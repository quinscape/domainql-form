import React from "react"
import PropTypes from "prop-types"

import FieldMode from "./FieldMode"
import FormGroup from "./FormGroup"
import GlobalConfig from "./GlobalConfig"
import Field from "./Field"
import cx from "classnames";

import InputSchema from "./InputSchema";
import unwrapType from "./util/unwrapType";
import { useFormConfig } from "./index";


/**
 * Finds the display name for the given value.
 *
 * @param {Array<object>} values        row objects
 * @param value                         value
 * @param {String} nameProperty         name property
 * @param {String} valueProperty        value property
 * 
 * @return {string} display name
 */
function findDisplayNameForValue(values, value, nameProperty, valueProperty)
{
    for (let i = 0; i < values.length; i++)
    {
        const v = values[i];
        if (typeof v === "string" && v === value)
        {
            return v;
        }
        else if (v[valueProperty] === value)
        {

            return v[nameProperty];
        }
    }

    return GlobalConfig.none();
}


/**
 * Finds the original scalar value from the row objects based on the
 * current string value of the select element.
 *
 * @param {HTMLElement} selectElem      select element
 * @param {Array<object>} values        row objects
 * @param {String} valueProperty        value property
 *
 * @return {*} row object value
 */
function findOptionValue(selectElem, values, valueProperty)
{

    const { value } = selectElem;

    let index = 0;
    let optionElem = selectElem.firstChild;
    while(optionElem)
    {
        if (optionElem.value !== "")
        {
            if (optionElem.value === value)
            {
                const listOption = values[index];
                if (typeof listOption === "string")
                {
                    return listOption;
                }
                else
                {
                    return listOption[valueProperty];
                }
            }
            index++;
        }
        optionElem = optionElem.nextSibling;
    }
    return null;
}


/**
 * Allows selection from a list of string values for a target field.
 */
const Select = props => {

    const { values, inputClass, required, nameProperty, valueProperty, ... fieldProps} = props;

    const formConfig = useFormConfig();

    const handleChange = (fieldContext, ev) => {

        const { onChange } = props;

        if (onChange)
        {
            onChange(ev, fieldContext);
        }

        if (!ev.isDefaultPrevented())
        {
            const scalarValue = findOptionValue(ev.target, values, valueProperty);

            const converted = InputSchema.scalarToValue(unwrapType(fieldContext.fieldType).name, scalarValue);

            //console.log("Select handleChange", scalarValue, "=>", converted);

            return formConfig.handleChange(fieldContext, converted);
        }
    };



    return (
        <Field
            {... fieldProps}
        >

            {
                (formConfig, fieldContext) => {
                    //console.log("render Select", fieldContext);

                    const { fieldId, fieldType, mode, path, qualifiedName, onBlur, autoFocus, tooltip } = fieldContext;

                    const errorMessages = formConfig.getErrors(path);
                    const fieldValue = Field.getValue(formConfig, fieldContext);

                    const noneText = GlobalConfig.none();

                    const isPlainText = mode === FieldMode.PLAIN_TEXT;

                    //console.log("SELECT", qualifiedName, fieldValue, typeof fieldValue);

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
                                findDisplayNameForValue(values, fieldValue, nameProperty, valueProperty)
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
                                        title={ tooltip }
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
                                                    name = v[nameProperty];
                                                    value = v[valueProperty];
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
    tooltip: PropTypes.string,

    /**
     * Label for the field.
     */
    label: PropTypes.string,

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
    required: PropTypes.bool,

    /**
     * Property of the row values to use as display name (default: "name")
     */
    nameProperty: PropTypes.string,

    /**
     * Property of the row values to use as value. Values can be string, number or boolean.  (default: "value")
     */
    valueProperty: PropTypes.string
};

Select.defaultProps = {
    required: false,
    nameProperty: "name",
    valueProperty: "value"
};

export default Select
