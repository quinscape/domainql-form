import React from "react"
import toPath from "lodash.topath"

import DEFAULT_CONVERTERS from "./default-converters"

const PLAN_SCALAR_LIST = "$scalar-list$";
const PLAN_COMPLEX_LIST = "$complex-list$";
const PLAN_INPUT_OBJECT = "$input-object$";

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
    converter = DEFAULT_CONVERTERS;
}

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
        throw new Error("Unknown scalar '" + typeName + "'");
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
            const elementType = inputSchema.getType(actualType.ofType.name);

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

    //console.log("Validation plan for ", typeName, "is: ", plan);

    inputSchema.validationPlan[typeName] = plan;

    return plan;
}

export function isEnumType(fieldType)
{
    return fieldType && fieldType.kind === "ENUM";
}

function convertValue(inputSchema, fieldType, value, toScalar)
{
    fieldType = unwrapNonNull(fieldType);

    if (isScalarType(fieldType))
    {
        let result;
        if (toScalar)
        {
            result = InputSchema.valueToScalar(fieldType.name, value);
        }
        else
        {
            result = InputSchema.scalarToValue(fieldType.name, value);

            if (fieldType.name !== "Boolean")
            {
                result = result || "";
            }
        }

        //console.log(value, "( type", fieldType, ") ==", toScalar ? "toScalar" : "fromScalar" , "=> ", result, typeof result);

        return result;
    }
    else if (isInputType(fieldType))
    {
        if (!value)
        {
            return toScalar ? null : {};
        }

        return convertInput(inputSchema, inputSchema.getType(fieldType.name), value, toScalar);
    }
    else if (isListType(fieldType))
    {
        if (!value)
        {
            return toScalar ? null : [];
        }

        const array = new Array(value.length);

        for (let j = 0; j < value.length; j++)
        {
            array[j] = convertValue(inputSchema, inputSchema.getType(fieldType.ofType.name), value[j], toScalar);
        }
        return array;
    }
    else if (isEnumType(fieldType))
    {
        return value;
    }
    else
    {
        throw new Error("Unhandled field type : " + JSON.stringify(fieldType));
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

function executeValidationPlan(values, validationPlan)
{
    if (validationPlan[0] === PLAN_SCALAR_LIST)
    {
        const result = validationPlan[1](values);

        //console.log("Scalar List elem ", values, " => ", result);

        return result;
    }

    let errors = null;

    let haveErrors = false;

    for (let i = 0; i < validationPlan.length; i+= 2)
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
                haveErrors = true;
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
                        const err = executeValidationPlan(fieldValue[j], fnOrArray.slice(1));
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
                        haveErrors = true;
                    }
                }
            }
            else if (fnOrArray[0] === PLAN_INPUT_OBJECT)
            {
                if (fieldValue)
                {
                    const err = executeValidationPlan(fieldValue, fnOrArray.slice(1));
                    if (err)
                    {
                        errors = errors || {};
                        errors[name] = err;
                        haveErrors = true;
                    }
                }
            }
        }
    }
    return errors;
}

class InputSchema
{
    constructor(schema)
    {
        this.schema = schema;
        this.validationPlan = {};
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
        return fn ? fn(value) : value
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

        return convertInput(this, baseTypeDef, value, false);
    }

    fromValues(typeName, value)
    {
        const baseTypeDef = this.getType(typeName);
        if (!isInputType(baseTypeDef))
        {
            throw new Error(typeName + " is not a known input type: " + JSON.stringify(baseTypeDef))
        }

        return convertInput(this, baseTypeDef, value, true);
    }

    getTypes()
    {
        return this.schema.types;
    }

    validate(type, values)
    {
        const validationPlan = getValidationPlan(this, type);

        const errors = executeValidationPlan(values, validationPlan);

        //console.log({errors});

        return errors || NO_ERRORS;
    }

}

export const InputSchemaContext = React.createContext(null);

export default InputSchema
