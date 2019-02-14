import React, { useMemo } from "react"
import cx from "classnames"
import PropTypes from "prop-types"
import FormConfig, { FormConfigContext } from "./FormConfig";
import FORM_CONFIG_PROP_TYPES from "./FormConfigPropTypes"
import useFormConfig from "./useFormConfig";

/**
 * A form block defining a changed form configuration for the fields
 * contained within.
 */
const FormBlock = props => {

    const { className, style, children } = props;

    const parentConfig = useFormConfig();

    const formConfig = useMemo(
        () => {

            if (!parentConfig || !parentConfig.schema || !parentConfig.type)
            {
                throw new Error("<FormBlock/> should only be used inside a <Form/>");
            }

            const formConfig = new FormConfig(
                FormConfig.mergeOptions(
                    parentConfig.options,
                    props
                ),
                parentConfig.schema
            );

            formConfig.setFormContext(
                parentConfig.type,
                props.basePath || parentConfig.basePath,
                parentConfig.root,
                parentConfig.setRoot,
                parentConfig.errors,
                parentConfig.setErrors
            );

            return formConfig
        },
        []
    );



    return (
        <FormConfigContext.Provider value={ formConfig }>
            <div className={ cx("dql-block", className) } style={ style }>
                {
                    children
                }
            </div>
        </FormConfigContext.Provider>
    );

};

FormBlock.propTypes = {
    /**
     * Additional HTML class for this form block
     */
    className: PropTypes.string,

    /**
     * Optional property to define a common base path for the fields contained within. (e.g. basePath="foos.12" would prefix all fields' name
     * attributes so that &lt;Field name="name"/&gt; would end up being &lt;Field name="foos.12.name"/&gt;
     */
    basePath: PropTypes.string,
    /**
     * Additional CSS styles for this form block.
     */
    style: PropTypes.object,
    ... FORM_CONFIG_PROP_TYPES
};

export default FormBlock
