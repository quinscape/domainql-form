import rawSchema from "../schema.json"
import InputSchema from "../../src/InputSchema";

class TrackingSchema extends InputSchema
{
    constructor(schema, debug)
    {
        super(schema, debug);

        this.typesUsed = new Set();
    }

    getType(typeName)
    {
        const domainType = super.getType(typeName);

        if (!this.typesUsed.has(typeName))
        {
            this.typesUsed.add(typeName);
        }
        return domainType;
    }


    /**
     * If the tracking feature is enabled, returns the typesUsed map mapping type names
     * @return {Set} set of used types
     */
    getTypesUsed()
    {
        return this.typesUsed;
    }
}

const schema = new TrackingSchema(rawSchema, false);

export default function getSchema()
{
    return schema;
}


