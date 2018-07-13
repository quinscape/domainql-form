import React from "react"

import assert from "power-assert"

import rawSchema from "./schema.json"
import InputSchema from "../src/InputSchema";

import { mount } from "enzyme"
import sinon from "sinon"
import Form from "../src/Form";
import TextArea from "../src/TextArea";
import Select from "../src/Select";
import GlobalConfig from "../src/GlobalConfig";

describe("Select", function (){

    it("renders as select element", function(done) {

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
                    name: "AAA",
                    description: "XXX",
                    type: "STRING",
                    required: true,
                    maxLength: -1
                }}
            >
                {
                    ctx => {

                        renderSpy(ctx);
                        return (
                            <Select name="name" values={ ["AAA","BBB","CCC"]} required={ true }/>
                        );
                    }
                }
            </Form>
        );

        const select = component.find("select");
        assert(select.instance().value === "AAA");
        select.instance().value = "CCC";
        select.simulate('change');


        const options = component.find("option").map( n => n.text());

        assert.deepEqual(options, ["AAA","BBB","CCC"]);
        

        const formConfig = renderSpy.lastCall.args[0];

        assert(formConfig.formikProps.values.name === "CCC");

        //console.log(renderSpy.callCount);
        component.find("form").simulate("submit");

        setImmediate(
            () => {

                assert(submitSpy.called);
                const values = submitSpy.lastCall.args[0];
                assert(values.name === "CCC");

                done();
            }
        )


    });

    it("offers an empty selection if not required", function() {

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
                    name: "AAA",
                    description: "XXX",
                    type: "STRING",
                    required: true,
                    maxLength: -1
                }}
            >
                {
                    ctx => {

                        renderSpy(ctx);
                        return (
                            <Select name="name" values={ ["AAA","BBB","CCC"]}/>
                        );
                    }
                }
            </Form>
        );


        const options = component.find("option").map( n => n.text());

        assert.deepEqual(options, ["---", "AAA","BBB","CCC"]);

        component.unmount();

        GlobalConfig.registerNoneText("NONE");


        const component2 = mount(
            <Form
                schema={ new InputSchema(rawSchema) }
                onSubmit={ submitSpy }
                type={ "DomainFieldInput" }
                value={{
                    name: "AAA",
                    description: "XXX",
                    type: "STRING",
                    required: true,
                    maxLength: -1
                }}
            >
                {
                    ctx => {

                        renderSpy(ctx);
                        return (
                            <Select name="name" values={ ["AAA","BBB","CCC"]}/>
                        );
                    }
                }
            </Form>
        );


        const options2 = component2.find("option").map( n => n.text());

        assert.deepEqual(options2, ["NONE", "AAA","BBB","CCC"]);

        component2.unmount();
    });

    it("supports name/value object", function(done) {

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
                    name: "AAA",
                    description: "XXX",
                    type: "STRING",
                    required: true,
                    maxLength: -1
                }}
            >
                {
                    ctx => {

                        renderSpy(ctx);
                        return (
                            <Select name="name" values={                                 [
                                {
                                    name: "Option A",
                                    value: "AAA"
                                },
                                {
                                    name: "Option B",
                                    value: "BBB"
                                },
                                {
                                    name: "Option C",
                                    value: "CCC"
                                }
                            ]
                            } required={ true }/>
                        );
                    }
                }
            </Form>
        );

        const select = component.find("select");
        assert(select.instance().value === "AAA");
        select.instance().value = "CCC";
        select.simulate('change');


        const options = component.find("option").map( n => n.text());

        assert.deepEqual(options, ["Option A","Option B","Option C"]);


        const formConfig = renderSpy.lastCall.args[0];

        assert(formConfig.formikProps.values.name === "CCC");

        //console.log(renderSpy.callCount);
        component.find("form").simulate("submit");

        setImmediate(
            () => {
                assert(submitSpy.called);
                const values = submitSpy.lastCall.args[0];
                assert(values.name === "CCC");

                done();
            }
        )



    });

});
