import React from "react"
import { cleanup, fireEvent, render, wait, prettyDOM, queryByLabelText } from "react-testing-library"

import assert from "power-assert"

import getSchema from "./util/getSchema"
import dumpUsage from "./util/dumpUsage"
import InputSchema from "../src/InputSchema";

import sinon from "sinon"
import Form from "../src/Form";
import TextArea from "../src/TextArea";
import FieldMode from "../src/FieldMode";
import { observable } from "mobx";
import userEvent from "user-event";

import itParam from "mocha-param"
import cartesian from "cartesian";
import ModeLocation from "./util/ModeLocation";
import Field from "./field";

describe("TextArea", function (){

    // automatically unmount and cleanup DOM after the tests are finished.
    afterEach( cleanup );

    after( dumpUsage) ;

    it("renders as textarea element", function() {

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
            name: "MyField",
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
                            <TextArea name="description"/>
                        );
                    }
                }
            </Form>
        );



        const textArea = getByLabelText("description");

        assert(!textArea.disabled);
        assert(!textArea.readOnly);

        assert(textArea.value === "XXX");

        userEvent.type(textArea, "YYY")


        const formConfig = renderSpy.lastCall.args[0];

        assert(formConfig.root.description === "YYY");

        fireEvent.submit(
            container.querySelector("form")
        );

        assert(formRoot.description === "YYY")

    });

    itParam(
        "inherits mode from parent context (${value})",
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
            name: "MyField",
            description: "XXX",
            type: "STRING",
            required: true,
            maxLength: -1
        });
        const { container } = render(
            <Form
                schema={ getSchema() }
                type={ "DomainFieldInput" }
                mode={ loc === ModeLocation.INHERITED ? mode : null }
                value={ formRoot }
            >
                {
                    ctx => {

                        renderSpy(ctx);
                        return (
                            <TextArea
                                mode={ loc === ModeLocation.ON_FIELD ? mode : null }
                                name="description"
                            />
                        );
                    }
                }
            </Form>
        );

        const textArea = queryByLabelText(container, "description");


        switch (mode)
        {
            case FieldMode.DISABLED:
                assert(textArea.value === "XXX");
                assert(textArea.disabled);
                assert(!textArea.readOnly);
                assert(container.querySelectorAll(".form-group").length === 1)
                break;
            case FieldMode.READ_ONLY:
                assert(textArea.value === "XXX");
                assert(!textArea.disabled);
                assert(textArea.readOnly);
                assert(container.querySelectorAll(".form-group").length === 1)
                break;
            case FieldMode.PLAIN_TEXT:
                assert(textArea.tagName === "SPAN");
                assert(textArea.innerHTML === "XXX");
                assert(container.querySelectorAll(".form-group").length === 1)
                break;
            case FieldMode.INVISIBLE:
                assert(!textArea);
                assert(container.querySelectorAll(".form-group").length === 0)
                break;
        }
    });

});
