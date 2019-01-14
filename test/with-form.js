import React from "react"
import { cleanup, fireEvent, render, wait, prettyDOM } from "react-testing-library"

import assert from "power-assert"

import getSchema from "./util/getSchema"
import InputSchema from "../src/InputSchema";

import sinon from "sinon"
import Field from "../src/Field";
import withForm from "../src/withForm";
import { observable } from "mobx";
import userEvent from "user-event";
import dumpUsage from "./util/dumpUsage";


describe("withForm()", function () {

    // automatically unmount and cleanup DOM after the tests are finished.
    afterEach( cleanup );

    after(dumpUsage);

    it("wraps a form body component ", function () {

        const renderSpy = sinon.spy();

        // in FormForm.js
        class FooForm extends React.Component {
            render()
            {
                renderSpy(this.props);

                return (
                    <React.Fragment>
                        <Field name="name"/>
                        <Field name="num"/>
                    </React.Fragment>
                )
            }
        }

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
        assert(numField.value === "21");

        userEvent.type(nameField, "Helmut");

        fireEvent.submit(
            container.querySelector("form")
        );

        assert(formRoot.name === "Helmut");
        assert(formRoot.num === 21);
        assert(formRoot.longNum === 999999999);
        assert(formRoot.moneys === 10000);
    });

    // it("uses the enhanced form component's validate prop as local validate", function () {
    //
    //     const renderSpy = sinon.spy();
    //
    //     // in FormForm.js
    //     class FooForm extends React.Component {
    //         render()
    //         {
    //             renderSpy(this.props);
    //
    //             return (
    //                 <React.Fragment>
    //                     <Field name="name"/>
    //                     <Field name="num"/>
    //                 </React.Fragment>
    //             )
    //         }
    //     }
    //
    //     // in FooForm.js: "export default withForm( FooForm, { type: "FooInput" } )"
    //     const EnhancedForm = withForm(
    //         FooForm,
    //         {
    //             // The form always needs the InputType
    //             type: "FooInput",
    //             // and the schema if it is not provided by a <FormConfigProvider/>
    //             schema:  getSchema()
    //
    //         }
    //     );
    //
    //     // FooForm can then be used in a higher component, e.g. in App.js
    //     const formRoot = observable({
    //         name: "Hans",
    //         num: 21,
    //         longNum: 999999999,
    //         moneys: 10000
    //     });
    //
    //     const { container, getByLabelText } = render(
    //         <EnhancedForm
    //             value={formRoot}
    //             validate={(values, actions) => {
    //
    //                 if (values.name === "foo")
    //                 {
    //                     return {
    //                         name: "Bad Name"
    //                     }
    //                 }
    //
    //                 return null;
    //             }}
    //         />
    //     );
    //
    //     const nameField = getByLabelText("name");
    //
    //     userEvent.type(nameField, "foo");
    //
    //     const props = renderSpy.lastCall.args[0];
    //
    //     const viewModel = props.formConfig.root;
    //     assert(viewModel.name === "foo");
    //     assert.deepEqual(props.formConfig.getErrors("name") , ["foo", "Bad Name"]);
    // })


});
