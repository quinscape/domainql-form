import React from "react"
import FormConfig from "../FormConfig"
import withFormConfig from "../withFormConfig"

import toPath from "lodash.topath"
import get from "lodash.get"

import Icon from "./Icon"

import {
    isListType,
    unwrapNonNull
} from "../InputSchema"

import { FieldArray } from "formik";



/**
 * List helper component used by <FormList/> and <FormSelector/>. Uses a
 */
class ListHelper extends React.Component {

    renderToolbar = (arrayHelpers) =>
    {
        const { newObject, addLabel, renderToolbar, formConfig } = this.props;

        const canAdd = typeof newObject === "function";
        const extraToolbar = typeof renderToolbar === "function";

        return (
            <React.Fragment>
                {
                    (canAdd || extraToolbar) &&
                    <div className="btn-toolbar">
                        {
                            canAdd &&
                            <button
                                type="button"
                                className="b-add btn btn-default"
                                onClick={ev => arrayHelpers.push(newObject())}
                            >
                                <Icon className="fa-plus"/>
                                {" " + addLabel}
                            </button>
                        }
                        {
                            extraToolbar && renderToolbar(formConfig, arrayHelpers)
                        }
                    </div>
                }
                {
                    (canAdd || extraToolbar) && <hr/>
                }
            </React.Fragment>
        );
    };

    createLineContext = ( index, path) =>
    {
        const { formConfig } = this.props;

        const lineConfig = new FormConfig(
            FormConfig.mergeOptions(formConfig.options, this.props),
            formConfig.schema
        );

        lineConfig.setFormContext(
            formConfig.type,
            path + "." + index,
            formConfig.formikProps
        );

        return lineConfig;
    };

    renderRowToolbar = (arrayHelpers, index, last) =>
    {
        const { canRemove, canSort, removeCheck, renderRowToolbar, minObjects } = this.props;

        return (
            <React.Fragment>
                {
                    renderRowToolbar && renderRowToolbar(arrayHelpers, index, last)
                }
                {
                    canSort &&
                    <div className="btn-group" role="group" aria-label="Sort Buttons">
                        <button
                            type="button"
                            className="b-up btn btn-link"
                            aria-label="Move Item Up"
                            onClick={ ev => arrayHelpers.swap(index, index - 1) }
                            disabled={ index === 0 }
                        >
                            <Icon className="fa-arrow-up"/>
                        </button>
                        <button
                            type="button"
                            className="b-down btn btn-link"
                            onClick={ ev => arrayHelpers.swap(index, index + 1) }
                            aria-label="Move Item Down"
                            disabled={ index === last }
                        >
                            <Icon className="fa-arrow-down"/>
                        </button>
                    </div>
                }
                {
                    canRemove && minObjects <= last &&
                    <button
                        type="button"
                        className="b-remove btn btn-link"
                        aria-label="Remove Row"
                        onClick={ ev => { if ( confirm(removeCheck) ) arrayHelpers.remove(index) } }
                    >
                        <Icon className="fa-times"/>
                    </button>

                }
            </React.Fragment>
        )
    };

    render()
    {
        const { name, children, formConfig } = this.props;

        const path = toPath(formConfig.getPath(name));

        // check type in development
        if (__DEV)
        {
            const fieldType = formConfig.schema.resolveType(formConfig.type, path);

            if (!isListType(unwrapNonNull(fieldType)))
            {
                throw new Error("FormList expected 'List' type: is " + JSON.stringify(fieldType))
            }
        }

        const array = get(formConfig.formikProps.values, path);

        return (
            <FieldArray
                name={ name }
                render={
                    arrayHelpers =>
                        children(
                            {
                                array,
                                path,
                                arrayHelpers,
                                renderRowToolbar: this.renderRowToolbar,
                                renderToolbar: this.renderToolbar,
                                createLineContext: this.createLineContext
                            }
                        )
                }
            />
        );
    };
}

export default withFormConfig(ListHelper)
