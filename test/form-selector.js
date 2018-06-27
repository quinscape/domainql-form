import React from "react"

import assert from "power-assert"

import rawSchema from "./schema.json"
import InputSchema from "../src/InputSchema";

import { mount } from "enzyme"
import sinon from "sinon"
import Form from "../src/Form";
import Field from "../src/Field";
import FormList from "../src/FormList";

import confirmed from "./confirmed"
import FormSelector from "../src/FormSelector";


function mapInputValue(input)
{
    return input.instance().value;
}

describe("FormSelector", function () {

    const submitSpy = sinon.spy();
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

    const component = mount(
        <Form
            schema={new InputSchema(rawSchema)}
            onSubmit={ submitSpy }
            type={"DomainTypeInput"}
            newObject={() => ({
                name: "",
                maxLength: 0
            })}
            value={{
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
            }}
        >
            {
                ctx => {

                    renderSpy(ctx);
                    return (
                        <FormSelector
                            selector="name"
                            name="fields"
                        >
                            {
                                index => (
                                    <React.Fragment>
                                        <Field name="name" inputClass="f-name"/>
                                        <Field name="maxLength" inputClass="f-maxLength"/>
                                    </React.Fragment>
                                )
                            }
                        </FormSelector>
                    );
                }
            }
        </Form>
    );

    after(() => component.unmount());

    it("renders one of many complex fields", function () {

        const nameInputs = component.find(".form-selector input.f-name");

        assert(nameInputs.length === 1);
        assert(nameInputs.instance().value === "id");

        const selectors = component.find(".form-selector a.selector");
        assert(selectors.length === 2);

        selectors.at(1).simulate("click");

        const nameInputs2 = component.find(".form-selector input.f-name");

        assert(nameInputs2.length === 1);
        assert(nameInputs2.instance().value === "name");

        nameInputs2.instance().value = "modified";
        nameInputs2.simulate("change");

        console.log(renderSpy.lastCall.args[0].formikProps.errors)
        assert(renderSpy.lastCall.args[0].formikProps.isValid);
        assert(renderSpy.lastCall.args[0].formikProps.values.fields[1].name === "modified");


        nameInputs2.instance().value = "";
        nameInputs2.simulate("change");

        assert(!renderSpy.lastCall.args[0].formikProps.isValid);
        assert(renderSpy.lastCall.args[0].formikProps.values.fields[1].name === "");
        assert(renderSpy.lastCall.args[0].formikProps.errors.fields[1].name === "$FIELD required");

        nameInputs2.instance().value = "mod";
        nameInputs2.simulate("change");

        component.find("form").simulate("submit");

        assert.deepEqual(submitSpy.lastCall.args[0], {
            "description": "",
            "fields": [
                {
                    "config": null,
                    "description": "",
                    "maxLength": 36,
                    "name": "id",
                    "required": true,
                    "sqlType": "",
                    "type": "UUID",
                    "unique": false
                },
                {
                    "config": null,
                    "description": "",
                    "maxLength": 100,
                    "name": "mod",   // changed
                    "required": true,
                    "sqlType": "",
                    "type": "STRING",
                    "unique": false
                }
            ],
            "foreignKeys": [],
            "name": "MyType",
            "primaryKey": {
                "fields": [
                    "id"
                ]
            },
            "uniqueConstraints": []
        });


    })

})
;
