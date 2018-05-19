import React from "react"
import PropTypes from "prop-types"
import get from "lodash.get"
import FormConfig from "./FormConfig"
import { GQLFormContext } from "./GQLForm"


/**
 * Helper to render a static value without form or form field.
 */
class StaticText extends React.Component {

    static propTypes = {
        type: PropTypes.string.isRequired,
        value: PropTypes.any,
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
        return (
            <GQLFormContext.Consumer>
                {
                    this.renderWithFormContext
                }
            </GQLFormContext.Consumer>
        )
    }

    renderWithFormContext = formContext => {
        const { name, value, type, inputSchema } = this.props;

        let result, resultType;
        if (name)
        {
            const path = formContext.getPath(name);
            resultType = inputSchema.resolveType(formContext.type, path);
            result = get(value, path);
        }
        else
        {
            resultType = inputSchema.getType(type);
            result = value;
        }

        return (
            FormConfig.renderStatic(resultType.name, result)
        );

    };

}

export default StaticText
