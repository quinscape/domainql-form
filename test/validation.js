import React from "react"
import { cleanup, fireEvent, render, getByLabelText } from "@testing-library/react"

import assert from "power-assert"

import sinon from "sinon"
import Form from "../src/Form";
import Field from "../src/Field";
import FieldMode from "../src/FieldMode";
import { observable } from "mobx";
import userEvent from "@testing-library/user-event";

import itParam from "mocha-param"
import ModeLocation from "./util/ModeLocation";
import { FormContext, InputSchema } from "../src";
import rawSchema from "./schema.json";
import clearAndType from "./util/clearAndType";

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

        const formContext = new FormContext(new InputSchema(rawSchema), {
            validation: {
                validateField: (ctx, value) => {

                    if (ctx.qualifiedName === "name" && value === "aaa")
                    {
                        return err;
                    }

                    return null;
                }
            }
        })
            formContext.useAsDefault();

        const { container } = render(
            <Form
                type={ "DomainTypeInput" }
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

        clearAndType(input, "aaa");

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

        const formContext = new FormContext(new InputSchema(rawSchema), {
            validation: {
                fieldContext: (ctx) => {

                    if (ctx.qualifiedName === "name")
                    {
                        ctx.mode = FieldMode.READ_ONLY
                    }
                },
            }
        })
        formContext.useAsDefault();

        const { container } = render(
            <Form
                type={ "DomainTypeInput" }
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


    it("receives empty string values", function () {

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
            description: "Bla",
            fields: [
                {
                    name: "id",
                    type: "UUID",
                    maxLength: 36,
                    required: true,
                    unique: false
                }, {
                    name: "description",
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

        const formContext = new FormContext(new InputSchema(rawSchema), {
            validation: {
                validateField: (ctx, value) => {

                    if (value === "")
                    {
                        return "EMPTY IN HL";
                    }

                    return null;
                }
            }
        })
        formContext.useAsDefault();

        const { container } = render(
            <Form
                type={ "DomainTypeInput" }
                value={
                    // we only edit the second field of the domain type
                    formRoot
                }
            >
                {
                    ctx => {

                        renderSpy(ctx);
                        return (
                            <Field name="description"/>
                        );
                    }
                }
            </Form>
        );


        //console.log(prettyDOM(container))

        const input = getByLabelText(container,"description");

        assert(input.value === "Bla");

        fireEvent.change(input, {
            target: {
                value: ""
            }
        });


        const formConfig = renderSpy.lastCall.args[0];
        assert.deepEqual(formConfig.getErrors("description"), ["","EMPTY IN HL"]);
    });

    // field validation and submission tested in field.js, text-area.js, select.js etc
});
