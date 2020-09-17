import React from "react"
import cx from "classnames"
import PropTypes from "prop-types"
import { observer as fnObserver } from "mobx-react-lite"


/**
 * Renders the given addons
 *
 * @param {Array<JSX.Element>} addons  array of addons
 * @param {String} placementToRender    placement to filter for
 * 
 * @return {JSX.Element}
 */
function renderAddons(addons, placementToRender)
{
    const elems = [];
    for (let i = 0; i < addons.length; i++)
    {
        const addon = addons[i];

        const { placement } = addon.props;

        if (placement === placementToRender)
        {
            elems.push(
                React.cloneElement(addon, {
                    key: i
                })
            )
        }
    }

    if (!elems.length)
    {
        return false;
    }

    return (
        <React.Fragment>
            {
                elems
            }
        </React.Fragment>
    )
}


/**
 * Returns true if the given addons contains LEFT or RIGHT addons, the true addons in the bootstrap sense.
 *
 * @param {Array<Addon>} addons array of addons
 *
 * @return {boolean} true if addons contains LEFT or RIGHT addons
 */
function hasBootstrapAddons(addons)
{
    if (addons)
    {
        for (let i = 0; i < addons.length; i++)
        {
            const { placement } = addons[i].props;

            if (placement === Addon.LEFT || placement === Addon.RIGHT)
            {
                return true;
            }
        }
    }
    return false;
}



/**
 * Addon component meant to go inside <Field/> or <TextArea/>
 */
const Addon = fnObserver(({placement = Addon.RIGHT, text, className, moveIfPlainText, children}) => {

    // XXX: moveIfPlainText is handled during field context creation

    const kids = typeof children === "function" ? children() : children;

    if (placement === Addon.BEFORE || placement === Addon.AFTER)
    {
        return (
            <span className={ className }>
                {
                    kids
                }
            </span>
        );
    }

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

Addon.BEFORE = "BEFORE";
Addon.LEFT = "LEFT";
Addon.RIGHT = "RIGHT";
Addon.AFTER = "AFTER";

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
     * Placement of the addon relative to the input field. BEFORE and AFTER are not addons in the boostrap sense but just
     * elements added before or after the field element / input group.
     */
    placement: PropTypes.oneOf([
        Addon.BEFORE,
        Addon.LEFT,
        Addon.RIGHT,
        Addon.AFTER
    ]),

    /**
     * If true, move true bootstrap addons (LEFT/RIGHT) to the outsides ( => BEFORE / AFTER) if the field is in plain text
     * mode. This is useful in situations where you want the addon to appear even when the field is plain text, but you
     * want to use the nicer looking visual addons when not.
     *
     * (Default is false)
     */
    moveIfPlainText: PropTypes.bool
};

/**
 * Filters a React children element and returns an array with the <Addon/> elements.
 *
 * @param  children      React children
 * @returns {Array<JSX.Element>} addons
 */
Addon.filterAddons = (children) =>
{
    return React.Children.toArray(children).filter(kid => kid.type === Addon);
};


/**
 * Renders the given field element with addons.
 *
 * @param {JSX.Element} fieldElem         field elem
 * @param {Array<JSX.Element>} addons     array of Addon elements
 *
 * @returns {JSX.Element} .input-group element with addons and field Element
 */
Addon.renderWithAddons = (fieldElem, addons) =>
{
    if (!addons || !addons.length)
    {
        return fieldElem;
    }

    if (!hasBootstrapAddons(addons))
    {
        // we render without input-group
        return (
            <React.Fragment>
                {
                    renderAddons(addons, Addon.BEFORE)
                }
                {
                    fieldElem
                }
                {
                    renderAddons(addons, Addon.AFTER)
                }
            </React.Fragment>
        );
    }

    return (
        <React.Fragment>
            {
                renderAddons(addons, Addon.BEFORE)
            }
            <div
                className="input-group"
            >
                {
                    renderAddons(addons, Addon.LEFT)
                }
                {
                    fieldElem
                }
                {
                    renderAddons(addons, Addon.RIGHT)
                }
            </div>
            {
                renderAddons(addons, Addon.AFTER)
            }
        </React.Fragment>
    )
};

export default Addon;
