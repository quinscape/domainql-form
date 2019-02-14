import React from "react"
import PropTypes from "prop-types"
import get from "lodash.get"
import GlobalConfig from "./GlobalConfig"
import useFormConfig from "./useFormConfig";


/**
 * Helper to render a static value without form or form field.
 */
const StaticText = props => {

    const formConfig = useFormConfig();

    const { name, value, type, schema } = props;

    let result, resultType;
    if (name)
    {
        const path = formConfig.getPath(name);
        resultType = schema.resolveType(formConfig.type, path);
        result = get(value, path);
    }
    else
    {
        resultType = schema.getType(type);
        result = value;
    }

    return (
        GlobalConfig.renderStatic(resultType.name, result)
    );
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
