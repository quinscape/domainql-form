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
         * Rows attribute for the textarea element (default is 3)
         */
        rows: PropTypes.number,
        /**
         * Cols attribute for the textarea element (default is 60)
         */
        cols: PropTypes.number,
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
        const { qualifiedName, path, formConfig, onChange, onBlur, autoFocus } = fieldContext;
        const { formikProps } = formConfig;

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
                    onChange={ onChange }
                    onBlur={ onBlur }
                    autoFocus={ autoFocus }
                />
            </FormGroup>
        )
    };
}

export default TextArea
