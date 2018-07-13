import React from "react"

import assert from "power-assert"

import rawSchema from "./schema.json"
import InputSchema from "../src/InputSchema";

import { mount } from "enzyme"
import sinon from "sinon"
import Form from "../src/Form";
import Field from "../src/Field";
import FormConfig, { DEFAULT_OPTIONS } from "../src/FormConfig";
import FormConfigProvider from "../src/FormConfigProvider";
import GlobalConfig from "../src/GlobalConfig";

describe("Field", function (){

    it("renders as text input", function(done) {

        const submitSpy = sinon.spy();
        const renderSpy = sinon.spy();

        const component = mount(
            <Form
                schema={ new InputSchema(rawSchema) }
                onSubmit={submitSpy }
                type={ "EnumTypeInput" }
                value={{
                    name: "MyEnum",
                    values: ["A", "B", "C"],
                }}
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

        const input = component.find("input[type='text']");

        input.instance().value = "AnotherEnum";
        input.simulate('change');


        setImmediate(
            () => {
                const formConfig = renderSpy.lastCall.args[0];

                assert(formConfig.formikProps.values.name === "AnotherEnum");

                let form = component.find("form");

                console.log("submit", form.simulate("submit"));

                setImmediate(
                    () => {
                        assert(submitSpy.called);
                        const values = submitSpy.lastCall.args[0];
                        assert(values.name === "AnotherEnum");

                        component.unmount();
                        done();
                    }
                );
            }
        );

    });

    it("renders as checkbox", function(done) {

        const submitSpy = sinon.spy();
        const renderSpy = sinon.spy();

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

        const component = mount(
            <Form
                schema={ new InputSchema(rawSchema) }
                onSubmit={ submitSpy }
                type={ "DomainFieldInput" }
                value={{
                    name: "MyField",
                    type: "STRING",
                    required: true,
                    maxLength: -1
                }}
            >
                {
                    ctx => {

                        renderSpy(ctx);
                        return (
                            <Field name="required"/>
                        );
                    }
                }
            </Form>
        );

        const checkbox = component.find("input[type='checkbox']");
        assert(checkbox.instance().checked === true);
        checkbox.instance().checked = false;
        checkbox.simulate('change');


        const formConfig = renderSpy.lastCall.args[0];

        assert(formConfig.formikProps.values.required === false);

        //console.log(renderSpy.callCount);
        component.find("form").simulate("submit");

        setImmediate(
            () => {
                assert(submitSpy.called);
                const values = submitSpy.lastCall.args[0];
                assert(values.required === false);

                component.unmount();
                done();
            }
        );



    });

    it("renders as enum select", function(done) {

        const submitSpy = sinon.spy();
        const renderSpy = sinon.spy();

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

        const component = mount(
            <Form
                schema={ new InputSchema(rawSchema) }
                onSubmit={ submitSpy }
                type={ "DomainFieldInput" }
                value={{
                    name: "MyField",
                    type: "STRING",
                    required: true,
                    maxLength: -1
                }}
            >
                {
                    ctx => {

                        renderSpy(ctx);
                        return (
                            <Field name="type"/>
                        );
                    }
                }
            </Form>
        );

        const select = component.find("select");
        assert(select.instance().value === "STRING");
        select.instance().value = "INTEGER";
        select.simulate('change');


        const formConfig = renderSpy.lastCall.args[0];

        assert(formConfig.formikProps.values.type === "INTEGER");

        //console.log(renderSpy.callCount);
        component.find("form").simulate("submit");

        setImmediate(
            () => {
                assert(submitSpy.called);
                const values = submitSpy.lastCall.args[0];
                assert(values.type === "INTEGER");

                component.unmount();
                done();
            }
        );


    });

    it("validates according to field type", function(done) {

        const submitSpy = sinon.spy();
        const renderSpy = sinon.spy();

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

        const component = mount(
            <Form
                schema={ new InputSchema(rawSchema) }
                onSubmit={ submitSpy }
                type={ "DomainFieldInput" }
                value={{
                    name: "MyField",
                    type: "STRING",
                    required: true,
                    maxLength: -1
                }}
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

        const select = component.find("input[type='text']");
        assert(select.instance().value === "-1");
        select.instance().value = "1a";
        select.simulate('change');


        setImmediate(
            () => {
                const formConfig = renderSpy.lastCall.args[0];

                assert(formConfig.formikProps.values.maxLength === "1a");
                assert(formConfig.formikProps.errors.maxLength === "Invalid Integer");

                component.unmount();
                done();
            }
        );


    });

    it("provides a field context to render function children", function(done) {

        GlobalConfig.registerLabelLookup((formConfig, name) =>
        {
            return "[ " + formConfig.type + "." + name + " ]";
        });

        const submitSpy = sinon.spy();
        const renderSpy = sinon.spy();

        const schema = new InputSchema(rawSchema);
        const component = mount(
            <Form
                schema={ schema }
                onSubmit={ submitSpy }
                type={ "DomainFieldInput" }
                value={{
                    name: "MyField",
                    type: "STRING",
                    required: true,
                    maxLength: -1
                }}
            >
                {
                    ctx => {

                        return (
                            <Field name="description">
                                {
                                    fieldContext => {

                                        renderSpy(fieldContext);

                                        const formikProps = fieldContext.formConfig.formikProps;
                                        return (

                                            <React.Fragment>
                                                <p>
                                                    {
                                                        JSON.stringify(formikProps.values.name )
                                                    }
                                                </p>
                                                <button type="button" onClick={ ev => formikProps.setFieldValue("name", "From Button")} />
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

        const fieldContext = renderSpy.lastCall.args[0];

        assert(fieldContext.fieldId === "field-DomainFieldInput-description" );
        assert(fieldContext.formConfig.schema === schema );
        assert(fieldContext.formConfig.type === "DomainFieldInput");
        assert.deepEqual(fieldContext.formConfig.options, DEFAULT_OPTIONS);
        assert(fieldContext.fieldType.kind === "SCALAR" );
        assert(fieldContext.fieldType.name === "String" );
        assert(fieldContext.qualifiedName === "description" );
        assert.deepEqual(fieldContext.path, ["description"] );
        assert(fieldContext.label === "[ DomainFieldInput.description ]" );
        assert(fieldContext.name === "description");

        const paragraph = component.find("p");

        assert(paragraph.text() === "\"MyField\"");

        component.find("button").simulate("click");

        setImmediate(
            () => {
                const fieldContext2 = renderSpy.lastCall.args[0];

                assert(fieldContext2.formConfig.formikProps.values.name === "From Button");

                component.unmount();
                done();
            }
        );

    })
});
