import assert from "power-assert"

import { render, act } from "@testing-library/react"


/**
 * Hacky helper to suppress console.error logs during renderings with expected error outcome
 * 
 * @param component                                     component to render
 * @param {RegExp|Function|Object|Error} outcome       second arg to assert.throws()
 */
export default function assertRenderThrows(component, outcome )
{
    const oldError = console.error;

    console.error = () => {};

    act(
        () => {
            assert.throws(
                () => render(component),
                outcome
            )
        }
    )

    console.error = oldError;
}
