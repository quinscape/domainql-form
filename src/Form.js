import React, { useCallback, useEffect, useMemo, useState } from "react"

import PropTypes from "prop-types"
import FormConfig, { DEFAULT_OPTIONS, FormConfigContext } from "./FormConfig";
import InputSchema from "./InputSchema";

import FORM_CONFIG_PROP_TYPES from "./FormConfigPropTypes"
import useFormConfig from "./useFormConfig";
import FormLayout from "./FormLayout";

import { useDebouncedCallback } from "use-debounce"
import { fallbackJSClone } from "./util/clone";
import { Observer } from "mobx-react-lite";
import FormContext from "./FormContext";


/**
 * Internal context object used between Form and FormConfig
 *
 * @param {Function} setRoot                    changes the form root object (type must match!)
 * @param {Function} submit                     triggers a Form submit
 * @param {Function} debouncedSubmit            debounced submission
 * @param {String} formId                        form id
 *
 * @constructor
 */
export function InternalContext(setRoot, submit, debouncedSubmit, formId)
{
    this.setRoot = setRoot;
    this.submit = submit;

    this.debouncedSubmit = debouncedSubmit;
    this.formId = formId;
}


/**
 * Evaluates the value of the given options from the given options, parent options or if neither of them provides an option
 * from DEFAULT_OPTIONS.
 *
 * This awkward method is needed in some cases to prevent a cyclic dependency between hooks.
 *
 * @param {String} name                 option name
 * @param {Object} [options]            optional options object
 * @param {Object} [parentOptions]      optional parent options object
 * @return {number}
 */
function getOption(name, options, parentOptions)
{
    if (options && options[name] !== undefined)
    {
        return options[name];
    }
    else if (parentOptions && parentOptions[name] !== undefined)
    {
        return parentOptions[name];
    }
    else
    {
        return DEFAULT_OPTIONS[name];
    }
}


function cloneRoot(schema, value, options, parentConfig)
{
    if (!value)
    {
        return null;
    }

    // return as-is if isolation option is falsy
    if (!getOption("isolation", options, parentConfig && parentConfig.options))
    {
        return value;
    }

    if (value._type)
    {
        return schema.clone(value);
    }
    else
    {
        return fallbackJSClone(value);
    }
}

let formCounter = 0;
/**
 * Form description
 */
const Form  = props =>  {

    const parentConfig = useFormConfig();

    /**
     * Internal form id for the form instance. Independent of the id attribute of the form.
     */
    const formId = useMemo( () => "f" + formCounter++, []);

    const { id, children, onClick, value, type, onSubmit, formContext = FormContext.getDefault(), options, ... rest } = props;

    const { schema } = formContext;
    const [ root, setRoot] = useState( () => cloneRoot(schema, value, options, parentConfig) );

    useEffect(
        () => {
            return () => formContext.unregisterForm(formId)
        },
        []
    )

    const handleSubmit = useCallback(
        ev => {

            ev && ev.preventDefault();

            if (formConfig.options.revalidate)
            {
                formConfig.formContext.revalidate();
            }

            if (!formConfig.hasErrors())
            {
                if (onSubmit)
                {
                    onSubmit(formConfig)
                }
            }
        },
        [ root, onSubmit ]
    );

    const submitTimeOut = getOption("submitTimeOut", options, parentConfig && parentConfig.options);

    const debouncedSubmit  = useDebouncedCallback(
        handleSubmit,
        submitTimeOut,
    );
    //let didRecreate = true;
    const formConfig = useMemo( () => {

        //didRecreate = false;

        let formConfig;
        if (parentConfig)
        {
            formConfig = new FormConfig(
                options ?
                {
                    ... parentConfig.options,
                    ... options
                } : parentConfig.options,
                formContext
            );
        }
        else
        {
            formConfig = new FormConfig(
                options,
                formContext
            );
        }

        formConfig.setFormContext(
            type,
            "",
            root,
            new InternalContext(
                setRoot,
                handleSubmit,
                debouncedSubmit,
                formId
            )
        );

        //console.log("<Form/> FormConfig", formConfig)

        return formConfig;

    }, [parentConfig, root, onSubmit, options]);
    
    //console.log("RENDER FORM", formConfig);


    const handleReset = ev => {
        const { onReset, value } = props;

        if (onReset)
        {
            onReset(formConfig)
        }
        else
        {
            const root = cloneRoot(schema, value, options, parentConfig);
            setRoot(root);

            formConfig.setFormContext(
                type,
                "",
                root,
                new InternalContext(
                    setRoot,
                    handleSubmit,
                    debouncedSubmit,
                    formId
                )
            );
        }
    };

    return (
        <form
            id={ id }
            className={
                formConfig.options.layout === FormLayout.INLINE ? "form-inline" : "form"
            }
            onSubmit={ handleSubmit }
            onReset={ handleReset }
            onClick={ onClick || null }
            data-form-id={ formId }
            { ... rest }
        >
            <FormConfigContext.Provider value={ formConfig }>
                <Observer>
                    {
                        () => typeof children === "function" ? children(formConfig) : children
                    }
                </Observer>
            </FormConfigContext.Provider>
        </form>
    );
};

Form.propTypes = {
    /**
     * Optional pass-through id attribute for the form element.
     */
    id: PropTypes.string,

    /**
     * Submit handler to receive the current formConfig with the root observable as-is. The default behavior is to do
     * nothing as the (cloned) root object is already updated.
     */
    onSubmit: PropTypes.func,

    /**
     * Reset handler. The default behaviour is to do re-clone the original value
     */
    onReset: PropTypes.func,

    /**
     * form base type. If it is not defined, a type prop must be given on all Fields.
     */
    type: PropTypes.string,

    /**
     * initial value (typed GraphQL object)
     */
    value: PropTypes.any,

    /**
     * Optional onClick handler for the form element.
     */
    onClick: PropTypes.func,

    /**
     * Form options. Options here overwrite options inherited from a FormConfigProvider
     */
    options: PropTypes.shape(FORM_CONFIG_PROP_TYPES),

    /**
     * Optional alternate form-context to use for this form. Separate form contexts will have separate error storage and
     * submit/validation cycles.
     */
    formContext: PropTypes.instanceOf(FormContext)
};

export default Form
