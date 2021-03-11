import getSchema from "./util/getSchema"
import InputSchema from "../src/InputSchema";

import assert from "power-assert"

import ADDRESS_OBJECT_TYPED from "./address.json"
import ADDRESS_OBJECT_VALUES from "./address-values.json"
import dumpUsage from "./util/dumpUsage";
import { describe, it } from "mocha";
import { observable } from "mobx";

import rawResolveSchema from "./inputschema-resolve-schema.json"

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

    it("clones objects", function () {
        const inputSchema = getSchema();

        const orig = observable({
            _type: "Foo",
            name: "Test-Foo"

        });
        const clone = inputSchema.clone(orig);

        assert(clone._type === "Foo")
        assert(clone.name === "Test-Foo")
        assert(clone.id === undefined)

    })

    it("resolves path types", function () {
        const inputSchema = new InputSchema(
            rawResolveSchema
        );

        assert.deepEqual(
            inputSchema.resolveType("QuxMain", "name"),
            {
                "kind": "NON_NULL",
                "name": null,
                "ofType": {
                    "kind": "SCALAR",
                    "name": "String",
                    "ofType": null
                }
            }
        )

        assert.deepEqual(
            inputSchema.resolveType("QuxMain", "quxA"),
            {
                "kind": "NON_NULL",
                "name": null,
                "ofType": {
                    "kind": "OBJECT",
                    "name": "QuxA",
                    "ofType": null
                }
            }
        )

        assert.deepEqual(
            inputSchema.resolveType("QuxMain", "quxA.name"),
            {
                "kind": "NON_NULL",
                "name": null,
                "ofType": {
                    "kind": "SCALAR",
                    "name": "String",
                    "ofType": null
                }
            }
        )

        assert.deepEqual(
            inputSchema.resolveType("Baz", "bazLinks.0.value"),
            {
                "kind": "NON_NULL",
                "name": null,
                "ofType": {
                    "kind": "OBJECT",
                    "name": "BazValue",
                    "ofType": null
                }
            }
        )

        assert.deepEqual(
            inputSchema.resolveType("Baz", "bazLinks.0.value.name"),
            {
                "kind": "NON_NULL",
                "name": null,
                "ofType": {
                    "kind": "SCALAR",
                    "name": "String",
                    "ofType": null
                }
            }
        )

        assert.deepEqual(
            inputSchema.resolveType("TripleA", "tripleB.tripleC"),
            {
                "kind": "OBJECT",
                "name": "TripleC",
                "ofType": null
            }
        )
        assert.deepEqual(
            inputSchema.resolveType("TripleA", "tripleB.tripleC.name"),
            {
                "kind": "SCALAR",
                "name": "String",
                "ofType": null
            }
        )

    })

});
