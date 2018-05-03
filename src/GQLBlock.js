import React from "react"
import cx  from "classnames"
import PropTypes from "prop-types"

import {
    FormContext,
    GQLFormContext,
    FORM_OPTIONS,
    mergeOptions
} from "./GQLForm"
import FieldMode from "./FieldMode";



class GQLBlock extends React.Component {

    static propTypes = {
        className: PropTypes.string,
        style: PropTypes.object,
        mode: PropTypes.oneOf(FieldMode.values()),
        ... FORM_OPTIONS
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

    renderWithFormContext = formContext => {

        const { className, style, mode, children } = this.props;
        const { inputSchema, type } = formContext;

        const groupContext  =  new FormContext(
            inputSchema,
            type,
            mode || formContext.mode,
            mergeOptions(
                formContext.options,
                this.props
            )
        );

        return (
            <GQLFormContext.Provider value={ groupContext }>
                <div className={ cx("gql-block", className) } style={ style }>
                    {
                        children
                    }
                </div>
            </GQLFormContext.Provider>
        );
    };
}

export default GQLBlock
