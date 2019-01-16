import React from "react"
import InputSchema from "./InputSchema";
import FieldMode from "./FieldMode";
import GlobalConfig from "./GlobalConfig";
import keys from "./util/keys";

import get from "lodash.get"
import set from "lodash.set"

import { action } from "mobx"

export const DEFAULT_OPTIONS = {
    horizontal: true,
    labelColumnClass: "col-md-5",
    wrapperColumnClass: "col-md-7",
    useReadOnlyAttribute: false,
    mode: FieldMode.NORMAL,
    currency: "EUR",
    currencyAddonRight: true,
    lookupLabel: GlobalConfig.lookupLabel,
    validation: null
};

import FORM_CONFIG_PROP_TYPES from "./FormConfigPropTypes"
import unwrapType from "./util/unwrapType";

const FORM_OPTION_NAMES = keys(FORM_CONFIG_PROP_TYPES);

const context = React.createContext(null);

const EMPTY = [];

/**
 @typedef Error
 @type {object}
 @property {string} path                    name/path
 @property {Array<String>} errorMessages    error messages, first value is original user-provided value
 */

/**
 * Finds the error with the given path
 *
 * @param {Array<Error>} errors     errors
 * @param {String} path             name/path
 * @return {number} index of the error
 */
function findError(errors, path)
{
    for (let i = 0; i < errors.length; i++)
    {
        const error = errors[i];
        if (error.path === path)
        {
            return i;
        }
    }
    return -1;
}

const setFormValueAction = action(
    "Set Form-Value",
    (root, name, value) => {
        set(root,name,value);
    }
);


/**
 * Encapsulates the complete configuration of a form field and is provided via React Context.
 *
 * This config is provided by <Form/>, <FormBlock/> and partially by <FormConfigProvider/>.
 *
 * <FormConfigProvider/> can provide defaults for configuration options and schema but does not actually define the
 * actual form context parts. Only the <Form/> component provides the full form context.
 *
 * <FormBlock/> can override configuration options.
 *
 * See FORM_CONFIG_PROP_TYPES for a description of overridable options.
 *
 */
class FormConfig
{
    /**
     *
     * @param {Object} opts                     form config options
     * @param {InputSchema|Object} [schema]     Schema (raw data or InputSchema instance)
     */
    constructor(opts, schema = null)
    {
        if (schema instanceof InputSchema)
        {
            this.schema = schema;
        }
        else
        {
            this.schema = schema && new InputSchema(schema);
        }

        this.options = FormConfig.mergeOptions(DEFAULT_OPTIONS, opts);

        this.button = "";

        // clear form context
        this.setFormContext();
    }


    /**
     * Sets the form context part of the current form config
     *
     * @param {String} [type]               name of the form base input type
     * @param {String} [basePath]           current base path within the form
     * @param {object} [value]              mobx input model
     * @param {function} [formInstance]     Form component instance
     */
    setFormContext(type = "", basePath = "", value = null, formInstance = null)
    {
        //console.log("setFormContext", { type, basePath, value, formInstance} );

        this.type = type;
        this.basePath = basePath;
        this.root = value;
        this.formInstance = formInstance ;

        this.errors = [];
    }

    copy()
    {
        const copy = new FormConfig(this.options, this.schema);
        copy.setFormContext(this.type, this.basePath, this.root);
        copy.button = this.button;
        copy.errors = this.errors;
        copy.root = this.root;
        copy.formInstance = this.formInstance;
        return copy;
    }
    
    getPath(name)
    {
        const isDot = name === ".";
        const { basePath } = this;
        if (basePath)
        {
            return isDot ? basePath : basePath + "." + name;
        }
        else
        {
            if (isDot)
            {
                throw new Error("'.' is only a valid name with a non-empty base-path (e.g. inside a FormList)");
            }
            return name;
        }
    }

    /**
     * Merges two option objects and returns a new merged options object. The returned object will be filtered so
     * that it only contains option keys defined in FORM_PROPTYPES.
     *
     * @param a     options A
     * @param b     options B
     */
    static mergeOptions(a,b)
    {
        if (!b)
        {
            return a;
        }

        const newOptions = { };

        const len = FORM_OPTION_NAMES.length;
        for (let i = 0; i < len; i++)
        {
            const name = FORM_OPTION_NAMES[i];
            let value = b[name];
            newOptions[name] = value !== undefined ? value : a[name];
        }
        return newOptions;
    }
    
