import React from "react"

import assert from "power-assert"
import FormConfig, {
    DEFAULT_OPTIONS,
} from "../src/FormConfig";


import FORM_CONFIG_PROP_TYPES from "../src/FormConfigPropTypes"


describe("FormConfig", function () {

    it("merges options", function () {

        const merged = FormConfig.mergeOptions( DEFAULT_OPTIONS, {});

        for (let name in FORM_CONFIG_PROP_TYPES)
        {
            if (FORM_CONFIG_PROP_TYPES.hasOwnProperty(name))
            {
                assert(merged[name] === DEFAULT_OPTIONS[name]);
            }
        }

        // values are merged if they are keys in FORM_CONFIG_PROPTYPES
        const merged2 = FormConfig.mergeOptions( { ... DEFAULT_OPTIONS, foo: 1}, { horizontal: !DEFAULT_OPTIONS.horizontal, bar: "abc"});
        assert(merged2.horizontal === !DEFAULT_OPTIONS.horizontal);
        assert(merged2.foo === undefined);
        assert(merged2.bar === undefined);
    });
});
