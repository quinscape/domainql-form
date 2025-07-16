import React from "react"
import PropTypes from "prop-types"
import cx from "classnames"
import FieldMode from "./FieldMode"
import FormLayout from "./FormLayout";
import Icon from "./util/Icon"



export function renderHelpBlock(haveErrors, errorMessages, helpText, isInline)
{
    let helpBlock = false;

    const formText = haveErrors ? errorMessages.slice(1) : helpText && [ typeof helpText === "function" ? helpText() : helpText ];

    if (formText)
    {
        helpBlock = (
            <p className={cx(haveErrors ? "invalid-feedback" : "text-muted", haveErrors && !isInline ? "d-block" : "d-inline")}>
                {formText.map((txt, idx) => <span key={idx}> {txt} </span>)}
            </p>
        )
    }
    return helpBlock;
}


/**
 * Renders a .form-group wrapper from our standard render context. Is used by internally the default field renderers
 * and can be used for implementing custom fields.
 *
 * If you just need a bootstrap form group with arbitrary content, use CustomGroup.
 *
 * Read [Form Customization](./customization.md) for an usage example and make sure FormGroup is what you want.
 */
const FormGroup = props => {

    const {
        formConfig,
        fieldId,
        label,
        helpText,
        labelClass,
        formGroupClass,
        errorMessages,
        mode,
        children,
        sensitiveDataText
    } = props;

    if (mode === FieldMode.INVISIBLE)
    {
        return false;
    }

    const { layout, labelColumnClass, wrapperColumnClass } = formConfig.options;

    //console.log("RENDER FormGroup", { horizontal, labelColumnClass, wrapperColumnClass });

    const horizontal = layout === FormLayout.HORIZONTAL;
    const isInline = layout === FormLayout.INLINE;


    const computedSensitiveDataText =    typeof sensitiveDataText === "function" ? sensitiveDataText() : sensitiveDataText ;
    const sensitiveDataIcon = computedSensitiveDataText ? (<Icon className="fa-eye mr-2 text-primary" title={computedSensitiveDataText}></Icon>) : null;

    const labelElement = label ? (
        <label
            className={
                cx(
                    horizontal ? labelColumnClass : null,
                    horizontal ? "col-form-label" : null,
                    labelClass
                )
            }
            htmlFor={fieldId}
        >
            {sensitiveDataIcon}
            {label}
        </label>) : (
            horizontal &&
            <div className={labelColumnClass}>
                {sensitiveDataIcon}
                {"\u00a0"}
            </div>
    );

    const haveErrors = errorMessages && errorMessages.length > 0;

    let helpBlock = renderHelpBlock(haveErrors, errorMessages, helpText, isInline);

    if (layout === FormLayout.INLINE)
    {
        return (
            <React.Fragment>
                { !formConfig.options.suppressLabels && labelElement }
                { children }
                { helpBlock }
            </React.Fragment>
        )
    }

    return (
        <div className={
            cx(
                "form-group",
                horizontal ? "form-row" : null,
                haveErrors && "has-error",
                formGroupClass
            )
        }>

            { labelElement }
            {
                horizontal && (
                    <div className={wrapperColumnClass || "col-md-9"}>
                        {children}
                        {helpBlock}
                    </div>
                )
            }
            {
                layout === FormLayout.DEFAULT && (
                    children
                )
            }
            { !horizontal && helpBlock }
        </div>
    );
};

FormGroup.propTypes = {
    /**
     * Additional classes the form group
     */
    formGroupClass: PropTypes.string,

    /**
     * Error messages to render for this form group.
     */
    errorMessages: PropTypes.array
};

export default FormGroup;
