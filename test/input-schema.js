import getSchema from "./util/getSchema"
import InputSchema from "../src/InputSchema";

import assert from "power-assert"

import ADDRESS_OBJECT_TYPED from "./address.json"
import ADDRESS_OBJECT_VALUES from "./address-values.json"
import dumpUsage from "./util/dumpUsage";

describe("InputSchema", function () {

    after(dumpUsage);

    it("converts complex values to string values", function () {

        const inputSchema = getSchema();


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

    it("converts string values back to typed values", function () {

        const inputSchema = getSchema();

        const converted = inputSchema.fromValues("DomainTypeInput", ADDRESS_OBJECT_VALUES);

        //console.log(converted);

        assert( converted.name === "Address");
        assert( converted.description === null);
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
