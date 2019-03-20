import assert from "power-assert"

import {
    objectType,
    field,
    nonNull,
    list,
    scalar,
    object,
    inputObjectType,
    inputField,
    inputObject
} from "../src/util/runtimeType"


describe("Runtime Type Generation", function () {

    it("creates GraphQL types at runtime ", function () {

        const type = objectType(
            "Test",
            [
                field(
                    "id", nonNull( scalar("String"))
                ),
                field(
                    "name", scalar("String")
                ),
                field(
                    "values", list( scalar("Int"))
                ),
                field(
                    "embedded", object("EmbeddedType")
                )
            ]
        );

        //console.log(JSON.stringify(type, null, 4))

        assert.deepEqual(
            type,
            {
                "kind": "OBJECT",
                "name": "Test",
                "description": "Runtime-generated type",
                "fields": [
                    {
                        "name": "id",
                        "description": "Runtime generated field",
                        "args": [],
                        "type": {
                            "kind": "NON_NULL",
                            "name": null,
                            "ofType": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            }
                        },
                        "isDeprecated": false,
                        "deprecationReason": null
                    },
                    {
                        "name": "name",
                        "description": "Runtime generated field",
                        "args": [],
                        "type": {
                            "kind": "SCALAR",
                            "name": "String",
                            "ofType": null
                        },
                        "isDeprecated": false,
                        "deprecationReason": null
                    },
                    {
                        "name": "values",
                        "description": "Runtime generated field",
                        "args": [],
                        "type": {
                            "kind": "LIST",
                            "name": null,
                            "ofType": {
                                "kind": "SCALAR",
                                "name": "Int",
                                "ofType": null
                            }
                        },
                        "isDeprecated": false,
                        "deprecationReason": null
                    },
                    {
                        "name": "embedded",
                        "description": "Runtime generated field",
                        "args": [],
                        "type": {
                            "kind": "OBJECT",
                            "name": "EmbeddedType",
                            "ofType": null
                        },
                        "isDeprecated": false,
                        "deprecationReason": null
                    }
                ],
                "inputFields": null,
                "interfaces": [],
                "enumValues": null,
                "possibleTypes": null
            }
        )
    });

    
    it("creates GraphQL input types at runtime ", function () {

        const type = inputObjectType(
            "TestInput",
            [
                inputField(
                    "id", nonNull( scalar("String"))
                ),
                inputField(
                    "name", scalar("String")
                ),
                inputField(
                    "values", list( scalar("Int"))
                ),
                inputField(
                    "embedded", inputObject("EmbeddedType")
                )
            ]
        );

        //console.log(JSON.stringify(type, null, 4))

        assert.deepEqual(
            type,
            {
                "kind": "INPUT_OBJECT",
                "name": "TestInput",
                "description": "Runtime-generated type",
                "fields": null,
                "inputFields": [
                    {
                        "name": "id",
                        "description": "Runtime generated input field",
                        "type": {
                            "kind": "NON_NULL",
                            "name": null,
                            "ofType": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            }
                        },
                        "defaultValue": null
                    },
                    {
                        "name": "name",
                        "description": "Runtime generated input field",
                        "type": {
                            "kind": "SCALAR",
                            "name": "String",
                            "ofType": null
                        },
                        "defaultValue": null
                    },
                    {
                        "name": "values",
                        "description": "Runtime generated input field",
                        "type": {
                            "kind": "LIST",
                            "name": null,
                            "ofType": {
                                "kind": "SCALAR",
                                "name": "Int",
                                "ofType": null
                            }
                        },
                        "defaultValue": null
                    },
                    {
                        "name": "embedded",
                        "description": "Runtime generated input field",
                        "type": {
                            "kind": "INPUT_OBJECT",
                            "name": "EmbeddedType",
                            "ofType": null
                        },
                        "defaultValue": null
                    }
                ],
                "interfaces": [],
                "enumValues": null,
                "possibleTypes": null
            }
        )

    });

});
