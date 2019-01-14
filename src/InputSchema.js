import toPath from "lodash.topath"

import DEFAULT_CONVERTERS from "./default-converters"


const PLAN_SCALAR_LIST = { __scalar_list : true };
const PLAN_COMPLEX_LIST = { __complex_list : true };
const PLAN_INPUT_OBJECT = { __input_object : true };

const NO_ERRORS = {};

export function findNamed(array, name)
{
    for (let i = 0; i < array.length; i++)
    {
        const type = array[i];
        if (type.name === name)
        {
            return type;
        }
    }

    return null;
}

let converter;

export function resetConverter()
{
    converter = {
        ... DEFAULT_CONVERTERS
    };
}

/**
 * Register new scalar converter / validator
 *
 * @param {String} type                 type name
 * @param {function} validate           validates the given string value and returns an error message if the value is invalid
 * @param {function} scalarToValue      converts the scalar value to a user-editable string representation
 * @param {function} valueToScalar      converts the string representation back to a scalar value
 */
export function registerCustomConverter(type, validate, scalarToValue, valueToScalar)
{
    converter[type] = {
        validate,
        scalarToValue,
        valueToScalar
    };
}

resetConverter();

export function isInputType(type)
{
    return type && type.kind === "INPUT_OBJECT"
}

export function isScalarType(type)
{
    return type && type.kind === "SCALAR"
}

export function isListType(type)
{
    return type && type.kind === "LIST"
}

export function isNonNull(type)
{
    return type && type.kind === "NON_NULL"
}


export function unwrapNonNull(type)
{
    if (isNonNull(type))
    {
        return type.ofType;
    }
    return type;
}


function resolve(inputSchema, current, path, pos)
{
    const len = path.length;

    current = unwrapNonNull(current);

    const prop = path[pos];
    const next = pos + 1;

    if (isListType(current))
    {
        current = inputSchema.getType(current.ofType.name);

        if (next === len)
        {
            return current;
        }

        return resolve(inputSchema, current, path, next);
    }
    else if (!isInputType(current))
    {
        throw new Error("Invalid type '" + current.name + "': " + JSON.stringify(current));
    }

    const found = findNamed(current.inputFields, prop);

    if (!found)
    {
        throw new Error("Could not find '" + prop + "' ( path = " + path + ", pos = " + pos + ") in " + JSON.stringify(current))
    }

    current = found.type;

    if (!current)
    {
        throw new Error("Could not find field '" + prop + "' in type '" + current.name + "'");
    }

    if (next === len)
    {
        return current;
    }

    return resolve(inputSchema, current, path, next);
}

function handlerFn(typeName, handlerName)
{
    const entry = converter[typeName];
    if (entry === false)
    {
        return null;
    }
    else if (!entry)
    {
        throw new Error("Unknown scalar " + JSON.stringify(typeName));
    }

    const fn = entry[handlerName];

    if (fn === false)
    {
        return null;
    }
    else if (!fn)
    {
        throw new Error("Undefined handler '" + handlerName + "' on " + typeName);
    }
    return fn;
}

function checkNonNull(value)
{
    return !value ? "$FIELD required" : null
}

function checkNonNullBool(value)
{
    return value !== true && value !== false ? "$FIELD required" : null
}

function getValidationPlan(inputSchema, typeName)
{
    const existing = inputSchema.validationPlan[typeName];
    if (existing)
    {
        return existing;
    }

    const inputTypeDef = inputSchema.getType(typeName);

    if (!isInputType(inputTypeDef))
    {
        throw new Error("'" + typeName + "' is not a known input type");
    }

    const { inputFields } = inputTypeDef;


    const plan = [];

    for (let i = 0; i < inputFields.length; i++)
    {
        const field = inputFields[i];
        const { name, type} = field;

        const typeIsNonNull = isNonNull(type);
        const actualType = unwrapNonNull(type);
        const isScalar = isScalarType(actualType);

        if (typeIsNonNull)
        {
            if (isScalar && actualType.name === "Boolean")
            {
                plan.push(name, checkNonNullBool);
            }
            else
            {
                plan.push(name, checkNonNull);
            }
        }

        if (isScalar)
        {
            const fn = handlerFn(actualType.name, "validate");

            //console.log("Scalar type ", actualType, ": validator = ", fn);

            if (fn)
            {
                plan.push(name, fn);
            }
        }
        else if (isInputType(actualType))
        {
            const inputTypePlan = getValidationPlan(inputSchema, actualType.name);
            if (inputTypePlan.length)
            {
                plan.push(name, [ PLAN_INPUT_OBJECT, ... inputTypePlan])
            }
        }
        else if (isListType(actualType))
        {
            const elementType = actualType.ofType;

            if (isScalarType(elementType))
            {
                const fn = handlerFn(elementType.name, "validate");

                if (fn)
                {
                    plan.push(name, [ PLAN_SCALAR_LIST, fn])
                }
            }
            else
            {
                const elementPlan = getValidationPlan(inputSchema, elementType.name);
                if (elementPlan.length)
                {
                    plan.push(name, [ PLAN_COMPLEX_LIST, ... elementPlan])
                    plan.push(name, elementPlan)
                }
            }
        }
    }

    if (inputSchema.debug)
    {
        console.log("Validation plan for ", typeName, "is: ", plan);
    }

    inputSchema.validationPlan[typeName] = plan;

    return plan;
}

export function isEnumType(fieldType)
{
    return fieldType && fieldType.kind === "ENUM";
}

