import React from "react"
import InputSchema from "./InputSchema";
import FieldMode from "./FieldMode";
import GlobalConfig from "./GlobalConfig";
import set from "lodash.set"

import { action, makeObservable } from "mobx"
import unwrapType from "./util/unwrapType";
import { NON_NULL } from "./kind";
import FormLayout from "./FormLayout";
import FormContext from "./FormContext";


export const DEFAULT_OPTIONS = {
    layout: FormLayout.DEFAULT,
    labelColumnClass: "col-md-5",
    wrapperColumnClass: "col-md-7",
    mode: FieldMode.NORMAL,
    currency: "EUR",
    currencyAddonRight: true,
    lookupLabel: GlobalConfig.lookupLabel,
    autoSubmit: false,
    submitTimeOut: 350,
    suppressLabels: false,
    isolation: false,
    revalidate: true
};

const EMPTY = [];

/**
 * React context for the current FormConfig object
 * @type {React.Context<FormConfig>}
 */
export const FormConfigContext = React.createContext(null);

/**
 @typedef FormError
 @type {object}
 @property {string} path                    name/path
 @property {Array<String>} errorMessages    error messages, first value is original user-provided value
 */

function validateOptions(options)
{
    if (options.validation)
    {
        throw new Error("Configuring validation via form config is deprecated create a new form context with your validation and call .useAsDefault()");
    }
    return options;
}


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
     * @param {FormContext} formContext         form context to use for this 
     */
    constructor(opts, formContext)
    {
        this.options = validateOptions({
            ... DEFAULT_OPTIONS,
            ... opts
        });

        this.formContext = formContext;


        // clear form context
        this.setFormContext();

        //console.log("NEW FormConfig", this)

        makeObservable(this);
    }

    get schema()
    {
        const { schema } = this.formContext;


        return schema;
    }

    /**
     * Sets the form context part of the current form config
     *
     * @param {String} [type]                   name of the form base input type
     * @param {String} [basePath]               current base path within the form
     * @param {object} [root]                   mobx input model
     * @param {InternalContext} [internal]      internal context object (see Form.js)
     */
    setFormContext(type = "", basePath = "", root = null, internal)
    {
        //console.log("setFormContext", { type, basePath, root, internal} );

        this.type = type;
        this.basePath = basePath;
        this.root = root;
        this.ctx = internal;
    }

    copy()
    {
        const copy = new FormConfig(this.options, this.formContext);
        copy.setFormContext(this.type, this.basePath, this.root, this.ctx);
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

    getErrors(path)
    {
        const { root, formContext } = this;

        return formContext ? formContext.findError( root, path) : EMPTY;
    }

    addError(path, msg, value)
    {
        const { root, formContext } = this;

        if (!formContext)
        {
            throw new Error("No form context initialized")
        }

        formContext.addError(root, path, msg, value);
    }

    removeErrors(path)
    {
        const { root, formContext } = this;

        if (!formContext)
        {
            throw new Error("No form context initialized")
        }

        formContext.removeErrors(root, path);

    }

    listAllErrors()
    {
        const { formContext } = this;

        return [ ... formContext.getErrors()];
    }

    hasErrors()
    {
        const { formContext } = this;
        return formContext.getErrors().length > 0;
    }

    handleChange(fieldContext, value)
    {
        try
        {
            const { fieldType } = fieldContext;

//            console.log("handleChange", { fieldType, name, value});

            const unwrapped = unwrapType(fieldType);

            // COLLECT
            let errorsForField = [ value ];

            const isScalar = unwrapped.kind === "SCALAR";
            const error = isScalar ? InputSchema.validate(unwrapped.name, value, fieldContext) : null;
            let converted;

            // type error?
            if (error)
            {
                // yes -> we stop validation here and report that error
                errorsForField.push(error);
            }
            else
            {
                // handle NON_NULL fields
                if (fieldType.kind === NON_NULL && value === "")
                {
                    errorsForField.push(this.formContext.getRequiredErrorMessage(fieldContext));
                }

                const highLevelResult = this.formContext.validate(fieldContext,value)

                if (highLevelResult)
                {
                    if (Array.isArray(highLevelResult))
                    {
                        errorsForField = errorsForField.concat(highLevelResult);
                    }
                    else
                    {
                        errorsForField.push(highLevelResult);
                    }
                }
            }

            // errors contains more than just our value
            const haveErrors = errorsForField.length > 1;
            if (!haveErrors)
            {
                converted = isScalar ? InputSchema.valueToScalar(unwrapped.name, value, fieldContext) : value;
            }

            // UPDATE
            this.updateFromChange(fieldContext, converted, errorsForField);

            if (!haveErrors)
            {
                const { fieldChangeHandler } = fieldContext;
                if (fieldChangeHandler)
                {
                    fieldChangeHandler(fieldContext, converted);
                }
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

    @action
    updateFromChange(fieldContext, converted, errorsForField)
    {
        //console.log("updateFromChange", path, converted, errorsForField)

        const { root, formContext } = this;
        const { path, qualifiedName } = fieldContext;

        formContext.updateErrors(root, qualifiedName, errorsForField);

        if (errorsForField.length < 2)
        {
            set(root, path, converted);

            if (this.options.autoSubmit)
            {
                this.ctx.debouncedSubmit();
            }
        }
    }

    getMode()
    {
        const { root } = this;
        const { mode } = this.options;
        
        if (!root && mode === FieldMode.NORMAL)
        {
            return FieldMode.DISABLED;
        }
        else
        {
            return mode;
        }
    }
}

export default FormConfig
