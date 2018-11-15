import FieldMode from "./FieldMode";
import PropTypes from "prop-types"

export default {

    /**
     * True to use "horizontal" bootstrap form groups
     */
    horizontal: PropTypes.bool,
    /**
     * Additional label column class to use if in horizontal mode.
     */
    labelColumnClass: PropTypes.string,
    /**
     * Additional wrapper column class to use if in horizontal mode.
     */
    wrapperColumnClass: PropTypes.string,

    /**
     * Currency ISO code for Currency fields
     */
    currency: PropTypes.string,

    /**
     * True if the currency addon is on the right side of the input component.
     */
    currencyAddonRight: PropTypes.bool,

    /**
     * Optional function to look up a form field label based on formConfig and field name / path.
     */
    lookupLabel: PropTypes.func,

    /**
     * Default mode for input components within the Form. Setting this on a &lt;FormBlock&gt; or a &lt;Form&gt; will control
     * all fields inside the form block or form.
     */
    mode: PropTypes.oneOf(FieldMode.values())
}
