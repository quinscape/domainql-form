import React from "react"
import cx from "classnames"

import FieldMode from "./FieldMode"
import InputSchema, { unwrapNonNull } from "./InputSchema"
import { resolveStaticRenderer } from "./GlobalConfig"

import get from "lodash.get"

import FormGroup from "./FormGroup"
import unwrapType from "./util/unwrapType";


function renderStatic(ctx, fieldValue)
{

    const {
        fieldId,
        inputClass,
        fieldType
    } = ctx;

    const scalarType = unwrapNonNull(fieldType);

    const staticRenderer = resolveStaticRenderer(scalarType.name);

    const value = scalarType.kind === "SCALAR" ? InputSchema.valueToScalar(
        scalarType.name,
        fieldValue
    ): fieldValue;


    return (
        <span
            id={ fieldId }
            className={
                cx(
                    inputClass,
                    "form-control-plaintext"
                )
            }
        >
            {
                staticRenderer(
                    value
                )
            }
        </span>
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

                const { fieldType, mode, formConfig, fieldId, inputClass, label, labelClass, title, path, qualifiedName, onChange, onBlur } = ctx;

                // no need to convert
                const fieldValue =  formConfig.getValue(path);

                //console.log("checkbox value = ", fieldValue);

                let checkBoxElement;

                if (mode === FieldMode.PLAIN_TEXT)
                {
                    const staticRenderer = resolveStaticRenderer("Boolean");

                    checkBoxElement = (
                        <span id={fieldId} className="form-control-plaintext">
                            {
                                staticRenderer(fieldValue)
                            }
                            <label
                                htmlFor={ fieldId }
                            >
                            {
                                label
                            }
                            </label>
                        </span>
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
                                disabled={ mode === FieldMode.DISABLED || mode === FieldMode.READ_ONLY }
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
                        { ...ctx }
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

                const errorMessages = formConfig.getErrors(path);
                const fieldValue =  formConfig.getValue(path, errorMessages);

                let fieldElement;
                if (mode === FieldMode.PLAIN_TEXT)
                {
                    fieldElement = renderStatic(ctx, fieldValue);
                }
                else
                {
                    const actualType = unwrapNonNull(fieldType);

                    const enumType = formConfig.schema.getType(actualType.name);

                    fieldElement = (
                        <select
                            id={ fieldId }
                            name={ qualifiedName }
                            className={ cx(inputClass, "form-control", errorMessages.length > 0 && "is-invalid") }
                            title={ title }
                            disabled={ mode === FieldMode.DISABLED || mode === FieldMode.READ_ONLY}
                            value={ fieldValue }
                            onChange={ onChange }
                            onBlur={ onBlur }
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
                        { ...ctx }
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

                const { currency, currencyAddonRight, mode: modeFromOptions } = formConfig.options;

                const errorMessages = formConfig.getErrors(qualifiedName);
                const fieldValue =  InputSchema.scalarToValue(unwrapType(fieldType).name, formConfig.getValue(path, errorMessages));

                //console.log("RENDER FIELD",{ ctx, fieldValue });

                let fieldElement;
                if (mode === FieldMode.PLAIN_TEXT)
                {
                    fieldElement = renderStatic(ctx, fieldValue);
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
                            disabled={ mode === FieldMode.DISABLED }
                            readOnly={ mode === FieldMode.READ_ONLY }
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
                        { ...ctx }
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
