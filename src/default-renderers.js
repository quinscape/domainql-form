import React, { useState } from "react"
import cx from "classnames"

import { i18n } from "./util/TranslationHelper"
import FieldMode from "./FieldMode"
import InputSchema, { unwrapNonNull } from "./InputSchema"
import GlobalConfig, { resolveStaticRenderer } from "./GlobalConfig"
import FormGroup from "./FormGroup"
import FormLayout from "./FormLayout";
import Addon from "./Addon";
import Field from "./Field";
import Icon from "./util/Icon"

export function renderStaticField(ctx, fieldValue)
{

    const {
        fieldId,
        inputClass,
        fieldType,
        qualifiedName
    } = ctx;

    const scalarType = unwrapNonNull(fieldType);

    const staticRenderer = resolveStaticRenderer(scalarType.name);

    const value = scalarType.kind === "SCALAR" ? InputSchema.valueToScalar(
        scalarType.name,
        fieldValue,
        ctx
    ): fieldValue;


    return (
        <span
            id={ fieldId }
            data-name={ qualifiedName }
            className={
                cx(
                    inputClass,
                    "form-control-plaintext"
                )
            }
        >
            {
                (!value && value !== 0) ? GlobalConfig.none() : staticRenderer(
                    value
                )
            }
        </span>
    );
}

function renderFieldElement(
    mode,
    ctx,
    fieldValue,
    defaultValue,
    fieldRef,
    fieldId,
    qualifiedName,
    inputClass,
    errorMessages,
    placeholder,
    tooltip,
    handleKeyPress,
    handleChange,
    handleBlur,
    handleFocus,
    autoFocus,
    isSensitive,
    formConfig
) {
    let fieldElement;

    const [isPasswordType, setIsPasswordType] = useState(isSensitive);

    if (mode === FieldMode.PLAIN_TEXT) {
        fieldElement = renderStaticField(ctx, fieldValue ?? defaultValue)
    } else {
        fieldElement = (
            <input
                ref={fieldRef}
                id={fieldId}
                name={qualifiedName}
                className={cx(inputClass, "form-control", errorMessages.length > 0 && "is-invalid")}
                type={isPasswordType ? "password" : "text"}
                placeholder={placeholder}
                title={tooltip}
                disabled={mode === FieldMode.DISABLED}
                readOnly={mode === FieldMode.READ_ONLY}
                value={fieldValue}
                defaultValue={defaultValue}
                onKeyPress={handleKeyPress}
                onChange={handleChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                autoFocus={autoFocus ? true : null} />
        )
    }

    if (isSensitive) {
        const controlMaskButton = (
            <Addon placement={ Addon.RIGHT }>
                <button
                    type="button"
                    className="btn btn-light border"
                    title={ isPasswordType ? i18n("Show password") : i18n("Hide password") }
                    onClick={ () => setIsPasswordType(!isPasswordType) }
                >
                    <Icon className={cx(isPasswordType ? "fa-eye-slash" : "fa-eye")}/>
                </button>
            </Addon>
        );
        fieldElement = Addon.renderWithAddons(fieldElement, [controlMaskButton, ...ctx.addons])
    } else {
        fieldElement = Addon.renderWithAddons(fieldElement, ctx.addons)
    }

    return (
        <FormGroup
            {...ctx}
            formConfig={formConfig}
            errorMessages={errorMessages}
        >
            {fieldElement}
        </FormGroup>
    )
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

                const {
                    fieldRef,
                    mode,
                    fieldId,
                    inputClass,
                    label,
                    labelClass,
                    tooltip,
                    path,
                    qualifiedName,
                    handleKeyPress,
                    handleChange,
                    handleBlur

                } = ctx;

                const fieldValue = Field.getValue(formConfig, ctx);
                //console.log("checkbox value = ", fieldValue);


                let checkBoxElement;

                if (mode === FieldMode.PLAIN_TEXT)
                {
                    checkBoxElement = (
                        <React.Fragment>
                            {
                                renderStaticField(ctx, fieldValue)
                            }
                            <label
                                htmlFor={ fieldId }
                            >
                                {
                                    label
                                }
                            </label>
                        </React.Fragment>
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
                                ref={fieldRef}
                                id={ fieldId }
                                name={ qualifiedName }
                                className={ cx(inputClass, "form-check-input") }
                                type="checkbox"
                                title={ tooltip }
                                checked={ fieldValue }
                                onChange={ handleChange }
                                onKeyPress={ handleKeyPress }
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

                checkBoxElement = Addon.renderWithAddons(checkBoxElement, ctx.addons);

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
                    fieldRef,
                    fieldId,
                    mode,
                    inputClass,
                    fieldType,
                    tooltip,
                    path,
                    qualifiedName,
                    handleKeyPress,
                    handleChange,
                    handleBlur
                } = ctx;

                const errorMessages = formConfig.getErrors(qualifiedName);
                const fieldValue = Field.getValue(formConfig, ctx, errorMessages);

                let fieldElement;
                if (mode === FieldMode.PLAIN_TEXT)
                {
                    fieldElement = renderStaticField(ctx, fieldValue);
                }
                else
                {
                    const actualType = unwrapNonNull(fieldType);

                    const enumType = formConfig.schema.getType(actualType.name);

                    fieldElement = (
                        <select
                            ref={fieldRef}
                            id={ fieldId }
                            name={ qualifiedName }
                            className={ cx(inputClass, "form-control", errorMessages.length > 0 && "is-invalid") }
                            title={ tooltip }
                            disabled={ mode === FieldMode.DISABLED || mode === FieldMode.READ_ONLY}
                            value={ fieldValue }
                            onKeyPress={ handleKeyPress }
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

                fieldElement = Addon.renderWithAddons(fieldElement, ctx.addons);

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
                    fieldRef,
                    fieldId,
                    mode,
                    inputClass,
                    placeholder,
                    tooltip,
                    qualifiedName,
                    handleKeyPress,
                    handleChange,
                    handleBlur,
                    handleFocus,
                    autoFocus,
                    suspendAutoUpdate,
                    isSensitive
                } = ctx;

                const errorMessages = formConfig.getErrors(qualifiedName);
                const fieldValue = Field.getValue(formConfig, ctx, errorMessages);

                if (suspendAutoUpdate) {
                    return renderFieldElement(mode, ctx, undefined, fieldValue, fieldRef, fieldId, qualifiedName, inputClass, errorMessages, placeholder, tooltip, handleKeyPress, handleChange, handleBlur, handleFocus, autoFocus, isSensitive, formConfig)
                }
                return renderFieldElement(mode, ctx, fieldValue, undefined, fieldRef, fieldId, qualifiedName, inputClass, errorMessages, placeholder, tooltip, handleKeyPress, handleChange, handleBlur, handleFocus, autoFocus, isSensitive, formConfig)
            }
        }
    ];

export default DEFAULT_RENDERERS

