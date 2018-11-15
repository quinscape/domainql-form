import React from "react"
import toPath from "lodash.topath"

import GlobalConfig from "./GlobalConfig"

import PropTypes from "prop-types"

import FieldMode from "./FieldMode"
import withFormConfig from "./withFormConfig";
import InputSchema from "./InputSchema";

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
         * Optional change handler to use
         */
        onChange: PropTypes.func,

        /**
         * Optional blur handler to use
         */
        onBlur: PropTypes.func,

        /**
         * Pass-through autoFocus attribute for text inputs
         */
        autoFocus: PropTypes.bool
    };

    static getDerivedStateFromProps(nextProps, prevState)
    {
        const { id, name, label, formConfig, autoFocus } = nextProps;

        // do we have a field type already and did the form config and id and name not change from last time?
        if (
            prevState.fieldContext &&
            prevState.id === id &&
            prevState.name === name &&

            prevState.label === label

            // XXX: none of the functionality here should be sensitive to form config changes. Uncomment if this is wrong
            /*&& prevState.formConfig.equals(formConfig)*/
        )
        {
            // yes -> no update
            //console.log("NO UPDATE");
            return null;
        }

        const qualifiedName = formConfig.getPath(name);
        const path = toPath(qualifiedName);

        let fieldId;
        let effectiveLabel;

        if (name && name.length)
        {
            const lastSegment = path[path.length - 1];
            fieldId = id || "field-" + type + "-" + lastSegment;
            effectiveLabel = typeof label === "string" ? label : formConfig.options.lookupLabel(formConfig, lastSegment);
        }
        else
        {
            fieldId = id;
            effectiveLabel = label || "";
        }

        // update field state
        return {
            fieldContext : {
                formConfig,
                fieldId,
                fieldType: formConfig.schema.resolveType(type, path),
                qualifiedName,
                path,
                label: effectiveLabel,
                onChange: prevState.onChange,
                onBlur: prevState.onBlur,
                autoFocus,
            }
        };
    }

    onChange = ev => {

        const { target: { name, value } } = ev;

        const { formConfig } = this.props;
        const { fieldContext : { fieldType } } = this.state;

        formConfig.handleChange(fieldType, name, value);
    };

    onBlur = ev => {
        const { target: { name, value } } = ev;

        const { formConfig } = this.props;
        const { fieldContext : { fieldType } } = this.state;

        formConfig.handleBlur(fieldType, name, value);

    };

    state = {
        onChange: this.onChange,
        onBlur: this.onBlur,
        fieldContext: null
    };

    render()
    {
        const { fieldContext } = this.state;

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

export default withFormConfig(Field)
