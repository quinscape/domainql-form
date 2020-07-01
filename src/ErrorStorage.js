import { action, isObservableArray, isObservableMap, isObservableObject, observable } from "mobx";
import get from "lodash.get";

const EMPTY = [];

/**
 * Storage for all errors for all form objects. Keeps a WeakMap with observable objects as key.
 */
export default class ErrorStorage
{
    errorsMap = new WeakMap()

    getErrors(root)
    {
        if (!root)
        {
            return EMPTY;
        }

        const errors = this.errorsMap.get(root);
        if (errors)
        {
            return errors;
        }

        const newObservable = observable.array();
        this.errorsMap.set(root, newObservable);
        return newObservable;
    }

    @action
    addError(root, path, msg, value)
    {
        const errors = this.getErrors(root);
        errors.push({

        })

        let i, existing;
        for (i = 0; i < errors.length; i++)
        {
            const curr = errors[i];
            if (curr.path === path)
            {
                existing = curr;
                break;
            }
        }

        if (!existing)
        {
            errors.push({
                    path,
                    errorMessages: [ value !== undefined ? value : get(this.root, path), msg]
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
        const errors = this.getErrors(root);
        const newErrors = errors.filter(
            err => err.path !== path
        );

        if (newErrors.length < errors.length)
        {
            errors.replace(newErrors);
        }
    }

    findError(root, path)
    {
        const errors = this.getErrors(root);
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

    findErrorIndex(root, path)
    {
        const errors = this.getErrors(root);
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

    @action
    clearErrors(root)
    {
        if (!isObservableObject(root))
        {
            throw new Error("Need observable Form root object");
        }

        const errorsForRoot = this.getErrors(root);
        errorsForRoot.clear();
    }

    @action
    transferErrors(root, errors)
    {
        if (!isObservableObject(root))
        {
            throw new Error("Need observable Form root object");
        }

        if (!isObservableArray(errors))
        {
            throw new Error("Need observable errors array");
        }

        const errorsForRoot = this.getErrors(root);
        Object.assign(errorsForRoot, errors)
    }
}

