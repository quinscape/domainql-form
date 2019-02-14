import React from "react"
import PropTypes from "prop-types"

import FieldMode from "./FieldMode"
import FormGroup from "./FormGroup"
import GlobalConfig from "./GlobalConfig"
import Field from "./Field"
import get from "lodash.get";
import cx from "classnames";

import { resolveStaticRenderer } from "./GlobalConfig"
import InputSchema from "./InputSchema";
import unwrapType from "./util/unwrapType";


function findLabelForValue(values, value)
{
    for (let i = 0; i < values.length; i++)
    {
        const v = values[i];
        if (typeof v === "string" && v === value)
        {
            return v;
        }
        else if (v.value === value)
        {

            return v.name;
        }
    }

    return GlobalConfig.none();
}


/**
 * Allows selection from a list of string values for a target field.
 */
const Select = props => {

    const handleChange = (fieldContext, ev) => {

        const { onChange } = props;

        if (onChange)
        {
            onChange(ev, fieldContext);
        }

        if (!ev.isDefaultPrevented())
        {
            return fieldContext.handleChange(ev);
        }
    };

    const { values, inputClass, required, ... fieldProps} = props;


    return (
        <Field
            {... fieldProps}
        >

            {
                (formConfig, fieldContext) => {
                    //console.log("render Select", fieldContext);

                    const { fieldId, fieldType, mode, path, qualifiedName, onBlur, autoFocus } = fieldContext;

                    const errorMessages = formConfig.getErrors(path);
                    const fieldValue = InputSchema.scalarToValue(unwrapType(fieldType).name, formConfig.getValue(path, errorMessages));

                    const noneText = GlobalConfig.none();

                    const isPlainText = mode === FieldMode.PLAIN_TEXT;

                    return (
                        <FormGroup
                            {...fieldContext}
                            formConfig={formConfig}
                            errorMessages={errorMessages}
                        >
                            {
                                isPlainText ? (
                                    <span
                                        id={fieldId}
                                        className="form-control-plaintext"
                                    >
                            {
                                findLabelForValue(values, fieldValue)
                            }
                        </span>
                                ) : (
                                    <select
                                        id={fieldId}
                                        className={
                                            cx(
                                                inputClass,
                                                "form-control",
                                                errorMessages.length > 0 && "is-invalid"
                                            )
                                        }
                                        name={qualifiedName}
                                        value={fieldValue}
                                        disabled={mode === FieldMode.DISABLED || mode === FieldMode.READ_ONLY}
                                        onChange={ev => handleChange(fieldContext, ev)}
                                        onBlur={onBlur}
                                        autoFocus={autoFocus}
                                    >
                                        {
                                            !required && <option key="" value="">{noneText}</option>
                                        }
                                        {
                                            values.map(v => {

                                                let name, value;
                                                if (typeof v === "string")
                                                {
                                                    name = v;
                                                    value = v;
                                                }
                                                else
                                                {
                                                    name = v.name;
                                                    value = v.value;
                                                }

                                                return (
                                                    <option
                                                        key={value}
                                                        value={value}
                                                    >
                                                        {
                                                            name
                                                        }
                                                    </option>
                                                );
                                            })
                                        }
                                    </select>
                                )
                            }
                        </FormGroup>
                    )
                }
            }
        </Field>
    )
};

Select.propTypes = {

    /**
     * Name / path for this field (e.g. "name", but also "foos.0.name")
     */
    name: PropTypes.string.isRequired,
    /**
     * Mode for this field. If not set or set to null, the mode will be inherited from the &lt;Form/&gt; or &lt;FormBlock&gt;.
     */
    mode: PropTypes.oneOf(FieldMode.values()),
    /**
     * Additional help text for this field. Is rendered for non-erroneous fields in place of the error.
     */
    helpText: PropTypes.string,
    /**
     * Title attribute
     */
    title: PropTypes.string,
    /**
     * Label for the field.
     */
    label: PropTypes.string,
    /**
     * Placeholder text to render for the empty text area.
     */
    placeholder: PropTypes.string,

    /**
     * Additional HTML classes for the textarea element.
     */
    inputClass: PropTypes.string,

    /**
     * Additional HTML classes for the label element.
     */
    labelClass: PropTypes.string,

    /**
     * Array of values to offer to the user. If required is false, &lt;Select/&gt; will add an empty option.
     *
     * The values can be either a string or an object with `name` and `value` property.
     */
    values: PropTypes.array.isRequired,

    /**
     * Local change handler. can call ev.preventDefault() to cancel change.
     */
    onChange: PropTypes.func,

    /**
     * If true, the user must select one of the given values, if false, the user will also be given an empty option.
     */
    required: PropTypes.bool
};

Select.defaultProps = {
    required: false
};

export default Select
