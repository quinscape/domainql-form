import React from "react"
import InputSchema, { findNamed } from "./InputSchema";
import FieldMode from "./FieldMode";
import GlobalConfig from "./GlobalConfig";
import keys from "./util/keys";

import toPath from "lodash.topath"
import get from "lodash.get"
import set from "lodash.set"

import { action } from "mobx"
import unwrapType from "./util/unwrapType";
import { INPUT_OBJECT, LIST, NON_NULL } from "./kind";
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
    suppressLabels: false
};

/**
 * React context for the current FormConfig object
 * @type {React.Context<FormConfig>}
 */
export const FormConfigContext = React.createContext(null);

const EMPTY = [];

/**
 @typedef FormError
 @type {object}
 @property {string} path                    name/path
 @property {Array<String>} errorMessages    error messages, first value is original user-provided value
 */

/**
 * Finds the error with the given path
 *
 * @param {Array<FormError>} errors     errors
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

        this.options = {
            ... DEFAULT_OPTIONS,
            ... opts
        };

        // clear form context
        this.setFormContext();
    }


    /**
     * Sets the form context part of the current form config
     *
     * @param {String} [type]                   name of the form base input type
     * @param {String} [basePath]               current base path within the form
     * @param {object} [root]                   mobx input model
     * @param {Array<String>} [errors]          current form errors
     * @param {InternalContext} [internal]      internal context object (see Form.js)
     */
        setFormContext(type = "", basePath = "", root = null, errors = EMPTY, internal)
    {
        //console.log("setFormContext", { type, basePath, root, errors, internal} );

        this.type = type;
        this.basePath = basePath;
        this.root = root;
        this.errors = errors;
        this.ctx = internal;
    }

    copy()
    {
        const copy = new FormConfig(this.options, this.schema);
        copy.setFormContext(this.type, this.basePath, this.root, this.errors, this.ctx);
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

    addError(path, msg, value)
    {

        const { errors } = this;

        const newErrors = [];

        let i, existing;
        for (i = 0; i < errors.length; i++)
        {
            existing = errors[i];
            if (existing.path === path)
            {
                break;
            }
        }

        if (!existing || i < errors.length)
        {
            newErrors.push({
                    path,
                    errorMessages: [ value !== undefined ? value : get(this.root, path), msg]
                }
            )
        }
        else
        {
            newErrors[i] = {
                path,
                errorMessages: existing.errorMessages.concat(msg)
            };
        }

        this.ctx.setErrors(newErrors);
    }

    removeErrors(path)
    {
        const newErrors = this.errors.filter(
            err => err.path !== path
        );

        if (newErrors.length < this.errors.length)
        {
            this.ctx.setErrors(newErrors);
        }
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
     * @param {Array<FormError>} errorMessages
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
            let errorsForField = [ value ];

            const isScalar = unwrapped.kind === "SCALAR";
            const error = isScalar ? InputSchema.validate(unwrapped.name, value) : null;
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
                    errorsForField.push((this.type ? this.type + "." : "") + fieldContext.qualifiedName + ":Field Required");
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
                converted = isScalar ? InputSchema.valueToScalar(unwrapped.name, value) : value;
            }

            // UPDATE
            const { errors : currentErrors } = this;

            let changedErrors;
            const index =  findError(currentErrors, qualifiedName);
            if (index < 0)
            {
                if (haveErrors)
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
                if (haveErrors)
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


            if (!haveErrors)
            {
                //console.log("SET FIELD VALUE", this.root, name, converted);
                setFormValueAction(this.root, qualifiedName, converted);

                if (this.options.autoSubmit)
                {
                    this.ctx.debouncedSubmit();
                }
            }

            if (changedErrors)
            {
                this.ctx.setErrors(changedErrors);
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
}

export default FormConfig
