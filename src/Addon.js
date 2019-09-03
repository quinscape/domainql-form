import React from "react"
import cx from "classnames"
import PropTypes from "prop-types"
import { observer as fnObserver } from "mobx-react-lite"

function addAddons(addons, elems, placementToAdd)
{
    for (let i = 0; i < addons.length; i++)
    {
        const addon = addons[i];

        const { placement } = addon.props;

        if (placement === placementToAdd)
        {
            elems.push(
                React.cloneElement(addon, {
                    key: i
                })
            )
        }
    }
}



/**
 * Addon component meant to go inside <Field/> or <TextArea/>
 */
const Addon = fnObserver(({placement = Addon.LEFT, text, className, children}) => {


    const kids = typeof children === "function" ? children() : children;

    return (
        <div    
            className={
                cx(
                    placement === Addon.LEFT ? "input-group-prepend" : "input-group-append",
                    className
                )
            }
        >
            {
                text ? ( <span className="input-group-text">{ kids }</span>) : kids
            }
        </div>
    );
});

Addon.LEFT = "LEFT";
Addon.RIGHT = "RIGHT";

Addon.propTypes = {
    /**
     *  if true, the input group children will be additionally wrapped in a <span className="input-group-text">
     */
    text: PropTypes.bool,

    /**
     * Additional classes to add to the addon element.
     */
    className: PropTypes.string,
    /**
     * Placement of the addon relative to the input field.
     */
    placement: PropTypes.oneOf([
        Addon.LEFT,
        Addon.RIGHT
    ])
};

/**
 * Filters a React children element and returns an array with the <Addon/> elements.
 *
 * @param  children      React children
 * @returns {Array<React.Element>} addons
 */
Addon.filterAddons = (children) =>
{
    return React.Children.toArray(children).filter(kid => kid.type === Addon);
};


/**
 * Renders the given field element with addons.
 *
 * @param {React.Element} fieldElem         field elem
 * @param {Array<React.Element>} addons     array of Addon elements
 *
 * @returns {React.Element} .input-group element with addons and field Element
 */
Addon.renderWithAddons = (fieldElem, addons) =>
{
    if (!addons || !addons.length)
    {
        return fieldElem;
    }

    const elems = [];

    addAddons(addons, elems, Addon.LEFT);
    elems.push(
        React.cloneElement(fieldElem, {
            key: "field"
        })
    );
    addAddons(addons, elems, Addon.RIGHT);

    return (
        <div
            className="input-group"
        >
            {
                elems
            }
        </div>
    )
};

export default Addon;
