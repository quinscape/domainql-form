import React from "react"

import assert from "power-assert"

import rawSchema from "./schema.json"
import InputSchema from "../src/InputSchema";

import { mount } from "enzyme"
import sinon from "sinon"
import Form from "../src/Form";
import TextArea from "../src/TextArea";

describe("TextArea", function (){

    it("renders as textarea element", function(done) {

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
                            <TextArea name="description"/>
                        );
                    }
                }
            </Form>
        );

        const select = component.find("textarea");
        assert(select.instance().value === "XXX");
        select.instance().value = "YYY";
        select.simulate('change');


        const formConfig = renderSpy.lastCall.args[0];

        assert(formConfig.formikProps.values.description === "YYY");

        //console.log(renderSpy.callCount);
        component.find("form").simulate("submit");

        setImmediate(
            () => {

                assert(submitSpy.called);
                const values = submitSpy.lastCall.args[0];
                assert(values.description === "YYY");


                component.unmount();
                done();
            }
        )

    });

});
