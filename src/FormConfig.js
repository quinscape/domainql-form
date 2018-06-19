import React from "react"
import InputSchema from "./InputSchema";
import FieldMode from "./FieldMode";
import GlobalConfig from "./GlobalConfig";
import keys from "./util/keys";

export const DEFAULT_OPTIONS = {
    horizontal: true,
    labelColumnClass: "col-md-5",
    wrapperColumnClass: "col-md-7",
    mode: FieldMode.NORMAL,
    currency: "EUR",
    currencyAddonRight: true,
    lookupLabel: GlobalConfig.lookupLabel
};

import FORM_CONFIG_PROP_TYPES from "./FormConfigPropTypes"

const FORM_OPTION_NAMES = keys(FORM_CONFIG_PROP_TYPES);

const context = React.createContext(null);

/**
 * Encapsulates the complete configuration of a form field and is provided via React Context.
 *
 * This config is provided by <Form/>, <FormBlock/> and partially by <FormConfigProvider/>.
 *
 * <FormConfigProvider/> can provide defaults for configuration options and schema but does not actually define the
 * actual form context parts. Only the <Form/> component provides the form context parts which include the formikProps
 * object.
 *
 * <FormBlock/> can override configuration options.
 *
 * See FORM_CONFIG_PROPTYPES for a description of overridable options.
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

        // clear form context
        this.setFormContext("", "", null);
    }

    /**
     * Sets the form context part of the current form config
     *
     * @param {String} type         Name of the form base input type
     * @param {String} basePath     current base path within the form
     * @param {Object} formikProps  formik context object
     */
    setFormContext(type, basePath, formikProps)
    {
        this.type = type;
        this.basePath = basePath;
        this.formikProps = formikProps;
    }
    
    getPath(name)
    {
        const nameIsDot = name === ".";
        const { basePath } = this;
        if (basePath)
        {
            return nameIsDot ? basePath : basePath + "." + name;
        }
        else
        {
            if (nameIsDot)
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
                this.formikProps !== other.formikProps ||   // <- most common reason for inequality
                this.schema !== other.schema ||
                this.type !== other.type ||
                this.basePath !== other.basePath
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

    /**
     * Internal React Consumer for FormConfig
     * @type {ReactElement}
     */
    static Consumer = context.Consumer;

    /**
     * Internal React Provider for FormConfig. Users should use <FormConfigProvider/>, not <FormConfig.Provider/>
     * @type {ReactElement}
     */
    static Provider = context.Provider;
}

export default FormConfig