function convertValue(inputSchema, typeRef, value, toScalar)
{
    typeRef = unwrapNonNull(typeRef);

    if (isScalarType(typeRef))
    {
        let result;
        if (toScalar)
        {
            result = InputSchema.valueToScalar(typeRef.name, value);
        }
        else
        {
            result = InputSchema.scalarToValue(typeRef.name, value);

            if (typeRef.name !== "Boolean")
            {
                result = result || "";
            }
        }

        if (inputSchema.debug)
        {
            console.log(value, "( type", typeRef, ") ==", toScalar ? "toScalar" : "fromScalar", "=> ", result, typeof result, path);
        }

        return result;
    }
    else if (isInputType(typeRef))
    {
        if (!value)
        {
            return null;
        }

        if (inputSchema.debug)
        {
            console.log("Convert InputObject ", typeRef.name, path);
        }

        return convertInput(inputSchema, inputSchema.getType(typeRef.name), value, toScalar);
    }
    else if (isListType(typeRef))
    {
        if (!value)
        {
            return null;
        }

        const array = new Array(value.length);

        if (inputSchema.debug)
        {
            console.log("Convert List of ", typeRef.ofType.name, path);
        }

        //const elementType = inputSchema.getType(typeRef.ofType.name);

        for (let j = 0; j < value.length; j++)
        {
            array[j] = convertValue(inputSchema, typeRef.ofType, value[j], toScalar);
        }
        return array;
    }
    else if (isEnumType(typeRef))
    {
        return value;
    }
    else
    {
        throw new Error("Unhandled field type : " + JSON.stringify(typeRef));
    }
}

function convertInput(inputSchema, baseTypeDef, value, toScalar)
{
    const { inputFields } = baseTypeDef;

    const out = {};

    for (let i = 0; i < inputFields.length; i++)
    {
        const field = inputFields[i];
        const name = field.name;

        out[name] = convertValue(inputSchema, field.type, value[name], toScalar);
    }
    return out;
}

function executeValidationPlan(values, validationPlan, start)
{
    if (validationPlan[start] === PLAN_SCALAR_LIST)
    {
        const result = validationPlan[start + 1](values);

        //console.log("Scalar List elem ", values, " => ", result);

        return result;
    }

    let errors = null;

    for (let i = start; i < validationPlan.length; i+= 2)
    {
        const name = validationPlan[i];
        const fnOrArray = validationPlan[i + 1];

        const fieldValue = values[name];
        if (typeof fnOrArray === "function")
        {
            const error = fnOrArray(fieldValue);

            //console.log("field ", name, ": ", fieldValue, " => ", error);
            if (error)
            {
                errors = errors || {};
                errors[name] = error;
            }
        }
        else
        {
            if (fnOrArray[0] === PLAN_COMPLEX_LIST)
            {
                if (fieldValue)
                {
                    let array = null;

                    for (let j = 0; j < fieldValue.length; j++)
                    {
                        const err = executeValidationPlan(fieldValue[j], fnOrArray, 1);
                        if (err)
                        {
                            array = array || new Array(fieldValue.length);
                            array[j] = err;
                        }
                    }

                    if (array)
                    {
                        errors = errors || {};
                        errors[name] = array;
                    }
                }
            }
            else if (fnOrArray[0] === PLAN_INPUT_OBJECT)
            {
                if (fieldValue)
                {
                    const err = executeValidationPlan(fieldValue, fnOrArray, 1);
                    if (err)
                    {
                        errors = errors || {};
                        errors[name] = err;
                    }
                }
            }
        }
    }
    return errors;
}

class InputSchema
{
    constructor(schema, debug = false)
    {
        const { types } = schema;

        if (!types || typeof types.length !== "number")
        {
            throw new Error("Given Schema object has no 'types' array property");
        }

        this.schema = schema;
        this.validationPlan = {};
        this.debug = debug;
    }

    /**
     * Resolves a complex type definition
     *
     * @param typeName      name of type
     */
    getType(typeName)
    {
        const { types } = this.schema;

        return findNamed(types, typeName);
    }

    /**
     * Resolves the type of a name expression
     *
     * @param typeName      base type
     * @param name          name expression (e.g. 'name', 'values[0]', 'address.city')
     */
    resolveType(typeName, name)
    {
        const path = typeof name === "string" ? toPath(name) : name;

        const currentType = this.getType(typeName);

        return resolve(this, currentType, path, 0);
    }

    static validate(scalarType, value)
    {
        const fn = handlerFn(scalarType, "validate");
        return fn ? fn(value) : ""
    }

    static scalarToValue(scalarType, value)
    {
        const fn = handlerFn(scalarType, "scalarToValue");
        const result = (fn ? fn(value) : value);
        return result || ""
    }

    static valueToScalar(scalarType, value)
    {
        const fn = handlerFn(scalarType, "valueToScalar");
        return fn ? fn(value) : value
    }

    toValues(typeName, value)
    {
        const baseTypeDef = this.getType(typeName);
        if (!isInputType(baseTypeDef))
        {
            throw new Error(typeName + " is not a known input type: " + JSON.stringify(baseTypeDef))
        }

        if (!value)
        {
            throw new Error("Root object of type '" + typeName + "' cannot be falsy: " + value);
        }

        return convertInput(this, baseTypeDef, value, false);
    }

    fromValues(typeName, values)
    {
        const baseTypeDef = this.getType(typeName);
        if (!isInputType(baseTypeDef))
        {
            throw new Error(typeName + " is not a known input type: " + JSON.stringify(baseTypeDef))
        }
        if (!values)
        {
            throw new Error("Form values cannot be falsy: " + values);
        }

        return convertInput(this, baseTypeDef, values, true);
    }

    getTypes()
    {
        return this.schema.types;
    }



    validate(type, values)
    {
        const validationPlan = getValidationPlan(this, type);

        const errors = executeValidationPlan(values, validationPlan, 0) || NO_ERRORS;

        if (this.debug)
        {
            console.log("Errors for ", values, "=>", errors);
        }

        return errors;
    }

}

export default InputSchema
