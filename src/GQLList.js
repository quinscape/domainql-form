import React from "react"
import cx from "classnames"
import PropTypes from "prop-types"

import FieldMode from "./FieldMode"
import { FormGroup } from "./default-renderers"


import {
    FormContext,
    GQLFormContext
} from "./GQLForm"

import toPath from "lodash.topath"
import get from "lodash.get"

import {
    isListType,
    unwrapNonNull
} from "./InputSchema"
import { FieldArray } from "formik";


class GQLList extends React.Component {

    static contextTypes = {
        formik: PropTypes.object
    };

    static propTypes = {
        name: PropTypes.string.isRequired,
        mode: PropTypes.oneOf(FieldMode.values()),
        canRemove: PropTypes.bool,
        canSort: PropTypes.bool,
        addLabel: PropTypes.string,
        removeCheck: PropTypes.string,

        // triggers alternate list view: row selector and single row form
        keyField: PropTypes.oneOfType([

            // field name/path within the array element type
            PropTypes.string,
            // function that renders the description for the array element
            PropTypes.func
        ]),

        // optional factory method to produce new values
        newObject: PropTypes.func,
        // render additional elements into the list toolbar
        renderToolbar: PropTypes.func,
        // render additional elements into the per row toolbars
        renderRowToolbar: PropTypes.func,

    };

    state = {
        selectedIndex: 0
    };

    static defaultProps = {
        canRemove: true,
        canSort: true,
        addLabel : "Add Object",
        removeCheck : "Delete Row?",
        emptyText: "No Rows"
    };

    render()
    {
        return (
            <GQLFormContext.Consumer>
                {
                    this.renderWithFormContext
                }
            </GQLFormContext.Consumer>
        )
    }

    selectRow = index => this.setState({
            selectedIndex: index
        });

    renderWithFormContext = formContext => {

        const { name, keyField, emptyText, children } = this.props;

        const path = toPath(formContext.getPath(name));

        // check type in development
        if (process.env.NODE_ENV !== "production")
        {
            const fieldType = formContext.inputSchema.resolveType(formContext.type, path);

            if (!isListType(unwrapNonNull(fieldType)))
            {
                throw new Error("GQLList expected 'List' type: is " + JSON.stringify(fieldType))
            }
        }

        const array = get(this.context.formik.values, path);
        const len = array.length;
        const last = len - 1;

        return (
            <FieldArray
                name={ name }
                render={
                    arrayHelpers => {


                        if (keyField)
                        {
                            const { selectedIndex } = this.state;

                            return (
                                <React.Fragment>
                                    {
                                        this.renderToolbar(formContext, arrayHelpers)
                                    }
                                    <div className="row">
                                        <div className="col-md-3">
                                            {
                                                len > 0 &&
                                                <ul className="list-group">
                                                    {
                                                        array.map(
                                                            (elem,index) => {

                                                                const isActive = index === selectedIndex;

                                                                const label = typeof keyField === "function" ? keyField(elem) : get(elem, toPath(keyField));
                                                                return (
                                                                    <li
                                                                        key={index}
                                                                        className={cx("list-group-item", isActive && "active")}
                                                                    >
                                                                        <a
                                                                            className={ cx("btn btn-link", isActive && "disabled") }
                                                                            aria-disabled={ isActive }
                                                                            onClick={ ev => {
                                                                                this.selectRow(index);
                                                                                ev.preventDefault();
                                                                            }}
                                                                        >
                                                                            {
                                                                                label
                                                                            }
                                                                        </a>
                                                                        <div className="float-right">
                                                                            {
                                                                                this.renderRowToolbar(arrayHelpers, index, last)
                                                                            }
                                                                        </div>
                                                                    </li>
                                                                );
                                                            }
                                                        )
                                                    }
                                                </ul>
                                            }
                                            {
                                                len === 0 &&
                                                <React.Fragment>
                                                    { emptyText }
                                                    <hr/>
                                                </React.Fragment>
                                            }
                                        </div>
                                        {
                                            selectedIndex < len &&
                                            <GQLFormContext.Provider
                                                key={ selectedIndex }
                                                value={ this.createLineContext(formContext, selectedIndex, path) }
                                            >
                                                <div className="col-md-9">
                                                    <div className="container-fluid">
                                                        {
                                                            typeof children === "function" ? children(selectedIndex, arrayHelpers) : children
                                                        }
                                                    </div>

                                                </div>
                                            </GQLFormContext.Provider>
                                        }
                                    </div>
                                </React.Fragment>
                            );
                        }
                        else
                        {
                            const rows = new Array(len);
                            for (let i = 0; i < len; i++)
                            {
                                rows[i] = this.renderRow(formContext, arrayHelpers, i, len - 1, path)
                            }
                            return (
                                <React.Fragment>
                                    {
                                        this.renderToolbar(formContext, arrayHelpers)
                                    }
                                    {
                                        rows
                                    }
                                    {
                                        len === 0 &&
                                        <React.Fragment>
                                            { emptyText }
                                            <hr/>
                                        </React.Fragment>
                                    }
                                </React.Fragment>
                            );
                        }
                    }
                }
            />
        )
    };

