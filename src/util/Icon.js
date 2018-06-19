import React from "react"
import PropTypes from "prop-types"


/**
 * Simple FontAwesome Icon component
 */
class Icon extends React.Component {

    static propTypes = {
        className: PropTypes.string.isRequired,
        title: PropTypes.string
    };

    render()
    {

        const { className } = this.props;

        return (
            <i
                {... this.props}
                className={"fas " + className}
            />
        );
    }
}

export default Icon
