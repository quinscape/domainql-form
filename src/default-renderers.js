import React from "react"
import cx from "classnames"

import FieldMode from "./FieldMode"
import InputSchema, { unwrapNonNull } from "./InputSchema"
import { resolveStaticRenderer } from "./FormConfig"

import get from "lodash.get"

import FormGroup from "./FormGroup"


function renderStatic(fieldType, inputClass, fieldValue)
{
    const scalarType = unwrapNonNull(fieldType);

    const staticRenderer = resolveStaticRenderer(scalarType.name);

    return (
        <p className={
                cx(
                    inputClass,
                    "form-control-plaintext"
                )
            }
        >
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

/**
 * Default rule set.
 */
const DEFAULT_RENDERERS =
    [
        {
            rule: { fieldType: "Boolean" },

            // CHECKBOX

            render: ctx => {

                const { mode, formik, formContext, fieldId, inputClass, label, labelClass, title, path, qualifiedName } = ctx;

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
                        <div className="form-check">
                            <input
                                id={ fieldId }
                                name={ qualifiedName }
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

                return (
                    <FormGroup
                        { ... ctx }
                        label=""
                    >
                        {
                            checkBoxElement
                        }
                    </FormGroup>
                );
            }
        },

        {
            rule: { kind: "ENUM" },

            // ENUM SELECT

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
                    path,
                    qualifiedName
                } = ctx;

                const effectiveMode = mode || formContext.mode;

                const errorMessage = get(formik.errors, path);

                const fieldValue = get(formik.values, path);

                let fieldElement;
                if (effectiveMode === FieldMode.READ_ONLY)
                {
                    fieldElement = renderStatic(fieldType, inputClass, fieldValue);
                }
                else
                {
                    const actualType = unwrapNonNull(fieldType);

                    const enumType = formContext.inputSchema.getType(actualType.name);

                    fieldElement = (
                        <select
                            id={fieldId}
                            name={qualifiedName}
                            className={cx(inputClass, "form-control", errorMessage && "is-invalid")}
                            title={title}
                            disabled={effectiveMode === FieldMode.DISABLED}
                            value={fieldValue}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        >
                            {
                                enumType.enumValues.map(enumValue =>
                                    <option key={ enumValue.name }>
                                        {
                                            enumValue.name
                                        }
                                    </option>
                                )
                            }

                        </select>
                    );
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
                    path,
                    qualifiedName
                } = ctx;

                const effectiveMode = mode || formContext.mode;

                const { currency, currencyAddonRight } = formContext.options;

                const errorMessage = get(formik.errors, path);

                const fieldValue = get(formik.values, path);

                let fieldElement;
                if (effectiveMode === FieldMode.READ_ONLY)
                {
                    fieldElement = renderStatic(fieldType, inputClass, fieldValue);
                }
                else
                {
                    fieldElement = (
                        <input
                            id={ fieldId }
                            name={ qualifiedName }
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
