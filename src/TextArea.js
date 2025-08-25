import React, { forwardRef, useEffect, useRef, useState } from "react"
import PropTypes from "prop-types"

import FieldMode from "./FieldMode"
import FormGroup from "./FormGroup"
import Field from "./Field"
import cx from "classnames";

import { resolveStaticRenderer } from "./GlobalConfig"
import Addon from "./Addon";
import { renderStaticField } from "./default-renderers";
import { observer } from "mobx-react-lite"
import useResizeObserver from "./util/useResizeObserver"
import { i18n } from "./util/TranslationHelper"


/**
 * Edits a string GraphQL field with a text area element.
 *
 * This is a good example how to implement custom fields.
 */
const TextArea = forwardRef(function TextArea(props, ref) {

    const { rows, cols, inputClass, showMoreButton, children, ...fieldProps } = props;

    const textAreaRef = useRef();
    const { height: textAreaHeight, width: textAreaWidth } = useResizeObserver(textAreaRef);
    const [isContentOverflowing, setIsContentOverflowing] = useState(false);

    useEffect(() => {
        const targetEl = textAreaRef.current;
        setIsContentOverflowing(targetEl.scrollHeight > targetEl.offsetHeight);
    }, [textAreaRef.current, textAreaHeight, textAreaWidth]);

    return (<>
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
                                ref={
                                    elem => {
                                        textAreaRef.current = elem;
                                        if (typeof fieldRef === "function") {
                                            fieldRef(elem);
                                        }
                                        else if (fieldRef) {
                                            fieldRef.current = elem;
                                        }
                                    }}
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
                                onChange={(event) => {
                                    const targetEl = textAreaRef.current;
                                    setIsContentOverflowing(targetEl.scrollHeight > targetEl.offsetHeight);

                                    handleChange(event);
                                }}
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
        {
            showMoreButton && isContentOverflowing ? (
                <button
                    className="btn btn-secondary d-block mx-auto"
                    onClick={() => {
                        const targetEl = textAreaRef.current;
                        const borders = (targetEl.offsetHeight - targetEl.clientHeight);
                        targetEl.style.height = targetEl.scrollHeight + borders + "px"
                    }}
                >
                    {i18n("TextArea:More")}
                </button>
            ) : null
        }
    </>)
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
    validate: PropTypes.func,

    /**
     * Show a "more" button if the content is bigger than the textbox (a scrollbar is visible).
     * 
     * The button allows the user to quickly expand the TextArea to match its content in height.
     */
    showMoreButton: PropTypes.bool

};

TextArea.defaultProps = {
    rows: 3,
    cols: 60
};

export default TextArea
