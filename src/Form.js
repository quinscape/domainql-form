import React from "react"
import cx from "classnames"
import { createViewModel } from "mobx-utils"

import PropTypes from "prop-types"
import FormConfig from "./FormConfig";
import InputSchema from "./InputSchema";

import FORM_CONFIG_PROP_TYPES from "./FormConfigPropTypes"
import withFormConfig from "./withFormConfig";

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
 * Form description
 */
class Form extends React.Component {


    static propTypes = {
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
         * Optional validate function. Note that the values object received here is *not* typed, i.e. it contains the
         * raw formik string/boolean values. If you need all values to be converted to a typed GraphQL object, you
         * need to invoke InputSchema.fromValues(type, values) manually on the received values object.
         */
        validate: PropTypes.func,

        /**
         * Optional onClick handler for the form element.
         */
        onClick: PropTypes.func,

        ... FORM_CONFIG_PROP_TYPES
        
    };

    handleSubmit = ev => {

        ev && ev.preventDefault();

        const { onSubmit } = this.props;
        const { formConfig } = this.state;

        if (onSubmit)
        {
            onSubmit(formConfig)
        }
        else
        {
            formConfig.root.submit();
        }
    };

    handleReset = ev => {

        ev.preventDefault();

        const { onReset } = this.props;
        const { formConfig } = this.state;


        if (onReset)
        {
            onReset(formConfig)
        }
        else
        {
            formConfig.model.reset();
        }

    };

    static getDerivedStateFromProps(nextProps, prevState)
    {
//        console.log("getDerivedStateFromProps", nextProps, prevState);

        const { value, type, formConfig: parentConfig } = nextProps;

        const schema = getSchema(parentConfig, nextProps);

        let formConfig;
        if (parentConfig)
        {
            formConfig = new FormConfig(
                FormConfig.mergeOptions(
                    parentConfig.options,
                    nextProps
                ),
                schema
            );
        }
        else
        {
            formConfig = new FormConfig(
                nextProps,
                schema
            );
        }

        // did the form config actually change since last time?
        if (prevState.formConfig && prevState.formConfig.equals(formConfig))
        {
            // no -> no update

            //console.log("NO UPDATE");

            return null;
        }

        //console.log("NEW formConfig", formConfig, parentConfig, value);

        const viewModel = prevState.formConfig ? prevState.formConfig.root : createViewModel(value);

        formConfig.setFormContext(type, "", viewModel, prevState.instance);
        if (prevState.formConfig)
        {
            formConfig.errors = prevState.formConfig.errors;
        }

        // update form config in local state
        return {
            formConfig
        };
    }

    state = {
        instance: this,
        formConfig: null
    };

    // called from outer form
    // noinspection JSUnusedGlobalSymbols
    validate = (values) => {

        const { formConfig } = this.state;

        const { validate } = this.props;

        const { schema, type } = formConfig;

        const errors = schema.validate( type, values);

        if (validate)
        {
            const localErrors = validate(values);
            return Object.assign({}, errors, localErrors);
        }
        return errors;
    };


    render()
    {
        const { children, onClick } = this.props;

        const { formConfig } = this.state;

//        console.log("RENDER FORM", formConfig);

        return (
            <form
                className={
                    cx(
                        "form",
                        false && "was-validated"
                    )
                }
                onSubmit={ this.handleSubmit }
                onReset={ this.handleReset }
                onClick={ onClick }
            >
                <FormConfig.Provider value={ formConfig }>
                    {
                        typeof children === "function" ? children(formConfig) : children
                    }
                </FormConfig.Provider>
            </form>
        );
    }
}

export default withFormConfig(Form)
