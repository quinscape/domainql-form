import React from "react"
import toPath from "lodash.topath"

import FormConfig from "./FormConfig"

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

        const { id, name, label, children } = this.props;

        const { formik } = this.context;


        let fieldId;
        let qualifiedName;
        let path;
        let fieldType;
        let effectiveLabel;

        if (name && name.length)
        {
            qualifiedName = formContext.getPath(name);
            path = toPath(qualifiedName);
            const lastSegment = path[path.length - 1];

            fieldId = id || "field-" + formContext.type + "-" + lastSegment;


            fieldType = formContext.inputSchema.resolveType(formContext.type, path);
            effectiveLabel = typeof label === "string" ? label : formContext.options.lookupLabel(formContext, lastSegment);
        }
        else
        {
            fieldId = id;
            qualifiedName = null;
            path = null;
            fieldType = null;
            effectiveLabel = label || "";
        }

        const fieldContext = {
            formContext,
            formik,
            fieldId,
            fieldType,
            qualifiedName,
            path,
            label: effectiveLabel,
            ... this.props
        };

        if (typeof children === "function")
        {
            return children(fieldContext);
        }
        else
        {
            const renderFn = FormConfig.get(fieldContext);
            return renderFn(fieldContext);
        }
    };

}

export default GQLField
