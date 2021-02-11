import { action, isObservableObject, observable, toJS } from "mobx";
import get from "lodash.get";


let defaultFormContext;

const EMPTY = [];

export function getDefaultFormContext()
{
    if (!defaultFormContext)
    {
        defaultFormContext = new FormContext();
    }

    return defaultFormContext;
}

const secret = Symbol("FormContext Secret");

let contextCounter = 0;
let objectCounter = 0;

const ids = new WeakMap();


/**
 * Provides a unique numeric id for an observable root object.
 *
 * @param root      observable root object
 * @return {number} unique numeric id
 */
function getUniqueId(root)
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
    constructor()
    {
        this[secret] = {
            id: contextCounter++,
            errors: observable([]),
            fieldContexts: []
        }
    }


    /**
     *
     * @param [root]    optional root object to filter the errors
     *
     * @return {[]|IObservableArray<any>|*}
     */
    getErrors()
    {
        return this[secret].errors;
    }

    /**
     *
     * @param [root]    optional root object to filter the errors
     *
     * @return {[]|IObservableArray<any>|*}
     */
    getErrorsForRoot(root)
    {
        if (!root)
        {
            return EMPTY;
        }

        const errors  = this.getErrors();

        const rootId = getUniqueId(root);

        return errors.filter( err => err.rootId ===  rootId);
    }

    @action
    addError(root, path, msg, value)
    {
        //console.log("FormContext.addError:", root, path, msg, value)

        const errors = this.getErrors();

        const rootId = getUniqueId(root);

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
            errors.push({
                    path,
                    rootId,
                    errorMessages: [ value !== undefined ? value : get(root, path), msg]
                }
            )
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

        const rootId = getUniqueId(root);

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
        const rootId = getUniqueId(root);
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
        const rootId = getUniqueId(root);
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

        const rootId = getUniqueId(root);

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

        //console.log("newErrors", newErrors, ", was", errors)
        
        if (newErrors.length < errors.length)
        {
            errors.replace(newErrors);
        }
    }

    registerFieldContext(fieldContext)
    {
        const { fieldContexts } = this[secret];

        fieldContexts.push(fieldContext);
    }

    get id()
    {
        return this[secret].id;
    }

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
        const haveErrors = errorsForField.length > 1;

        const errors = this.getErrors();


        const rootId = getUniqueId(root);

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
}

