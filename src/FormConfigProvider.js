import React from "react"
import PropTypes from "proptypes"

import FormConfig from "./FormConfig"
import FORM_CONFIG_PROP_TYPES from "./FormConfigPropTypes"

import InputSchema from "./InputSchema";


/**
 * Allows the definition defaults for form config options and schema at the top of the application component hierarchy.
 */
class FormConfigProvider extends React.Component {

    state = FormConfigProvider.getDerivedStateFromProps(this.props, null);

    static propTypes = {
        // provides the input schema for all child <Form/> components.
        schema: PropTypes.oneOfType([
            PropTypes.instanceOf(InputSchema),
            PropTypes.object
        ]),
        // default Form configaration properties for all child <Form/> components.
        ... FORM_CONFIG_PROP_TYPES
    };

    static getDerivedStateFromProps(nextProps, prevState)
    {
        const formConfig = new FormConfig(nextProps, nextProps.schema);

        if (prevState && formConfig.equals(prevState.formConfig))
        {
            return null;
        }

        return {
            formConfig
        };
    }

    render()
    {
        const { children } = this.props;

        return (
            <FormConfig.Provider value={ this.state.formConfig }>
                {
                    children
                }
            </FormConfig.Provider>
        )
    }
}

export default FormConfigProvider
