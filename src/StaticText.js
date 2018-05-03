import React from "react"
import PropTypes from "prop-types"
import get from "lodash.get"
import toPath from "lodash.topath"

import InputSchema from "./InputSchema"
import FieldRenderers from "./field-renderers"


/**
 * Helper to render a static value without form or form field.
 */
class StaticText extends React.Component {

    static propTypes = {
        inputSchema: PropTypes.instanceOf(InputSchema).isRequired,
        type: PropTypes.string.isRequired,
        value: PropTypes.any.isRequired,
        name: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.array
        ])
    };

    shouldComponentUpdate(nextProps, nextState) {

        const { props } = this;

        return (
            props.type !== nextProps.type ||
            props.value !== nextProps.value ||
            props.name !== nextProps.name
        );
    }

    render()
    {
        const { name, value, type, inputSchema } = this.props;

        let result, resultType;
        if (name)
        {
            const path = toPath(name);
            resultType = inputSchema.resolveType(type, path);
            result = get(value, path);
        }
        else
        {
            resultType = inputSchema.getType(type);
            result = value;
        }
        return (
            FieldRenderers.renderStatic(resultType.name, result)
        );

    };

}

export default StaticText
