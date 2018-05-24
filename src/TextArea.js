import React from "react"
import PropTypes from "prop-types"

import FieldMode from "./FieldMode"
import FormGroup from "./FormGroup"
import Field from "./Field"
import get from "lodash.get";
import cx from "classnames";


/**
 * Edits a string GraphQL field with a text area element.
 *
 * This is a good example how to implement custom fields.
 */
class TextArea extends React.Component {

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
            <Field
                { ...this.props }
                rows={ null }
                cols={ null }
            >
                {
                    this.renderWithFieldContext
                }
            </Field>
        )
    }

    renderWithFieldContext = fieldContext => {

        const { rows, cols, inputClass, placeholder } = this.props;
        const { qualifiedName, path } = fieldContext;
        const { formikProps } = fieldContext.formConfig;

        const errorMessage = get(formikProps.errors, path);
        const fieldValue = get(formikProps.values, path);

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
                    name={ qualifiedName }
                    value={ fieldValue }
                    placeholder={ placeholder }
                    onChange={ formikProps.handleChange }
                    onBlur={ formikProps.handleBlur }
                />
            </FormGroup>
        )
    };
}

export default TextArea
