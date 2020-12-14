import { ENUM, INPUT_OBJECT, LIST, NON_NULL, OBJECT, SCALAR } from "../kind";
import InputSchema from "../InputSchema";
import Field from "../Field";
import { toJS } from "mobx";

function lastSegment(path)
{
    const pos = path.lastIndexOf(".");
    if (pos < 0)
    {
        return path;
    }
    return path.substr(pos + 1);
}


function join(path, segment)
{
    if (path)
    {
        return path + "." + segment;
    }
    return segment;
}


function validateEnum(schema, enumTypeName, value)
{
    if (!value)
    {
        return true;
    }

    const { enumValues } = schema.getType(enumTypeName);

    for (let i = 0; i < enumValues.length; i++)
    {
        const enumValue = enumValues[i];
        if (enumValue.name === value)
        {
            return true;
        }
    }
    return false

}


function revalidateRecursive(parentType, typeRef, value, root, errorStorage, contexts, validation, schema, path)
{
    if (typeRef.kind === NON_NULL)
    {
        if (value === null || value === undefined)
        {
            if (contexts.get(path))
            {
                errorStorage.addError(root, path, parentType + "." + lastSegment(path) + ":Field Required" , "");
            }
            return;
        }
        revalidateRecursive(parentType, typeRef.ofType, value, root, errorStorage, contexts, validation, schema, path);
        return;
    }

    if (typeRef.kind === SCALAR)
    {
        const fieldContext = contexts.get(path);
        if (!fieldContext)
        {
            return;
        }

        if (validation)
        {
            const scalarName = typeRef.name;
            const result = validation.validateField(fieldContext, value);

            if (result)
            {
                if (Array.isArray(result))
                {
                    for (let i = 0; i < result.length; i++)
                    {
                        const r = result[i];
                        errorStorage.addError(root, path, r , InputSchema.scalarToValue(scalarName, value, fieldContext));
                    }
                }
                else
                {
                    errorStorage.addError(root, path, result , InputSchema.scalarToValue(scalarName, value, fieldContext));
                }
            }
        }
    }
    else if (typeRef.kind === OBJECT || typeRef.kind === INPUT_OBJECT)
    {
        if (value)
        {
            const typeName = typeRef.name;

            const typeDef = schema.getType(typeName);
            if (!typeDef)
            {
                throw new Error("Could not find type '" + typeName + "' in schema");
            }

            const fields = typeDef.kind === INPUT_OBJECT ? typeDef.inputFields : typeDef.fields;

            if (!fields)
            {
                throw new Error("Type '" + typeName + "' has no fields: " + JSON.stringify(typeDef));
            }

            for (let i = 0; i < fields.length; i++)
            {
                const { name, type } = fields[i];
                const pathForField = join(path, name);

                const fieldValue = value[name];
                revalidateRecursive(typeName, type, fieldValue, root, errorStorage, contexts, validation, schema, pathForField);
            }
        }
    }
    else if (typeRef.kind === LIST)
    {
        if (value)
        {
            const elementType = typeRef.ofType;
            for (let j = 0; j < value.length; j++)
            {
                const pathForElem = join(path, j);
                //console.log("CONVERT ELEMENT", elementType, value[j], convertOpts);
                revalidateRecursive(parentType, elementType, value[j], root, errorStorage, contexts, validation, schema, pathForElem);
            }
        }
    }
    else if (typeRef.kind === ENUM)
    {
        const enumTypeName = typeRef.name;
        if (!validateEnum(schema, enumTypeName, value))
        {
            console.warn("Invalid value for Enum " + enumTypeName + " at " + path + " in " + JSON.stringify(root) + ": " + value);
            errorStorage.addError(root, path, "Invalid Enum Value" , value);
        }
    }
}


export default function revalidate(formConfig) {
    const {type, schema, root, errorStorage} = formConfig

    if (!type)
    {
        return;
    }

    const contexts = Field.lookupContexts(root);

    const typeDef = schema.getType(type);

    const {validation} = formConfig.options;

    try
    {
        revalidateRecursive(null, typeDef, root, root, errorStorage, contexts, validation && validation.validateField ?
            validation :
            null, schema, "")
    }
    catch (e)
    {
        throw new Error("Error validating " + JSON.stringify(root) + ": " + e)
    }

}
