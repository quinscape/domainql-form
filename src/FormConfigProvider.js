import React, { useMemo } from "react"
import PropTypes from "prop-types"

import FormConfig, { FormConfigContext, FORM_OPTION_NAMES } from "./FormConfig";
import FORM_CONFIG_PROP_TYPES from "./FormConfigPropTypes"

import InputSchema from "./InputSchema";


/**
 * Extracts an memo input array of all form props
 *
 * @param props         props object
 *
 * @return {Array<*>} memo inputs for all form props
 */
export function extractFormPropValues(props)
{
    const numOpts = FORM_OPTION_NAMES.length;
    const list = new Array(numOpts);

    for (let i = 0; i < numOpts; i++)
    {
        list[i] = props[FORM_OPTION_NAMES[i]];
    }
    return list;
}


/**
 * Allows the definition defaults for form config options and schema at the top of the application component hierarchy.
 */
const FormConfigProvider = props => {

    const { children } = props;

    const formConfig = useMemo(() => {
        return new FormConfig(props, props.schema);
    }, extractFormPropValues(props));

    return (
        <FormConfigContext.Provider value={ formConfig }>
            {
                children
            }
        </FormConfigContext.Provider>
    )
};

FormConfigProvider.propTypes = {
    // provides the input schema for all child <Form/> components.
    schema: PropTypes.oneOfType([
        PropTypes.instanceOf(InputSchema),
        PropTypes.object
    ]),
    // default Form configaration properties for all child <Form/> components.
    ... FORM_CONFIG_PROP_TYPES
};


export default FormConfigProvider
