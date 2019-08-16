import React from "react"
import cx from "classnames"

import FieldMode from "./FieldMode"
import InputSchema, { unwrapNonNull } from "./InputSchema"
import { resolveStaticRenderer } from "./GlobalConfig"
import FormGroup from "./FormGroup"
import unwrapType from "./util/unwrapType";
import FormLayout from "./FormLayout";
import Addon from "./Addon";

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

            render: (formConfig, ctx) =>  {

                const { fieldType, mode, fieldId, inputClass, label, labelClass, tooltip, path, qualifiedName, handleChange, handleBlur } = ctx;

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
                        <div className={
                            cx(
                                "form-check",
                                formConfig.options.layout === FormLayout.INLINE && "form-check-inline"
                            )
                        }>
                            <input
                                id={ fieldId }
                                name={ qualifiedName }
                                className={ cx(inputClass, "form-check-input") }
                                type="checkbox"
                                title={ tooltip }
                                checked={ fieldValue }
                                onChange={ handleChange }
                                onBlur={ handleBlur }
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
                        formConfig={ formConfig }
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

            render: (formConfig, ctx) =>  {

                const {
                    fieldId,
                    mode,
                    inputClass,
                    fieldType,
                    tooltip,
                    path,
                    qualifiedName,
                    handleChange,
                    handleBlur
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
                            title={ tooltip }
                            disabled={ mode === FieldMode.DISABLED || mode === FieldMode.READ_ONLY}
                            value={ fieldValue }
                            onChange={ handleChange }
                            onBlur={ handleBlur }
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
                        formConfig={ formConfig }
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
             * @param {FormConfig} formConfig
             * @param {object} ctx
             * @returns {*}
             */
            render: (formConfig, ctx) =>  {

                const {
                    fieldId,
                    mode,
                    inputClass,
                    placeholder,
                    tooltip,
                    fieldType,
                    path,
                    qualifiedName,
                    handleChange,
                    handleBlur,
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
                            title={ tooltip }
                            disabled={ mode === FieldMode.DISABLED }
                            readOnly={ mode === FieldMode.READ_ONLY }
                            value={ fieldValue }
                            onChange={ handleChange }
                            onBlur={ handleBlur }
                            autoFocus={ autoFocus ? true : null }
                        />
                    );

                    if (fieldType.name === "Currency" && !ctx.addons.length)
                    {
                        fieldElement = Addon.renderWithAddons(fieldElement, [
                            <Addon placement={ currencyAddonRight ? Addon.RIGHT : Addon.LEFT} text={ true}>
                                {
                                    currency
                                }
                            </Addon>
                        ]);
                    }
                    else if ( ctx.addons.length)
                    {
                        fieldElement = Addon.renderWithAddons(fieldElement, ctx.addons);
                    }

                }

                return (
                    <FormGroup
                        { ...ctx }
                        formConfig={ formConfig }
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
