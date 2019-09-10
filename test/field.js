import React from "react"

import { cleanup, fireEvent, render, wait, prettyDOM, queryByLabelText, getByText, queryByText } from "@testing-library/react"

import assert from "power-assert"

import getSchema from "./util/getSchema"

import sinon from "sinon"
import Form from "../src/Form";
import Field from "../src/Field";

import { observable, runInAction } from "mobx";
import viewModelToJs from "./util/viewModelToJs";
import userEvent from "@testing-library/user-event";
import GlobalConfig from "../src/GlobalConfig";
import { DEFAULT_OPTIONS } from "../src/FormConfig";

import itParam from "mocha-param"
import FieldMode from "../src/FieldMode";
import cartesian from "cartesian";
import ModeLocation from "./util/ModeLocation";
import dumpUsage from "./util/dumpUsage";
import Addon from "../src/Addon";

describe("Field", function () {

    // automatically unmount and cleanup DOM after the tests are finished.
    afterEach(cleanup);

    after( dumpUsage) ;

    itParam(
        "renders as text input (${value})",
        cartesian([
            [FieldMode.NORMAL, FieldMode.DISABLED, FieldMode.READ_ONLY, FieldMode.PLAIN_TEXT, FieldMode.INVISIBLE],
            [ModeLocation.ON_FIELD, ModeLocation.INHERITED]
        ]), function ([mode, loc]) {

            const renderSpy = sinon.spy();

            const formRoot = observable({
                name: "MyEnum",
                values: ["A", "B", "C"],
            });

            const { container } = render(
                <Form
                    schema={getSchema()}
                    type={"EnumTypeInput"}
                    options={{
                        mode: loc === ModeLocation.INHERITED ? mode : null
                    }}
                    value={
                        formRoot
                    }
                >
                    {
                        ctx => {

                            renderSpy(ctx);
                            return (
                                <Field
                                    mode={loc === ModeLocation.ON_FIELD ? mode : null}
                                    name="name"
                                />
                            );
                        }
                    }
                </Form>
            );

            //console.log(loc, mode, prettyDOM(container));

            const input = queryByLabelText(container, "name");
            switch (mode)
            {
                case FieldMode.NORMAL:
                    userEvent.type(input, "AnotherEnum");

                    const formConfig = renderSpy.lastCall.args[0];
                    assert(formConfig.root.name === "AnotherEnum");

                    fireEvent.submit(
                        container.querySelector("form")
                    );

                    assert(formRoot.name === "AnotherEnum");
                    assert(container.querySelectorAll(".form-group").length === 1)
                    break;
                case FieldMode.DISABLED:

                    assert(input.disabled);
                    assert(!input.readOnly);
                    assert(container.querySelectorAll(".form-group").length === 1)
                    break;
                case FieldMode.READ_ONLY:
                    assert(!input.disabled);
                    assert(input.readOnly);
                    assert(container.querySelectorAll(".form-group").length === 1)
                    break;
                case FieldMode.PLAIN_TEXT:
                    assert(input.tagName === "SPAN");
                    assert(input.className.indexOf("form-control-plaintext") >= 0);
                    assert(container.querySelectorAll(".form-group").length === 1)
                    break;
                case FieldMode.INVISIBLE:
                    assert(!input);
                    assert(container.querySelectorAll(".form-group").length === 0)
                    break;
            }

        });

    itParam(
        "renders as checkbox (${value})",
        cartesian([
            [FieldMode.NORMAL, FieldMode.DISABLED, FieldMode.READ_ONLY, FieldMode.PLAIN_TEXT, FieldMode.INVISIBLE],
            [ModeLocation.ON_FIELD, ModeLocation.INHERITED]
        ]), function ([mode, loc]) {

            /*
            input DomainFieldInput {
                name: String!
                description: String
                type: FieldType!
                required: Boolean!
                maxLength: Int!
                sqlType: String
                config: [ConfigValueInput]
                unique: Boolean
            }
             */

            const renderSpy = sinon.spy();

            const formRoot = observable({
                name: "MyField",
                type: "STRING",
                required: true,
                maxLength: -1
            });
            const {container} = render(
                <Form
                    schema={getSchema()}
                    type={"DomainFieldInput"}
                    options={{
                        mode: loc === ModeLocation.INHERITED ? mode : null
                    }}
                    value={
                        formRoot
                    }
                >
                    {
                        ctx => {

                            renderSpy(ctx);
                            return (
                                <Field
                                    mode={loc === ModeLocation.ON_FIELD ? mode : null}
                                    name="required"
                                />
                            );
                        }
                    }
                </Form>
            );

            const checkbox = queryByLabelText(container, "required");

            switch (mode)
            {
                case FieldMode.NORMAL:
                    assert(checkbox.checked === true);
                    fireEvent.click(checkbox);

                    assert(checkbox.checked === false);

                    fireEvent.submit(
                        container.querySelector("form")
                    );

                    assert(formRoot.required === false);
                    assert(container.querySelectorAll(".form-group").length === 1)

                    break;
                case FieldMode.DISABLED:
                case FieldMode.READ_ONLY:
                    assert(checkbox.disabled);
                    assert(container.querySelectorAll(".form-group").length === 1)
                    break;
                case FieldMode.PLAIN_TEXT:
                    assert(checkbox.tagName === "SPAN");
                    assert(checkbox.className.indexOf("form-control-plaintext") >= 0);
                    assert(container.querySelectorAll(".form-group").length === 1)
                    break;
                case FieldMode.INVISIBLE:
                    assert(!checkbox);
                    assert(container.querySelectorAll(".form-group").length === 0)
                    break;
            }

        });

    itParam(
        "renders as enum select (${value})",
        cartesian([
            [FieldMode.NORMAL, FieldMode.DISABLED, FieldMode.READ_ONLY, FieldMode.PLAIN_TEXT],
            [ModeLocation.ON_FIELD, ModeLocation.INHERITED]
        ]), function ([mode, loc]) {

            /*
            input DomainFieldInput {
                name: String!
                description: String
                type: FieldType!
                required: Boolean!
                maxLength: Int!
                sqlType: String
                config: [ConfigValueInput]
                unique: Boolean
            }
             */

            const formRoot = observable({
                name: "MyField",
                type: "STRING",
                required: true,
                maxLength: -1
            });

            const renderSpy = sinon.spy();

            const {container} = render(
                <Form
                    schema={getSchema()}
                    type={"DomainFieldInput"}
                    options={{
                        mode: loc === ModeLocation.INHERITED ? mode : null
                    }}
                    value={
                        formRoot
                    }
                >
                    {
                        ctx => {

                            renderSpy(ctx);
                            return (
                                <Field
                                    mode={loc === ModeLocation.ON_FIELD ? mode : null}
                                    name="type"
                                />
                            );
                        }
                    }
                </Form>
            );

            const select = queryByLabelText(container, "type");

            //console.log(prettyDOM(container))

            switch (mode)
            {
                case FieldMode.NORMAL:
                    assert(select.value === "STRING");

                    fireEvent.change(select, {
                        target: {
                            value: "INTEGER"
                        }
                    });

                    assert(select.value === "INTEGER");

                    fireEvent.submit(
                        container.querySelector("form")
                    );

                    assert(formRoot.type === "INTEGER");

                    assert(container.querySelectorAll(".form-group").length === 1)

                    break;
                case FieldMode.DISABLED:
                case FieldMode.READ_ONLY:
                    assert(select.value === "STRING");
                    assert(select.disabled);
                    assert(container.querySelectorAll(".form-group").length === 1)
                    break;
                case FieldMode.PLAIN_TEXT:
                    assert(select.tagName === "SPAN");
                    assert(select.className.indexOf("form-control-plaintext") >= 0);
                    assert(container.querySelectorAll(".form-group").length === 1)
                    break;
                case FieldMode.INVISIBLE:
                    assert(!select);
                    assert(container.querySelectorAll(".form-group").length === 0)
                    break;
            }

        });

    it("validates according to field type", function () {

        /*
        input DomainFieldInput {
            name: String!
            description: String
            type: FieldType!
            required: Boolean!
            maxLength: Int!
            sqlType: String
            config: [ConfigValueInput]
            unique: Boolean
        }
         */

        const formRoot = observable({
            name: "MyField",
            type: "STRING",
            required: true,
            maxLength: -1
        });

        const renderSpy = sinon.spy();

        const {container} = render(
            <Form
                schema={getSchema()}
                type={"DomainFieldInput"}
                value={formRoot}
            >
                {
                    ctx => {

                        renderSpy(ctx);
                        return (
                            <Field name="maxLength"/>
                        );
                    }
                }
            </Form>
        );

        const numericInput = queryByLabelText(container, "maxLength");
        assert(numericInput.value === "-1");

        userEvent.type(numericInput, "1a");

        const formConfig = renderSpy.lastCall.args[0];

        // value is *not* written back into view model
        assert(formConfig.root.maxLength === 1);
        // it's kept as first error followed by the actual first error
        assert.deepEqual(formConfig.getErrors("maxLength"), ["1a", "Invalid Integer"]);

    });

    it("handles required fields", function () {

        /*
        input DomainFieldInput {
            name: String!
            description: String
            type: FieldType!
            required: Boolean!
            maxLength: Int!
            sqlType: String
            config: [ConfigValueInput]
            unique: Boolean
        }
         */

        const formRoot = observable({
            name: "MyField",
            type: "STRING",
            required: true,
            maxLength: -1
        });

        const renderSpy = sinon.spy();

        const {container} = render(
            <Form
                schema={getSchema()}
                type={"DomainFieldInput"}
                value={formRoot}
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

        const nameInput = queryByLabelText(container, "name");
        assert(nameInput.value === "MyField");


        fireEvent.change(nameInput, {
            target: {
                value: ""
            }
        });

        const formConfig = renderSpy.lastCall.args[0];

        assert(nameInput.value === "");
        // value is *not* written back into view model
        assert(formConfig.root.name === "MyField");
        // it's kept as first error followed by the actual first error
        assert.deepEqual(formConfig.getErrors("name"), ["","DomainFieldInput.name:Field Required"]);

    });

    // make sure to de-register our label lookup to not disturb other tests
    after(() => GlobalConfig.registerLabelLookup(null));

    it("provides a field context to render function children", function () {

        GlobalConfig.registerLabelLookup((formConfig, name) => {
            return "[ " + formConfig.type + "." + name + " ]";
        });

        const schema = getSchema();
        const renderSpy = sinon.spy();

        const formRoot = observable({
            name: "MyField",
            type: "STRING",
            required: true,
            maxLength: -1
        });
        const {container} = render(
            <Form
                schema={schema}
                type={"DomainFieldInput"}
                value={formRoot}
            >
                {
                    ctx => {

                        return (
                            <Field name="description">
                                {
                                    (formConfig, fieldContext) => {

                                        renderSpy(formConfig, fieldContext);

                                        const { root} = formConfig;
                                        return (

                                            <React.Fragment>
                                                <p>
                                                    {
                                                        JSON.stringify(root.name)
                                                    }
                                                </p>
                                                <button type="button"
                                                        onClick={() => runInAction(() => root.name = "From Button")}>
                                                    SetFromButton
                                                </button>
                                            </React.Fragment>
                                        );
                                    }
                                }

                            </Field>
                        );
                    }
                }
            </Form>
        );

        const formConfig = renderSpy.lastCall.args[0];
        const fieldContext = renderSpy.lastCall.args[1];

        //console.log({fieldContext});

        assert(fieldContext.fieldId === "field-DomainFieldInput-description");
        assert(formConfig.schema === schema);
        assert(formConfig.type === "DomainFieldInput");
        assert.deepEqual(formConfig.options, DEFAULT_OPTIONS);
        assert(fieldContext.fieldType.kind === "SCALAR");
        assert(fieldContext.fieldType.name === "String");
        assert(fieldContext.qualifiedName === "description");
        assert.deepEqual(fieldContext.path, ["description"]);
        assert(fieldContext.label === "[ DomainFieldInput.description ]");

        const paragraph = container.querySelector("p");

        assert(paragraph.innerHTML === "\"MyField\"");

        const button = getByText(container, "SetFromButton");

        fireEvent.click(button);

        assert(formConfig.root.name === "From Button");
        assert(formConfig.root.model.name === "MyField");

    })

    it("optionally renders field addons", function () {

        const schema = getSchema();

        const formRoot = observable({
            name: "MyField",
            type: "STRING",
            required: true,
            maxLength: -1
        });

        {

            const { container } = render(
                <Form
                    schema={schema}
                    type={"DomainFieldInput"}
                    value={formRoot}
                >
                    {
                        ctx => {

                            return (
                                <Field name="description">
                                    <Addon placement={ Addon.LEFT} text={ true}>LEFT</Addon>
                                    <Addon placement={ Addon.RIGHT} text={ false}>RIGHT</Addon>
                                </Field>
                            );
                        }
                    }
                </Form>
            );

            const addonLeft = getByText(container, "LEFT");
            const addonRight = getByText(container, "RIGHT");

            assert(addonLeft.className === "input-group-text");
            assert(addonLeft.parentNode.className === "input-group-prepend");
            assert(addonRight.className === "input-group-append");
        }

        {

            const { container } = render(
                <Form
                    schema={schema}
                    type={"DomainFieldInput"}
                    value={formRoot}
                >
                    {
                        ctx => {

                            return (
                                <Field name="description" addons={ [ <Addon placement={ Addon.LEFT} text={ true}>PROP-ADDON</Addon> ] }>
                                    <Addon placement={ Addon.RIGHT} text={ false}>RIGHT</Addon>
                                </Field>
                            );
                        }
                    }
                </Form>
            );

            const propAddon = getByText(container, "PROP-ADDON");
            const addonRight = queryByText(container, "RIGHT");

            // addons array prop works and has precedence over child addons
            assert(propAddon.className === "input-group-text");
            assert(propAddon.parentNode.className === "input-group-prepend");
            assert(!addonRight);
        }
    })
});
