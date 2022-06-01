import React, { useEffect, useMemo, useRef, useState } from "react"
import cx from "classnames";
import toPath from "lodash.topath"

import GlobalConfig from "./GlobalConfig"

import PropTypes from "prop-types"

import FieldMode from "./FieldMode"

import { observer as fnObserver } from "mobx-react-lite"
import useFormConfig from "./useFormConfig";

import { ENUM, NON_NULL, SCALAR } from "./kind"
import Addon from "./Addon";
import get from "lodash.get";
import InputSchema from "./InputSchema";
import unwrapType from "./util/unwrapType";

function buildType(type)
{
    const nonNull = type.indexOf("!") === type.length - 1;

    if (nonNull)
    {
        return {
            kind: NON_NULL,
            ofType: {
                kind: SCALAR,
                name: type.substr(0, type.length - 1)
            }
        };
    }
    else
    {
        return {
            kind: SCALAR,
            name: type
        };
    }

}




/**
 * Renders a bootstrap 4 form group with an input field for the given name/path within the current form object. The actual
 * field rendered is resolved by the render rules in GlobalConfig.js ( See ["Form Customization"](./customization.md) for details)
 */

const Field = fnObserver((props, ref) => {

    const formConfig = useFormConfig();

    const [isPending, setPending ] = useState( false )

    const {
        name,
        mode,
        inputClass,
        labelClass,
        formGroupClass,
        helpText,
        children,
        addons: addonsFromProps,
        onChange,
        onPressEnter,
        onBlur,
        onFocus,
        validate,
        fieldContext: fieldContextCB,
        maxLength,
        tooltip,
        validateAsync: validateAsyncFromProps,
        validateAsyncTimeout = 350,
        isEditMode,
        suspendAutoUpdate,
        isSensitive
    } = props;
    
    /**
     * Memoize validateAsync independently so we have a stable reference even when the field context changes.
     */
    const validateAsync = useMemo(
        () => {
            return validateAsyncFromProps ? {
                invokeValidateAsync: (context, value) => {

                    return new Promise((resolve, reject) => {

                        if (validateAsync.timerId !== null)
                        {
                            clearTimeout(validateAsync.timerId);
                        }
                        else
                        {
                            validateAsync.resolve = resolve;
                            validateAsync.reject = reject;
                        }

                        validateAsync.timerId = setTimeout(
                            () => {

                                const { resolve, reject } = validateAsync;

                                validateAsync.timerId = null;
                                validateAsync.resolve = null;
                                validateAsync.reject = null;

                                Promise.resolve(validateAsyncFromProps(context, value)).then(
                                    resolve,
                                    reject
                                )
                            },
                            validateAsyncTimeout
                        )
                    })
                },
                resolve: null,
                reject: null,
                timerId: null
            } : null;

        },
        [ validateAsyncTimeout ]
    )


    const fieldContext = useMemo(
        () => {
            const {
                id,
                label,
                autoFocus,
                placeholder,
                type
            } = props;
            
            const qualifiedName = formConfig.getPath(name);
            let effectiveMode = mode || formConfig.getMode();

            const path = toPath(qualifiedName);
            const parentPath = path.length > 1 ? path.slice(0, -1) : null;

            const { formId } = formConfig.ctx;

            let fieldId;
            let effectiveLabel;
            const fieldType = type ? buildType(type) : formConfig.schema.resolveType(formConfig.type, path);

            if (name && name.length)
            {
                const lastSegment = path[path.length - 1];
                fieldId = id || "c" + formConfig.formContext.id + ":" + formId + ":" + qualifiedName;
                effectiveLabel =
                    typeof label === "string" ? label : formConfig.options.lookupLabel(formConfig, lastSegment);
            }
            else
            {
                // XXX: solve issue
                throw new Error("It does happen after all");
                // fieldId = id;
                // effectiveLabel = label || "";
            }

            let addons = addonsFromProps || Addon.filterAddons(children);

            if (effectiveMode === FieldMode.PLAIN_TEXT)
            {
                addons = addons.map(addon => {
                    const {placement, moveIfPlainText} = addon.props;

                    if (moveIfPlainText)
                    {
                        if (placement === Addon.LEFT)
                        {
                            return React.cloneElement(addon, {
                                placement: Addon.BEFORE
                            })
                        }
                        else if (placement === Addon.RIGHT)
                        {
                            return React.cloneElement(addon, {
                                placement: Addon.AFTER
                            })
                        }
                    }
                    return addon;
                });
            }


            const newFieldContext = {
                isFieldContext: true,
                fieldRef: ref,
                name,
                formId,
                fieldId,
                fieldType,
                qualifiedName,
                path,
                autoFocus,
                placeholder,
                inputClass: cx(inputClass, isPending && "pending"),
                labelClass,
                formGroupClass,
                tooltip,
                helpText,
                maxLength,
                suspendAutoUpdate,
                isSensitive,
                rootType: formConfig.type,

                root: formConfig.root,

                get mode()
                {
                    if (effectiveMode === FieldMode.NORMAL && parentPath)
                    {
                        const parentObject = get(formConfig.root, parentPath);
                        if (!parentObject || typeof parentObject !== "object")
                        {
                            return FieldMode.DISABLED
                        }
                    }
                    return effectiveMode
                },
                set mode(mode)
                {
                    effectiveMode = mode
                },
                label: effectiveLabel,

                isEditMode,


                handleKeyPress: !!onPressEnter ? ev => {

                    const { target, code, ctrlKey, altKey, shiftKey, metaKey } = ev;
                    const modifier = {ctrlKey, altKey, shiftKey, metaKey};

                    const value = target.type === "checkbox" ? target.checked : target.value;

                    //console.log("Field.handleKeyPress", fieldType, name, value);

                    formConfig.handleKeyPress(newFieldContext, code, modifier, value);
                } : null,

                handleChange: ev => {

                    const { target } = ev;

                    const value = target.type === "checkbox" ? target.checked : target.value;

                    //console.log("Field.handleChange", fieldType, name, value);

                    formConfig.handleChange(newFieldContext, value);
                },

                handleBlur: ev => {

                    const { target: { value } } = ev;

                    //console.log("Field.handleBlur", fieldType, name, value);

                    formConfig.handleBlur(newFieldContext, value);
                },

                handleFocus: ev => {

                    const { target: { value } } = ev;

                    //console.log("Field.handleBlur", fieldType, name, value);

                    formConfig.handleFocus(newFieldContext, value);
                },

                validate,
                validateAsync,
                addons,
                section: null,
                fieldChangeHandler : onChange,
                fieldPressEnterHandler: onPressEnter,
                fieldBlurHandler: onBlur,
                fieldFocusHandler: onFocus,

                isPending,
                setPending
            };

            if (typeof fieldContextCB === "function")
            {
                fieldContextCB(newFieldContext);
            }

            if (formConfig.root)
            {
                formConfig.formContext.registerFieldContext(newFieldContext);
            }

            //console.log("FIELD CONTEXT", newFieldContext.fieldId, newFieldContext)

            return newFieldContext;

        },
        [ formConfig, name, mode, inputClass, labelClass, tooltip, isPending, helpText, isEditMode ]
    );

    const isFirstRun = useRef(true);
    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }
        formConfig.handleChange(fieldContext, Field.getValue(formConfig, fieldContext));
    }, [isEditMode])

    //console.log("RENDER FIELD", fieldContext);

    if (typeof children === "function")
    {
        return (
            <React.Fragment>
                {
                    children(formConfig, fieldContext)
                }
            </React.Fragment>
        );
    }
    else
    {
        const renderFn = GlobalConfig.getRenderFn(formConfig,fieldContext);
        return renderFn(formConfig, fieldContext);

    }

}, { forwardRef: true});

