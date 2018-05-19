import React from "react"
import PropTypes from "prop-types"

import FieldMode from "./FieldMode"
import FormGroup from "./FormGroup"
import GQLField from "./GQLField"
import get from "lodash.get";
import cx from "classnames";


/**
 * Edits a string GraphQL field with a text area element.
 *
 * This is a good example how to implement custom fields.
 */
class GQLTextArea extends React.Component {

    static propTypes = {
        name: PropTypes.string.isRequired,
        mode: PropTypes.oneOf(FieldMode.values()),
        helpText: PropTypes.string,
        title: PropTypes.string,
        label: PropTypes.string,
        rows: PropTypes.number,
        cols: PropTypes.number,
        placeholder: PropTypes.string,
        inputClass: PropTypes.string,
        labelClass: PropTypes.string
    };

    static defaultProps = {
        rows: 3,
        cols: 60
    };

    render()
    {
        return (
            <GQLField
                { ...this.props }
                rows={ null }
                cols={ null }
            >
                {
                    this.renderWithFieldContext
                }
            </GQLField>
        )
    }

    renderWithFieldContext = fieldContext => {

        const { name, rows, cols, inputClass, placeholder } = this.props;
        const { formik, path } = fieldContext;

        const errorMessage = get(formik.errors, path);
        const fieldValue = get(formik.values, path);

        return (
            <FormGroup
                { ... fieldContext }
                errorMessage={ errorMessage }
            >
                <textarea
                    className={
                        cx(
                            inputClass,
                            "form-control",
                            errorMessage && "is-invalid"
                        )
                    }
                    rows={ rows }
                    cols={ cols }
                    name={ name }
                    value={ fieldValue }
                    placeholder={ placeholder }
                    onChange={ formik.handleChange }
                    onBlur={ formik.handleBlur }
                />
            </FormGroup>
        )
    };
}

export default GQLTextArea
