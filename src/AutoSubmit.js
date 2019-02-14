import React, { useCallback } from "react"
import PropTypes from "prop-types"
import { comparer } from "mobx"

import debounce from "lodash.debounce"
import useFormConfig from "./useFormConfig";
import usePrevious from "./usePrevious";

/**
 * A component that renders no output but causes a debounced auto-submit of the form whenever its content changes.
 * 
 */
const AutoSubmit = props => {

    const formConfig = useFormConfig();
    const { timeout } = props;


    const triggerSubmit = useCallback( () => debounce( () => formConfig.submitForm(), timeout), [
        formConfig,
        timeout
    ]);

    const root = formConfig.root;
    const prevRoot = usePrevious(root);

    if (!comparer.structural(prevRoot, root))
    {
        triggerSubmit();
    }
    
    // render nothing
    return false;
};

AutoSubmit.propTypes = {
    /**
     * Debounce timeout in milliseconds.
     */
    timeout: PropTypes.number
};

AutoSubmit.defaultProps = {
    timeout: 300
};

export default AutoSubmit
