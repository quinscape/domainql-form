import { observable } from "mobx"


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



export default class WireFormat
{
    constructor(inputSchema, classes)
    {
        this.inputSchema = inputSchema;
        this.classes = classes;
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

        return null;
    }


    /**
     * Converts the JSON wire-format into observable objects.
     *
     * All objects are turned into observable objects. If there is a observable JavaScript class definition for that type an instance
     * of that is created for the object. All scalar values are converted according to their JavaScript version.
     *
     * @param {String} [type]   Complex Type within the GraphQL domain. Optional if the object contains a _type property pointing to the type.
     * @param {Object} obj      type instance as JSON object representation
     *
     * @return {Object} observable object tree
     */
    fromWire(type, obj)
    {
        type = getType(type, obj);

        const TypeClass = this.classes[type];

        let out;
        if (TypeClass)
        {
            out = new TypeClass();
        }
        else
        {
            out = {};
        }

        const schemaType = this.inputSchema.getType(type);

        console.log({schemaType});


        return out;
    }

}

