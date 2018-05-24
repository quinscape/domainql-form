import React from "react"
import PropTypes from "proptypes"
import ListHelper from "./util/ListHelper";
import FormConfig,{ FORM_CONFIG_PROPTYPES } from "./FormConfig";

class FormList extends React.Component {

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
        addLabel : "Add Object",
        removeCheck : "Delete Row?",
        emptyText: "No Rows",

        // we use horizontal mode as non-inherited default in FormList.
        horizontal: true
    };

    render()
    {
        const { emptyText, children } = this.props;

        return (
            <ListHelper
                { ... this.props }
            >
                {
                    (ctx) => {

                        const { array, path,arrayHelpers, renderToolbar, renderRowToolbar, createLineContext} = ctx;

                        const len = array.length;
                        const last = len - 1;

                        const rows = new Array(len);

                        for (let index = 0; index < len; index++)
                        {
                            rows[index] = (
                                <FormConfig.Provider
                                    key={ index }
                                    value={ createLineContext(index, path) }
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
                                                renderRowToolbar(arrayHelpers, index, last )
                                            }
                                        </div>
                                    </div>
                                    <hr/>
                                </FormConfig.Provider>
                            );
                        }

                        return (
                            <div className="form-list">
                                {
                                    renderToolbar(arrayHelpers)
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
                            </div>
                        );
                    }
                }
            </ListHelper>
        );
    }
}

export default FormList
