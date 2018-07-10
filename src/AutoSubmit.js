import React from "react"
import PropTypes from "prop-types"
import withFormConfig from "./withFormConfig";

import debounce from "lodash.debounce"
import isEqual from "lodash.isequal"


/**
 * A component that renders no output but causes a debounced auto-submit of the form whenever its content changes.
 * 
 */
class AutoSubmit extends React.Component {

    static propTypes = {
        /**
         * Debounce timeout in milliseconds.
         */
        timeout: PropTypes.number
    };

    static defaultProps = {
        timeout: 300
    };

    static getDerivedStateFromProps(nextProps, prevState)
    {
        const { formConfig } = nextProps;

        //console.log("AutoSubmit.getDerivedStateFromProps", nextProps, prevState);

        if (!prevState.formConfig)
        {
            //console.log("NO prevState or config, set ", formConfig);

            return {
                formConfig
            };
        }

        if (prevState.formConfig !== formConfig)
        {
            const { formConfig : oldConfig, instance } = prevState;

            const { values : prevValues } = oldConfig.formikProps;
            const { values } = formConfig.formikProps;

            if (!isEqual(prevValues, values))           
            {
                //console.log("triggerSubmit");
                instance.triggerSubmit();
            }

            //console.log("Update ", prevValues, values, formConfig);

            return {
                formConfig
            }
        }

        return null;
    }

    state = {
        instance: this
    };

    triggerSubmit = debounce( () => this.props.formConfig.formikProps.submitForm(), this.props.timeout);

    render()
    {
        // render nothing
        return false;
    }
}

export default withFormConfig(AutoSubmit)
