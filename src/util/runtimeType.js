function _expectProps(obj, desc, propNames)
{
    for (let i = 0; i < propNames.length; i++)
    {
        const propName = propNames[i];

        if (obj[propName] === undefined)
        {
            throw new Error(desc + ": Expected object with properties " + propNames.join(", ") + ": is " + JSON.stringify(obj))
        }
    }
}


function expectProps(desc, arrayOrObj, propNames)
{
    if (Array.isArray(arrayOrObj))
    {
        for (let i = 0; i < arrayOrObj.length; i++)
        {
            _expectProps(arrayOrObj[i], desc, propNames);
        }
    }
    else
    {
        _expectProps(arrayOrObj, desc, propNames);
    }
}


/**
 * Creates a scalar type reference.
 *
 * @param {String} name     name of the scalar type
 * 
 * @return {{kind: string, name: *, ofType: null}}
 */
export function scalar(name)
{
    if (!name)
    {
        throw new Error("Need name");
    }

    return (
        {
            "kind": "SCALAR",
            "name": name,
            "ofType": null
        }
    )
}


/**
 * Creates an input object reference
 * @param {String} name     name of the input object type
 * @return {{kind: string, name: *, ofType: null}}
 */
export function inputObject(name)
{
    return (
        {
            "kind": "INPUT_OBJECT",
            "name": name,
            "ofType": null
        }
    )
}


/**
 * Creates an object type reference.
 *
 * @param {String} name     name of the object type
 * @return {{kind: string, name: *, ofType: null}}
 */
export function object(name)
{
    return (
        {
            "kind": "OBJECT",
            "name": name,
            "ofType": null
        }
    )
}

/**
 * Creates a non-null version of the wrapped type
 *
 * @param {Object} type reference
 * @return {{kind: string, name: null, ofType: *}}
 */
export function nonNull(type)
{
    if (process.env.NODE_ENV !== "production")
    {
        expectProps(
            "NonNull Type argument",
            type,
            ["kind", "name", "ofType"]
        );
    }

    return (
        {
            "kind": "NON_NULL",
            "name": null,
            "ofType": type
        }
    )
}


/**
 * Creates a list type of the wrapped type
 *
 * @param {Object} type reference
 * @return {{kind: string, name: null, ofType: *}}
 */
export function list(type)
{
    if (process.env.NODE_ENV !== "production")
    {
        expectProps(
            "List Type argument",
            type,
            [
                "kind",
                "name",
                "ofType"
            ]
        );
    }

    return (
        {
            "kind": "LIST",
            "name": null,
            "ofType": type
        }
    )
}


/**
 * Creates a new field.
 *
 * @param {String} name         name of the input field
 * @param {Object} type         type reference (see scalar(), object(), nonNull(), list())
 * @return {{args: Array, deprecationReason: null, isDeprecated: boolean, name: *, description: string, type: *}}
 */
export function field(name, type)
{
    if (process.env.NODE_ENV !== "production")
    {
        expectProps(
            "Field Type argument",
            type,
            [
                "kind",
                "name",
                "ofType"
            ]
        );
    }
    
    return (
        {
            "name": name,
            "description": "Runtime generated field",
            "args": [],
            "type": type,
            "isDeprecated": false,
            "deprecationReason": null
        }

    )
}


/**
 * Creates a new input field.
 *
 * @param {String} name         name of the input field
 * @param {Object} type         type reference (see scalar(), inputObject(), nonNull(), list())
 * @param {*} defaultValue      default value
 * @return {{defaultValue: *, name: *, description: string, type: *}}
 */
export function inputField(name, type, defaultValue = null)
{
    if (process.env.NODE_ENV !== "production")
    {
        expectProps(
            "Input Field Type argument",
            type,
            [
                "kind",
                "name",
                "ofType"
            ]
        );
    }

    return (
        {
            "name": name,
            "description": "Runtime generated input field",
            "type": type,
            "defaultValue": defaultValue
        }
    )
}

/**
 * Creates a new input object type.
 *
 * @param {String} name     name of the new input object type
 * @param {Array>} fields   array of GraphQL input fields ( see inputField() )
 * @return {{inputFields: null, interfaces: Array, possibleTypes: null, kind: string, name: *, description: string, fields: ...*[], enumValues: null}}
 */
export function inputObjectType(name, inputFields)
{
    if (process.env.NODE_ENV !== "production")
    {
        expectProps(
            "Input fields argument",
            inputFields,
            [
            "name",
            "description",
            "type",
            "defaultValue"
        ]);
    }

    return (
        {
            "kind": "INPUT_OBJECT",
            "name": name,
            "description": "Runtime-generated type",
            "fields": null,
            "inputFields": [
                ... inputFields
            ],
            "interfaces": [],
            "enumValues": null,
            "possibleTypes": null
        }
    )
}


/**
 * Creates a new object type.
 *
 * @param {String} name     name of the new object type
 * @param {Array>} fields   array of GraphQL fields ( see field() )
 * @return {{inputFields: null, interfaces: Array, possibleTypes: null, kind: string, name: *, description: string, fields: ...*[], enumValues: null}}
 */
export function objectType(name, fields)
{
    if (process.env.NODE_ENV !== "production")
    {
        expectProps(
            "Fields",
            fields,
            [
            "name",
            "description",
            "args",
            "type",
            "isDeprecated",
            "deprecationReason"
        ]);
    }

    return (
        {
            "kind": "OBJECT",
            "name": name,
            "description": "Runtime-generated type",
            "fields": [
                ...fields
            ],
            "inputFields": null,
            "interfaces": [],
            "enumValues": null,
            "possibleTypes": null
        }
    )
}
