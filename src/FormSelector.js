import React from "react"
import PropTypes from "proptypes"
import cx from "classnames";
import toPath from "lodash.topath";
import get from "lodash.get";

import ListHelper from "./util/ListHelper"
import FormConfig,{ FORM_CONFIG_PROPTYPES } from "./FormConfig";


/**
 * Selects one object from a list of objects
 */
class FormSelector extends React.Component {

    static propTypes = {

        /**
         * Name/path of the list field for this <FormSelector/>
         */
        name: PropTypes.string.isRequired,

        /**
         * If true (the default), the user can remove objects as long as there are more than "minObjects" objects. If false
         * the user can never remove objects.
         */
        canRemove: PropTypes.bool,

        /**
         * If true (the default), the user can sort the list of objects with up and down buttons for each object.
         */
        canSort: PropTypes.bool,

        /**
         * Label to put on the add button (default is "Add")
         */
        addLabel: PropTypes.string,
        /**
         * Text of the remove object confirmation (default is "Remove Object?")
         */
        removeCheck: PropTypes.string,
        /**
         * Mininum number of objects in the list. (default is 0)
         */
        minObjects: PropTypes.number,

        /**
         * Field to select one object from the list of objects by. Can also be a function that renders a representation
         * of a given object.
         */
        selector: PropTypes.oneOfType([
            // field name/path within the array element type
            PropTypes.string,
            // function that renders the description for the array element
            PropTypes.func
        ]).isRequired,

        /**
         * optional factory method to produce new values. If no newObject prop is given, the user cannot add objects
         * to the list.
         */
        newObject: PropTypes.func,
        /**
         * render additional elements into the list toolbar
         */
        renderToolbar: PropTypes.func,
        /**
         * render additional elements into the per row toolbars
         */
        renderRowToolbar: PropTypes.func,

        ... FORM_CONFIG_PROPTYPES
    };

    static defaultProps = {
        canRemove: true,
        canSort: true,
        minObjects: 0,
        addLabel : "Add",
        removeCheck : "Remove Object?",
        emptyText: "No Rows",

        // we use horizontal mode as non-inherited default in FormList.
        horizontal: true
    };


    state = {
        selectedIndex: 0
    };

    selectRow = index => this.setState({
        selectedIndex: index
    });

    render()
    {
        const { selector, emptyText, children } = this.props;
        const { selectedIndex } = this.state;

        return (
            <ListHelper
                {...this.props}
                selector={ null }
            >
                {
                    ctx => {

                        const { array, path, arrayHelpers, renderToolbar, renderRowToolbar, createLineContext  } = ctx;
                        const len = array.length;
                        const last = len - 1;

                        return (
                            <div className="form-selector">
                                {
                                    renderToolbar(arrayHelpers)
                                }
                                <div className="row">
                                    <div className="col-md-3">
                                        {
                                            len > 0 &&
                                            <ul className="list-group">
                                                {
                                                    array.map(
                                                        (elem, index) => {

                                                            const isActive = index === selectedIndex;

                                                            const label = typeof selector === "function" ? selector(elem) : get(elem, toPath(selector));
                                                            return (
                                                                <li
                                                                    key={index}
                                                                    className={cx("list-group-item", isActive && "active")}
                                                                >
                                                                    <a
                                                                        className={cx("selector btn btn-link", isActive && "disabled")}
                                                                        aria-disabled={ isActive }
                                                                        onClick={ev => {
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
                                                                            renderRowToolbar(arrayHelpers, index, last)
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
                                        <FormConfig.Provider
                                            key={ selectedIndex }
                                            value={createLineContext(selectedIndex, path)}
                                        >
                                            <div className="col-md-9">
                                                <div className="container-fluid">
                                                    {
                                                        typeof children === "function" ? children(selectedIndex, arrayHelpers) : children
                                                    }
                                                </div>

                                            </div>
                                        </FormConfig.Provider>
                                    }
                                </div>
                            </div>
                        );
                    }
                }
            </ListHelper>
        );
    }
}

export default FormSelector
