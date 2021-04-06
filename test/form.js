import React from "react"
import { describe, after, afterEach, it } from "mocha";
import { cleanup, fireEvent, render, prettyDOM, act, getAllByLabelText, getByText, getByLabelText,flushEffects } from "@testing-library/react"

import assert from "power-assert"

import getSchema from "./util/getSchema"

import sinon from "sinon"
import Form from "../src/Form";
import FormConfig, { FormConfigContext, DEFAULT_OPTIONS } from "../src/FormConfig";
import FormConfigProvider from "../src/FormConfigProvider";
import Field from "../src/Field";
import { observable, runInAction } from "mobx";
import { observer as fnObserver } from "mobx-react-lite";
import viewModelToJs from "./util/viewModelToJs";
import userEvent from "@testing-library/user-event";
import dumpUsage from "./util/dumpUsage";
import FormLayout from "../src/FormLayout";
import FormContext from "../src/FormContext";
import assertRenderThrows from "./util/assertRenderThrows";
import useFormConfig from "../src/useFormConfig";


describe("Form", function () {

    // automatically unmount and cleanup DOM after the tests are finished.
    afterEach( cleanup);

    //afterEach( resetFormContext );

    beforeEach(
        () => {
            const formContext = new FormContext(getSchema());
            formContext.useAsDefault();
        }
    )

    it("provides a form config to render function", function () {

        const submitSpy = sinon.spy();
        let renderSpy = sinon.spy();

        // yup, that's valid
        const {  } = render(
            <Form
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
            <FormConfigProvider>
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
                type={ "EnumTypeInput" }
                options={{
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
                type={ "DomainFieldInput" }
                options={{
                    isolation: true
                }}
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
                type={ "DomainTypeInput" }
                options={{
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
                    type={ "EnumTypeInput" }
                    value={ formRoot }
                    options={{
                        isolation: true,
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
                    value={ formRoot }
                    options={{
                        isolation: true
                    }}
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

    it("works without isolation by default", function () {

        let renderSpy = sinon.spy();

        //console.log("AD HOC TYPE", JSON.stringify(adHocType, null, 4));

        const formRoot = observable({
            field1: "String Field Content",
            field2: 12345,
        });
        let container, getByLabelText;


        // XXX: isolation used to be the default and a lot of tests still use it, but the default is no isolation now,
        //      i.e. the form writes directly into the observables.

        act(() => {
            const result = render(
                <Form
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
                type={ "DomainType" }
                value={
                    // we only edit the second field of the domain type
                    formRoot
                }
                options={{
                    isolation: true
                }}
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


        // XXX: we test two forms with the same form context and different root objects.
        const { container } = render(
            <FormConfigProvider
                options={{
                    isolation: false
                }}
            >
                <Form
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
                                    <Field name="name"/>
                                    <p className="form-control-plainText">{ ctx.hasErrors() ? "0:ERROR" : "0:OK"  } </p>
                                </React.Fragment>
                            );
                        }
                    }
                </Form>
                <Form
                    type={ "DomainFieldInput" }
                    value={
                        formRoot.fields[1]
                    }
                >
                    {
                        ctx => {

                            renderSpyB(ctx);
                            return (
                                <React.Fragment>
                                    <Field name="maxLength"/>
                                    <p className="form-control-plainText">{ ctx.hasErrors() ? "1:ERROR" : "1:OK"  } </p>
                                </React.Fragment>
                            );
                        }
                    }
                </Form>
            </FormConfigProvider>
        );


        //console.log(prettyDOM(container))

        const nameInput = getByLabelText(container, "name");
        const maxLenInput = getByLabelText(container, "maxLength");

        assert(nameInput.value === "MyType");
        assert(maxLenInput.value === "100");

        assert(getByText(container, "0:OK"))
        assert(getByText(container, "1:OK"))

        // type a wrong number
        userEvent.type(maxLenInput, "12a");

        const formConfig = renderSpyA.lastCall.args[0];
        // the form stopped updating the value after 12
        assert(formConfig.root.fields[1].maxLength === 12);

        assert.deepEqual(FormContext.getDefault().findError(formRoot.fields[1], "maxLength"), ["12a","Invalid Integer"]);

        assert(getByText(container, "0:ERROR"))
        assert(getByText(container, "1:ERROR"))
    });


    it("passes through an optional id attribute", function () {

        const submitSpy = sinon.spy();
        const renderSpy = sinon.spy();

        // yup, that's valid
        const {  } = render(
            <FormConfigProvider>
                <Form
                    id="my-form"
                    onSubmit={ submitSpy }
                    type={ "EnumTypeInput" }
                    value={
                        observable({
                            name: "Elmer"
                        })
                    }
                >
                    { formConfig => {
                        renderSpy(formConfig);
                        return (
                            <React.Fragment>
                                <Field name="name" />
                            </React.Fragment>
                        );
                    } }
                </Form>
            </FormConfigProvider>
        );

        assert(renderSpy.called);
        assert(renderSpy.lastCall.args[0] instanceof FormConfig);

        const form = document.querySelector("#my-form");


        assert(form.elements[0].value === "Elmer")

    });

    it("works with null form object", () => {

        const renderSpy = sinon.spy();

        const TestErrors = fnObserver(({name = "ERRORS"}) => {

            const formConfig = useFormConfig();

            return (
                <span>
                    { name }:{ String(formConfig.hasErrors()) }
                </span>
            )
        });


        const FormComponent = fnObserver(({state, renderSpy}) => {
            return (
                <React.Fragment>

                    <TestErrors name="OUTSIDE"/>
                    <Form
                        key={ state.formObject && state.formObject.id }
                        id="my-form"
                        type={ "EnumTypeInput" }
                        value={
                            state.formObject
                        }
                    >
                        { formConfig => {
                            renderSpy(formConfig);
                            return (
                                <React.Fragment>
                                    <Field name="name" />
                                    <TestErrors name="INSIDE"/>
                                </React.Fragment>
                            );
                        } }
                    </Form>
                </React.Fragment>
            )
        })

        const state = observable({
            /*
                input EnumTypeInput {
                  name: String!
                  values: [String]!
                  description: String
                }
             */
            formObject: null
        });

        let container;

        act(
            () => {
                const result = render(
                    <FormConfigProvider>
                        <FormComponent
                            state={ state }
                            renderSpy={ renderSpy }
                        />
                    </FormConfigProvider>
                );

                container = result.container;
            }
        )

        //console.log(prettyDOM(container))

        const input = getByLabelText(container, "name")

        assert(input.disabled)
        assert(input.value === "")

        assert(getByText(container, "OUTSIDE:false"))
        assert(getByText(container, "INSIDE:false"))

        return Promise.resolve()
            .then(() => {

                act(
                    () => {
                        runInAction(
                            () => state.formObject = {
                                id: "2840e722-fde0-41f9-8e95-3147e378b9a8",
                                name: "MyEnum",
                                values: ["A", "B", "C"],
                            }
                        )
                    }
                )

                assert(getByText(container, "OUTSIDE:false"))
                assert(getByText(container, "INSIDE:false"))

                const nameInput = getByLabelText(container, "name")

                assert(!nameInput.disabled)
                assert(nameInput.value === "MyEnum")

                act(
                    () => {
                        userEvent.type(nameInput, "AnotherEnum");
                    }
                )

                const formConfig = renderSpy.lastCall.args[0];
                assert(formConfig.root.name === "AnotherEnum");
                assert(state.formObject.name === "AnotherEnum");

                act(
                    () => {
                        fireEvent.change(nameInput, {
                            target: {
                                value: ""
                            }
                        });
                    }
                )


                const formConfig2 = renderSpy.lastCall.args[0];
                assert.deepEqual(formConfig2.getErrors("name"), ["","EnumTypeInput.name:Field Required"]);

                assert(getByText(container, "OUTSIDE:true"))
                assert(getByText(container, "INSIDE:true"))


                // XXX: Make sure we still complain about wrong field names
                assertRenderThrows(
                    <FormConfigProvider>
                        <Form
                            key={ state.formObject && state.formObject.id }
                            id="my-form"
                            type={ "EnumTypeInput" }
                            value={
                                null
                            }
                        >
                            { formConfig => {
                                renderSpy(formConfig);
                                return (
                                    <React.Fragment>
                                        <Field name="name2" />
                                    </React.Fragment>
                                );
                            } }
                        </Form>
                    </FormConfigProvider>,
                    /Could not find 'name2'/
                )
            })

    })

    it("performs revalidation grouped by form context", function () {

        const renderSpyA = sinon.spy();
        const renderSpyB = sinon.spy();

        /*
            input DomainTypeInput {
              name: String!
              description: String
              fields: [DomainFieldInput]!
              primaryKey: UniqueConstraintInput!
              foreignKeys: [ForeignKeyInput]!
              uniqueConstraints: [UniqueConstraintInput]!
            }

            input DomainFieldInput
            {
                description : String
                maxLength : Int!
                name : String!
                required : Boolean!
                sqlType : String
                type : FieldType!
                unique : Boolean
            }


         */

        const formRoot = observable({
            name: null,
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
                    maxLength: null,
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


        // XXX: we test two forms with the same form context and different root objects.
        const { container } = render(
            <FormConfigProvider
                options={{
                    isolation: false
                }}
            >
                <Form
                    id="domain-type-form"
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
                                    <Field name="name"/>
                                    <p className="form-control-plainText">{ ctx.hasErrors() ? "0:ERROR" : "0:OK"  } </p>
                                </React.Fragment>
                            );
                        }
                    }
                </Form>
                <Form
                    id="domain-field-form"
                    type={ "DomainFieldInput" }
                    value={
                        formRoot.fields[1]
                    }
                >
                    {
                        ctx => {

                            renderSpyB(ctx);
                            return (
                                <React.Fragment>
                                    <Field name="maxLength"/>
                                    <p className="form-control-plainText">{ ctx.hasErrors() ? "1:ERROR" : "1:OK"  } </p>
                                </React.Fragment>
                            );
                        }
                    }
                </Form>
            </FormConfigProvider>
        );


        //console.log(prettyDOM(container))

        const nameInput = getByLabelText(container, "name");
        const maxLenInput = getByLabelText(container, "maxLength");

        // empty values on two nonNull fields
        assert(nameInput.value === "");
        assert(maxLenInput.value === "");

        // ok, because we don't render errors on the initial render
        assert(getByText(container, "0:OK"))
        assert(getByText(container, "1:OK"))


        act(
            () => {

                const form = document.getElementById("domain-field-form");
                form.submit();
            }
        )

        // both forms have errors
        assert(getByText(container, "0:ERROR"))
        assert(getByText(container, "1:ERROR"))

        // the submit attempt on the sub form results in both required fields being detected
        assert.deepEqual(FormContext.getDefault().findError(formRoot, "name"), ["","DomainTypeInput.name:Field Required"]);
        assert.deepEqual(FormContext.getDefault().findError(formRoot.fields[1], "maxLength"), ["","DomainFieldInput.maxLength:Field Required"]);

    });

});
