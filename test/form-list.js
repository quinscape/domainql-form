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


function mapInputValue(input)
{
    return input.instance().value;
}

describe("FormList", function (){

    const submitSpy = sinon.spy();
    const renderSpy = sinon.spy();

    function mountListOfScalars(props)
    {
        return mount(
            <Form
                schema={ new InputSchema(rawSchema) }
                onSubmit={ submitSpy }
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
                            <FormList
                                newObject={ () => "NEW" }
                                name="values"
                                { ... props }
                            >
                                {
                                    index => (
                                        <Field name="."/>
                                    )
                                }
                            </FormList>
                        );
                    }
                }
            </Form>
        );
    }

    function mountComplexList(props)
    {
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

        return mount(
            <Form
                schema={ new InputSchema(rawSchema) }
                onSubmit={ submitSpy }
                type={ "DomainTypeInput" }
                newObject={ () => ({ name: "", maxLength: 0 })}
                value={{
                    name: "MyType",
                    fields: [{
                        name: "id",
                        type: "UUID",
                        maxLength: 36,
                        required: true,
                        unique: false
                    },{
                        name: "name",
                        type: "STRING",
                        maxLength: 100,
                        required: true,
                        unique: false
                    }],
                    config: [],
                    foreignKeys: [],
                    uniqueConstraints: [],
                    primaryKey: {
                        fields : ["id"]
                    }
                }}
            >
                {
                    ctx => {

                        renderSpy(ctx);
                        return (
                            <FormList
                                name="fields"
                                { ... props }
                            >
                                {
                                    index => (
                                        <React.Fragment>
                                            <Field name="name" inputClass="f-name"/>
                                            <Field name="maxLength" inputClass="f-maxLength"/>
                                        </React.Fragment>
                                    )
                                }
                            </FormList>
                        );
                    }
                }
            </Form>
        )
    }

    const component = mountListOfScalars();

    after(done => setImmediate( () => { component.unmount(); done() }));

    it("renders as list of scalar inputs", function() {

        const textInputs = component.find(".form-list .form-row input[type='text']");

        assert.deepEqual(
            textInputs.map( mapInputValue),
            ["A", "B", "C"]
        );

        const middleInput = textInputs.at(1);
        middleInput.instance().value = "BB";
        middleInput.simulate("change");



        const textInputs2 = component.find(".form-list .form-row input[type='text']");

        assert.deepEqual(
            textInputs2.map(
                r => r.instance().value
            ),
            ["A", "BB", "C"]
        );
    });

    it("can optionally add new objects", function (done) {


        const addButton = component.find(".form-list .b-add");
        assert(addButton.length === 1);

        addButton.simulate("click");


        const textInputs = component.find(".form-list .form-row input[type='text']");
        assert.deepEqual(
            textInputs.map(
                r => r.instance().value
            ),
            ["A", "BB", "C", "NEW"]
        );

        // list without newObject prop
        const noAddList = mountListOfScalars({newObject : null});
        // has no add button
        assert(noAddList.find(".form-list .b-add").length === 0);

        setImmediate(
            () => {
                noAddList.unmount();
                done();
            }
        );
    });

    it("can optionally remove objects", function (done) {

        const removeButtons = component.find(".form-list .b-remove");
        assert(removeButtons.length === 4);

        confirmed( () => removeButtons.at(3).simulate("click"));

        const rows = component.find(".form-list .form-row input[type='text']");
        assert.deepEqual(
            rows.map(
                r => r.instance().value
            ),
            ["A", "BB", "C"]
        );

        const noRemoveList = mountListOfScalars({canRemove : false});
        assert(noRemoveList.find(".form-list .b-remove").length === 0);
        setImmediate(
            () => {
                noRemoveList.unmount();

                const limitedList = mountListOfScalars({minObjects : 2});
                // all elements could be removed if enough elements are present
                assert(limitedList.find(".form-list .b-remove").length === 3);

                confirmed( () => limitedList.find(".form-list .b-remove").at(0).simulate("click"));

                setImmediate(
                    () => {
                        // otherwise no elements can be removed
                        assert(limitedList.find(".form-list .b-remove").length === 0);
                        limitedList.unmount();
                        done();
                    }
                );
            }
        );

    });

    it("can optionally sort objects", function (done) {


        const upButtons = component.find(".form-list .b-up");
        const downButtons = component.find(".form-list .b-down");
        assert(upButtons.length === 3);
        assert(downButtons.length === 3);

        // first row can't be moved up
        assert(upButtons.at(0).instance().disabled);
        // every other row can
        assert(!upButtons.at(1).instance().disabled);
        assert(!upButtons.at(2).instance().disabled);

        // rows can be moved down
        assert(!downButtons.at(0).instance().disabled);
        assert(!downButtons.at(1).instance().disabled);
        // except for the last row
        assert(downButtons.at(2).instance().disabled);

        downButtons.at(0).simulate("click");

        setImmediate(
            () => {

                const rows = component.find(".form-list .form-row input[type='text']");
                assert.deepEqual(
                    rows.map(
                        r => r.instance().value
                    ),
                    ["BB", "A", "C"]
                );

                component.find(".form-list .b-up").at(2).simulate("click");

                setImmediate(
                    () => {
                        const rows2 = component.find(".form-list .form-row input[type='text']");
                        assert.deepEqual(
                            rows2.map(
                                r => r.instance().value
                            ),
                            ["BB", "C", "A"]
                        );

                        const noSortList = mountListOfScalars({canSort : false});
                        assert(noSortList.find(".form-list .b-up").length === 0);
                        assert(noSortList.find(".form-list .b-down").length === 0);

                        noSortList.unmount();
                        done();

                    }
                )
            }
        )
    });

    it("renders as list of complex objects", function (done) {

        const component = mountComplexList();

        assert(renderSpy.lastCall.args[0].formikProps.isValid);

        const nameInputs = component.find(".form-list .form-row input.f-name");

        assert.deepEqual(
            nameInputs.map( mapInputValue),
            ["id", "name"]
        );


        const second = nameInputs.at(1);

        second.instance().value = "modified";
        second.simulate("change");

        const nameInputs2 = component.find(".form-list .form-row input.f-name");

        assert.deepEqual(
            nameInputs2.map( mapInputValue),
            ["id", "modified"]
        );

        const first = nameInputs2.at(0);

        first.instance().value = "";
        first.simulate("change");


        setImmediate(
            () => {

                assert(renderSpy.lastCall.args[0].formikProps.errors.fields[0].name === "$FIELD required");

                const secondMax = component.find(".form-list .form-row input.f-maxLength").at(1);

                secondMax.instance().value = "1a";
                secondMax.simulate("change");

                setImmediate(
                    () => {
                        assert(renderSpy.lastCall.args[0].formikProps.errors.fields[0].name === "$FIELD required");
                        assert(renderSpy.lastCall.args[0].formikProps.errors.fields[1].maxLength === "Invalid Integer");

                        first.instance().value = "xxx";
                        first.simulate("change");

                        secondMax.instance().value = "120";
                        secondMax.simulate("change");

                        setImmediate(
                            () => {

                                console.log(renderSpy.lastCall.args[0].formikProps.errors);
                                assert(renderSpy.lastCall.args[0].formikProps.isValid);

                                component.find("form").simulate("submit");

                                setImmediate(
                                    () => {
                                        const submitted = submitSpy.lastCall.args[0];

                                        assert.deepEqual(submitted, {
                                            "description": "",
                                            "fields": [
                                                {
                                                    "config" : null,
                                                    "description": "",
                                                    "maxLength": 36,
                                                    "name": "xxx",  // changed
                                                    "required": true,
                                                    "sqlType": "",
                                                    "type": "UUID",
                                                    "unique": false
                                                },
                                                {
                                                    "config" : null,
                                                    "description": "",
                                                    "maxLength": 120,   // changed
                                                    "name": "modified",   // changed
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

                                        component.unmount();
                                        done();
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
    })
});
