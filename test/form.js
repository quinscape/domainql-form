import React from "react"
import { describe, after, afterEach, it } from "mocha";
import { cleanup, fireEvent, render, prettyDOM, act, getAllByLabelText, getByText } from "@testing-library/react"

import assert from "power-assert"

import getSchema from "./util/getSchema"

import sinon from "sinon"
import Form from "../src/Form";
import FormConfig, { FormConfigContext, DEFAULT_OPTIONS } from "../src/FormConfig";
import FormConfigProvider from "../src/FormConfigProvider";
import Field from "../src/Field";
import { observable } from "mobx";
import viewModelToJs from "./util/viewModelToJs";
import userEvent from "@testing-library/user-event";
import dumpUsage from "./util/dumpUsage";
import FormLayout from "../src/FormLayout";
import ErrorStorage from "../src/ErrorStorage";


describe("Form", function () {

    // automatically unmount and cleanup DOM after the tests are finished.
    afterEach( cleanup );

    after(dumpUsage);


    it("provides a form config to render function", function () {

        const submitSpy = sinon.spy();
        let renderSpy = sinon.spy();

        // yup, that's valid
        const {  } = render(
            <Form
                schema={ getSchema() }
                onSubmit={ submitSpy }
                type={ "EnumTypeInput" }
                value={observable({
                    description: "",
                    name: "",
                    values: null
                })}
            >
                {
                    renderSpy
                }
            </Form>
        );

        // the validation causes a re-render, which is more of an implementation detail
        // we look at the last render here only
        const formConfig = renderSpy.lastCall.args[0];

        assert(formConfig instanceof FormConfig);

        assert(formConfig.type === "EnumTypeInput");

        assert(formConfig.getPath("name") === "name");

        assert.throws(
            () => formConfig.getPath("."),
            /'.' is only a valid name with a non-empty base-path/
        );

        //assert(formConfig.formikProps);

        assert(formConfig.root.description === "");
        assert(formConfig.root.name === "");
        assert(formConfig.root.values === null);

    });

    it("validates the initial values", function () {

        /*
            input EnumTypeInput {
              name: String!
              values: [String]!
              description: String
            }
         */

        const submitSpy = sinon.spy();
        let renderSpy = sinon.spy();

        // yup, that's valid
        const {  } = render(
            <Form
                schema={ getSchema() }
                onSubmit={ submitSpy }
                type={ "EnumTypeInput" }
                value={observable( {
                    name: "MYENUM",
                    description: "",
                    values: ["AA","BB","CC"]
                })}
            >
                {
                    renderSpy
                }
            </Form>
        );

        const formConfig = renderSpy.lastCall.args[0];
        assert( formConfig.getErrors("name").length === 0);

        const validConfig = renderSpy.lastCall.args[0];

        assert.deepEqual(viewModelToJs(validConfig.root), {
            "description": "",
            "name": "MYENUM",
            "values": [
                "AA",
                "BB",
                "CC"
            ]
        });

        assert.deepEqual(validConfig.listAllErrors(), []);
    });


    it("provides form config as React context", function () {

        const submitSpy = sinon.spy();
        const consumerSpy = sinon.spy();

        // yup, that's valid
        const {  } = render(
            <Form
                schema={ getSchema() }
                onSubmit={ submitSpy }
                type={ "EnumTypeInput" }
                value={
                    observable({
                        name: "MYENUM"
                    })
                }
            >
                <div>
                    <FormConfigContext.Consumer>
                        { consumerSpy }
                    </FormConfigContext.Consumer>
                </div>
            </Form>
        );

        assert(consumerSpy.called);
        assert(consumerSpy.getCall(0).args[0] instanceof FormConfig)
    });


    it("inherits schema from FormConfigProvider", function () {

        const submitSpy = sinon.spy();

        // no schema at all throws
        // assert.throws(
        //     () =>
        //         render(
        //             <Form
        //                 onSubmit={ submitSpy }
        //                 type={ "EnumTypeInput" }
        //                 value={observable({})}
        //             />
        //         )
        //     ,
        //     /No schema prop given and no FormConfigProvider providing one either/
        // );

        const renderSpy = sinon.spy();

        // yup, that's valid
        const {  } = render(
            <FormConfigProvider
                schema={getSchema() }

            >
            <Form
                onSubmit={ submitSpy }
                type={ "EnumTypeInput" }
                value={
                    observable({
                        name: "MYENUM"
                    })
                }
            >
                { renderSpy }
            </Form>
            </FormConfigProvider>
        );

        assert(renderSpy.called);
        assert(renderSpy.lastCall.args[0] instanceof FormConfig)

    });

    it("inherits options FormConfigProvider", function () {

        const submitSpy = sinon.spy();
        const renderSpy = sinon.spy();

        // yup, that's valid
        const {  } = render(
            <FormConfigProvider
                schema={getSchema() }
                options={{
                    layout: FormLayout.INLINE
                }}

            >
                <Form
                    onSubmit={ submitSpy }
                    type={ "EnumTypeInput" }
                    value={
                        observable({
                            name: "MYENUM"
                        })
                    }
                >
                    { renderSpy }
                </Form>
            </FormConfigProvider>
        );

        assert(renderSpy.called);
        assert(renderSpy.lastCall.args[0] instanceof FormConfig);
        assert(renderSpy.lastCall.args[0].options.layout  === FormLayout.INLINE);


    });

    it("commits on submit by default", function (done) {

        const renderSpy = sinon.spy();

        const formRoot = observable({
            name: "MyEnum",
            values: ["A", "B", "C"],
        });
        const { container, getByLabelText } = render(
            <Form
                schema={ getSchema() }
                type={ "EnumTypeInput" }
                value={
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


        const input = getByLabelText("name");

        userEvent.type(input, "AnotherEnum");

        const formConfig = renderSpy.lastCall.args[0];
        assert(formConfig.root.name === "AnotherEnum");


        const form = container.querySelector("form");


        fireEvent.submit(
            form
        );

        // Cloned object is isolated now
        assert(formRoot.name === "MyEnum");

        done();

    });
    it("supports custom onSubmit", function () {

        const submitSpy = sinon.spy();
        const renderSpy = sinon.spy();

        const { container, getByLabelText } = render(
            <Form
                schema={ getSchema() }
                onSubmit={submitSpy }
                type={ "EnumTypeInput" }
                value={
                    observable({
                        name: "MyEnum",
                        values: ["A", "B", "C"],
                    })
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


        const input = getByLabelText("name");

        userEvent.type(input, "AnotherEnum");

        const formConfig = renderSpy.lastCall.args[0];
        assert(formConfig.root.name === "AnotherEnum");


        const form = container.querySelector("form");


        fireEvent.submit(
            form
        );

        assert(submitSpy.called);

        const clone = submitSpy.lastCall.args[0].root;

        // clone contains new value
        assert(clone.name === "AnotherEnum");



    });


    it("works on sub-elements", function () {

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

        const { container, getByLabelText } = render(
            <Form
                schema={ getSchema() }
                type={ "DomainFieldInput" }
                value={
                    // we only edit the second field of the domain type
                    formRoot.fields[1]
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


        const input = getByLabelText("name");

        assert(input.value === "name");

        userEvent.type(input, "AnotherName");

        const formConfig = renderSpy.lastCall.args[0];
        assert(formConfig.root.name === "AnotherName");


        fireEvent.submit(
            container.querySelector("form")
        );

        // Cloned object is isolated now
        assert(formRoot.fields[1].name === "name");

    });

    it("works on nested fields", function () {

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

        const { container, getByLabelText } = render(
            <Form
                schema={ getSchema() }
                type={ "DomainTypeInput" }
                value={
                    formRoot
                }
            >
                {
                    ctx => {

                        renderSpy(ctx);
                        return (
                            // we only edit the second field of the domain type
                            <Field name="fields.1.name"/>
                        );
                    }
                }
            </Form>
        );


        //console.log(prettyDOM(container))

        const input = getByLabelText("name");

        assert(input.value === "name");

        userEvent.type(input, "AnotherName");

        const formConfig = renderSpy.lastCall.args[0];
        assert(formConfig.root.fields[1].name === "AnotherName");


        fireEvent.submit(
            container.querySelector("form")
        );

        // Cloned object is isolated now
        assert(formRoot.fields[1].name === "name");

    });


    it("supports auto-submit", function (done) {

        let renderSpy = sinon.spy();


        //console.log("AD HOC TYPE", JSON.stringify(adHocType, null, 4));

        const formRoot = observable( {
            name: "MYENUM",
            description: "",
            values: ["AA","BB","CC"]
        });
        let container, getByLabelText;

        act(() => {
            const result = render(
                <Form
                    schema={ getSchema() }
                    type={ "EnumTypeInput" }
                    value={ formRoot }
                    options={{
                        autoSubmit: true,
                        submitTimeOut: 50
                    }}
                >
                    {
                        ctx => {

                            renderSpy(ctx);
                            return (
                                <React.Fragment>
                                    <Field name="name" />
                                </React.Fragment>
                            );
                        }
                    }
                </Form>
            );

            container = result.container;
            getByLabelText = result.getByLabelText;
        });

        const formConfig = renderSpy.lastCall.args[0];

        assert(formConfig instanceof FormConfig);

        assert(formConfig.type === "EnumTypeInput");
        assert(formConfig.root.name === "MYENUM");

        const input = getByLabelText("name");

        assert(input.value === "MYENUM");

        act( () => {
            userEvent.type(input, "New Name");
        });

        setTimeout(() => {
            //console.log(prettyDOM(container))

            // Cloned object is isolated now
            assert(formRoot.name === "MYENUM");

            act( () => {
                fireEvent.change(input, {
                    target: {
                        value: ""
                    }
                });
            });

            const formConfig2 = renderSpy.lastCall.args[0];

            assert.deepEqual(
                formConfig2.getErrors("name"),
                [
                    "",
                    "EnumTypeInput.name:Field Required"
                ]
            );

            setTimeout(() => {
                //console.log(prettyDOM(container))

                // error not auto-submitted, still old value
                // Cloned object is isolated now
                assert(formRoot.name === "MYENUM");


                done();

            }, 100);

        }, 100);

    });


    it("works without predefined type", function () {

        let renderSpy = sinon.spy();

        //console.log("AD HOC TYPE", JSON.stringify(adHocType, null, 4));

        const formRoot = observable({
            field1: "String Field Content",
            field2: 12345,
        });
        let container, getByLabelText;

        act(() => {
            const result = render(
                <Form
                    schema={ getSchema() }
                    value={ formRoot }
                >
                    {
                        ctx => {

                            renderSpy(ctx);
                            return (
                                <React.Fragment>
                                    <Field name="field1" type="String!" />
                                    <Field name="field2" type="Int" />
                                </React.Fragment>
                            );
                        }
                    }
                </Form>
            );

            container = result.container;
            getByLabelText = result.getByLabelText;

        })

        const formConfig = renderSpy.lastCall.args[0];

        assert(formConfig instanceof FormConfig);

        assert(formConfig.root.field1 === "String Field Content");
        assert(formConfig.root.field2 === 12345);

        const input1 = getByLabelText("field1");
        const input2 = getByLabelText("field2");

        assert(input1.value === "String Field Content");
        assert(input2.value === "12345");

        act( () => {
            fireEvent.change(input1, {
                target: {
                    value: ""
                }
            });
        })

        //console.log(prettyDOM(container))

        const formConfig2 = renderSpy.lastCall.args[0];

        assert.deepEqual(
            formConfig2.getErrors("field1"),
            [
                "",
                "field1:Field Required"
            ]
        );

        act( () => {
            userEvent.type(input1, "Changed");
        });

        const formConfig3 = renderSpy.lastCall.args[0];
        assert(formConfig3.root.field1 === "Changed");


        act( () => {
            userEvent.type(input2, "abc");
        });

        const formConfig4 = renderSpy.lastCall.args[0];
        assert.deepEqual(
            formConfig4.getErrors("field2"),
            [
                "abc",
                "Invalid Integer"
            ]
        );

        act( () => {
            userEvent.type(input2, "98765");
        });

        const formConfig5 = renderSpy.lastCall.args[0];
        assert(formConfig5.root.field2 === 98765);


        fireEvent.submit(
            container.querySelector("form")
        );

        // Cloned object is isolated now
        assert(formRoot.field1 === "String Field Content");
        assert(formRoot.field2 === 12345);

    });

    it("optionally works without isolation", function () {

        let renderSpy = sinon.spy();

        //console.log("AD HOC TYPE", JSON.stringify(adHocType, null, 4));

        const formRoot = observable({
            field1: "String Field Content",
            field2: 12345,
        });
        let container, getByLabelText;

        act(() => {
            const result = render(
                <Form
                    schema={ getSchema() }
                    value={ formRoot }
                    options={ { isolation: false } }
                >
                    {
                        ctx => {

                            renderSpy(ctx);
                            return (
                                <React.Fragment>
                                    <Field name="field1" type="String!" />
                                    <Field name="field2" type="Int" />
                                </React.Fragment>
                            );
                        }
                    }
                </Form>
            );

            container = result.container;
            getByLabelText = result.getByLabelText;

        })

        const formConfig = renderSpy.lastCall.args[0];

        assert(formConfig instanceof FormConfig);

        assert(formConfig.root.field1 === "String Field Content");
        assert(formConfig.root.field2 === 12345);

        const input1 = getByLabelText("field1");
        const input2 = getByLabelText("field2");

        assert(input1.value === "String Field Content");
        assert(input2.value === "12345");

        act( () => {
            userEvent.type(input1, "Changed");
        });

        const formConfig3 = renderSpy.lastCall.args[0];
        assert(formConfig3.root.field1 === "Changed");
        assert(formRoot.field1 === "Changed");

        act( () => {
            userEvent.type(input2, "98765");
        });

        const formConfig5 = renderSpy.lastCall.args[0];
        assert(formConfig5.root.field2 === 98765);
        assert(formRoot.field2 === 98765);


        fireEvent.submit(
            container.querySelector("form")
        );

        assert(formRoot.field1 === "Changed");
        assert(formRoot.field2 === 98765);

    });


    it("works on output types", function () {

        const renderSpy = sinon.spy();

        /*
            input DomainType {
              name: String!
              description: String
              fields: [DomainField]!
              primaryKey: UniqueConstraint!
              foreignKeys: [ForeignKey]!
              uniqueConstraints: [UniqueConstraint]!
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

        const { container, getByLabelText } = render(
            <Form
                schema={ getSchema() }
                type={ "DomainType" }
                value={
                    // we only edit the second field of the domain type
                    formRoot
                }
            >
                {
                    ctx => {

                        renderSpy(ctx);
                        return (
                            <React.Fragment>
                                <Field name="fields.1.name"/>
                                <Field name="fields.1.maxLength"/>
                            </React.Fragment>
                        );
                    }
                }
            </Form>
        );


        //console.log(prettyDOM(container))

        const input = getByLabelText("name");
        const input2 = getByLabelText("maxLength");

        assert(input.value === "name");
        assert(input2.value === "100");


        act( () => {
            fireEvent.change(input, {
                target: {
                    value: ""
                }
            });
        });

        //console.log(prettyDOM(container))

        const formConfig = renderSpy.lastCall.args[0];

        assert.deepEqual(
            formConfig.getErrors("fields.1.name"),
            [
                "",
                "DomainField.name:Field Required"
            ]
        );


        act( () => {
            fireEvent.change(input2, {
                target: {
                    value: "abc"
                }
            });
        });

        userEvent.type(input, "AnotherName");

        //console.log(prettyDOM(container))

        const formConfig2 = renderSpy.lastCall.args[0];

        assert.deepEqual(
            formConfig2.getErrors("fields.1.maxLength"),
            [
                "abc",
                "Invalid Integer"
            ]
        );

        userEvent.type(input2, "110");


        const formConfig3 = renderSpy.lastCall.args[0];
        assert(formConfig3.root.fields[1].name === "AnotherName");
        assert(formConfig3.root.fields[1].maxLength === 110);


        fireEvent.submit(
            container.querySelector("form")
        );

        // Cloned object is isolated now
        assert(formRoot.fields[1].name === "name");
        assert(formRoot.fields[1].maxLength === 100);

    });


    it("supports multiple forms with one error context", function () {

        const renderSpyA = sinon.spy();
        const renderSpyB = sinon.spy();

        const errorStorage = new ErrorStorage();

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
            <FormConfigProvider
                errorStorage={ errorStorage }
                options={{
                    isolation: false
                }}
            >
            <Form
                schema={ getSchema() }
                type={ "DomainTypeInput" }
                value={
                    formRoot
                }
            >
                {
                    ctx => {

                        renderSpyA(ctx);
                        return (
                            <React.Fragment>
                                <Field name="fields.0.maxLength"/>
                                <p className="form-control-plainText">{ ctx.hasErrors() ? "0:ERROR" : "0:OK"  } </p>
                            </React.Fragment>
                        );
                    }
                }
            </Form>
            <Form
                schema={ getSchema() }
                type={ "DomainTypeInput" }
                value={
                    formRoot
                }
            >
                {
                    ctx => {

                        renderSpyB(ctx);
                        return (
                            <React.Fragment>
                                <Field name="fields.1.maxLength"/>
                                <p className="form-control-plainText">{ ctx.hasErrors() ? "1:ERROR" : "1:OK"  } </p>
                            </React.Fragment>
                        );
                    }
                }
            </Form>
            </FormConfigProvider>
        );


        //console.log(prettyDOM(container))

        const inputs = getAllByLabelText( container,"maxLength");

        assert(inputs.length === 2);

        assert(inputs[0].value === "36");
        assert(inputs[1].value === "100");

        assert(getByText(container, "0:OK"))
        assert(getByText(container, "1:OK"))

        // type a wrong number
        userEvent.type(inputs[0], "12a");

        const formConfig = renderSpyA.lastCall.args[0];
        // the form stopped updating the value after 12
        assert(formConfig.root.fields[0].maxLength === 12);

        assert.deepEqual(errorStorage.findError(formRoot, "fields.0.maxLength"), ["12a","Invalid Integer"]);
        assert.deepEqual(errorStorage.findError(formRoot, "fields.1.maxLength"), []);

        assert(getByText(container, "0:ERROR"))
        assert(getByText(container, "1:ERROR"))

    });

});