    renderToolbar(formContext, arrayHelpers)
    {
        const { newObject, addLabel, renderToolbar } = this.props;

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
                                className="btn btn-default"
                                onClick={ev => arrayHelpers.push(newObject())}
                            >
                                <i className="fas fa-plus"></i>
                                {" " + addLabel}
                            </button>
                        }
                        {
                            extraToolbar && renderToolbar(formContext, arrayHelpers)
                        }
                    </div>
                }
                {
                    (canAdd || extraToolbar) && <hr/>
                }
            </React.Fragment>
        );
    }

    createLineContext(formContext, index, path)
    {
        const { mode } = this.props;
        const { inputSchema, type } = formContext;

        return new FormContext(
            inputSchema,
            type,
            mode || formContext.mode,
            {
                ...formContext.options,
                basePath: path + "." + index,
                horizontal: true
            }
        );

    }

    renderRow(formContext, arrayHelpers, index, last, path)
    {
        const { children } = this.props;

        return (
            <GQLFormContext.Provider
                key={ index }
                value={ this.createLineContext(formContext, index, path) }
            >
                <div className="form-row">
                    <div className="col-md-9">
                        <div className="container-fluid">
                            {
                                typeof children === "function" ? children(index, arrayHelpers) : children
                            }
                        </div>
                    </div>
                    <div className="col-md-3">
                        {
                            this.renderRowToolbar(arrayHelpers, index, last )
                        }
                    </div>
                </div>
                <hr/>
            </GQLFormContext.Provider>
        );
    }

    renderRowToolbar(arrayHelpers, index,last)
    {
        const { canRemove, canSort, removeCheck, renderRowToolbar } = this.props;

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
                            className="btn btn-link"
                            aria-label="Move Item Up"
                            onClick={ ev => arrayHelpers.swap(index, index - 1) }
                            disabled={ index === 0 }
                        >
                            <i className="fas fa-arrow-up"></i>
                        </button>
                        <button
                            type="button"
                            className="btn btn-link"
                            onClick={ ev => arrayHelpers.swap(index, index + 1) }
                            aria-label="Move Item Down"
                            disabled={ index === last }
                        >
                            <i className="fas fa-arrow-down"></i>
                        </button>
                    </div>
                }
                {
                    canRemove &&
                    <button
                        type="button"
                        className="btn btn-link"
                        aria-label="Remove Row"
                        onClick={ ev => { if ( confirm(removeCheck) ) arrayHelpers.remove(index) } }
                    >
                        <i className="fas fa-times"></i>
                        {
                        }
                    </button>

                }
            </React.Fragment>

        )
    }


}

export default GQLList
