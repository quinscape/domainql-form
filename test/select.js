import React from "react"
import { cleanup, fireEvent, render, wait, prettyDOM, getByLabelText, queryByLabelText } from "react-testing-library"

import assert from "power-assert"

import getSchema from "./util/getSchema"
import InputSchema from "../src/InputSchema";

import sinon from "sinon"
import Form from "../src/Form";
import Select from "../src/Select";
import GlobalConfig, { DEFAULT_NONE_TEXT } from "../src/GlobalConfig";
import FieldMode from "../src/FieldMode";
import { observable } from "mobx";

import itParam from "mocha-param"
import cartesian from "cartesian";
import ModeLocation from "./util/ModeLocation";
import Field from "./field";
import userEvent from "user-event";
import dumpUsage from "./util/dumpUsage";

describe("Select", function (){

    // automatically unmount and cleanup DOM after the tests are finished.
    afterEach( cleanup );

    after( dumpUsage) ;

    it("renders as select element", function() {

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

        const formRoot = observable({
            name: "AAA",
            description: "XXX",
            type: "STRING",
            required: true,
            maxLength: -1
        });
        const { container, getByLabelText } = render(
            <Form
                schema={ getSchema() }
                type={ "DomainFieldInput" }
                value={ formRoot }
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

        const select = getByLabelText("name");

        assert(select.value === "AAA");

        fireEvent.change(select, {
            target: {
                value : "CCC"
            }
        });

        const options = Array.prototype.map.call( select.querySelectorAll("option"),  n => n.innerHTML);

        assert.deepEqual(options, ["AAA","BBB","CCC"]);
        

        const formConfig = renderSpy.lastCall.args[0];

        assert(formConfig.root.name === "CCC");

        fireEvent.submit(
            container.querySelector("form")
        );

        assert(formRoot.name === "CCC");

    });

    it("offers an empty selection if not required", function() {

        after(() => GlobalConfig.registerNoneText(DEFAULT_NONE_TEXT));

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

        const formRoot = observable({
            name: "AAA",
            description: "XXX",
            type: "STRING",
            required: true,
            maxLength: -1
        });
        const { container } = render(
            <Form
                schema={ getSchema() }
                type={ "DomainFieldInput" }
                value={ formRoot }
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

        const select = getByLabelText(container, "name");

        const options = Array.prototype.map.call( select.querySelectorAll("option"),  n => n.innerHTML);

        assert.deepEqual(options, ["---", "AAA","BBB","CCC"]);

    });


    it("takes the name of empty option from global config", function() {

        after(() => GlobalConfig.registerNoneText(DEFAULT_NONE_TEXT));


        GlobalConfig.registerNoneText("NONE");
        
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

        const formRoot = observable({
            name: "AAA",
            description: "XXX",
            type: "STRING",
            required: true,
            maxLength: -1
        });
        const { container } = render(
            <Form
                schema={ getSchema() }
                type={ "DomainFieldInput" }
                value={ formRoot }
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

        const select = getByLabelText(container, "name");

        const options = Array.prototype.map.call( select.querySelectorAll("option"),  n => n.innerHTML);

        assert.deepEqual(options, ["NONE", "AAA","BBB","CCC"]);

    });




    it("supports name/value object", function() {

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

        const formRoot = observable({
            name: "AAA",
            description: "XXX",
            type: "STRING",
            required: true,
            maxLength: -1
        });
        const { container } = render(
            <Form
                schema={ getSchema() }
                type={ "DomainFieldInput" }
                value={ formRoot }
            >
                {
                    ctx => {

                        renderSpy(ctx);
                        return (
                            <Select name="name" values={
                                [
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
                            } required={true}/>
                        );
                    }
                }
            </Form>
        );
        //console.log(prettyDOM(container))
        
        const select = getByLabelText(container, "name");
        assert(select.value === "AAA");
        assert(!select.disabled);


        fireEvent.change(select, {
            target: {
                value : "CCC"
            }
        });

        const options = Array.prototype.map.call( select.querySelectorAll("option"),  n => n.innerHTML);

        assert.deepEqual(options, ["Option A","Option B","Option C"]);


        const formConfig = renderSpy.lastCall.args[0];

        assert(formConfig.root.name === "CCC");


        fireEvent.submit(
            container.querySelector("form")
        );

        assert(formRoot.name === "CCC");
    });

    itParam(
        "inherits mode from parent context(${value})",
        cartesian([
            [FieldMode.NORMAL, FieldMode.DISABLED, FieldMode.READ_ONLY, FieldMode.PLAIN_TEXT, FieldMode.INVISIBLE],
            [ModeLocation.ON_FIELD, ModeLocation.INHERITED]
        ]), function([ mode, loc ]) {

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

        const formRoot = observable({
            name: "AAA",
            description: "XXX",
            type: "STRING",
            required: true,
            maxLength: -1
        });
        const { container } = render(
            <Form
                schema={ getSchema() }
                type={ "DomainFieldInput" }
                options={{
                    mode: loc === ModeLocation.INHERITED ? mode : null
                }}
                value={ formRoot }
            >
                {
                    ctx => {

                        renderSpy(ctx);
                        return (
                            <Select
                                name="name"
                                values={
                                    [
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
                                }
                                mode={ loc === ModeLocation.ON_FIELD ? mode : null }
                                required={ true }/>
                        );
                    }
                }
            </Form>
        );

        const select = queryByLabelText(container, "name");

            switch (mode)
            {
                case FieldMode.NORMAL:
                    assert(select.value === "AAA");
                    assert(!select.disabled);
                    assert(container.querySelectorAll(".form-group").length === 1)
                    break;
                case FieldMode.DISABLED:
                case FieldMode.READ_ONLY:
                    assert(select.value === "AAA");
                    assert(select.disabled);
                    assert(container.querySelectorAll(".form-group").length === 1)
                    break;
                case FieldMode.PLAIN_TEXT:
                    // select is rendered as span.form-control-plaintext
                    assert(select.tagName === "SPAN");
                    assert(select.className.indexOf("form-control-plaintext") >= 0);
                    assert(select.innerHTML === "Option A");
                    assert(container.querySelectorAll(".form-group").length === 1)
                    break;
                case FieldMode.INVISIBLE:
                    assert(!select);
                    assert(container.querySelectorAll(".form-group").length === 0)
                    break;
            }


    });

});