Field.propTypes = {
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
     * Tooltip / title attribute for the input element
     */
    tooltip: PropTypes.string,
    /**
     * Label for the field.
     */
    label: PropTypes.string,
    /**
     * Placeholder text to render for text inputs.
     */
    placeholder: PropTypes.string,

    /**
     * Additional HTML classes for the input element.
     */
    inputClass: PropTypes.string,

    /**
     * Additional HTML classes for the label element.
     */
    labelClass: PropTypes.string,

    /**
     * Additional HTML classes for the form group element.
     */
    formGroupClass: PropTypes.string,

    /**
     * Optional local on-change handler ( ({oldValue, fieldContext}, value) => ... )
     */
    onChange: PropTypes.func,

    /**
     * Optional keypress handler to use to react to the single field enter button press
     */
    onPressEnter: PropTypes.func,

    /**
     * Optional per-field validation function  ( (fieldContext, value) => error ). It receives the current scalar value
     * and the current field context and returns an error string if there is any or `null` if there is no error.
     *
     * The local validation is executed after the type validation and also prevents invalid values from being written back
     * into the observable. The high-level validation is only executed if the local validation succeeds.
     */
    validate: PropTypes.func,

    /**
     * Optional blur handler to use
     */
    onBlur: PropTypes.func,

    /**
     * Pass-through autoFocus attribute for text inputs
     */
    autoFocus: PropTypes.bool,

    /**
     * Array of addons as props instead of as children. Only useful if you're writing a component wrapping Field and want
     * to render your addons as field addons while using the render function form.
     */
    addons: PropTypes.array,

    /**
     * Callback function that allows complex field implementations to modify the newly created field context ( fieldContext => void ).
     */
    fieldContext: PropTypes.func,

    /**
     * Maximum field length (for string fields)
     */
    maxLength: PropTypes.number,

    /**
     * Optional asynchronous validation function. ( (context,value) => Promise ).
     */
    validateAsync: PropTypes.func,

    /**
     * Debounce timeout for validateAsync (Default is 300).
      */
    validateAsyncTimeout: PropTypes.number,

    /**
     * Enable masking for sensitive information.
     */
    isSensitive: PropTypes.bool
};

Field.displayName = "Field";

Field.getValue = (formConfig, fieldContext, errorMessages = formConfig.getErrors(fieldContext.qualifiedName)) =>
{
    if (errorMessages.length > 0)
    {
        return errorMessages[0];
    }
    else
    {
        const { fieldType, path } = fieldContext;
        let value = get(formConfig.root, path);
        if (value === undefined)
        {
            value = null;
        }

        //console.log("getValue", this.root, path, " = ", value);

        const unwrapped = unwrapType(fieldType);
        if (unwrapped.kind === ENUM)
        {
            return value;
        }
        return InputSchema.scalarToValue(unwrapped.name, value, fieldContext);
    }

}


export default Field;
