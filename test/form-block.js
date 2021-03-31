import React from "react"
import { cleanup, fireEvent, render, wait, prettyDOM } from "@testing-library/react"

import assert from "power-assert"

import getSchema from "./util/getSchema"

import sinon from "sinon"
import Form from "../src/Form";
import FormBlock from "../src/FormBlock";
import FormConfig, { FormConfigContext } from "../src/FormConfig";
import FormConfigProvider from "../src/FormConfigProvider";
import { observable } from "mobx";
import dumpUsage from "./util/dumpUsage";
import { FormContext } from "../src";

describe("FormBlock", function () {

    after(dumpUsage);

    beforeEach(
        () => {
            const formContext = new FormContext(getSchema());
            formContext.useAsDefault();
        }
    )

    it("overrides Form options", function () {

        const consumerSpy = sinon.spy();

        const inputSchema = getSchema();
        const formRoot = observable({
            name: "MYENUM"
        });
        const { container } = render(
            <Form
                type={ "EnumTypeInput" }
                value={ formRoot }
            >
                <FormBlock
                    options={{
                        labelColumnClass:  "foo" 
                    }}
                >
                    <FormConfigContext.Consumer>{ consumerSpy }</FormConfigContext.Consumer>

                </FormBlock>
            </Form>
        );


        assert(consumerSpy.called);
        assert(consumerSpy.lastCall.args[0].options.labelColumnClass === "foo");
        assert(consumerSpy.lastCall.args[0].type === "EnumTypeInput");
        assert(consumerSpy.lastCall.args[0].schema === inputSchema);
    });

    it("allows changing the base path", function () {

        const consumerSpy = sinon.spy();
        const formRoot = observable({
            name: "MYENUM"
        });

        const inputSchema = getSchema();
        const { container } = render(
            <Form
                onSubmit={ () => null }
                type={ "EnumTypeInput" }
                value={ formRoot }
            >
                <FormBlock
                    basePath={ "foo.bar" }
                >
                    <FormConfigContext.Consumer>{ consumerSpy }</FormConfigContext.Consumer>

                </FormBlock>
            </Form>
        );


        assert(consumerSpy.called);
        assert(consumerSpy.lastCall.args[0].basePath === "foo.bar");
    });
});
