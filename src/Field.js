import React from "react"
import toPath from "lodash.topath"

import GlobalConfig from "./GlobalConfig"

import PropTypes from "prop-types"

import FieldMode from "./FieldMode"
import withFormConfig from "./withFormConfig";

import { observer } from "mobx-react"

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
        const { id, name, label, formConfig, autoFocus, mode, placeHolder, inputClass, labelClass } = nextProps;


        const effectiveMode = mode || formConfig.options.mode;

        // do we have a field type already and did the form config and id and name not change from last time?
        const { fieldContext } = prevState;

        if (
            fieldContext  &&
            fieldContext.id === id &&
            fieldContext.name === name &&
            fieldContext.mode === effectiveMode &&
            fieldContext.label === label &&
            fieldContext.placeHolder === placeHolder &&
            fieldContext.inputClass === inputClass &&
            prevState.fieldContext.labelClass === labelClass
        )
        {
            // yes -> no update
            //console.log("NO FIELD-CONTEXT UPDATE");
            return null;
        }

        const qualifiedName = formConfig.getPath(name);
        const path = toPath(qualifiedName);

        let fieldId;
        let effectiveLabel;
        const fieldType = formConfig.schema.resolveType(formConfig.type, path);

        if (name && name.length)
        {
            const lastSegment = path[path.length - 1];
            fieldId = id || "field-" + formConfig.type + "-" + qualifiedName;
            effectiveLabel = typeof label === "string" ? label : formConfig.options.lookupLabel(formConfig, lastSegment);
        }
        else
        {
            // XXX: solve issue
            throw new Error("It does happen after all");
            // fieldId = id;
            // effectiveLabel = label || "";
        }

        // update field state
        let newFieldContext = {
            name,
            fieldId,
            fieldType,
            qualifiedName,
            path,
            label: effectiveLabel,
            fieldInstance: prevState.fieldInstance,
            autoFocus,
            mode: effectiveMode,
            effectiveMode,
            placeholder,
            inputClass,
            labelClass,
            tooltip
        };

        const { validation } = formConfig.options;

        if (validation && validation.fieldContext)
        {
            validation.fieldContext(newFieldContext)
        }

        return {
            fieldContext: newFieldContext
        };
    }

    onChange = ev => {

        const { target } = ev;

        const { formConfig } = this.props;
        const { fieldContext : { fieldType } } = this.state;

        const { name } = target;

        const value = target.type === "checkbox" ? target.checked : target.value;

        //console.log("onChange", fieldType, name, value);

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
        const { children } = this.props;
        const { fieldContext } = this.state;

        //console.log("RENDER FIELD", fieldContext);

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

export default withFormConfig(
    observer(
        Field
    )
)
