import React from "react"

import { act, cleanup, fireEvent, render, wait, prettyDOM, queryByLabelText, getByText, queryByText } from "@testing-library/react"

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
import { FormContext } from "../src";

describe("Field", function () {

    // automatically unmount and cleanup DOM after the tests are finished.
    afterEach(cleanup);

    after( dumpUsage) ;

    beforeEach(
        () => {
            const formContext = new FormContext(getSchema());
            formContext.useAsDefault();
        }
    )

    itParam(
        "renders as text input (${value})",
        cartesian([
            [FieldMode.NORMAL, FieldMode.DISABLED, FieldMode.READ_ONLY, FieldMode.PLAIN_TEXT, FieldMode.INVISIBLE],
            [ModeLocation.ON_FIELD, ModeLocation.INHERITED]
        ]), function ([mode, loc]) {

            const renderSpy = sinon.spy();

            const formRoot = observable({
                _type: "EnumTypeInput",
                name: "MyEnum",
                values: ["A", "B", "C"],
            });

            const { container } = render(
                <Form
                    type={"EnumTypeInput"}
                    options={{
                        mode: loc === ModeLocation.INHERITED ? mode : null,
                        isolation: true
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

                    // Cloned object is isolated now
                    assert(formRoot.name === "MyEnum");
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
                    type={"DomainFieldInput"}
                    options={{
                        mode: loc === ModeLocation.INHERITED ? mode : null,
                        isolation: true

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

                    // Cloned object is isolated now
                    assert(formRoot.required === true);
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
                    type={"DomainFieldInput"}
                    options={{
                        mode: loc === ModeLocation.INHERITED ? mode : null,
                        isolation: true
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

                    // Cloned object is isolated now
                    assert(formRoot.type === "STRING");

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
    afterEach(() => GlobalConfig.registerLabelLookup(null));

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

        assert( /^c[0-9]+:f[0-9]+:description$/.test(fieldContext.fieldId));
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
        //assert(formConfig.root.model.name === "MyField");

    })

    it("optionally renders field addons", function () {

        const clickSpy = sinon.spy();

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
                    type={"DomainFieldInput"}
                    value={formRoot}
                >
                    {
                        ctx => {

                            return (
                                <Field name="description">
                                    <Addon placement={ Addon.BEFORE} text={ true} className="test-1">BEFORE</Addon>
                                    <Addon placement={ Addon.LEFT} text={ true}>LEFT</Addon>
                                    <Addon placement={ Addon.RIGHT}><button type="button" onClick={ () => clickSpy("RIGHT") }>RIGHT</button></Addon>
                                    <Addon placement={ Addon.AFTER} className="test-2"><button type="button" onClick={ () => clickSpy("AFTER") }>AFTER</button></Addon>
                                </Field>
                            );
                        }
                    }
                </Form>
            );

            //console.log(prettyDOM(container))

            const addonBefore = getByText(container, "BEFORE");
            const addonLeft = getByText(container, "LEFT");
            const addonRight = getByText(container, "RIGHT");
            const addonAfter = getByText(container, "AFTER");

            assert(addonBefore.className === "test-1");
            assert(addonBefore.parentNode.className === "form-group");

            assert(addonLeft.className === "input-group-text");
            assert(addonLeft.parentNode.className === "input-group-prepend");

            assert(addonLeft.className === "input-group-text");
            assert(addonLeft.parentNode.className === "input-group-prepend");
            assert(addonRight.nodeName === "BUTTON");
            assert(addonRight.parentNode.className === "input-group-append");

            assert(addonAfter.nodeName === "BUTTON");
            assert(addonAfter.parentNode.className === "test-2");
            assert(addonAfter.parentNode.parentNode.className === "form-group");

            act(
                () => addonRight.click()
            )

            assert(clickSpy.calledOnce)
            assert(clickSpy.lastCall.args[0] === "RIGHT")

            act(
                () => addonAfter.click()
            )

            assert(clickSpy.calledTwice)
            assert(clickSpy.lastCall.args[0] === "AFTER")
        }

        // the existence of prop adddons hides child addons
        {

            const { container } = render(
                <Form
                    type={"DomainFieldInput"}
                    value={formRoot}
                >
                    {
                        ctx => {

                            return (
                                <Field name="name" addons={ [ <Addon placement={ Addon.LEFT} text={ true}>PROP-ADDON</Addon> ] }>
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

        // for plain text fields, the true bootstrap addons are moved to the outside
        {

            const { container } = render(
                <Form
                    type={"DomainFieldInput"}
                    value={formRoot}
                >
                    {
                        ctx => {

                            return (
                                <Field name="name" mode={ FieldMode.PLAIN_TEXT }>
                                    <Addon placement={ Addon.LEFT } moveIfPlainText={ true }>
                                        LEFT
                                    </Addon>
                                    <Addon placement={ Addon.RIGHT } moveIfPlainText={ true }>
                                        RIGHT
                                    </Addon>
                                </Field>
                            );
                        }
                    }
                </Form>
            );

            const addonLeft = getByText(container, "LEFT");
            const addonRight = queryByText(container, "RIGHT");

            // addons got moved outside, not rendered as part of input-group
            assert(addonLeft.parentNode.className === "form-group");
            assert(addonRight.parentNode.className === "form-group");
        }
    })

    it("forwards refs", function () {

        const renderSpy = sinon.spy();

        const formRoot = observable({
            _type: "EnumTypeInput",
            name: "MyEnum",
            values: ["A", "B", "C"],
        });

        const ref = React.createRef();

        let container;

        act(() => {
            const result = render(
                <Form
                    type={"EnumTypeInput"}
                    options={{isolation: false}}
                    value={
                        formRoot
                    }
                >
                    {
                        ctx => {

                            renderSpy(ctx);
                            return (
                                <Field
                                    ref={ref}
                                    name="name"
                                />
                            );
                        }
                    }
                </Form>
            );

            container = result.container;
        })

        // ref value is set to input
        assert(ref.current.value === "MyEnum")

    });

    it("provides optional local change handler", function () {

        const renderSpy = sinon.spy();
        const onChangeSpy = sinon.spy();

        const formRoot = observable({
            _type: "EnumTypeInput",
            name: "MyEnum",
            values: ["A", "B", "C"],
        });

        const { container } = render(
            <Form
                type={"EnumTypeInput"}
                options={{ isolation: false }}
                value={
                    formRoot
                }
            >
                {
                    ctx => {

                        renderSpy(ctx);
                        return (
                            <Field
                                name="name"
                                onChange={ onChangeSpy }
                            />
                        );
                    }
                }
            </Form>
        );

        //console.log(loc, mode, prettyDOM(container));



        const input = queryByLabelText(container, "name");

        act(() => { userEvent.type(input, "Zeno") })

        const formConfig = renderSpy.lastCall.args[0];

        assert(formConfig.root.name === "Zeno");
        assert(!formConfig.getErrors("name").length);

        assert(onChangeSpy.called)
        assert(onChangeSpy.lastCall.args[0].isFieldContext)
        assert(onChangeSpy.lastCall.args[0].qualifiedName === "name")
        assert(onChangeSpy.lastCall.args[1] === "Zeno")

    });
    it("provides optional local validation", function () {

        const renderSpy = sinon.spy();

        const formRoot = observable({
            _type: "EnumTypeInput",
            name: "MyEnum",
            values: ["A", "B", "C"],
        });

        const { container } = render(
            <Form
                type={"EnumTypeInput"}
                options={{ isolation: false }}
                value={
                    formRoot
                }
            >
                {
                    ctx => {

                        renderSpy(ctx);
                        return (
                            <Field
                                name="name"
                                validate={ (ctx, value) => {

                                    return value.indexOf("Z") === 0 ? "NO Z" : null;

                                }}
                            />
                        );
                    }
                }
            </Form>
        );

        //console.log(loc, mode, prettyDOM(container));



        const input = queryByLabelText(container, "name");

        act(() => { userEvent.type(input, "Zeno") })

        const formConfig = renderSpy.lastCall.args[0];

        // values deemed invalid by local validation are not written through
        assert(formConfig.root.name === "MyEnum");

        assert.deepEqual(formConfig.getErrors("name"), ["Zeno","NO Z"]);


        act(() => { userEvent.type(input, "Anaximander") });

        assert(formConfig.root.name === "Anaximander");
        assert(formRoot.name === "Anaximander");

        assert(!formConfig.getErrors("name").length);
    });

    it("validates maximum length on 'String' fields", function () {

        const renderSpy = sinon.spy();

        const formRoot = observable({
            _type: "EnumTypeInput",
            name: "MyEnum",
            values: ["A", "B", "C"],
        });

        const { container } = render(
            <Form
                type={"EnumTypeInput"}
                options={{ isolation: false }}
                value={
                    formRoot
                }
            >
                {
                    ctx => {

                        renderSpy(ctx);
                        return (
                            <Field
                                name="name"
                                maxLength={ 6 }
                            />
                        );
                    }
                }
            </Form>
        );

        //console.log(loc, mode, prettyDOM(container));



        const input = queryByLabelText(container, "name");

        act(() => { userEvent.type(input, "LongerName") })

        const formConfig = renderSpy.lastCall.args[0];

        // The value only gets written back as long as its below maxLength, so it stops at "Longer"
        assert(formConfig.root.name === "Longer");

        assert.deepEqual(formConfig.getErrors("name"), ["LongerName","Value too long"]);


        act(() => { userEvent.type(input, "Short") });

        assert(formConfig.root.name === "Short");
        assert(formRoot.name === "Short");

        assert(!formConfig.getErrors("name").length);
    });
});
