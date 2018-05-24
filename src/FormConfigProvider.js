import React from "react"
import PropTypes from "proptypes"

import FormConfig, { FORM_CONFIG_PROPTYPES } from "./FormConfig"
import InputSchema from "./InputSchema";

class FormConfigProvider extends React.Component {

    state = FormConfigProvider.getDerivedStateFromProps(this.props, null);

    static propTypes = {
        // provides the input schema for all child <Form/> components.
        schema: PropTypes.oneOfType([
            PropTypes.instanceOf(InputSchema),
            PropTypes.object
        ]),
        // default Form configaration properties for all child <Form/> components.
        ... FORM_CONFIG_PROPTYPES
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
