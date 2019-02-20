import React, { useState, useMemo, useCallback } from "react"
import cx from "classnames"
import { createViewModel } from "mobx-utils"

import PropTypes from "prop-types"
import FormConfig, { FormConfigContext } from "./FormConfig";
import InputSchema from "./InputSchema";

import FORM_CONFIG_PROP_TYPES from "./FormConfigPropTypes"
import useFormConfig from "./useFormConfig";
import { extractFormPropValues } from "./FormConfigProvider";

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
 * @param handleSubmit      triggers a Form submit
 * @constructor
 */
export function InternalContext(setRoot, setErrors, handleSubmit)
{
    this.setRoot = setRoot;
    this.setErrors = setErrors;
    this.handleSubmit = handleSubmit;
}


/**
 * Form description
 */
const Form  = props =>  {

    const parentConfig = useFormConfig();

    const { children, onClick, value, type, onSubmit } = props;

    const [ errors, setErrors] = useState([]);
    const [ root, setRoot] = useState( () => createViewModel(value) );


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

    let didRecreate = true;
    const formConfig = useMemo( () => {

        const schema = getSchema(parentConfig, props);

        didRecreate = false;

        let formConfig;
        if (parentConfig)
        {
            formConfig = new FormConfig(
                FormConfig.mergeOptions(
                    parentConfig.options,
                    props
                ),
                schema
            );
        }
        else
        {
            formConfig = new FormConfig(
                props,
                schema
            );
        }

        formConfig.setFormContext(type, "", root, errors, new InternalContext(setRoot, setErrors, handleSubmit));

        return formConfig;

    }, [parentConfig, root, errors, onSubmit, ... extractFormPropValues(props)]);
    
    //console.log("RENDER FORM", formConfig);


    const handleReset = ev => {

        ev.preventDefault();

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
     * Submit handler handling the final typed GraphQL result
     */
    onSubmit: PropTypes.func,

    /**
     * schema to use for this form
     */
    schema: PropTypes.oneOfType([
        PropTypes.instanceOf(InputSchema),
        PropTypes.object
    ]),

    /**
     * form base type
     */
    type: PropTypes.string.isRequired,

    /**
     * initial value (typed GraphQL object)
     */
    value: PropTypes.any.isRequired,

    /**
     * true if the initial value is valid
     */
    isInitialValid: PropTypes.bool,

    /**
     * Optional function to provide the initialValues for Formik without converting them from the typed GraphQL object.
     * Might also be invalid (See isInitialValid)
     */
    initialValues: PropTypes.func,

    /**
     * High-level validation configuration object
     */
    validation: PropTypes.object,

    /**
     * Optional onClick handler for the form element.
     */
    onClick: PropTypes.func,

    ... FORM_CONFIG_PROP_TYPES

};

export default Form
