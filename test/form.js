import React from "react"

import assert from "power-assert"

import rawSchema from "./schema.json"
import InputSchema from "../src/InputSchema";

import { mount } from "enzyme"
import sinon from "sinon"
import Form from "../src/Form";
import FormConfig, { DEFAULT_OPTIONS } from "../src/FormConfig";
import FormConfigProvider from "../src/FormConfigProvider";
import Field from "../src/Field";

describe("Form", function () {

    const submitSpy = sinon.spy();
    let renderSpy = sinon.spy();

    let component = mount(
        <Form
            schema={ new InputSchema(rawSchema) }
            onSubmit={ submitSpy }
            type={ "EnumTypeInput" }
            value={{}}
        >
            {
                renderSpy
            }
        </Form>
    );


    it("provides a form config to render function", function () {
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

        assert(formConfig.formikProps);

        assert.deepEqual(formConfig.formikProps.values, {
            "description": "",
            "name": "",
            "values": null
        })

    });

    it("validates the initial values", function () {

        /*
            input EnumTypeInput {
              name: String!
              values: [String]!
              description: String
            }
         */

        const formConfig = renderSpy.lastCall.args[0];

        assert.deepEqual(
            formConfig.formikProps.errors,
            {
                "name": "$FIELD required",
                "values": "$FIELD required"
            }
        );

        component.unmount();
        renderSpy = sinon.spy();

        component = mount(
            <Form
                schema={ new InputSchema(rawSchema) }
                onSubmit={ submitSpy }
                type={ "EnumTypeInput" }
                value={{
                    name: "MYENUM",
                    values: ["AA","BB","CC"]
                }}
            >
                {
                    renderSpy
                }
            </Form>
        );

        const validConfig = renderSpy.lastCall.args[0];

        assert.deepEqual(validConfig.formikProps.values, {
            "description": "",
            "name": "MYENUM",
            "values": [
                "AA",
                "BB",
                "CC"
            ]
        });

        assert.deepEqual(validConfig.formikProps.errors, {});

        component.unmount();

    });

    it("provides form config as React context", function () {

        const consumerSpy = sinon.spy();

        component = mount(
            <Form
                schema={ new InputSchema(rawSchema) }
                onSubmit={ submitSpy }
                type={ "EnumTypeInput" }
                value={{
                    name: "MYENUM"
                }}
            >
                <div>
                    <FormConfig.Consumer>
                        { consumerSpy }
                    </FormConfig.Consumer>
                </div>
            </Form>
        );

        assert(consumerSpy.called);
        assert(consumerSpy.getCall(0).args[0] instanceof FormConfig)

        component.unmount();
    });

    it("inherits schema from FormConfigProvider", function () {

        // no schema at all throws
        assert.throws(
            () =>
                mount(
                    <Form
                        onSubmit={ submitSpy }
                        type={ "EnumTypeInput" }
                        value={{}}
                    />
                )
            ,
            /No schema prop given and no FormConfigProvider providing one either/
        );

        renderSpy = sinon.spy();

        component = mount(
            <FormConfigProvider
                schema={new InputSchema(rawSchema) }

            >
            <Form
                onSubmit={ submitSpy }
                type={ "EnumTypeInput" }
                value={{
                    name: "MYENUM"
                }}
            >
                { renderSpy }
            </Form>
            </FormConfigProvider>
        );

        assert(renderSpy.called);
        assert(renderSpy.lastCall.args[0] instanceof FormConfig)

        component.unmount();

    });

    it("inherits options FormConfigProvider", function () {

        renderSpy = sinon.spy();

        component = mount(
            <FormConfigProvider
                schema={new InputSchema(rawSchema) }
                horizontal={ !DEFAULT_OPTIONS.horizontal }

            >
                <Form
                    onSubmit={ submitSpy }
                    type={ "EnumTypeInput" }
                    value={{
                        name: "MYENUM"
                    }}
                >
                    { renderSpy }
                </Form>
            </FormConfigProvider>
        );

        assert(renderSpy.called);
        assert(renderSpy.lastCall.args[0] instanceof FormConfig);
        assert(renderSpy.lastCall.args[0].options.horizontal  === !DEFAULT_OPTIONS.horizontal);

        component.unmount();

    });

    it("validates locally", function () {


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
                    description: "MyField Desc",
                    type: "STRING",
                    required: true,
                    maxLength: -1
                }}

                validate={ values => {

                    if (values.name === values.description)
                    {
                        return {
                            name: "NAME=DESC",
                            description: "DESC=NAME",
                        };
                    }
                    return {};
                }}
            >
                {
                    ctx => {

                        renderSpy(ctx);

                        return (
                            <React.Fragment>
                                <Field  name="name"/>
                                <Field name="description"/>
                            </React.Fragment>
                        );
                    }
                }
            </Form>
        );

        const formConfig = renderSpy.lastCall.args[0];

        assert(formConfig.formikProps.values.name === "MyField");
        assert(formConfig.formikProps.values.description === "MyField Desc");
        assert(!formConfig.formikProps.errors.name);
        assert(!formConfig.formikProps.errors.description);


        const input = component.find("input[name='description']");

        input.instance().value = "MyField";
        input.simulate('change');

        const formConfig2 = renderSpy.lastCall.args[0];
        assert(formConfig2.formikProps.values.name === "MyField");
        assert(formConfig2.formikProps.values.description === "MyField");
        assert(formConfig2.formikProps.errors.name === "NAME=DESC");
        assert(formConfig2.formikProps.errors.description === "DESC=NAME");


        component.unmount();
    });

    // field validation and submission tested in field.js, text-area.js, select.js etc
});
