import React from "react"

import assert from "power-assert"

import rawSchema from "./schema.json"
import InputSchema from "../src/InputSchema";

import { mount } from "enzyme"
import sinon from "sinon"
import Form from "../src/Form";
import FormBlock from "../src/FormBlock";
import FormConfig, { DEFAULT_OPTIONS } from "../src/FormConfig";
import FormConfigProvider from "../src/FormConfigProvider";

describe("FormBlock", function () {


    it("overrides Form options", function () {

        const consumerSpy = sinon.spy();

        const inputSchema = new InputSchema(rawSchema);
        const component = mount(
            <Form
                schema={inputSchema }
                onSubmit={ () => null }
                type={ "EnumTypeInput" }
                value={{
                    name: "MYENUM"
                }}
            >
                <FormBlock
                    labelColumnClass={ "foo" }
                >
                    <FormConfig.Consumer>{ consumerSpy }</FormConfig.Consumer>

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

        const inputSchema = new InputSchema(rawSchema);
        const component = mount(
            <Form
                schema={inputSchema }
                onSubmit={ () => null }
                type={ "EnumTypeInput" }
                value={{
                    name: "MYENUM"
                }}
            >
                <FormBlock
                    basePath={ "foo.bar" }
                >
                    <FormConfig.Consumer>{ consumerSpy }</FormConfig.Consumer>

                </FormBlock>
            </Form>
        );


        assert(consumerSpy.called);
        assert(consumerSpy.lastCall.args[0].basePath === "foo.bar");
    });
});
