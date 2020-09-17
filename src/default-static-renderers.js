import React from "react"
import cx from "classnames"
import BigNumber from "bignumber.js"

import { CURRENCY_MULTIPLIER } from "./default-converters";


const DEFAULT_STATIC_RENDERERS = {
    "Boolean" : (value) => {
        return (
            <span className={
                cx(
                    // color
                    value ? "text-success" : "text-danger",
                    // icon
                    "fa",
                    value ? "fa-check-square" : "fa-square",
                    // margin-right
                    "mr-sm-2"
                )
            }/>
        )
    },
    "Currency" : (value) => {

        return (
            <span className={
                cx(
                    "mr-sm-2",
                    "currency"
                )
            }>
                {
                    new BigNumber(value / CURRENCY_MULTIPLIER).toFormat(2)
                }
                <em>
                    { " EUR"}
                </em>
            </span>
        )
    }
};

export default DEFAULT_STATIC_RENDERERS;
