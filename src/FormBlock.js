import React from "react"
import cx from "classnames"
import PropTypes from "prop-types"

import withFormConfig from "./withFormConfig";
import FormConfig from "./FormConfig"
import FORM_CONFIG_PROP_TYPES from "./FormConfigPropTypes"


/**
 * A form block defining a changed form configuration for the fields
 * contained within.
 */
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
            parentConfig.value
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

    render()
    {
        const { className, style, children } = this.props;

        return (
            <FormConfig.Provider value={ this.state.formConfig }>
                <div className={ cx("dql-block", className) } style={ style }>
                    {
                        children
                    }
                </div>
            </FormConfig.Provider>
        );
    };
}

export default withFormConfig(FormBlock)
