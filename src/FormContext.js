import { ENUM, NON_NULL, SCALAR } from "./kind";
import InputSchema, { unwrapNonNull } from "./InputSchema";

import { action, isObservableObject, makeObservable, observable } from "mobx";
import get from "lodash.get";
import FieldMode from "./FieldMode";


let defaultFormContext;

const EMPTY = [];


const secret = Symbol("FormContext Secret");

let contextCounter = 0;
let objectCounter = 0;

/**
 * Weakmap containing numeric identifiers for form root objects. We keep it in the module to share those identifiers
 * among all form contexts.
 *
 * @type {WeakMap<object, number>}
 */
const ids = new WeakMap();

function validateEnum(schema, enumTypeName, value)
{
    if (!value)
    {
        return true;
    }

    const { enumValues } = schema.getType(enumTypeName);

    for (let i = 0; i < enumValues.length; i++)
    {
        const enumValue = enumValues[i];
        if (enumValue.name === value)
        {
            return true;
        }
    }
    return false
}


function findById(fieldContexts, id)
{
    for (let i = 0; i < fieldContexts.length; i++)
    {
        const curr = fieldContexts[i];
        if (curr.fieldId === id)
        {
            return id;
        }
    }
    return -1;
}


/**
 * The form context represents a logical context with which multiple <Form/> objects can interact with each other and
 * offer a cohesive user experience.
 *
 * All forms that share the same form context act as one form in terms of user-interaction. If one form is submitted,
 * all fields of all forms are validated etc.
 *
 * The form context encapsulates the current error messages related to a form root object and [WIP]
 *
 */
export default class FormContext
{
    constructor(schema, options = {})
    {

        if (!schema)
        {
            throw new Error("Form context needs an inputSchema argument")
        }

        const { validation = null } = options;

        makeObservable(this);

        this[secret] = {

            schema,
            validation,

            id: contextCounter++,
            errors: observable([]),
            fieldContexts: []
        }
    }

    findFieldContext(root, path)
    {
        const { fieldContexts } = this;

        for (let i = 0; i < fieldContexts.length; i++)
        {
            const ctx = fieldContexts[i];
            if ( ctx.root === root && ctx.qualifiedName === path)
            {
                return ctx;
            }
        }
        return null;
    }

    get schema()
    {
        return this[secret].schema;
    }

    /**
     *  Returns all errors for the form context.
     *
     * @return {Array} errors entries
     */
    getErrors()
    {
        return this[secret].errors;
    }

    hasErrors()
    {
        return this[secret].errors.length > 0;
    }

    /**
     * Returns a list of errors registered for the given form root.
     *
     * @param [root]    root observable. A falsy root object will always have an empty error list.
     *
     * @return {Array} errors entries
     */
    getErrorsForRoot(root)
    {
        if (!root)
        {
            return EMPTY;
        }

        const errors  = this.getErrors();

        const rootId = FormContext.getUniqueId(root);

        return errors.filter( err => err.rootId ===  rootId);
    }

    @action
    addError(root, path, msg, value)
    {
        //console.log("FormContext.addError:", root, path, msg, value)

        const errors = this.getErrors();

        const rootId = FormContext.getUniqueId(root);

        let i, existing;
        for (i = 0; i < errors.length; i++)
        {
            const curr = errors[i];
            if (curr.path === path && curr.rootId === rootId)
            {
                existing = curr;
                break;
            }
        }

        if (!existing)
        {
            const ctx = this[secret].fieldContexts.find( ctx => ctx.root === root && ctx.qualifiedName === path)
            if (ctx)
            {
                errors.push({
                        path,
                        rootId,
                        errorMessages: [ value !== undefined ? value : InputSchema.scalarToValue(unwrapNonNull(ctx.fieldType).name, get(root, path)), msg]
                    }
                )
            }
        }
        else
        {
            existing.errorMessages.push(msg)
        }
    }

    @action
    removeErrors(root, path)
    {
        const errors = this.getErrors();

        const rootId = FormContext.getUniqueId(root);

        const newErrors = errors.filter(
            err => err.path !== path || err.rootId !== rootId
        );

        if (newErrors.length < errors.length)
        {
            errors.replace(newErrors);
        }
    }

    findError(root, path)
    {
        const errors = this.getErrors();
        const rootId = FormContext.getUniqueId(root);
        for (let i = 0; i < errors.length; i++)
        {
            const error = errors[i];
            if (error.path === path && error.rootId === rootId)
            {
                return error.errorMessages;
            }
        }
        return EMPTY;
    }

    findErrorIndex(root, path)
    {
        const errors = this.getErrors();
        const rootId = FormContext.getUniqueId(root);
        for (let i = 0; i < errors.length; i++)
        {
            const error = errors[i];
            if (error.path === path && error.rootId === rootId)
            {
                return i;
            }
        }
        return -1;
    }

