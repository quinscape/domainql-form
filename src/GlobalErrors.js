import React from "react"
import PropTypes from "prop-types"
import withFormConfig from "./withFormConfig";


/**
 * Searches for an HTML with the given name attribute and returns the id attribute of that HTML element or null if there
 * is no such element.
 * 
 * @param {HTMLFormElement} form      form element
 * @param {String} name               field name / path
 * @return {*}
 */
function getFieldId(form, name)
{
    if (!form)
    {
        return null;
    }

    const elem = form.querySelector("[name='" + name + "']");
    return elem && elem.getAttribute("id");
}

/**
 * Renders a global list of current errors or nothing.
 *
 * The error labels are cross-linked with the input fields by name attribute after mount.
 */
class GlobalErrors extends React.Component {

    state = {
        instance: this
    };

    static propTypes = {
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

    static defaultProps = {
        headingText: "Errors",
        text: null,
        heading: "h3"
    };


    static getDerivedStateFromProps(nextProps, prevState)
    {
        //console.log("GlobalErrors.getDerivedStateFromProps", {nextProps, prevState});

        const current = prevState.errors;
        const {errors: nextErrors} = nextProps.formConfig;

        if (!nextErrors || (current === nextErrors))
        {
            return null;
        }

        //console.log("Linearize errors", next);

        const errorIdList = GlobalErrors.findFieldIds(nextErrors, prevState.instance._listElem);

        return {
            errorIdList,
            errors: nextErrors
        }

    }

    componentDidMount()
    {
        const { errors } = this.props.formConfig;

        // if we have initial errors
        if (errors)
        {
            // we need to update extra once to update the target field ids of our error list
            const errorList = GlobalErrors.findFieldIds(errors, this._listElem);
            this.setState({
                errorList
            });
        }
    }

    static findFieldIds(errors, component)
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

        const length = errors.length;
        const errorIdList = new Array(length);

        for (let i = 0; i < length; i++)
        {
            const { path, errorMessages } = errors[i];

            errorIdList[i] = {
                fieldId: getFieldId(form, path),
                path,
                errorMessages
            }
        }

        return errorIdList;
    }


    render()
    {
        const { heading, headingText, text } = this.props;
        const { errorIdList } = this.state;

        //console.log({ errorIdList });

        const errors = [];

        errorIdList.forEach(entry => {
            const { fieldId, path, errorMessages } = entry;

            // the first error is the preserved user input
            for (let i = 1; i < errorMessages.length; i++)
            {
                const err = errorMessages[i];
                errors.push(
                    <li key={ path + i }>
                        <label
                            className="text-danger"
                            htmlFor={ fieldId }
                            data-path={ fieldId ? null : path }
                        >
                            {
                                err
                            }
                        </label>
                    </li>
                );
            }

        });

        return (
            <div className="global-errors" style={{
                display: !errorIdList.length ? "none" : null
            }}>
                {
                    headingText && React.createElement(heading, null, headingText)
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
                        errors
                    }
                </ul>
            </div>
        );
    }
}


export default withFormConfig(GlobalErrors)
