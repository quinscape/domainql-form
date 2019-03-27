import React, { useState, useMemo, useCallback } from "react"
import cx from "classnames"
import { createViewModel } from "mobx-utils"

import PropTypes from "prop-types"
import FormConfig, { DEFAULT_OPTIONS, FormConfigContext } from "./FormConfig";
import InputSchema from "./InputSchema";

import FORM_CONFIG_PROP_TYPES from "./FormConfigPropTypes"
import useFormConfig from "./useFormConfig";
import FormLayout from "./FormLayout";

import useDebouncedCallback from "use-debounce/lib/callback"

function getSchema(formConfig, props)
{
    const { schema: schemaFromProps } = props;

    const schema = (formConfig && formConfig.schema) || schemaFromProps;

    if (!schema)
    {
        throw new Error("No schema prop given and no FormConfigProvider providing one either");
    }

    return schema;
}


/**
 * Internal context object used between Form and FormConfig
 *
 * @param {Function} setRoot                    changes the form root object (type must match!)
 * @param {Function} setErrors                  changes the form errors
 * @param {Function} submit                     triggers a Form submit
 * @param {Function} debouncedSubmit            debounced submission
 * @param {Function} cancelDebouncedSubmit      cancels any outstanding submissions
 * 
 * @constructor
 */
export function InternalContext(setRoot, setErrors, submit, debouncedSubmit, cancelDebouncedSubmit)
{
    this.setRoot = setRoot;
    this.setErrors = setErrors;
    this.submit = submit;

    this.debouncedSubmit = debouncedSubmit;
    this.cancelDebouncedSubmit = cancelDebouncedSubmit;
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


/**
 * Form description
 */
const Form  = props =>  {

    const parentConfig = useFormConfig();

    const { children, onClick, value, type, onSubmit, options } = props;

    const [ errors, setErrors] = useState([]);
    const [ root, setRoot] = useState( () => createViewModel(value) );

    const isLocalType = typeof type === "object";

    const handleSubmit = useCallback(
        ev => {
            
            ev && ev.preventDefault();

            if (onSubmit)
            {
                onSubmit(formConfig)
            }
            else
            {
                formConfig.root.submit();
            }
        },
        [ root, onSubmit ]
    );

    const submitTimeOut = getOption("submitTimeOut", options, parentConfig && parentConfig.options);

    const [ debouncedSubmit, cancelDebouncedSubmit ] = useDebouncedCallback(
        handleSubmit,
        submitTimeOut,
        [
            handleSubmit,
            submitTimeOut
        ]
    );
    const formConfig = useMemo( () => {

        const schema = getSchema(parentConfig, props);

        let formConfig;
        if (parentConfig)
        {
            formConfig = new FormConfig(
                options ?
                {
                    ... parentConfig.options,
                    ... options
                } : parentConfig.options,
                schema,
                isLocalType ? type : null
            );
        }
        else
        {
            formConfig = new FormConfig(
                options,
                schema,
                isLocalType ? type : null
            );
        }

        formConfig.setFormContext(
            isLocalType ? type.name : type,
            "",
            root,
            errors,
            new InternalContext(
                setRoot,
                setErrors,
                handleSubmit,
                debouncedSubmit,
                cancelDebouncedSubmit
            )
        );

        return formConfig;

    }, [ parentConfig, root, errors, onSubmit, options ]);
    
    //console.log("RENDER FORM", formConfig);


    const handleReset = ev => {


        const { onReset } = props;

        if (onReset)
        {
            onReset(formConfig)
        }
        else
        {
            formConfig.model.reset();
        }

    };

    return (
        <form
            className={
                formConfig.options.layout === FormLayout.INLINE ? "form-inline" : "form"
            }
            onSubmit={ handleSubmit }
            onReset={ handleReset }
            onClick={ onClick }
        >
            <FormConfigContext.Provider value={ formConfig }>
                {
                    typeof children === "function" ? children(formConfig) : children
                }
            </FormConfigContext.Provider>
        </form>
    );
};

Form.propTypes = {
    /**
     * Submit handler to receive the current formConfig with the root observable as-is. If you
     * define an onSubmit handler, you have to execute `formConfig.root.submit()` or `formConfig.root.reset()`
     * yourself.
     *
     * The default behaviour without `onSubmit` property is to submit the root observable.
     */
    onSubmit: PropTypes.func,

    /**
     * Reset handler. If you define an `onReset` handler, you have to execute `formConfig.root.reset()`
     * yourself.
     *
     * The default behaviour without `onReset` property is to reset the root observable.
     */
    onReset: PropTypes.func,

    /**
     * schema to use for this form
     */
    schema: PropTypes.oneOfType([
        PropTypes.instanceOf(InputSchema),
        PropTypes.object
    ]),

    /**
     * form base type (Schema type name or runtime created type structure)
     */
    type: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object
    ]).isRequired,

    /**
     * initial value (typed GraphQL object)
     */
    value: PropTypes.any.isRequired,

    /**
     * High-level validation configuration object
     */
    validation: PropTypes.object,

    /**
     * Optional onClick handler for the form element.
     */
    onClick: PropTypes.func,

    /**
     * Form options. Options here overwrite options inherited from a FormConfigProvider
     */
    options: PropTypes.shape(FORM_CONFIG_PROP_TYPES)
};

export default Form
