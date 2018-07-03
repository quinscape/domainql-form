import React from "react"
import toPath from "lodash.topath"

import GlobalConfig from "./GlobalConfig"
import FormConfig from "./FormConfig"

import PropTypes from "prop-types"

import FieldMode from "./FieldMode"


/**
 * Renders a bootstrap 4 form group with an input field for the given name/path within the current form object. The actual
 * field rendered is resolved by the render rules in GlobalConfig.js ( See ["Form Customization"](./customization.md) for details)
 */
class Field extends React.Component {

    static propTypes = {
        /**
         * Name / path for this field (e.g. "name", but also "foos.0.name")
         */
        name: PropTypes.string.isRequired,
        /**
         * Mode for this field. If not set or set to null, the mode will be inherited from the &lt;Form/&gt; or &lt;FormBlock&gt;.
         */
        mode: PropTypes.oneOf(FieldMode.values()),
        /**
         * Additional help text for this field. Is rendered for non-erroneous fields in place of the error.
         */
        helpText: PropTypes.string,
        /**
         * Title attribute
         */
        title: PropTypes.string,
        /**
         * Label for the field.
         */
        label: PropTypes.string,
        /**
         * Placeholder text to render for text inputs.
         */
        placeholder: PropTypes.string,

        /**
         * Additional HTML classes for the input element.
         */
        inputClass: PropTypes.string,

        /**
         * Additional HTML classes for the label element.
         */
        labelClass: PropTypes.string,

        /**
         * Optional change handler to use instead of formikProps.handleChange
         */
        onChange: PropTypes.func,

        /**
         * Optional blur handler to use instead of formikProps.handleBlur
         */
        onBlur: PropTypes.func,

        /**
         * Pass-through autoFocus attribute for text inputs
         */
        autoFocus: PropTypes.bool
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

        const { id, name, label, children, onChange, onBlur, autoFocus } = this.props;

        const { type, formikProps }  = formConfig;

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
            onChange: onChange || formikProps.handleChange,
            onBlur: onBlur || formikProps.handleBlur,
            autoFocus,
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
