/**
 * Clones a given domain object by serializing and deserializing it.
 *
 * This ensures that the new object will use the exact same custom domain implementation classes as the original and
 * does not replace them with simple observables.
 *
 * @param {object} obj      object to be cloned

 * @returns {object} cloned object
 */
import { INPUT_OBJECT, LIST, NON_NULL, OBJECT, SCALAR } from "../kind";
import { observable } from "mobx";
import { isPropertyWritable } from "./PropertyUtils";

let domainObjectFactory = (type, id) => observable({ _type: type, id});


/**
 * Creates a new object with the currently registered domain object factory.
 *
 * @param {String} type     domain type
 * @param {*} [id]          id value
 * @returns {object}
 */
export function createDomainObject(type, id = null)
{
    return domainObjectFactory(type, id);
}

function join(path, segment)
{
    if (path)
    {
        return path + "." + segment;
    }
    return segment;
}



function getTypeDef(obj, inputSchema)
{
    const name = obj._type;
    if (!name)
    {
        throw new Error("Object has no _type property: " + JSON.stringify(obj));
    }

    const typeDef = inputSchema.getType(name);
    if (!typeDef)
    {
        throw new Error("Could not find type '" + name + "' in schema");
    }

    return typeDef;
}


/**
 * Clones a list of domain objects instead of a single domain object.
 *
 * Each object must fulfill the requirements explained for clone()
 *
 * @param {Array<object>} array         observable object to clone deeply.
 * @param {Array<object>} [update]      observable array clone to update instaed of creating new clones
 * @param {InputSchema} inputSchema     input schema
 *
 * @returns {Array<object>} cloned list
 */
export function cloneList(array, update, inputSchema)
{
    return cloneOrUpdate(
        {
            kind: LIST,
            ofType: getTypeDef(obj, inputSchema)
        },
        obj,
        update,
        inputSchema,
        ""
    );
}


/**
 * Clones or updates a domain object hierarchy. The given object must have a _type property specifying the domain type.
 * Only the fields of the corresponding GraphQL type are cloned.
 *
 * @param {object} obj                  observable object to clone deeply, instancing custom implementations as needed
 * @param {object} [update]             observable clone to update instead of creating a new clone
 * @param {InputSchema} inputSchema     input schema
 *
 * @returns {object} cloned object
 */
export function clone(obj, update, inputSchema)
{
    return cloneOrUpdate(
        getTypeDef(obj, inputSchema),
        obj,
        update,
        inputSchema,
        ""
    );
}


function cloneOrUpdate(typeRef, value, update, inputSchema, path)
{
    if (typeRef.kind === NON_NULL)
    {
        if (value === null)
        {
            throw new Error("NON_NULL value is null: typeRef = " + JSON.stringify(typeRef) + ", value = " + JSON.stringify(value));
        }

        return cloneOrUpdate(typeRef.ofType, value, update, inputSchema, path);
    }

    if (typeRef.kind === SCALAR)
    {
        return value;
    }
    else if (typeRef.kind === OBJECT || typeRef.kind === INPUT_OBJECT)
    {
        if (!value)
        {
            return null;
        }

        const typeName = typeRef.name;

        const typeDef = inputSchema.getType(typeName);
        if (!typeDef)
        {
            throw new Error("Could not find type '" + typeName + "' in schema");
        }

        const fields = typeDef.kind === INPUT_OBJECT ? typeDef.inputFields : typeDef.fields;
        if (!fields)
        {
            throw new Error("Type '" + typeName + "' has no fields: " + JSON.stringify(typeDef));
        }

        const out = update || createDomainObject(typeName, null);

        out.id = value.id;

        for (let i = 0; i < fields.length; i++)
        {
            const { name, type } = fields[i];
            const pathForField = join(path, name);

            const fieldValue = value[name];
            if (fieldValue !== undefined)
            {
                if(isPropertyWritable(out, name)) {
                    out[name] = cloneOrUpdate(type, fieldValue, out[name], inputSchema, pathForField);
                }
            }
        }
        return out;
    }
    else if (typeRef.kind === LIST)
    {
        if (value)
        {
            const elementType = typeRef.ofType;
            const out = new Array(value.length);

            for (let j = 0; j < value.length; j++)
            {
                out[j] = cloneOrUpdate(elementType, value[j], out[j], inputSchema, path);
            }
            return observable(out);
        }
        return null;
    }
}

/**
 * Alternate clone implementation for non-typed / normal JavaScript objects. Used to clone non-typed root objects in the
 * <Form/> component.
 *
 * This is normally *not* the clone function you want. Use clone() to clone domain objects ( or cloneList() to clone
 * lists of objects)
 *
 * @param value
 * @returns {*}
 */
export function fallbackJSClone(value)
{
    return fallbackCloneFunction(value);
}

let fallbackCloneFunction = value => {
    if (Array.isArray(value))
    {
        const out = new Array(value.length);
        for (let j = 0; j < value.length; j++)
        {
            out[j] = fallbackJSClone(value[j]);
        }
        return observable(out);

    }
    // XXX: the cloning algorithm is not totally satisfying although it works for our use-cases so far -- the danger is
    //      that we misclassify scalar values we should copy as-is here and try to clone them as obj.
    //      hence the special case handling of Date. If you run into issues with cloning your untyped form objects
    //      consider turning off isolation to prevent cloning.
    else if (value && typeof value === "object" && !(value instanceof Date))
    {
        const out = {};

        for (let name in value)
        {
            if (value.hasOwnProperty(name))
            {
                out[name] = fallbackJSClone(value[name]);
            }
        }
        return observable(out);
    }
    else
    {
        return value;
    }
};

/**
 * Registers an alternative domain object factory used to create objects during clone()
 * @param factory
 */
export function registerDomainObjectFactory(factory)
{
    domainObjectFactory = factory;
}

/**
 * Registers an alternative non-typed object clone function.
 *
 * See cloneObj() above.
 *
 * @param {Function} cloneObj   alternative function to clone non-typed object.
 */
export function registerFallbackCloneFunction(cloneObj)
{
    fallbackCloneFunction = cloneObj;
}

