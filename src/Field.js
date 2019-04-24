import React, { useMemo } from "react"
import toPath from "lodash.topath"

import GlobalConfig from "./GlobalConfig"

import PropTypes from "prop-types"

import FieldMode from "./FieldMode"

import { observer as fnObserver } from "mobx-react-lite"
import useFormConfig from "./useFormConfig";

import { NON_NULL, SCALAR} from "./kind"

function buildType(type)
{
    const nonNull = type.indexOf("!") === type.length - 1;

    if (nonNull)
    {
        return {
            kind: NON_NULL,
            ofType: {
                kind: SCALAR,
                name: type.substr(0, type.length - 1)
            }
        };
    }
    else
    {
        return {
            kind: SCALAR,
            name: type
        };
    }

}


/**
 * Renders a bootstrap 4 form group with an input field for the given name/path within the current form object. The actual
 * field rendered is resolved by the render rules in GlobalConfig.js ( See ["Form Customization"](./customization.md) for details)
 */

const Field = fnObserver(props => {

    const formConfig = useFormConfig();

    const { name, mode, inputClass, labelClass, children } = props;

    const fieldContext = useMemo(
        () => {
            const { id, label, autoFocus, tooltip, placeholder, type } = props;

            const qualifiedName = formConfig.getPath(name);
            const effectiveMode = mode || formConfig.options.mode;

            const path = toPath(qualifiedName);

            let fieldId;
            let effectiveLabel;
            const fieldType = type ? buildType(type) : formConfig.schema.resolveType(formConfig.type, path);

            if (name && name.length)
            {
                const lastSegment = path[path.length - 1];
                fieldId = id || "field-" + formConfig.type + "-" + qualifiedName;
                effectiveLabel =
                    typeof label === "string" ? label : formConfig.options.lookupLabel(formConfig, lastSegment);
            }
            else
            {
                // XXX: solve issue
                throw new Error("It does happen after all");
                // fieldId = id;
                // effectiveLabel = label || "";
            }

            // update field state
            const newFieldContext = {
                name,
                fieldId,
                fieldType,
                qualifiedName,
                path,
                autoFocus,
                placeholder,
                inputClass,
                labelClass,
                tooltip,

                mode: effectiveMode,
                label: effectiveLabel,

                handleChange: ev => {

                    const { target } = ev;

                    const value = target.type === "checkbox" ? target.checked : target.value;

                    //console.log("Field.handleChange", fieldType, name, value);

                    formConfig.handleChange(newFieldContext, value);
                },

                handleBlur: ev => {

                    const { target: { value } } = ev;

                    //console.log("Field.handleBlur", fieldType, name, value);
                    
                    formConfig.handleBlur(newFieldContext, value);
                }
            };

            const { validation } = formConfig.options;

            if (validation && validation.fieldContext)
            {
                validation.fieldContext(newFieldContext)
            }

            return newFieldContext;

        },
        [ formConfig, name, mode, inputClass, labelClass ]
    );

    //console.log("RENDER FIELD", fieldContext);

    if (typeof children === "function")
    {
        return (
            <React.Fragment>
                {
                    children(formConfig, fieldContext)
                }
            </React.Fragment>
        );
    }
    else
    {
        const renderFn = GlobalConfig.getRenderFn(formConfig,fieldContext);
        return renderFn(formConfig, fieldContext);

    }

});

Field.propTypes = {
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


export default Field;
