import React, { useState, useMemo, useCallback } from "react"
import cx from "classnames"
import { createViewModel } from "mobx-utils"

import PropTypes from "prop-types"
import FormConfig, { FormConfigContext } from "./FormConfig";
import InputSchema from "./InputSchema";

import FORM_CONFIG_PROP_TYPES from "./FormConfigPropTypes"
import useFormConfig from "./useFormConfig";

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
 * @param setRoot           changes the form root object (type must match!)
 * @param setErrors         changes the form errors
 * @param submit      triggers a Form submit
 * @constructor
 */
export function InternalContext(setRoot, setErrors, submit)
{
    this.setRoot = setRoot;
    this.setErrors = setErrors;
    this.submit = submit;
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

        formConfig.setFormContext(isLocalType ? type.name : type, "", root, errors, new InternalContext(setRoot, setErrors, handleSubmit));

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
                cx(
                    "form"
                )
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
