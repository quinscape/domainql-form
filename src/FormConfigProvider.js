import React, { useMemo } from "react"
import PropTypes from "prop-types"

import FormConfig, { FormConfigContext } from "./FormConfig";
import FORM_CONFIG_PROP_TYPES from "./FormConfigPropTypes"

import InputSchema from "./InputSchema";

/**
 * Allows the definition defaults for form config options and schema at the top of the application component hierarchy.
 */
const FormConfigProvider = props => {

    const { options, schema, children } = props;

    const formConfig = useMemo(() => {
        return new FormConfig(options, schema, null);
    }, [ options, schema ]);

    return (
        <FormConfigContext.Provider value={ formConfig }>
            {
                children
            }
        </FormConfigContext.Provider>
    )
};

FormConfigProvider.propTypes = {
    /**
     * provides the input schema for all child <Form/> components.
     */
    schema: PropTypes.oneOfType([
        PropTypes.instanceOf(InputSchema),
        PropTypes.object
    ]),

    /**
     * Default form options
     */
    options: PropTypes.shape(
        FORM_CONFIG_PROP_TYPES
    )
};

export default FormConfigProvider