    @action
    clearErrors(root)
    {
        if (!isObservableObject(root))
        {
            throw new Error("Need observable Form root object");
        }

        const errors = this.getErrors();

        const rootId = FormContext.getUniqueId(root);

        const newErrors = errors.filter(
            err => err.rootId !== rootId
        );

        if (newErrors.length < errors.length)
        {
            errors.replace(newErrors);
        }
    }


    /**
     * Cleans up field context registrations and potential errors for the given form id.
     *
     * @param {String} formId   internal formId (*not* the id attribute of the form)
     */
    @action
    unregisterForm(formId)
    {
        //console.log("unregisterForm", formId)

        const { fieldContexts, id } = this[secret];

        const prefix = "c" + id + ":" + formId + ":";

        const toRemove = [];

        const newFieldContexts = [];
        for (let i = 0; i < fieldContexts.length; i++)
        {
            const ctx = fieldContexts[i];
            if (ctx.fieldId.indexOf(prefix) === 0)
            {
                toRemove.push(ctx.qualifiedName);
            }
            else
            {
                newFieldContexts.push(ctx);
            }
        }

        this[secret].fieldContexts = newFieldContexts;

        const errors = this.getErrors();
        const newErrors = errors.filter(
            err => toRemove.indexOf(err.path) < 0
        );
        if (newErrors.length < errors.length)
        {
            errors.replace(newErrors);
        }
        //console.log("Removed fieldContexts:", toRemove, ", newFieldContexts = ", newFieldContexts)
    }

    registerFieldContext(fieldContext)
    {
        //console.log("registerFieldContext", fieldContext)

        const { fieldContexts, validation } = this[secret];

        if (validation && validation.fieldContext)
        {
            validation.fieldContext(fieldContext)
        }

        const existingIndex = findById(fieldContexts, fieldContext.fieldId)
        if (existingIndex >= 0)
        {
            fieldContexts[existingIndex] = fieldContext;
        }
        else
        {
            fieldContexts.push(fieldContext);
        }
    }
    

    /**
     * Performs the registered high-level validation for the given field context and value
     *
     * @param fieldContext      field context
     * @param {*} value         scalar value
     * 
     * @return {String|Array<String>|null} error or array of errors. Might return null for no errors / no validation registered.
     */
    validate(fieldContext, value)
    {
        if (!fieldContext)
        {
            throw new Error("Need fieldContext")
        }

        const { validation } = this[secret];

        let errors = [];

        const add = val => {
            if (val)
            {
                if (Array.isArray(val))
                {
                    errors = errors.concat(val)
                }
                else
                {
                    errors.push(val)
                }
            }
        }

        if (validation && validation.validateField)
        {
            add(
                validation.validateField(fieldContext, value)
            )
        }

        if (fieldContext)
        {

            const typeDef = unwrapNonNull(fieldContext.fieldType);
            if (typeDef.kind === SCALAR)
            {
                const strValue = InputSchema.scalarToValue(typeDef.name, value, fieldContext);
                if (strValue !== "")
                {
                    add(
                        InputSchema.validate(
                            typeDef.name,
                            strValue,
                            fieldContext
                        )
                    )
                }
            }

            if (typeof fieldContext.validate === "function")
            {
                add(
                    fieldContext.validate(fieldContext, value)
                )
            }

            const { validateAsync } = fieldContext;
            if (validateAsync)
            {
                fieldContext.setPending(true);

                const fieldId = fieldContext.fieldId;

                validateAsync.invokeValidateAsync(fieldContext, value)
                    .then(
                        errors => {

                            if (!this.fieldContexts.find(ctx => ctx.fieldId === fieldId))
                            {
                                // component unmounted
                                return;
                            }

                            //console.log("RESOLVED ASYNC VALIDATION", errors)

                            const { root, qualifiedName } = fieldContext;

                            if (Array.isArray(errors))
                            {
                                //console.log("validateAsync array", errors);

                                for (let i = 0; i < errors.length; i++)
                                {
                                    const error = errors[i];
                                    this.addError(root, qualifiedName, error);
                                }
                            }
                            else if (typeof errors === "string")
                            {
                                //console.log("validateAsync string", errors);
                                
                                if (errors.length)
                                {
                                    this.addError(root, qualifiedName, errors);
                                }
                            }
                            else if (errors !== null)
                            {
                                console.error("Invalid validateAsync return value: " + errors);
                            }

                            fieldContext.setPending(false);
                        },

                        err => {
                            console.error("Error during async validation", err);
                            fieldContext.setPending(false);
                        }
                    )
            }
        }
        return errors.length ? errors : null;
    }


