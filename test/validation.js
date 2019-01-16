import React from "react"
import { cleanup, fireEvent, render, getByLabelText } from "react-testing-library"

import assert from "power-assert"

import getSchema from "./util/getSchema"

import sinon from "sinon"
import Form from "../src/Form";
import Field from "../src/Field";
import FieldMode from "../src/FieldMode";
import { observable } from "mobx";
import userEvent from "user-event";

import itParam from "mocha-param"

describe("High-Level Validation", function () {

    // automatically unmount and cleanup DOM after the tests are finished.
    afterEach( cleanup );


    itParam(
        "does additional field validation ( ${value} error} ",
        [
            // Test single additional error message as return value
            "single",
            // Test array of error messages as return value
            ["multi", "array"]
        ],
        function (err) {

        const renderSpy = sinon.spy();

        /*
            input DomainTypeInput {
              name: String!
              description: String
              fields: [DomainFieldInput]!
              primaryKey: UniqueConstraintInput!
              foreignKeys: [ForeignKeyInput]!
              uniqueConstraints: [UniqueConstraintInput]!
            }
         */

        const formRoot = observable({
            name: "MyType",
            fields: [
                {
                    name: "id",
                    type: "UUID",
                    maxLength: 36,
                    required: true,
                    unique: false
                }, {
                    name: "name",
                    type: "STRING",
                    maxLength: 100,
                    required: true,
                    unique: false
                }
            ],
            foreignKeys: [],
            uniqueConstraints: [],
            primaryKey: {
                fields: ["id"]
            }
        });

        const { container } = render(
            <Form
                schema={ getSchema() }
                type={ "DomainTypeInput" }
                validation={{
                    validateField: (ctx, value) => {

                        if (ctx.qualifiedName === "name" && value === "aaa")
                        {
                            return err;
                        }

                        return null;
                    }
                }}
                value={
                    // we only edit the second field of the domain type
                    formRoot
                }
            >
                {
                    ctx => {

                        renderSpy(ctx);
                        return (
                            <Field name="name"/>
                        );
                    }
                }
            </Form>
        );


        //console.log(prettyDOM(container))

        const input = getByLabelText(container,"name");

        assert(input.value === "MyType");

        userEvent.type(input, "aaa");

        const formConfig = renderSpy.lastCall.args[0];
        assert.deepEqual(formConfig.getErrors("name"), err === "single" ? ["aaa", "single"] : ["aaa", "multi", "array"]);
    });

    it("overrides field context", function () {

        const renderSpy = sinon.spy();

        /*
            input DomainTypeInput {
              name: String!
              description: String
              fields: [DomainFieldInput]!
              primaryKey: UniqueConstraintInput!
              foreignKeys: [ForeignKeyInput]!
              uniqueConstraints: [UniqueConstraintInput]!
            }
         */

        const formRoot = observable({
            name: "MyType",
            fields: [
                {
                    name: "id",
                    type: "UUID",
                    maxLength: 36,
                    required: true,
                    unique: false
                }, {
                    name: "name",
                    type: "STRING",
                    maxLength: 100,
                    required: true,
                    unique: false
                }
            ],
            foreignKeys: [],
            uniqueConstraints: [],
            primaryKey: {
                fields: ["id"]
            }
        });

        const { container } = render(
            <Form
                schema={ getSchema() }
                type={ "DomainTypeInput" }
                validation={{
                    fieldContext: (ctx) => {

                        if (ctx.qualifiedName === "name")
                        {
                            ctx.mode = FieldMode.READ_ONLY
                        }
                    },
                }}
                value={
                    // we only edit the second field of the domain type
                    formRoot
                }
            >
                {
                    ctx => {

                        renderSpy(ctx);
                        return (
                            <Field name="name"/>
                        );
                    }
                }
            </Form>
        );


        //console.log(prettyDOM(container))

        const input = getByLabelText(container,"name");

        assert(input.value === "MyType");
        assert(input.readOnly);
    });

    // field validation and submission tested in field.js, text-area.js, select.js etc
});
