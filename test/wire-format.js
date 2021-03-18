import { describe, it } from "mocha";
import getSchema from "./util/getSchema"
import WireFormat from "../src/WireFormat";
import { isObservableArray, isObservableObject } from "mobx";

import assert from "power-assert"

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

        const converted2 = wireFormat.convert({
            kind: "OBJECT",
            name : "Wrapper"
        }, {
            foos: [{
                "name" : "Foo #1",
                "date":  null
            }]
        }, false);

        assert(converted2.foos[0].date === null);

        const converted3 = wireFormat.convert({
            kind: "OBJECT",
            name : "Wrapper"
        }, {
            foos: [{
                "name" : "Foo #1",
                "date":  null
            }]
        }, true);

        assert(converted3.foos[0].date === null);

        const converted4 = wireFormat.convert({
            kind: "OBJECT",
            name : "Wrapper"
        }, {
            foos: [{
                "name" : "Foo #1",
                "date":  ""
            }]
        }, true);

        assert(converted4.foos[0].date === null);

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

        {
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
        }

        {
            const converted = wireFormat.convert({
                kind: "OBJECT",
                name : "DomainField"
            }, {
                'name': "test",
                'type': "INTEGER",
                'notNull': false,
                'maxLength' : -1
            }, false);

            assert(converted.name === "test");
            assert(converted.type === "INTEGER");
        }

        {
            const converted = wireFormat.convert({
                kind: "OBJECT",
                name : "DomainField"
            }, {
                'name': "test",
                'type': "INTEGER",
                'notNull': false,
                'maxLength' : -1
            }, true);

            assert(converted.name === "test");
            assert(converted.type === "INTEGER");
        }
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

        assert(converted.foos[0].f1 === "Foo #1");
        assert(converted.foos[0].f2 instanceof Date);

    });


    it("does not instantiate classes if they contain aliases", function () {

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
                "f1" : "Foo #1",
                "f2":  "2018-11-16T00:00:00.000Z"
            }]
        },true,{
            "foos.name" : "f1",
            "foos.timestamp" : "f2"
        });


        // objects with alias are not instanciated as class
        assert(!(converted.foos[0] instanceof Foo));
        // but still enjoy field conversion and reassignment
        assert(converted.foos[0].f2 instanceof Date);

    });



    it("converts live JS objects to GraphQL JSON wire format with _type", function () {

        const schema = getSchema();

        const wireFormat = new WireFormat(schema, {

        });

        const now = new Date();

        const converted = wireFormat.convert({
            kind: "OBJECT",
            name : "Wrapper"
        }, {
            foos: [{
                "name" : "Foo #1",
                "timestamp":  now
            }]
        }, { fromWire: false, withType: true });



        assert(converted.foos[0]._type === "Foo");
        assert(converted.foos[0].timestamp === now.toISOString());
    });

    it("converts GraphQL JSON wire format to live JS objects (forced not-wrapped)", function () {

        const schema = getSchema();

        const wireFormat = new WireFormat(schema, {
        }, { wrapAsObservable: true});


        const converted = wireFormat.convert({
            kind: "OBJECT",
            name : "Wrapper"
        }, {
            foos: [{
                "name" : "Foo #1",
                "timestamp":  "2018-11-16T00:00:00.000Z"
            }]
        }, { fromWire: true, withType: true, noWrapping: true });

        assert(!isObservableObject(converted));
        assert(converted.foos[0].timestamp instanceof Date);
        assert(!isObservableArray(converted.foos));

    })

    it("offers simplified conversion methods", function () {

        const schema = getSchema();

        const wireFormat = new WireFormat(schema, {
        }, { wrapAsObservable: true});


        {
            const converted = wireFormat.fromWire("Wrapper", {
                foos: [{
                    "name" : "Foo #1",
                    "timestamp":  "2018-11-16T00:00:00.000Z"
                }]
            });

            assert.deepEqual(
                converted,
                {
                    "_type": "Wrapper",
                    "foos": [
                        {
                            "_type": "Foo",
                            "name": "Foo #1",
                            "timestamp": new Date(Date.parse("2018-11-16T00:00:00.000Z"))

                        }
                    ]
                }
            )

        }

        {
            const converted = wireFormat.toWire("WrapperInput", {
                foos: [{
                    "name" : "Foo #1",
                    "timestamp":  new Date(Date.parse("2018-11-16T00:00:00.000Z"))
                }]
            });

            assert.deepEqual(
                converted,
                {
                    "foos": [
                        {
                            "name": "Foo #1",
                            "timestamp": "2018-11-16T00:00:00.000Z"

                        }
                    ]
                }
            )

        }
    })

});