    /**
     * Returns id of the form context
     *
     * @return {number} id
     */
    get id()
    {
        return this[secret].id;
    }


    /**
     * Returns an array with all registered field contexts.
     *
     * @return {Array} field contexts
     */
    get fieldContexts()
    {
        const { fieldContexts } = this[secret];
        return fieldContexts.slice();
    }


    /**
     * Updates the errors recorded for a given root object and a given path.
     *
     * @param root
     * @param {String} qualifiedName
     * @param {Array<String>} errorsForField    errors for field in the special internal storage. First element is the current field value, followed by the errors. If errorsForField only contains less than two elements the errors for that field will be removed.
     */
    @action
    updateErrors(root, qualifiedName, errorsForField)
    {
        //console.log("FormContext.updateErrors: root = ", root, ", qualifiedName = ", qualifiedName,  "errorsForField = ", errorsForField);

        const haveErrors = errorsForField.length > 1;

        const errors = this.getErrors();

        const rootId = FormContext.getUniqueId(root);

        const index =  this.findErrorIndex(root, qualifiedName);
        if (index < 0)
        {
            if (haveErrors)
            {
                // ADD ERRORS
                errors.push({
                    path: qualifiedName,
                    rootId,
                    errorMessages: errorsForField
                });
            }
        }
        else
        {
            if (haveErrors)
            {
                // UPDATE ERRORS
                errors[index] = {
                    path: qualifiedName,
                    rootId,
                    errorMessages: errorsForField
                }
            }
            else
            {
                // REMOVE ERRORS
                const changedErrors = errors.slice();
                changedErrors.splice(index, 1);

                errors.replace(changedErrors)
            }
        }
    }

    @action
    removeAllErrors()
    {
        this[secret].errors.replace([]);
    }


    /**
     * Performs a complete revalidation of all registered field contexts.
     */
    revalidate()
    {

        const { fieldContexts } = this[secret];

        for (let i = 0; i < fieldContexts.length; i++)
        {

            const ctx = fieldContexts[i];
            const { root, mode, fieldType, path, qualifiedName } = ctx;
            if (mode !== FieldMode.NORMAL)
            {
                continue;
            }

            const value = get(root, path);


            if (fieldType.kind === NON_NULL)
            {
                if (value === null || value === undefined)
                {
                    this.addError(root, qualifiedName, this.getRequiredErrorMessage(ctx) , "");
                }
            }

            const typeRef = unwrapNonNull(fieldType);

            if (typeRef.kind === SCALAR)
            {
                const scalarName = typeRef.name;
                const result = this.validate(ctx, value);
                if (result)
                {
                    if (Array.isArray(result))
                    {
                        for (let i = 0; i < result.length; i++)
                        {
                            const r = result[i];
                            this.addError(root, qualifiedName, r , InputSchema.scalarToValue(scalarName, value, ctx));
                        }
                    }
                    else
                    {
                        this.addError(root, qualifiedName, result , InputSchema.scalarToValue(scalarName, value, ctx));
                    }
                }
            }
            else if (typeRef.kind === ENUM)
            {
                const enumTypeName = typeRef.name;
                if (!validateEnum(this.schema, enumTypeName, value))
                {
                    if (__DEV)
                    {
                        console.warn("Invalid value for Enum " + enumTypeName + " at " + path + " in " + JSON.stringify(root) + ": " + value);
                    }
                    this.addError(root, path, "Invalid Enum Value" , value);
                }
            }
        }
    }


    getRequiredErrorMessage(fieldContext)
    {
        const { rootType } = fieldContext;

        let parentType;
        const fieldName = fieldContext.path.slice(-1);
        if (rootType)
        {
            if (fieldContext.path.length > 1)
            {
                parentType = this.schema.resolveType(rootType, fieldContext.path.slice(0, -1)).name + "." + fieldName;
            }
            else
            {
                parentType = rootType + "." + fieldName;
            }
        }
        else
        {
            parentType = fieldName;
        }

        return parentType + ":Field Required";
    }



    /**
     * Provides a unique numeric id for an observable root object.
     *
     * @param root      observable root object
     * @return {number} unique numeric id
     */
    static getUniqueId(root)
    {
        if (!root)
        {
            return 0;
        }

        const existing = ids.get(root);
        if (existing !== undefined)
        {
            return existing;
        }

        const newId = ++objectCounter;
        ids.set(root, newId);
        return newId;
    }


    /**
     * Returns the default form context.
     *
     */
    static getDefault()
    {
        if (!defaultFormContext)
        {
            throw new Error("No default form context defined.");
        }
        return defaultFormContext;
    }


    /**
     * Uses the current form context instance as the default form context.
     */
    useAsDefault()
    {
        defaultFormContext = this;
    }
}
