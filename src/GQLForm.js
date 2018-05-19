import React from "react"
import cx from "classnames"
import assign from "object-assign"

import { Formik} from "formik"

import InputSchema from "./InputSchema"
import FieldMode from "./FieldMode"

import PropTypes from "prop-types"
import keys from "./util/keys";
import FormConfig from "./FormConfig";

export const GQLFormContext = React.createContext(null);

/**
 * @typedef {Object} GQLFormOptions
 * 
 * @property {bool} opts.horizontal            if true, place label and input next to each other instead of the label on top of the input
 * @property {bool} opts.labelColumnClass      bootstrap column class for the label column (only if horizontal)
 * @property {bool} opts.wrapperColumnClass    bootstrap column class for the wrapper column (only if horizontal)
 * @property {String} opts.currency            Currency to display
 * @property {bool} opts.currencyAddonRight    Whether to put the addon for the currency onto the right side
 *
 */

/**
 * FormContext object
 *
 * @param {InputSchema} inputSchema         input schema
 * @param {string} type                     base type for the form
 * @param {string} type                     base type for the form
 * @param {FieldMode} mode                  default field mode if not defined on field
 * @param {GQLFormOptions} options          options
 * @constructor
 */
export function FormContext(inputSchema, type, mode, options)
{
    this.inputSchema = inputSchema;
    this.type = type;
    this.mode = mode;
    this.options = options;
}


FormContext.prototype.getPath = function (name) {
    const { basePath } = this.options;
    if (basePath)
    {
        return name !== "." ? basePath + "." + name : basePath;
    }
    else
    {
        return name;
    }
}

export const FORM_OPTIONS = {
    horizontal: PropTypes.bool,
    labelColumnClass: PropTypes.string,
    wrapperColumnClass: PropTypes.string,
    currency: PropTypes.string,
    currencyAddonRight: PropTypes.bool,
    lookupLabel: PropTypes.func,

    ////////// INTERNAL PROPS ////////// 

    // current base path within the formik values. Will be set e.g. for lists
    basePath: PropTypes.string
};

/**
 *
 * @param options
 * @param props
 */
export function mergeOptions(options, props)
{
    const optionNames = keys(FORM_OPTIONS);

    const merged = {};

    for (let i = 0; i < optionNames.length; i++)
    {
        const name = optionNames[i];

        const pValue = props[name];
        merged[name] = pValue !== undefined ? pValue : options[name];
    }

    return merged;
}


class GQLForm extends React.Component {

    static getDerivedStateFromProps(nextProps, prevState)
    {

        const { inputSchema, type, mode } = nextProps;

        return {
            formContext: new FormContext(
                inputSchema,
                type,
                mode,
                mergeOptions(
                    GQLForm.defaultProps,
                    nextProps
                )
            )
        }
    }

    static propTypes = {
        inputSchema: PropTypes.instanceOf(InputSchema).isRequired,
        type: PropTypes.string.isRequired,
        value: PropTypes.any.isRequired,
        isInitialValid: PropTypes.bool,
        onSubmit: PropTypes.func.isRequired,
        // optional initialValues provider
        initialValues: PropTypes.func,
        // optional local validate function
        validate: PropTypes.func,

        lookupLabel: PropTypes.func,

        // overridable in GQLBlock
        mode: PropTypes.oneOf(FieldMode.values()),
        ... FORM_OPTIONS
    };

    static defaultProps = {
        // whether the initial state of the form is considered valid (passed to formik)
        isInitialValid: true,

        // form settings overridable with form-block
        horizontal: true,
        labelColumnClass: "col-md-5",
        wrapperColumnClass: "col-md-7",
        mode: FieldMode.NORMAL,
        currency: "EUR",
        basePath: "",
        currencyAddonRight: true,
        lookupLabel: FormConfig.lookupLabel
    };

    constructor(props, context)
    {
        super(props, context);

        this.state = GQLForm.getDerivedStateFromProps(props);
    }

    onSubmit = (values, actions) => {

        //console.log("GQLForm onSubmit", values);

        const { inputSchema, type } = this.props;

        if (!inputSchema)
        {
            throw new Error("No input schema given via props or context");
        }

        const converted = inputSchema.fromValues(type, values);

        try
        {
            return this.props.onSubmit(converted, actions);
        }
        catch(e)
        {
            console.error("Error in onSubmit", e);
        }
    };

    validate = (values) => {

        const { inputSchema, type, validate } = this.props;

        const errors = inputSchema.validate(type, values);

        if (validate)
        {
            const localErrors = validate(values);
            assign(errors, localErrors);
        }
        return errors;
    };

    componentDidMount()
    {
        this._component.getFormikBag().validateForm();
    }

    render()
    {
        const {value, inputSchema, type, initialValues, isInitialValid } = this.props;

        const initial = initialValues != null ? initialValues() : inputSchema.toValues(type, value);
        
        return (
            <GQLFormContext.Provider value={ this.state.formContext }>
                <Formik
                    ref={ c => this._component = c }
                    isInitialValid={ isInitialValid }
                    initialValues={ initial }
                    validate={ this.validate }
                    onSubmit={ this.onSubmit }
                    render={ this.renderForm }
                />
            </GQLFormContext.Provider>
        )
    }

    /**
     * Renders the actual form element based on the current formik props passed to us by the Formik component.
     *
     * Needs to be bound because we pass it for Formik and we don't want to recreate the arrow function every time.
     *
     * @param formikProps
     * @returns {ReactElement}
     */
    renderForm = formikProps => {
        const { children } = this.props;

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
            >
                {
                    typeof children === "function" ? children(formikProps) : children
                }
            </form>
        );
    };
}

/**
 * Globally change the currency  default
 *
 * @param currency              currency symbol
 * @param currencyAddonRight    displayed on the right?
 */
export function setCurrencyDefaults(currency, currencyAddonRight)
{
    GQLForm.defaultProps.currency = currency;
    GQLForm.defaultProps.currencyAddonRight = currencyAddonRight;
}

export default GQLForm
