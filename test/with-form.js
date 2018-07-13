import React from "react"

import assert from "power-assert"

import rawSchema from "./schema.json"
import InputSchema from "../src/InputSchema";

import { mount } from "enzyme"
import sinon from "sinon"
import Field from "../src/Field";
import withForm from "../src/withForm";


describe("withForm()", function () {

    const renderSpy = sinon.spy();
    const submitSpy = sinon.spy();

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
            schema:  new InputSchema(rawSchema)

        }
    );

    // FooForm can then be used in a higher component, e.g. in App.js
    const initial = {
        name: "Hans",
        num: 21,
        longNum: 999999999,
        moneys: 10000
    };

    const form = mount(
        <EnhancedForm
            value={initial}
            validate={(values, actions) => {

                if (values.name === "foo")
                {
                    return {
                        name: "Bad Name"
                    }
                }

                return null;
            }}
            onSubmit={ submitSpy }
        />
    );

    it("wraps a form body component ", function () {

        const props = renderSpy.lastCall.args[0];

        assert(props.formConfig);
        const formikProps = props.formConfig.formikProps;
        assert(formikProps.values.name === "Hans");
        assert(formikProps.values.num === "21");

        const input = form.find("input[type='text']");

        assert(input.length === 2);
        const firstInput = input.at(0);
        const secondInput = input.at(1);
        assert(firstInput.instance().value === "Hans");
        assert(secondInput.instance().value === "21");

        firstInput.instance().value = "Helmut";
        firstInput.simulate("change");

        form.find("form").simulate("submit");

        setImmediate(
            () => {

            const foo = submitSpy.lastCall.args[0];

            assert(foo.name === "Helmut");
            assert(foo.num === 21);
            assert(foo.longNum === 999999999);
            assert(foo.moneys === 10000);
        })
    });

    it("uses the enhanced form component's validate prop as local validate", function () {

        const input = form.find("input[type='text']").at(0);
        input.instance().value = "foo";
        input.simulate("change");

        setImmediate(() => {
            const props = renderSpy.lastCall.args[0];

            const formikProps = props.formConfig.formikProps;
            assert(formikProps.values.name === "foo");
            assert(formikProps.errors.name === "Bad Name");
        })
    })


});
