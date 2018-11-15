import React from "react"
import PropTypes from "prop-types"
import { comparer } from "mobx"
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

            const { value : prevValue } = oldConfig;
            const { value } = formConfig;

            if (!comparer.structural(prevValue, value))
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

    triggerSubmit = debounce( () => this.props.formConfig.submitForm(), this.props.timeout);

    render()
    {
        // render nothing
        return false;
    }
}

export default withFormConfig(AutoSubmit)
