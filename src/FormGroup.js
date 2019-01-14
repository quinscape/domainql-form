import React from "react"
import PropTypes from "prop-types"
import cx from "classnames"
import FieldMode from "./FieldMode"


/**
 * Renders a .form-group wrapper from our standard render context. Is used by internally the default field renderers
 * and can be used for implementing custom fields.
 *
 * If you just need a bootstrap form group with arbitrary content, use CustomGroup.
 *
 * Read [Form Customization](./customization.md) for an usage example and make sure FormGroup is what you want.
 */
class FormGroup extends React.Component
{
    static propTypes = {
        /**
         * Marker class for the form group, (default is "form-group")
         */
        formGroupClass: PropTypes.string,

        /**
         * Error messages to render for this form group.
         */
        errorMessages: PropTypes.array
    };

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
            errorMessages,
            mode,
            children
        } = this.props;

        if (mode === FieldMode.INVISIBLE)
        {
            return false;
        }

        const { horizontal, labelColumnClass, wrapperColumnClass } = formConfig.options;

        //console.log("RENDER FormGroup", { horizontal, labelColumnClass, wrapperColumnClass });

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

        const haveErrors = errorMessages && errorMessages.length > 0;


        const formText = haveErrors ? errorMessages.slice(1) : helpText && [helpText];

        if (formText)
        {
            helpBlock = (
                <p className={ cx("form-group", haveErrors ? "invalid-feedback" : "text-muted") }>
                    { formText.map( (txt, idx) => <span key={ idx }> { txt } </span>) }
                </p>
            )
        }

        return (
            <div className={
                cx(
                    "form-group",
                    horizontal ? "form-row" : null,
                    haveErrors && "has-error"
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
