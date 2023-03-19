import React, { forwardRef } from "react"
import PropTypes from "prop-types"

import FieldMode from "./FieldMode"
import FormGroup from "./FormGroup"
import Field from "./Field"
import cx from "classnames";

import { resolveStaticRenderer } from "./GlobalConfig"
import Addon from "./Addon";
import { renderStaticField } from "./default-renderers";
import { observer } from "mobx-react-lite"


/**
 * Edits a string GraphQL field with a text area element.
 *
 * This is a good example how to implement custom fields.
 */
const TextArea = forwardRef(function TextArea(props, ref) {

    const { rows, cols, inputClass, children, ...fieldProps } = props;

    return (
        <Field
            ref={ ref }
            { ...fieldProps }
            addons={ Addon.filterAddons(children) }
        >
            {
                (formConfig, fieldContext) => {

                    const {fieldRef, fieldId, mode, qualifiedName, path, autoFocus, tooltip, placeholder, handleChange, handleBlur} = fieldContext;

                    const errorMessages = formConfig.getErrors(qualifiedName);
                    const fieldValue = Field.getValue(formConfig, fieldContext);

                    const isPlainText = mode === FieldMode.PLAIN_TEXT;

                    let fieldElem;
                    if (isPlainText)
                    {
                        fieldElem = (
                            renderStaticField(fieldContext, fieldValue)
                        );
                    }
                    else
                    {
                        fieldElem = (
                            <textarea
                                ref={fieldRef}
                                id={fieldId}
                                className={
                                    cx(
                                        inputClass,
                                        "form-control",
                                        errorMessages.length > 0 && "is-invalid"
                                    )
                                }
                                rows={rows}
                                cols={cols}
                                name={qualifiedName}
                                value={fieldValue}
                                placeholder={placeholder}
                                title={tooltip}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                autoFocus={autoFocus}
                                disabled={mode === FieldMode.DISABLED}
                                readOnly={mode === FieldMode.READ_ONLY}
                            />
                        );
                    }

                    fieldElem = Addon.renderWithAddons(fieldElem, fieldContext.addons);

                    return (
                        <FormGroup
                            {...fieldContext}
                            formConfig={formConfig}
                            errorMessages={errorMessages}
                        >
                            {
                                fieldElem
                            }
                        </FormGroup>
                    )
                }
            }
        </Field>
    )
});

TextArea.propTypes = {
    /**
     * Name / path for this field (e.g. "name", but also "foos.0.name")
     */
    name: PropTypes.string.isRequired,
    /**
     * Mode for this field. If not set or set to null, the mode will be inherited from the &lt;Form/&gt; or &lt;FormBlock&gt;.
     */
    mode: PropTypes.oneOf(FieldMode.values()),

    /**
     * Additional help text for this field. Is rendered for non-erroneous fields in place of the error. If a function
     * is given, it should be a stable reference ( e.g. with useCallback()) to prevent creating the field context over
     * and over. The same considerations apply to using elements. ( The expression <Bla/> recreates that element on every
     * invocation, use static element references)
     */
    helpText: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.element]),

    /**
     * Tooltip / title attribute
     */
    tooltip: PropTypes.string,
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

    /**
     * Maximum field length
     */
    maxLength: PropTypes.number,

    /**
     * Optional local on-change handler ( ({oldValue, fieldContext}, value) => ... )
     */
    onChange: PropTypes.func,

    /**
     * Optional per-field validation function  ( (fieldContext, value) => error ). It receives the current scalar value
     * and the current field context and returns an error string if there is any or `null` if there is no error.
     *
     * The local validation is executed after the type validation and also prevents invalid values from being written back
     * into the observable. The high-level validation is only executed if the local validation succeeds.
     */
    validate: PropTypes.func

};

TextArea.defaultProps = {
    rows: 3,
    cols: 60
};

export default TextArea
