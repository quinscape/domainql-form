import React from "react"
import PropTypes from "prop-types"

import FieldMode from "./FieldMode"
import FormGroup from "./FormGroup"
import FormConfig from "./FormConfig"
import GQLField from "./GQLField"
import get from "lodash.get";
import cx from "classnames";

/**
 * Allows selection from a list of string values for a target field.
 */
class GQLSelect extends React.Component {

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
            return fieldContext.formik.handleChange(ev);
        }
    };

    render()
    {
        return (
            <GQLField
                { ...this.props }
                values={ null }
            >

                {
                    this.renderWithFieldContext
                }
            </GQLField>
        )
    }

    renderWithFieldContext = fieldContext => {
        //console.log("render GQLSelect", fieldContext);

        const { values, inputClass, required } = this.props;
        const { formik, path, qualifiedName } = fieldContext;

        const errorMessage = get(formik.errors, path);
        const fieldValue = get(formik.values, path);

        const noneText = FormConfig.none();


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
                    onBlur={ formik.handleBlur }
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

export default GQLSelect
