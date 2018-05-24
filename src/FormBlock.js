import React from "react"
import cx from "classnames"
import PropTypes from "prop-types"

import withFormConfig from "./withFormConfig";
import FormConfig, { FORM_CONFIG_PROPTYPES } from "./FormConfig";

class FormBlock extends React.Component {

    static getDerivedStateFromProps(nextProps, prevState)
    {
        const { formConfig: parentConfig } = nextProps;

        if (!parentConfig || !parentConfig.schema || !parentConfig.type)
        {
            throw new Error("<FormBlock/> should only be used inside a <Form/>");
        }

        const formConfig = new FormConfig(
            FormConfig.mergeOptions(
                parentConfig.options,
                nextProps
            ),
            parentConfig.schema
        );
        
        formConfig.setFormContext(
            parentConfig.type,
            nextProps.basePath || parentConfig.basePath,
            parentConfig.formikProps
        );

        // did the form config actually change since last time?
        if (prevState && prevState.formConfig.equals(formConfig))
        {
            // no -> no update
            return null;
        }

        // update form config in local state
        return {
            formConfig
        };
    }

    state = FormBlock.getDerivedStateFromProps(this.props);

    static propTypes = {
        className: PropTypes.string,
        basePath: PropTypes.string,
        style: PropTypes.object,
        ... FORM_CONFIG_PROPTYPES
    };

    render()
    {
        const { className, style, children } = this.props;

        return (
            <FormConfig.Provider value={ this.state.formConfig }>
                <div className={ cx("gql-block", className) } style={ style }>
                    {
                        children
                    }
                </div>
            </FormConfig.Provider>
        );
    };
}

export default withFormConfig(FormBlock)
