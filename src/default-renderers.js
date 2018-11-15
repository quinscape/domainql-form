import React from "react"
import cx from "classnames"

import FieldMode from "./FieldMode"
import InputSchema, { unwrapNonNull } from "./InputSchema"
import { resolveStaticRenderer } from "./GlobalConfig"

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

                const { mode, formConfig, fieldId, inputClass, label, labelClass, title, path, qualifiedName, onChange, onBlur } = ctx;

                const { value } = formConfig;

                const fieldValue = get(value, path);

                const effectiveMode = mode || formConfig.options.mode;

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
                                onChange={ onChange }
                                onBlur={ onBlur }
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
                    fieldId,
                    mode,
                    inputClass,
                    formConfig,
                    fieldType,
                    title,
                    path,
                    qualifiedName,
                    onChange,
                    onBlur
                } = ctx;

                const effectiveMode = mode || formConfig.options.mode;

                const errorMessages = formConfig.getErrors(path);
                const fieldValue = formConfig.getValue(path, errorMessages);

                let fieldElement;
                if (effectiveMode === FieldMode.READ_ONLY)
                {
                    fieldElement = renderStatic(fieldType, inputClass, fieldValue);
                }
                else
                {
                    const actualType = unwrapNonNull(fieldType);

                    const enumType = formConfig.schema.getType(actualType.name);

                    fieldElement = (
                        <select
                            id={fieldId}
                            name={qualifiedName}
                            className={cx(inputClass, "form-control", errorMessages.length > 0 && "is-invalid")}
                            title={title}
                            disabled={effectiveMode === FieldMode.DISABLED}
                            value={fieldValue}
                            onChange={onChange}
                            onBlur={onBlur}
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
                        errorMessages={ errorMessages }
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
                    fieldId,
                    name,
                    mode,
                    inputClass,
                    placeholder,
                    formConfig,
                    fieldType,
                    title,
                    path,
                    qualifiedName,
                    onChange,
                    onBlur,
                    autoFocus
                } = ctx;

                const { currency, currencyAddonRight, mode : modeFromOptions } = formConfig.options;
                const effectiveMode = mode || modeFromOptions;

                const errorMessages = formConfig.getErrors(path);
                const fieldValue = formConfig.getValue(path, errorMessages);

                //console.log({formikProps, fieldValue});

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
                            className={ cx(inputClass, "form-control", errorMessages.length > 0 && "is-invalid") }
                            type="text"
                            placeholder={ placeholder }
                            title={ title }
                            disabled={ effectiveMode === FieldMode.DISABLED }
                            value={ fieldValue }
                            onChange={ onChange }
                            onBlur={ onBlur }
                            autoFocus={ autoFocus ? true : null }
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
                        errorMessages={ errorMessages }
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
