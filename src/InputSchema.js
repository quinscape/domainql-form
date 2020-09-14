import toPath from "lodash.topath"

import DEFAULT_CONVERTERS from "./default-converters"
import { INPUT_OBJECT, LIST, NON_NULL, SCALAR, OBJECT } from "./kind";
import { clone } from "./util/clone";


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
    return type && type.kind === INPUT_OBJECT
}

function isOutputType(type)
{
    return type && type.kind === OBJECT
}

export function isScalarType(type)
{
    return type && type.kind === SCALAR
}

export function isListType(type)
{
    return type && type.kind === LIST
}

export function isNonNull(type)
{
    return type && type.kind === NON_NULL
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
    else if (!isInputType(current) && !isOutputType(current))
    {
        throw new Error("Invalid type '" + current.name + "': " + JSON.stringify(current));
    }

    const found = findNamed(current.kind === INPUT_OBJECT ? current.inputFields : current.fields, prop);

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
     *
     * @return {Object} GraphQL type reference object
     */
    resolveType(typeName, name)
    {
        const path = typeof name === "string" ? toPath(name) : name;

        const currentType = this.getType(typeName);
        if (!currentType)
        {
            throw new Error("Cannot resolve " + typeName + "."  + name  + ": Type '" + typeName + "' does not exist.");
        }

        return resolve(this, currentType, path, 0);
    }

    static validate(scalarType, value)
    {
        if (value === "")
        {
            return "";
        }

        const fn = handlerFn(scalarType, "validate");
        return fn ? fn(value) : ""
    }

    static scalarToValue(scalarType, value)
    {
        if (value === null)
        {
            return "";
        }

        const fn = handlerFn(scalarType, "scalarToValue");
        return fn ? fn(value) : value
    }

    static valueToScalar(scalarType, value)
    {
        if (value === "")
        {

            return null;
        }

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


    /**
     * Clones or updates a domain object hierarchy. The given object must have a _type property specifying the domain type.
     * Only the fields of the corresponding GraphQL type are cloned.
     *
     * @param {object} obj                  observable object to clone deeply, instancing custom implementations as needed
     * @param {object} [update]             observable clone to update instead of creating a new clone
     *
     * @returns {object} cloned object
     */
    clone(obj, update)
    {
        return clone(obj, update, this);
    }

    /**
     * Clones a list of domain objects instead of a single domain object.
     *
     * Each object must fulfill the requirements explained for clone()
     *
     * @param {Array<object>} array         observable object to clone deeply.
     * @param {Array<object>} [update]      observable array clone to update instaed of creating new clones
     *
     * @returns {Array<object>} cloned list
     */
    cloneList(array, update)
    {
        return clone(obj, update, this);
    }
}

export default InputSchema
