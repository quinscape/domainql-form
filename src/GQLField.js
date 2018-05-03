import React from "react"
import toPath from "lodash.topath"

import FieldRenderers from "./field-renderers"

import { GQLFormContext } from "./GQLForm"
import PropTypes from "prop-types"

import FieldMode from "./FieldMode"

class GQLField extends React.Component {

    static contextTypes = {
        formik: PropTypes.object
    };

    static propTypes = {
        name: PropTypes.string.isRequired,
        mode: PropTypes.oneOf(FieldMode.values()),
        helpText: PropTypes.string,
        title: PropTypes.string,
        label: PropTypes.string,
        placeholder: PropTypes.string,
        inputClass: PropTypes.string,
        labelClass: PropTypes.string
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

        const { id, name, children } = this.props;
        
        const { formik } = this.context;

        const fieldId =  id || "field-" + formContext.type + "-" + name;

        const path = toPath(name);

        const fieldType = formContext.inputSchema.resolveType(formContext.type, path);

        const fieldContext = {
            formContext,
            formik,
            fieldId,
            fieldType,
            path,
            label: this.props.label || formContext.options.lookupLabel(formContext, name),
            ... this.props
        };

        if (typeof children === "function")
        {
            return children(fieldContext);
        }
        else
        {
            const renderFn = FieldRenderers.get(fieldContext);
            return renderFn(fieldContext);
        }
    };

}

export default GQLField
