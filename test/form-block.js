import React from "react"
import { cleanup, fireEvent, render, wait, prettyDOM } from "react-testing-library"

import assert from "power-assert"

import getSchema from "./util/getSchema"

import { mount } from "enzyme"
import sinon from "sinon"
import Form from "../src/Form";
import FormBlock from "../src/FormBlock";
import FormConfig, { DEFAULT_OPTIONS } from "../src/FormConfig";
import FormConfigProvider from "../src/FormConfigProvider";
import { observable } from "mobx";
import dumpUsage from "./util/dumpUsage";

describe("FormBlock", function () {

    after(dumpUsage);

    it("overrides Form options", function () {

        const consumerSpy = sinon.spy();

        const inputSchema = getSchema();
        const formRoot = observable({
            name: "MYENUM"
        });
        const { container } = render(
            <Form
                schema={ getSchema() }
                type={ "EnumTypeInput" }
                value={ formRoot }
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
        const formRoot = observable({
            name: "MYENUM"
        });

        const inputSchema = getSchema();
        const { container } = render(
            <Form
                schema={inputSchema }
                onSubmit={ () => null }
                type={ "EnumTypeInput" }
                value={ formRoot }
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
