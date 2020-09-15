import { NON_NULL, LIST, OBJECT, SCALAR, INPUT_OBJECT, ENUM } from "./kind";
import { observable, action } from "mobx";

function getType(type, obj)
{
    if (!type)
    {
        type = obj._type;

        if (!type)
        {
            throw new Error(
                "Cannot get type for type = " + type + ", obj = " + JSON.stringify(obj)
            );
        }
    }
    return type;
}

function normDate(dateObj){
    dateObj.setUTCHours(0);
    dateObj.setUTCMinutes(0);
    dateObj.setUTCSeconds(0);
    dateObj.setUTCMilliseconds(0);
    return dateObj;
}

function describeTypeRef(typeRef)
{
    if (typeRef.kind === NON_NULL)
    {
        return describeTypeRef(typeRef.ofType) + "!";
    }
    else if (typeRef.kind === LIST)
    {
        return "[" + describeTypeRef(typeRef.ofType) + "]";
    }
    return typeRef.name;
}


const DEFAULT_TO_WIRE = {
    // "BigDecimal": function (v) {
    //     return null
    // },
    // "BigInteger": function (v) {
    //     return null
    // },
    // "Boolean": function (v) {
    //     return null
    // },
    // "Byte": function (v) {
    //     return null
    // },
    "Date": function (v) {
        if (v === null)
        {
            return null;
        }
        normDate(v);
        return v && v.toISOString();
    },
    // "Float": function (v) {
    //     return null
    // },
    // "Int": function (v) {
    //     return null
    // },
    // "Long": function (v) {
    //     return null
    // },
    // "Short": function (v) {
    //     return null
    // },
    // "String": function (v) {
    //     return null
    // },
    "Timestamp": function (v) {
        return v && v.toISOString();
    }

};

const DEFAULT_FROM_WIRE = {

    // "BigDecimal": function (v) {
    //     return null
    // },
    // "BigInteger": function (v) {
    //     return null
    // },
    // "Boolean": function (v) {
    //     return null
    // },
    // "Byte": function (v) {
    //     return null
    // },
    "Date": function (v) {
        if (!v)
        {
            return null;
        }
        const d = new Date(v);
        normDate(d);
        return d;
    },
    // "Float": function (v) {
    //     return null
    // },
    // "Int": function (v) {
    //     return null
    // },
    // "Long": function (v) {
    //     return null
    // },
    // "Short": function (v) {
    //     return null
    // },
    // "String": function (v) {
    //     return null
    // },
    "Timestamp": function (v) {
        return v && new Date(v);
    }
};


const DEFAULT_OPTS = {
    /**
     * True if values converted from wire-format should always be wrapped as observables.
     */
    wrapAsObservable: false
};


function join(path, segment)
{
    if (path)
    {
        return path + "." + segment;
    }
    return segment;
}


function hasAliases(aliases, objectPath)
{
    if (aliases)
    {
        for (let name in aliases)
        {
            if (
                aliases.hasOwnProperty(name) &&
                name.charAt(objectPath.length) === '.' &&
                name.indexOf(objectPath) === 0 &&
                name.lastIndexOf('.') === objectPath.length
            )
            {
                return true;
            }
        }
    }
    return false;
}

const CONVERT_DEFAULT_OPTS = {
    noWrapping: false
}

const CONVERT_OPTS_FROM_WIRE = {
    fromWire: true,
    withType: true,
    noWrapping: false
}

const CONVERT_OPTS_TO_WIRE = {
    fromWire: false,
    withType: false,
    noWrapping: true
}

export default class WireFormat {

    /**
     * Creates a new wire format instance.
     *
     * @param {InputSchema} inputSchema         input schema
     * @param {Object} classes                  map of domain class implementations to use
     * @param {Object} opts                     options
     * @param {boolean} opts.wrapAsObservable   True if values converted from wire-format should always be wrapped as observables.
     */
    constructor(inputSchema, classes = {}, opts)
    {
        this.opts = {
            ... DEFAULT_OPTS,
            ... opts
        };

        if (!inputSchema)
        {
            throw new Error("Need inputSchema")
        }

        this.inputSchema = inputSchema;
        this.classes = classes;

        this.ToWireConverters = {
            ... DEFAULT_TO_WIRE
        };
        this.FromWireConverters = {
            ... DEFAULT_FROM_WIRE
        };

        //console.log("Created", this);
    }


    /**
     * Converts an observable object into the JSON wire format.
     *
     * All observable objects are simplified into JavaScript objects and the scalar values are converted to their wire format
     * representation.
     *
     * @param {String} [type]       Complex Type within the GraphQL domain. Optional if the object contains a _type property pointing to the type.
     * @param {Object} obj          type instance as observable object
     * @param {Object} classes      object map mapping type names to observable class implementations.
     *
     * @return {Object} type instance in wire format
     */
    toWire(type, obj)
    {
        type = getType(type, obj);

        return convert(
            this,
            {
                kind: OBJECT,
                name: type
            },
            value,
            false
        );
    }

    registerConverter(type, fromWire, toWire)
    {
        this.FromWireConverters[type] = fromWire;
        this.ToWireConverters[type] = toWire;
    }

