import React from "react"
import PropTypes from "prop-types"

import FieldMode from "./FieldMode"
import FormGroup from "./FormGroup"
import GlobalConfig from "./GlobalConfig"
import Field from "./Field"
import get from "lodash.get";
import cx from "classnames";

import { resolveStaticRenderer } from "./GlobalConfig"

/**
 * Allows selection from a list of string values for a target field.
 */
class Select extends React.Component {

    static propTypes = {

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

    static defaultProps = {
        required:  false
    };

    handleChange = (fieldContext, ev) => {

        const { onChange } = this.props;

        if (onChange)
        {
            onChange(ev, fieldContext);
        }

        if (!ev.isDefaultPrevented())
        {
            return fieldContext.onChange(ev);
        }
    };

    render()
    {
        return (
            <Field
                { ...this.props }
                values={ null }
            >

                {
                    this.renderWithFieldContext
                }
            </Field>
        )
    }

    renderWithFieldContext = fieldContext => {
        //console.log("render Select", fieldContext);

        const { values, inputClass, required } = this.props;
        const { formConfig, path, qualifiedName, onBlur, autoFocus } = fieldContext;

        const { formikProps } = formConfig;

        const errorMessage = get(formikProps.errors, path);
        const fieldValue = get(formikProps.values, path);

        const noneText = GlobalConfig.none();

        const effectiveMode = fieldContext.mode || formConfig.options.mode;

        const isReadOnly = effectiveMode === FieldMode.READ_ONLY;


        return (
            <FormGroup
                { ... fieldContext }
                errorMessage={ errorMessage }
            >
                {
                    isReadOnly ?
                        resolveStaticRenderer(fieldContext.fieldType)(fieldValue) : (
                            <select
                                className={
                                    cx(
                                        inputClass,
                                        "form-control",
                                        errorMessage && "is-invalid"
                                    )
                                }
                                name={qualifiedName}
                                value={fieldValue}
                                disabled={effectiveMode === FieldMode.DISABLED}
                                onChange={ev => this.handleChange(fieldContext, ev)}
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
    };
}

export default Select
