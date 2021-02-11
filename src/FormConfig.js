import React from "react"
import InputSchema from "./InputSchema";
import FieldMode from "./FieldMode";
import GlobalConfig from "./GlobalConfig";
import set from "lodash.set"

import { action } from "mobx"
import unwrapType from "./util/unwrapType";
import { NON_NULL } from "./kind";
import FormLayout from "./FormLayout";


export const DEFAULT_OPTIONS = {
    layout: FormLayout.DEFAULT,
    labelColumnClass: "col-md-5",
    wrapperColumnClass: "col-md-7",
    mode: FieldMode.NORMAL,
    currency: "EUR",
    currencyAddonRight: true,
    lookupLabel: GlobalConfig.lookupLabel,
    validation: null,
    autoSubmit: false,
    submitTimeOut: 350,
    suppressLabels: false,
    isolation: false,
    revalidate: true
};

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
     * @param {FormContext} formContext       optional error storage to use. Default is using a lazily initialized static storage.
     */
    constructor(opts, schema = null, formContext)
    {

        if (schema instanceof InputSchema)
        {
            this.schema = schema;
        }
        else
        {
            this.schema = schema && new InputSchema(schema);
        }

        this.options = {
            ... DEFAULT_OPTIONS,
            ... opts
        };

        this.formContext = formContext;

        // clear form context
        this.setFormContext();

        //console.log("NEW FormConfig", this)
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
        const copy = new FormConfig(this.options, this.schema, this.formContext);
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

        return formContext.findError( root, path);
    }

    addError(path, msg, value)
    {
        const { root, formContext } = this;
        formContext.addError(root, path, msg, value);
    }

    removeErrors(path)
    {
        const { root, formContext } = this;
        formContext.removeErrors(root, path);

    }

    listAllErrors()
    {
        const { root, formContext } = this;
        return [ ... formContext.getErrors()];
    }

    hasErrors()
    {
        const { root, formContext } = this;
        return formContext.getErrors().length > 0;
    }

    handleChange(fieldContext, value)
    {
        try
        {
            const { fieldType, qualifiedName } = fieldContext;

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
                    errorsForField.push(this.getRequiredErrorMessage(fieldContext));
                }

                const { validation } = this.options;
                if (validation && validation.validateField)
                {
                    const highLevelResult = validation.validateField(fieldContext, value);

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

            }

            // errors contains more than just our value
            const haveErrors = errorsForField.length > 1;
            if (!haveErrors)
            {
                converted = isScalar ? InputSchema.valueToScalar(unwrapped.name, value, fieldContext) : value;
            }

            // UPDATE
            this.updateFromChange(qualifiedName, converted, errorsForField);
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

    updateFromChange(qualifiedName, converted, errorsForField)
    {
        const { root, formContext } = this;

        formContext.updateErrors(root, qualifiedName, errorsForField);

        if (errorsForField.length < 2)
        {
            set(root, qualifiedName, converted);

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

    getRequiredErrorMessage(fieldContext)
    {
        let parentType;
        const fieldName = fieldContext.path.slice(-1);
        if (this.type)
        {
            if (fieldContext.path.length > 1)
            {
                parentType = this.schema.resolveType(this.type, fieldContext.path.slice(0, -1)).name + "." + fieldName;
            }
            else
            {
                parentType = this.type + "." + fieldName;
            }
        }
        else
        {
            parentType = fieldName;
        }

        return parentType + ":Field Required";
    }
}

export default FormConfig
