import React from "react"
import cx from "classnames"
import PropTypes from "prop-types"


/**
 * Simple FontAwesome Icon component
 */
const Icon = props =>  {
    
    const { className, brand, tooltip, ... rest} = props;

    return (
        <i
            { ... rest }
            title={ tooltip }
            className={
                cx( brand ? "fab" : "fas", className)
            }
        />
    );
};

Icon.propTypes = {
    className: PropTypes.string.isRequired,
    tooltip: PropTypes.string,
    brand: PropTypes.bool
};

export default Icon