    /**
     * Converts the JSON wire-format into observable objects.
     *
     * All objects are turned into observable objects. If there is a observable JavaScript class definition for that type an instance
     * of that is created for the object. All scalar values are converted according to their JavaScript version.
     *
     * @param {String} [type]   Complex Type within the GraphQL domain. Optional if the object contains a _type property pointing to the type.
     * @param {Object} value      type instance as JSON object representation
     *
     * @return {Object} observable object tree
     */
    fromWire(type, value)
    {
        type = getType(type, value);

        return convert(
            this,
            {
                kind: OBJECT,
                name: type
            },
            value,
            true
        );
    }

    /**
     * Does the actual conversion based on a GraphQL schema type reference
     *
     * @param {Object} typeRef      GraphQL schema type reference
     * @param {*} value             value
     * @param {boolean|Object} fromWire    true if the value is to be converted from wire format into JavaScript, false otherwise
     * @param {object} [aliases]    Map with aliases mapping path names to their original name
     * @param {String} [path]       current path
     *
     * @return {*} JavaScript value
     */
    @action
    convert(typeRef, value, fromWire, aliases, path = "")
    {
        //console.log({typeRef, value, fromWire, aliases, path});

        let convertOpts;
        if (typeof fromWire === "boolean")
        {
            convertOpts = fromWire ? CONVERT_OPTS_FROM_WIRE : CONVERT_OPTS_TO_WIRE;
        }
        else
        {
            convertOpts = {
                ... CONVERT_DEFAULT_OPTS,
                ... fromWire
            }
        }


        return this._convert(typeRef, value, convertOpts, aliases, path);
    }
    
    _convert(typeRef, value, convertOpts, aliases, path)
    {
        try
        {
            if (typeRef.kind === NON_NULL)
            {
                if (value === null)
                {
                    throw new Error("NON_NULL value is null: typeRef = " + JSON.stringify(typeRef) + ", value = " + JSON.stringify(value));
                }

                return this._convert(typeRef.ofType, value, convertOpts, aliases, path);
            }

            if (typeRef.kind === SCALAR)
            {

                const scalarName = typeRef.name;

                const fn = this[convertOpts.fromWire ? "FromWireConverters" : "ToWireConverters"][scalarName];
                //console.log("CONVERT SCALAR", scalarName, value);
                return fn ? fn(value) : value;
            }
            else if (typeRef.kind === OBJECT || typeRef.kind === INPUT_OBJECT)
            {
                if (value)
                {
                    let out;
                    const typeName = typeRef.name;

                    const typeDef = this.inputSchema.getType(typeName);
                    if (!typeDef)
                    {
                        throw new Error("Could not find type '" + typeName + "' in schema");
                    }

                    const fields = typeDef.kind === INPUT_OBJECT ? typeDef.inputFields : typeDef.fields;

                    if (!fields)
                    {
                        throw new Error("Type '" + typeName + "' has no fields: " + JSON.stringify(typeDef));
                    }

                    let needsWrapping = false;
                    if (convertOpts.fromWire)
                    {
                        const TypeClass = this.classes[typeName];
                        if (TypeClass && !hasAliases(aliases, path))
                        {
                            out = new TypeClass();
                            //console.log("Create new instance of ", TypeClass, "=>", out);
                        }
                        else
                        {
                            out = {};
                            needsWrapping = true;
                        }
                    }
                    else
                    {
                        out = {};
                        needsWrapping = true;
                    }

                    if (convertOpts.withType)
                    {
                        out._type = typeName;
                    }

                    for (let i = 0; i < fields.length; i++)
                    {
                        const { name, type } = fields[i];
                        const pathForField = join(path, name);

                        const alias = aliases && aliases[pathForField];

                        const propName = alias ? alias : name;

                        const fieldValue = value[propName];
                        if (fieldValue !== undefined)
                        {
                            //console.log("CONVERT FIELD", name, type, fieldValue, convertOpts)
                            out[propName] = this._convert(type, fieldValue, convertOpts, aliases, pathForField);
                        }
                    }

                    if (convertOpts.fromWire && this.opts.wrapAsObservable && !convertOpts.noWrapping)
                    {
                        if (needsWrapping)
                        {
                            // console.log("Wrap as observable", out)
                            out = observable(out);
                        }
                    }

                    return out;
                }
                return null;
            }
            else if (typeRef.kind === LIST)
            {
                if (value)
                {
                    const elementType = typeRef.ofType;
                    let out = new Array(value.length);
                    if (convertOpts && this.opts.wrapAsObservable && !convertOpts.noWrapping)
                    {
                        out = observable(out);
                    }

                    for (let j = 0; j < value.length; j++)
                    {
                        //console.log("CONVERT ELEMENT", elementType, value[j], convertOpts);
                        out[j] = this._convert(elementType, value[j], convertOpts, aliases, path);
                    }
                    return out;
                }
                return null;
            }
            else if (typeRef.kind === ENUM)
            {
                // enum wire format and js format are both simple strings
                return value;
            }
        }
        catch(e)
        {
            throw new Error(
                "Error converting type " + describeTypeRef(typeRef) + (convertOpts ? " from" : " to") + " wire format: path = " + path +
                ":\nVALUE: " + JSON.stringify(value, null,4) +
                "\nERROR: " +  e)
        }
    }
}

