import React from "react";
import cx from "classnames";


/**
 * Renders a .form-group wrapper from our standard render context. Is used by internally the default field renderers
 * and can be used for implementing custom fields.
 *
 * If you just need a bootstrap form group with arbitrary content, use CustomGroup.
 *
 * @param props
 * @returns {*}
 * @constructor
 */
class FormGroup extends React.Component
{
    static defaultProps = {
        formGroupClass : "form-group"
    };

    render()
    {
        const {
            formConfig,
            fieldId,
            label,
            helpText,
            labelClass,
            errorMessage,
            children
        } = this.props;

        const { horizontal, labelColumnClass, wrapperColumnClass } = formConfig.options;

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
                {label}
            </label>) : (
                horizontal &&
                <div className={labelColumnClass}>
                    {"\u00a0"}
                </div>
        );

        let helpBlock = false;


        const formText = errorMessage || helpText;

        if (formText)
        {
            helpBlock = (
                <p className={ cx("form-group", errorMessage ? "invalid-feedback" : "text-muted") }>
                    { formText }
                </p>
            )
        }

        return (
            <div className={
                cx(
                    "form-group",
                    horizontal ? "form-row" : null,
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
}

export default FormGroup;
