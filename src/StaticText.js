import React from "react"
import PropTypes from "prop-types"
import get from "lodash/get"
import GlobalConfig from "./GlobalConfig"
import useFormConfig from "./useFormConfig";


/**
 * Helper to render a static value without form or form field.
 */
const StaticText = props => {

    const formConfig = useFormConfig();

    const { name, value, type, schema } = props;

    if (name)
    {
        const path = formConfig.getPath(name);
        const typeName = type ? type : schema.resolveType(formConfig.type, path).name;
        const result = get(value, path);

        return (
            GlobalConfig.renderStatic(typeName, result)
        );
    }
    else
    {
        return (
            GlobalConfig.renderStatic( type, value)
        );
    }

};

StaticText.propTypes = {
    type: PropTypes.string.isRequired,
    value: PropTypes.any,
    name: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.array
    ])
};

export default StaticText
