import React from "react"
import toPath from "lodash.topath"

import DEFAULT_CONVERTERS from "./default-converters"

function findNamed(array, name)
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


function resolve(current, path, pos)
{
    const len = path.length;

    if (!isInputType(current))
    {
        throw new Error("Invalid type '" + current.name + "': " + JSON.stringify(current));
    }

    const prop = path[pos];
    current = findNamed(current.inputFields, prop).type;

    if (!current)
    {
        throw new Error("Could not find field '" + prop + "' in type '" + current.name + "'");
    }

    const next = pos + 1;
    if (next === len)
    {
        return current;
    }

    return resolve(current, path, next);
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

        const actualType = unwrapNonNull(type);

        if (isScalarType(actualType))
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
            plan.push(name, getValidationPlan(actualType.name))
        }
        else if (isListType(actualType))
        {
            const elementType = actualType.ofType;

            if (isScalarType(elementType))
            {
                const fn = handlerFn(elementType.name, "validate");

                if (fn)
                {
                    plan.push(name, [ null, fn])
                }
            }
            else
            {
                plan.push(name, getValidationPlan(elementType.name))
            }
        }
    }

    //console.log("Validation plan for ", typeName, "is: ", plan);

    inputSchema.validationPlan[typeName] = plan;

    return plan;
}


function convertValue(field, fieldValue, conversionFn)
{
    const fieldType = unwrapNonNull(field.type);

    if (isScalarType(fieldType))
    {
        const result = conversionFn(fieldType.name, fieldValue);

        //console.log(fieldValue, "( type", fieldType, ") => ", result, typeof result);

        return result;
    }
    else if (isInputType(fieldType))
    {
        return convertInput(fieldType, fieldValue, conversionFn);
    }
    else if (isListType(fieldType))
    {
        const array = new Array(fieldValue.length);

        for (let j = 0; j < fieldValue.length; j++)
        {
            array[j] = convertValue(fieldType.ofType, fieldValue[j], conversionFn);
        }
        return array;
    }
    else
    {
        throw new Error("Unhandled field type : " + JSON.stringify(fieldType));
    }

}

function convertInput(baseTypeDef, value, conversionFn)
{
    const { inputFields } = baseTypeDef;

    const out = {};

    for (let i = 0; i < inputFields.length; i++)
    {
        const field = inputFields[i];
        const name = field.name;

        out[name] = convertValue(field, value[name], conversionFn);
    }
    return out;
}

function executeValidationPlan(values, validationPlan)
{
    if (validationPlan[0] === null)
    {
        const result = validationPlan[1](values);

        //console.log("Scalar List elem ", values, " => ", result);

        return result;
    }

    const errors = {};

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
                errors[name] = error;
            }
        }
        else
        {
            const complex = fieldValue;
            if (complex.length && complex[0])
            {
                const array = new Array(complex.length);
                for (let j = 0; j < complex.length; j++)
                {
                    array[j] = executeValidationPlan(complex[j], fnOrArray);
                }
                errors[name] = array;
            }
            else
            {
                errors[name] = executeValidationPlan(complex, fnOrArray);
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

        return resolve(currentType, path, 0);
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

        return convertInput(baseTypeDef, value, InputSchema.scalarToValue);
    }

    fromValues(typeName, value)
    {
        const baseTypeDef = this.getType(typeName);
        if (!isInputType(baseTypeDef))
        {
            throw new Error(typeName + " is not a known input type: " + JSON.stringify(baseTypeDef))
        }

        return convertInput(baseTypeDef, value, InputSchema.valueToScalar);
    }

    validate(type, values)
    {
        const validationPlan = getValidationPlan(this, type);

        const errors = executeValidationPlan(values, validationPlan);

        //console.log({errors});

        return errors;
    }

}

export const InputSchemaContext = React.createContext(null);

export default InputSchema
