import React, { useState } from "react"
import PropTypes from "prop-types"
import FormGroup from "./FormGroup"
import Field from "./Field"

let count = 0;

/**
 * Custom form group to render arbitrary content encapsulated by a form group with label. If you need an actual
 * custom input, use Field in your own component. (see e.g. TextArea as an example of a custom field)
 */
const CustomGroup  = props => {

    const [ fieldId ] = useState( () => props.id || "custom-" + count++ );

    return (
        <Field
            { ...this.props }
            id={ fieldId }
            name=""
        >
            {
                (formConfig, fieldContext) => {

                    const { label, labelClass, children } = this.props;

                    if (typeof children !== "function")
                    {
                        throw new Error("CustomGroup expects a single function child")
                    }

                    return (
                        <FormGroup
                            { ... fieldContext }
                            formConfig={ formConfig }
                            label={ label }
                            labelClass={ labelClass }
                        >
                            {
                                children(fieldContext)
                            }
                        </FormGroup>
                    );
                }
            }
        </Field>
    );
};

CustomGroup.propTypes = {
    // label text
    label: PropTypes.string.isRequired,
    children: PropTypes.func.isRequired,
    // optional field id
    id: PropTypes.string,
    // optional label class
    labelClass: PropTypes.string
};

CustomGroup.defaultProps = {
    rows: 5,
    columns: 60
};

export default CustomGroup
