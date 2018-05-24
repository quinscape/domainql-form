import React from "react"
import PropTypes from "prop-types"
import get from "lodash.get"
import GlobalConfig from "./GlobalConfig"
import FormConfig from "./FormConfig"


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
            <FormConfig.Consumer>
                {
                    this.renderWithFormContext
                }
            </FormConfig.Consumer>
        )
    }

    renderWithFormContext = formConfig => {
        const { name, value, type, schema } = this.props;

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

}

export default StaticText
