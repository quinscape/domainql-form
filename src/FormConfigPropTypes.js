import FieldMode from "./FieldMode";
import PropTypes from "prop-types"
import FormLayout from "./FormLayout";

export default {
    /**
     * Form layout: "DEFAULT" - Label on top of input. "HORIZONTAL" - label to the left of input in layout column
     * "INLINE" - inline field elements without form group element
     */
    layout: PropTypes.oneOf([FormLayout.DEFAULT, FormLayout.HORIZONTAL, FormLayout.INLINE]),
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
    mode: PropTypes.oneOf(FieldMode.values()),

    /**
     * High-level validation configuration object
     */
    validation: PropTypes.object,

    /**
     * Whether the form automatically does a (debounced) submit on every change.
     */
    autoSubmit: PropTypes.bool,

    /**
     * Timeout in milliseconds for submit debouncing.
     */
    submitTimeOut: PropTypes.number,

    /**
     * Render no label in inline mode at all. 
     */
    suppressLabels: PropTypes.bool,

    /**
     * Whether to protect the original observable value from changing by cloning (default: true)
     */
    isolation: PropTypes.bool
}
