import React from "react"
import { cleanup, fireEvent, render, wait, prettyDOM } from "@testing-library/react"

import assert from "power-assert"

import getSchema from "./util/getSchema"
import InputSchema from "../src/InputSchema";

import sinon from "sinon"
import Field from "../src/Field";
import withForm from "../src/withForm";
import { observable } from "mobx";
import userEvent from "@testing-library/user-event";
import dumpUsage from "./util/dumpUsage";
import FieldMode from "../src/FieldMode";
import Form from "../src/Form";


describe("withForm()", function () {

    // automatically unmount and cleanup DOM after the tests are finished.
    afterEach( cleanup );

    after(dumpUsage);

    it("wraps a form body component ", function () {

        const renderSpy = sinon.spy();

        // in FormForm.js
        const FooForm = props => {
            renderSpy(props);

            return (
                <React.Fragment>
                    <Field name="name"/>
                    <Field name="num"/>
                </React.Fragment>
            )
        };

        // in FooForm.js: "export default withForm( FooForm, { type: "FooInput" } )"
        const EnhancedForm = withForm(
            FooForm,
            {
                // The form always needs the InputType
                type: "FooInput",
                // and the schema if it is not provided by a <FormConfigProvider/>
                schema:  getSchema()

            }
        );

        // FooForm can then be used in a higher component, e.g. in App.js
        const formRoot = observable({
            name: "Hans",
            num: 21,
            longNum: 999999999,
            moneys: 10000
        });

        const { container, getByLabelText } = render(
            <EnhancedForm
                value={formRoot}
                options={{
                    isolation: true
                }}
            />
        );

        const props = renderSpy.lastCall.args[0];

        assert(props.formConfig);
        const viewModel = props.formConfig.root;
        assert(viewModel.name === "Hans");
        assert(viewModel.num === 21);

        const nameField = getByLabelText("name");
        const numField = getByLabelText("num");

        assert(nameField.value === "Hans");
        assert(nameField.disabled === false);
        assert(numField.value === "21");

        userEvent.type(nameField, "Helmut");

        fireEvent.submit(
            container.querySelector("form")
        );

        // Cloned object is isolated now
        assert(formRoot.name === "Hans");
        assert(formRoot.num === 21);
        assert(formRoot.longNum === 999999999);
        assert(formRoot.moneys === 10000);
    });

    it("allows overriding form options on the enhanced component", function () {

        const renderSpy = sinon.spy();

        // in FormForm.js
        const FooForm = props => {
            renderSpy(props);

            return (
                <React.Fragment>
                    <Field name="name"/>
                    <Field name="num"/>
                </React.Fragment>
            )
        };

        // in FooForm.js: "export default withForm( FooForm, { type: "FooInput" } )"
        const EnhancedForm = withForm(
            FooForm,
            {
                // The form always needs the InputType
                type: "FooInput",
                // and the schema if it is not provided by a <FormConfigProvider/>
                schema:  getSchema()

            }
        );

        // FooForm can then be used in a higher component, e.g. in App.js
        const formRoot = observable({
            name: "Hans",
            num: 21,
            longNum: 999999999,
            moneys: 10000
        });

        const { container, getByLabelText } = render(
            <EnhancedForm
                value={formRoot}
                options={{ mode: FieldMode.DISABLED }}
            />
        );

        const props = renderSpy.lastCall.args[0];

        assert(props.formConfig);
        const viewModel = props.formConfig.root;
        assert(viewModel.name === "Hans");
        assert(viewModel.num === 21);

        const nameField = getByLabelText("name");
        const numField = getByLabelText("num");

        assert(nameField.value === "Hans");
        assert(nameField.disabled);
        assert(numField.value === "21");
        assert(numField.disabled);

    });

});
