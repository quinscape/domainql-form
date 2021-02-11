import { ENUM, INPUT_OBJECT, LIST, NON_NULL, OBJECT, SCALAR } from "../kind";
import InputSchema, { unwrapNonNull } from "../InputSchema";
import Field from "../Field";
import { toJS } from "mobx";
import get from "lodash.get";

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


export default function revalidate(formConfig)
{
    const {type, schema, formContext } = formConfig

    const { validation } = formConfig.options;

    if (!type)
    {
        return;
    }

    const { fieldContexts } = formContext;

    for (let i = 0; i < fieldContexts.length; i++)
    {

        const ctx = fieldContexts[i];
        const { root, fieldType, path, qualifiedName } = ctx;
        //console.log("Revalidate: ", toJS(root), ctx)
        const value = get(root, path);


        if (fieldType.kind === NON_NULL)
        {
            if (value === null || value === undefined)
            {
                formContext.addError(root, qualifiedName, formConfig.getRequiredErrorMessage(ctx) , "");
            }
        }

        const typeRef = unwrapNonNull(fieldType);

        if (typeRef.kind === SCALAR)
        {
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
                            formContext.addError(root, qualifiedName, r , InputSchema.scalarToValue(scalarName, value, ctx));
                        }
                    }
                    else
                    {
                        formContext.addError(root, qualifiedName, result , InputSchema.scalarToValue(scalarName, value, ctx));
                    }
                }
            }
        }
        else if (typeRef.kind === ENUM)
        {
            const enumTypeName = typeRef.name;
            if (!validateEnum(schema, enumTypeName, value))
            {
                if (__DEV)
                {
                    console.warn("Invalid value for Enum " + enumTypeName + " at " + path + " in " + JSON.stringify(root) + ": " + value);
                }
                formContext.addError(root, path, "Invalid Enum Value" , value);
            }
        }
    }
}
