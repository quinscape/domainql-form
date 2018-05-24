import React from "react"
import PropTypes from "prop-types"

import FieldMode from "./FieldMode"
import FormGroup from "./FormGroup"
import GlobalConfig from "./GlobalConfig"
import withFormConfig from "./withFormConfig"
import Field from "./Field"
import get from "lodash.get";
import cx from "classnames";

/**
 * Allows selection from a list of string values for a target field.
 */
class Select extends React.Component {

    static propTypes = {
        name: PropTypes.string.isRequired,
        values: PropTypes.array.isRequired,
        mode: PropTypes.oneOf(FieldMode.values()),
        onChange: PropTypes.func,
        required: PropTypes.bool,
        helpText: PropTypes.string,
        title: PropTypes.string,
        label: PropTypes.string,
        inputClass: PropTypes.string,
        labelClass: PropTypes.string
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
            return fieldContext.formConfig.formikProps.handleChange(ev);
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
        const { formConfig, path, qualifiedName } = fieldContext;

        const { formikProps } = formConfig;

        const errorMessage = get(formikProps.errors, path);
        const fieldValue = get(formikProps.values, path);

        const noneText = GlobalConfig.none();


        return (
            <FormGroup
                { ... fieldContext }
                errorMessage={ errorMessage }
            >
                <select
                    className={
                        cx(
                            inputClass,
                            "form-control",
                            errorMessage && "is-invalid"
                        )
                    }
                    name={ qualifiedName }
                    value={ fieldValue }
                    onChange={ ev => this.handleChange(fieldContext, ev) }
                    onBlur={ formikProps.handleBlur }
                >
                    {
                        !required && <option key="" value="">{ noneText }</option>
                    }
                    {
                        values.map(v => (
                            <option
                                key={ v }
                            >
                                {
                                    v
                                }
                            </option>
                        ))
                    }
                </select>
            </FormGroup>
        )
    };
}

export default withFormConfig(Select)
