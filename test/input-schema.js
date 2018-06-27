import rawSchema from "./schema.json"
import InputSchema from "../src/InputSchema";

import assert from "power-assert"

import ADDRESS_OBJECT_TYPED from "./address.json"
import ADDRESS_OBJECT_VALUES from "./address-values.json"

describe("InputSchema", function () {
    it("converts complex values to formik values", function () {

        const inputSchema = new InputSchema(rawSchema);

        const converted = inputSchema.toValues("DomainTypeInput", ADDRESS_OBJECT_TYPED);

        //console.log(JSON.stringify(converted));

        assert( converted.name === "Address");
        assert( converted.fields.length === 6);
        assert( converted.fields[0].name === "id");
        assert( converted.primaryKey.fields.length === 1);
        assert( converted.primaryKey.fields[0] === "id");

        // following formik, bools are real bools :\
        assert( converted.fields[0].required === true);
        assert( converted.fields[0].unique === true);
        // everything else is string
        assert( converted.fields[0].maxLength === "36");

        assert( converted.description === "");
    });

    it("does type-based formik values validation", function () {

        const inputSchema = new InputSchema(rawSchema);

        {
            const errors = inputSchema.validate("DomainTypeInput", {});

            assert(Object.keys(errors).length === 5);

            assert( errors.name === "$FIELD required");
            assert( errors.fields === "$FIELD required");
            assert( errors.primaryKey === "$FIELD required");
            assert( errors.foreignKeys === "$FIELD required");
            assert( errors.uniqueConstraints === "$FIELD required");

        }

        {
            const errors = inputSchema.validate("DomainTypeInput", {
                name: "Test",
                fields: [],
                primaryKey: {
                    fields: ["id"]
                },
                uniqueConstraints: [],
                foreignKeys: []
            });

            assert.deepEqual(errors , {});
        }

        {
            const errors = inputSchema.validate("DomainTypeInput", {
                name: "Test",
                fields: [{
                    name : "f1",
                    type: "PLAINTEXT",
                    required: false,
                    maxLength: "3a"
                }],
                primaryKey: {
                    fields: ["id"]
                },
                uniqueConstraints: [],
                foreignKeys: []
            });

            //console.log(errors);

            assert(Object.keys(errors).length === 1);

            assert( errors.fields.length === 1);
            assert( errors.fields[0].maxLength === "Invalid Integer");
        }
    });
    
    it("converts formik values back to typed values", function () {

        const inputSchema = new InputSchema(rawSchema);

        const converted = inputSchema.fromValues("DomainTypeInput", ADDRESS_OBJECT_VALUES);

        //console.log(converted);

        assert( converted.name === "Address");
        assert( converted.description === "");
        assert( converted.fields.length === 6);
        assert( converted.fields[0].name === "id");
        assert( converted.primaryKey.fields.length === 1);
        assert( converted.primaryKey.fields[0] === "id");

        // following formik, bools are real bools :\
        assert( converted.fields[0].required === true);
        assert( converted.fields[0].unique === true);
        // everything else is string
        assert( converted.fields[0].maxLength === 36);


        assert.throws( () => inputSchema.toValues("DomainTypeInput", null), /Root object of type 'DomainTypeInput' cannot be falsy: null/);
        assert.throws( () => inputSchema.fromValues("DomainTypeInput", null), /Form values cannot be falsy/);

    });


});
