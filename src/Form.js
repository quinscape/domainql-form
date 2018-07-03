import React from "react"
import cx from "classnames"
import assign from "object-assign"

import { Formik } from "formik"

import PropTypes from "prop-types"
import FormConfig from "./FormConfig";
import InputSchema from "./InputSchema";

import FORM_CONFIG_PROP_TYPES from "./FormConfigPropTypes"

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
 * "Inner" form component.
 *
 * Indirection created to have the two coalesced contexts as props.
 *
 */
class InnerForm extends React.Component {

    static getDerivedStateFromProps(nextProps, prevState)
    {
        const { type, formikProps, formConfig: parentConfig } = nextProps;

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
        formConfig.setFormContext(type, "", formikProps);

        // did the form config actually change since last time?
        if (prevState.formConfig && prevState.formConfig.equals(formConfig))
        {
            // no -> no update

            //console.log("NO UPDATE");

            return null;
        }

        //console.log("NEW formConfig", formConfig, parentConfig);

        // update form config in local state
        return {
            formConfig
        };
    }

    state = {
        formConfig: null
    };

    // called from outer form
    // noinspection JSUnusedGlobalSymbols
    onSubmit = (values, actions) => {

        const { formConfig } = this.state;

        const { schema, type, formikProps : { status } } = formConfig;


        const converted = schema.fromValues( type, values);

        if ( status)
        {
            actions = {
                ... actions,
                status
            };
        }

        try
        {
            return this.props.onSubmit(converted, actions);
        }
        catch(e)
        {
            console.error("Error in onSubmit", e);
        }
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
            return assign({}, errors, localErrors);
        }
        return errors;
    };

    handleButtonStatus = ev => {

        const { target } = ev;

        const { onClick } = this.props;

        //console.log("Form onClick, target =", target);

        if (
            (
                target.tagName === "BUTTON" ||
                target.tagName === "INPUT"
            ) &&
            target.getAttribute("type") === "submit"
        )
        {
            const name = target.getAttribute("name");
            {
                if (name)
                {
                    const { formConfig } = this.state;
                    const { formikProps } = formConfig;

                    const { status } = formikProps;

                    if (!status || status.button !== name )
                    {
                        formikProps.setStatus({
                            ... status,
                            button: name
                        })
                    }
                }
            }
        }

        if (typeof onClick === "function")
        {
            onClick(ev);
        }
    };

    render()
    {
        const { children, onClick } = this.props;

        const { formConfig } = this.state;
        const { formikProps } = formConfig;

        return (
            <form
                className={
                    cx(
                        "form",
                        formikProps.submitCount > 0 && "was-validated"
                    )
                }
                onSubmit={ formikProps.handleSubmit }
                onReset={ formikProps.handleReset }
                onClick={ formConfig.options.buttonStatus ? this.handleButtonStatus : onClick }
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

/**
 * Form description
 */
class Form extends React.Component {


    static propTypes = {
        /**
         * Submit handler handling the final typed GraphQL result
         */
        onSubmit: PropTypes.func.isRequired,

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

    static defaultProps = {
        // whether the initial state of the form is considered valid (passed to formik)
        isInitialValid: true
    };


    componentDidMount()
    {
        this._component.getFormikBag().validateForm();
    }

    onSubmit = (values, actions) => this._innerForm.onSubmit(values, actions);
    validate = (values) => this._innerForm.validate(values);

    registerFormikComponent = c => this._component = c;
    registerInnerForm = c => this._innerForm = c;

    render()
    {
        const {value, type, initialValues, isInitialValid, children } = this.props;

        return (
            <FormConfig.Consumer>
                {
                    formConfig => {

                        const schema = getSchema(formConfig , this.props);

                        const initial = initialValues != null ? initialValues() : schema.toValues(type, value);
                        //console.log("RENDER OUTER", formConfig, initial);

                        return (
                            <Formik
                                ref={ this.registerFormikComponent }
                                isInitialValid={ isInitialValid }
                                initialValues={ initial }
                                validate={ this.validate }
                                onSubmit={ this.onSubmit }
                                render={
                                    formikProps => (
                                        <InnerForm
                                            { ... this.props }
                                            ref={ this.registerInnerForm }
                                            formConfig={ formConfig }
                                            formikProps={ formikProps }
                                        >
                                            {
                                                children
                                            }
                                        </InnerForm>
                                    )
                                }
                            />
                        );
                    }
                }
            </FormConfig.Consumer>
        );
    }
}

/**
 * Globally change the currency  default
 *
 * @param currency              currency symbol
 * @param currencyAddonRight    displayed on the right?
 */
// export function setCurrencyDefaults(currency, currencyAddonRight)
// {
//     GQLForm.defaultProps.currency = currency;
//     GQLForm.defaultProps.currencyAddonRight = currencyAddonRight;
// }

export default Form
