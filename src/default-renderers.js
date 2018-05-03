import React from "react"
import cx from "classnames"

import FieldMode from "./FieldMode"
import InputSchema, { unwrapNonNull } from "./InputSchema"
import { resolveStaticRenderer } from "./field-renderers"

import toPath from "lodash.topath"
import get from "lodash.get"

/**
 * Renders a .form-group wrapper from our standard render context. Is used by the default field renderer
 * and can be used for custom fields
 *
 * @param props
 * @returns {*}
 * @constructor
 */
export function FormGroup(props)
{
    const {
        formContext,
        fieldId,
        label,
        helpText,
        labelClass,
        errorMessage,
        children
    } = props;

    const { horizontal, labelColumnClass, wrapperColumnClass } = formContext.options;


    const labelElement = (
        <label
            className={
                cx(
                    "col-form-label",
                    horizontal ? labelColumnClass : null,
                    labelClass
                )
            }
            htmlFor={ fieldId }
        >
            { label }
        </label>
    );

    let helpBlock = false;


    const formText = errorMessage || helpText;

    if (formText)
    {
        helpBlock = (
            <p className={ cx("form-text", errorMessage ? "invalid-feedback" : "text-muted") }>
                { formText }
            </p>
        )
    }

    return (
        <div className={
            cx(
                "form-group",
                horizontal ? "row" : null,
                errorMessage && "has-error"
            )
        }>
            { labelElement }
            {
                horizontal ? (
                    <div className={ wrapperColumnClass || "col-md-9" }>
                        { children }
                        { helpBlock }
                    </div>
                ) : (
                    children
                )
            }
            { !horizontal && helpBlock }
        </div>
    );
}

/**
 * Default rule set.
 */
const DEFAULT_RENDERERS =
    [
        {
            rule: { fieldType: "Boolean" },
            render: ctx => {

                const { name, mode, formik, formContext, fieldId, inputClass, label, labelClass, title, path } = ctx;
                const { horizontal, labelColumnClass, wrapperColumnClass } = formContext.options;

                const fieldValue = get(formik.values, path);

                const effectiveMode = mode || formContext.mode;

                //console.log("checkbox value = ", fieldValue);

                let checkBoxElement;

                if (effectiveMode === FieldMode.READ_ONLY)
                {
                    const staticRenderer = resolveStaticRenderer("Boolean");

                    checkBoxElement = (
                        <p className="form-control-plaintext">
                            {
                                staticRenderer(fieldValue)
                            }
                            {
                                label
                            }
                        </p>
                    )
                }
                else
                {

                    checkBoxElement = (
                        <div className={ cx("form-check") }>
                            <input
                                id={ fieldId }
                                name={ name }
                                className={ cx(inputClass, "form-check-input") }
                                type="checkbox"
                                title={ title }
                                checked={ fieldValue }
                                onChange={ formik.handleChange }
                                onBlur={ formik.handleBlur }
                                disabled={ effectiveMode === FieldMode.DISABLED }
                            />
                            <label
                                htmlFor={ fieldId }
                                className={ cx("form-check-label", labelClass) }>
                                {
                                    label
                                }
                            </label>
                        </div>
                    );
                }

                if (horizontal)
                {
                    checkBoxElement = (
                        <div className="row">
                            <div className={ labelColumnClass }>{ "\u00a0" }</div>
                            <div className={ wrapperColumnClass }>
                                <div className="form-control-plaintext">
                                    {
                                        checkBoxElement
                                    }
                                </div>
                            </div>
                        </div>
                    )
                }

                return (
                    checkBoxElement
                );
            }
        },

        {
            // DEFAULT RULE
            rule: false,

            /**
             *
             * @param {FieldRenderContext} ctx
             * @returns {*}
             */
            render: ctx => {

                const {
                    formik,
                    fieldId,
                    name,
                    mode,
                    inputClass,
                    placeholder,
                    formContext,
                    fieldType,
                    title,
                    path
                } = ctx;

                const effectiveMode = mode || formContext.mode;

                const { currency, currencyAddonRight } = formContext.options;

                const errorMessage = get(formik.errors, path);

                const fieldValue = get(formik.values, path);

                let fieldElement;
                if (effectiveMode === FieldMode.READ_ONLY)
                {
                    const scalarType = unwrapNonNull(fieldType);

                    const staticRenderer = resolveStaticRenderer(scalarType.name);

                    fieldElement = (
                        <p className={ cx(inputClass, "form-control-plaintext") }>
                            {
                                 staticRenderer(
                                     InputSchema.valueToScalar(
                                         scalarType.name,
                                         fieldValue
                                     )
                                 )
                            }
                        </p>
                    );
                }
                else
                {
                    fieldElement = (
                        <input
                            id={ fieldId }
                            name={ name }
                            className={ cx(inputClass, "form-control", errorMessage && "is-invalid") }
                            type="text"
                            placeholder={ placeholder }
                            title={ title }
                            disabled={ effectiveMode === FieldMode.DISABLED }
                            value={ fieldValue }
                            onChange={ formik.handleChange }
                            onBlur={ formik.handleBlur }
                        />
                    );

                    if (fieldType.name === "Currency")
                    {
                        if (currencyAddonRight)
                        {
                            fieldElement = (
                                <div className="input-group mb-3">
                                    {
                                        fieldElement
                                    }
                                    <span className="input-group-append">
                                        <span className="input-group-text">
                                        {
                                            currency
                                        }
                                        </span>
                                    </span>
                                </div>
                            );
                        }
                        else
                        {

                            fieldElement = (
                                <div className="input-group mb-3">
                                <span className="input-group-prepend">
                                    <span className="input-group-text">
                                    {
                                        currency
                                    }
                                    </span>
                                </span>
                                    {
                                        fieldElement
                                    }
                                </div>
                            );
                        }
                    }
                }

                return (
                    <FormGroup
                        { ... ctx }
                        errorMessage={ errorMessage }
                    >
                        {
                            fieldElement
                        }
                    </FormGroup>
                )
            }
        }
    ];

export default DEFAULT_RENDERERS
