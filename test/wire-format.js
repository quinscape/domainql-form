import getSchema from "./util/getSchema"
import WireFormat from "../src/WireFormat";
import { isObservableObject } from "mobx";

import assert from "power-assert"

import ADDRESS_OBJECT_TYPED from "./address.json"
import ADDRESS_OBJECT_VALUES from "./address-values.json"

describe("Wire Format", function () {

    it("converts GraphQL JSON wire format to live JS objects", function () {

        const schema = getSchema();

        const wireFormat = new WireFormat(schema, {

        });


        const converted = wireFormat.convert({
            kind: "OBJECT",
            name : "Wrapper"
        }, {
            foos: [{
                "name" : "Foo #1",
                "timestamp":  "2018-11-16T00:00:00.000Z"
            }]
        }, true);

        assert(converted.foos[0].timestamp instanceof Date);

    });

    it("supports wrapping received values as mobx observables", function () {

        const schema = getSchema();

        const wireFormat = new WireFormat(schema, {

        }, { wrapAsObservable: true })

        const converted = wireFormat.convert({
            kind: "OBJECT",
            name : "Wrapper"
        }, {
            foos: [{
                "name" : "Foo #1",
                "timestamp":  "2018-11-16T00:00:00.000Z"
            }]
        }, true);

        assert(isObservableObject(converted.foos[0]));

    });

    it("supports instantiating classes for GraphQL object types", function () {

        class Foo
        {
            name;
            foos;
        }

        const schema = getSchema();

        const wireFormat = new WireFormat(schema, {
            Foo
        }, { wrapAsObservable: true })

        const converted = wireFormat.convert({
            kind: "OBJECT",
            name : "Wrapper"
        }, {
            foos: [{
                "name" : "Foo #1",
                "timestamp":  "2018-11-16T00:00:00.000Z"
            }]
        }, true);

        assert(converted.foos[0] instanceof Foo);

    });


    it("converts live JS objects to GraphQL JSON wire format", function () {

        const schema = getSchema();

        const wireFormat = new WireFormat(schema, {

        });

        const now = new Date();

        const converted = wireFormat.convert({
            kind: "OBJECT",
            name : "WrapperInput"
        }, {
            foos: [{
                "name" : "Foo #1",
                "timestamp":  now
            }]
        }, false);

        assert(converted.foos[0].timestamp === now.toISOString());
    });

    it("resolves aliases", function () {
        const schema = getSchema();

        const wireFormat = new WireFormat(schema, {

        });


        const converted = wireFormat.convert({
            kind: "OBJECT",
            name : "Wrapper"
        }, {
            foos: [{
                "f1" : "Foo #1",
                "f2":  "2018-11-16T00:00:00.000Z"
            }]
        }, true, {
            "foos.name" : "f1",
            "foos.timestamp" : "f2"
        });

        assert(converted.foos[0].name === "Foo #1");
        assert(converted.foos[0].timestamp instanceof Date);



    });

});
