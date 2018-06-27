import React from "react"
import PropTypes from "prop-types"
import withFormConfig from "./withFormConfig";

function getFieldId(form, name)
{
    if (!form)
    {
        return null;
    }

    const elem = form.querySelector("[name='" + name + "']");
    return elem && elem.getAttribute("id");
}

function pushErrors(errorList, value, name, form)
{
    if (!value)
    {
        return;
    }

    if (value && typeof value === "object")
    {
        if (Array.isArray(value))
        {
            for (let i = 0; i < value.length; i++)
            {
                const e = value[i];

                pushErrors(errorList, e, name + "." + i, form)
            }
        }
        else
        {
            for (let propName in value)
            {
                if (value.hasOwnProperty(propName))
                {
                    const e = value[propName];

                    pushErrors(errorList, e, name + "." + propName, form)
                }
            }
        }
    }
    else
    {
        errorList.push({
            name,
            errorMessage: value,
            fieldId: getFieldId(form, name)
        })
    }
}

class GlobalErrors extends React.Component {


    static propTypes={
        /**
         * Text to use as heading (empty = no heading).
         */
        headingText: PropTypes.string,
        /**
         * Additional text below the headline
         */
        text: PropTypes.string,
        /**
         * Tag to surround the errors heading with
         */
        heading: PropTypes.string
    };
    static defaultProps={
        headingText: "Errors",
        text: null,
        heading: "h3"
    };

    static getDerivedStateFromProps(nextProps, prevState)
    {
        //console.log("GlobalErrors.getDerivedStateFromProps", {nextProps, prevState});

        const current = prevState ? prevState.errors : null;
        const { errors : next } = nextProps.formConfig.formikProps;

        if (!next || (prevState && current === next) )
        {
            return null;
        }

        //console.log("Linearize errors", next);

        const errorList = GlobalErrors.linearizeErrors( next, null);

        return {
            errorList,
            errors : next
        }

    }

    componentDidMount()
    {
        const { errors } = this.props.formConfig.formikProps;
        if (errors)
        {
            const errorList = GlobalErrors.linearizeErrors(errors, this._listElem);
            this.setState({
                errorList
            });
        }
    }

    componentDidUpdate(prevProps, prevState)
    {
        const { errors : prevErrors } = prevProps.formConfig.formikProps;
        const { errors } = this.props.formConfig.formikProps;

        if( prevErrors !== errors )
        {
            const errorList = GlobalErrors.linearizeErrors(errors, this._listElem);

            this.setState({
                errorList,
                errors
            });
        }
    }

    static linearizeErrors(errors, component)
    {
        let form = null;
        if (component)
        {
            form = component;
            while (form.tagName !== "FORM")
            {
                form = form.parentNode;
            }
        }

        const errorList = [];

        for (let name in errors)
        {
            if (errors.hasOwnProperty(name))
            {
                const value = errors[name];

                pushErrors(errorList, value, name, form);
            }
        }

        return errorList;
    }

    state = GlobalErrors.getDerivedStateFromProps(this.props);

    render()
    {
        const { heading, headingText, text } = this.props;
        const { errorList } = this.state;

        //console.log({errorList});

        return (
            <div className="global-errors" style={{
                display: !errorList.length ? "none" : null
            }}>
                {
                    headingText && React.createElement( heading, null, headingText)
                }
                {
                    text &&
                    <p>
                    {
                        text
                    }
                    </p>
                }
                <ul
                    ref={ elem => this._listElem = elem }
                >
                    {
                        errorList.map( entry => {

                            const { fieldId, name, errorMessage } = entry;

                            return (
                                <li key={ name }>
                                    <label
                                        className="text-danger"
                                        htmlFor={ fieldId }
                                        data-path={ fieldId ? null : name }
                                    >
                                        {
                                            errorMessage
                                        }
                                    </label>
                                </li>
                            );
                        })
                    }
                </ul>
            </div>
        );
    }
}

export default withFormConfig(GlobalErrors)
