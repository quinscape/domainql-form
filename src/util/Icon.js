import React from "react"
import cx from "classnames"
import PropTypes from "prop-types"


/**
 * Bootstrap 4 classes for the symbolic icon family names.
 *
 * @type {{REGULAR: string, DUOTONE: string, LIGHT: string, SOLID: string, BRAND: string}}
 */
const familyClasses = {
    SOLID : "fas",
    REGULAR : "far",
    LIGHT : "fal",
    DUOTONE : "fad",
    BRAND : "fab"
};

/**
 * Simple FontAwesome Icon component
 */
const Icon = props =>  {

    const { className, family = Icon.SOLID, ... rest } = props;

    return (
        <i
            { ... rest }
            className={
                cx(
                    familyClasses[family],
                    className
                )
            }
        />
    );
};

Icon.SOLID = "SOLID";
Icon.REGULAR = "REGULAR";
Icon.LIGHT = "LIGHT";
Icon.DUOTONE = "DUOTONE";
Icon.BRAND = "BRAND";

Icon.propTypes = {
    /**
     * Fontawesome icon as class name
     */
    className: PropTypes.string.isRequired,
    /**
     * Optional tooltip / title
     */
    title: PropTypes.string,
    /**
     * true if icon is a brand icon
     */
    family: PropTypes.oneOf([
        "SOLID",
        "REGULAR",
        "LIGHT",
        "DUOTONE",
        "BRAND"
    ])
};

export default Icon
