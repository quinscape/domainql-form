import React from "react"
import toPath from "lodash.topath"

import GlobalConfig from "./GlobalConfig"
import FormConfig from "./FormConfig"

import PropTypes from "prop-types"

import FieldMode from "./FieldMode"

class Field extends React.Component {

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
            <FormConfig.Consumer>
                {
                    this.renderWithFormConfig
                }
            </FormConfig.Consumer>
        )
    }

    renderWithFormConfig = formConfig => {

        const { id, name, label, children } = this.props;

        const { type }  = formConfig;

        let fieldId;
        let qualifiedName;
        let path;
        let fieldType;
        let effectiveLabel;

        if (name && name.length)
        {
            qualifiedName = formConfig.getPath(name);
            path = toPath(qualifiedName);
            const lastSegment = path[path.length - 1];

            fieldId = id || "field-" + type + "-" + lastSegment;


            fieldType = formConfig.schema.resolveType(type, path);
            effectiveLabel = typeof label === "string" ? label : formConfig.options.lookupLabel(formConfig, lastSegment);
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
            formConfig,
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
            const renderFn = GlobalConfig.get(fieldContext);
            return renderFn(fieldContext);
        }
    };

}

export default Field