    /**
     * Compares this form config to another form config
     *
     * @param {FormConfig} other     other config
     *
     * @return {boolean} true if both configs are equal
     */
    equals(other)
    {
        if (other instanceof FormConfig)
        {
            if (
                this.schema !== other.schema ||
                this.type !== other.type ||
                this.basePath !== other.basePath ||
                this.errors !== other.errors ||
                this.root !== other.root
            )
            {
                return false;
            }

            const { options } = this;
            const { options: otherOptions } = other;


            const len = FORM_OPTION_NAMES.length;
            for (let i = 0; i < len; i++)
            {
                const name = FORM_OPTION_NAMES[i];
                if (options[name] !== otherOptions[name])
                {
                    return false;
                }
            }
            return true;
        }
        return false;               
    }

    getErrors(path)
    {
        const { errors } = this;

        for (let i = 0; i < errors.length; i++)
        {
            const error = errors[i];
            if (error.path === path)
            {
                return error.errorMessages;
            }
        }

        return EMPTY;
    }

    listAllErrors()
    {

        const { errors } = this;
        const { length } = errors;

        const out = new Array(length);
        for (let i = 0; i < length; i++)
        {
            out[i] = errors[i];
        }
        return out;
    }

    hasErrors()
    {
        return this.errors.length > 0;
    }


    /**
     * Returns the current form value for the given path, returning the original user-provided value in case of a
     * field with error.
     *
     * @param {String} path     name/path
     * @param {Array<Error>} errorMessages
     * @return {*}
     */
    getValue(path, errorMessages = this.getErrors(path))
    {
        if (errorMessages.length > 0)
        {
            return errorMessages[0];
        }
        else
        {
            const value = get(this.root, path);
            //console.log("getValue", this.root, path, " = ", value);
            return value;
        }
    }

    handleChange(fieldContext, value)
    {
        try
        {
            const { fieldType, qualifiedName } = fieldContext;

//            console.log("handleChange", { fieldType, name, value});

            const unwrapped = unwrapType(fieldType);

            // COLLECT
            let errorsForField;

            const isScalar = unwrapped.kind === "SCALAR";
            const error = isScalar ? InputSchema.validate(unwrapped.name, value) : null;
            let converted;
            if (error)
            {
                errorsForField = [ value, error ];
            }
            else
            {
                const { validation } = this.options;

                if (validation && validation.validateField)
                {
                    const highLevelResult = validation.validateField(fieldContext, value);

                    if (highLevelResult)
                    {
                        if (Array.isArray(highLevelResult))
                        {
                            errorsForField = [value, ... highLevelResult];
                        }
                        else
                        {
                            errorsForField = [ value, highLevelResult ];
                        }
                    }
                }

                if (!errorsForField)
                {
                    converted = isScalar ? InputSchema.valueToScalar(unwrapped.name, value) : value;
                }
            }

            // UPDATE

            const { errors : currentErrors } = this;

            let changedErrors;
            const index =  findError(currentErrors, qualifiedName);
            if (index < 0)
            {
                if (errorsForField)
                {
                    // ADD ERRORS
                    changedErrors = currentErrors.concat({
                        path: qualifiedName,
                        errorMessages: errorsForField
                    });
                }
            }
            else
            {
                if (errorsForField)
                {
                    // UPDATE ERRORS
                    changedErrors = currentErrors.slice();
                    changedErrors[index] = {
                        path: qualifiedName,
                        errorMessages: errorsForField
                    }
                }
                else
                {
                    // REMOVE ERRORS
                    changedErrors = currentErrors.slice();
                    changedErrors.splice(index, 1);
                }
            }


            if (!errorsForField)
            {
                //console.log("SET FIELD VALUE", this.root, name, converted);

                setFormValueAction(this.root, qualifiedName, converted);
            }

            if (changedErrors)
            {
                //console.log("CHANGED ERRORS", changedErrors);

                const newFormConfig = this.copy();
                newFormConfig.errors = changedErrors;

                this.formInstance.setState({
                    formConfig: newFormConfig
                })
            }
        }
        catch(e)
        {
            console.error("HANDLE-CHANGE ERROR", e);
        }

    };

    handleBlur = (fieldContext, value) => {
        try
        {
            //console.log("BLUR", fieldContext, value)
        }
        catch(e)
        {
            console.error("HANDLE-BLUR ERROR", e);
        }
    };

    /**
     * Internal React Consumer for FormConfig
     * @type {React.Element}
     */
    static Consumer = context.Consumer;

    /**
     * Internal React Provider for FormConfig. Users should use <FormConfigProvider/>, not <FormConfig.Provider/>
     * @type {React.Element}
     */
    static Provider = context.Provider;
}

export default FormConfig
