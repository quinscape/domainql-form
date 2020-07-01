import React, { useCallback, useMemo, useState } from "react"

import PropTypes from "prop-types"
import FormConfig, { DEFAULT_OPTIONS, FormConfigContext } from "./FormConfig";
import InputSchema from "./InputSchema";

import FORM_CONFIG_PROP_TYPES from "./FormConfigPropTypes"
import useFormConfig from "./useFormConfig";
import FormLayout from "./FormLayout";

import { useDebouncedCallback } from "use-debounce"
import { fallbackJSClone } from "./util/clone";
import { useObserver } from "mobx-react-lite";


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
 * @param {Function} submit                     triggers a Form submit
 * @param {Function} debouncedSubmit            debounced submission
 * @param {Function} cancelDebouncedSubmit      cancels any outstanding submissions
 * 
 * @constructor
 */
export function InternalContext(setRoot, submit, debouncedSubmit, cancelDebouncedSubmit)
{
    this.setRoot = setRoot;
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


function cloneRoot(schema, value, options, parentConfig)
{
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


/**
 * Form description
 */
const Form  = props =>  {

    const parentConfig = useFormConfig();

    const { children, onClick, value, type, onSubmit, errorStorage, options } = props;

    const schema = getSchema(parentConfig, props);
    const [ root, setRoot] = useState( () => cloneRoot(schema, value, options, parentConfig) );

    const handleSubmit = useCallback(
        ev => {
            
            ev && ev.preventDefault();

            if (onSubmit)
            {
                onSubmit(formConfig)
            }
        },
        [ root, onSubmit ]
    );

    const submitTimeOut = getOption("submitTimeOut", options, parentConfig && parentConfig.options);

    const [ debouncedSubmit, cancelDebouncedSubmit ] = useDebouncedCallback(
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
                schema,
                errorStorage || parentConfig.errorStorage
            );
        }
        else
        {
            formConfig = new FormConfig(
                options,
                schema,
            errorStorage
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
                cancelDebouncedSubmit
            )
        );

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
                    cancelDebouncedSubmit
                )
            );
        }
    };

    return (
        <form
            className={
                formConfig.options.layout === FormLayout.INLINE ? "form-inline" : "form"
            }
            onSubmit={ handleSubmit }
            onReset={ handleReset }
            onClick={ onClick || null }
        >
            <FormConfigContext.Provider value={ formConfig }>
                {
                    useObserver(() => typeof children === "function" ? children(formConfig) : children)
                }
            </FormConfigContext.Provider>
        </form>
    );
};

Form.propTypes = {
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
     * schema to use for this form
     */
    schema: PropTypes.oneOfType([
        PropTypes.instanceOf(InputSchema),
        PropTypes.object
    ]),

    /**
     * form base type. If it is not defined, a type prop must be given on all Fields.
     */
    type: PropTypes.string,

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
