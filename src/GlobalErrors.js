import React, { useEffect, useRef, useState } from "react"
import { observer as fnObserver } from "mobx-react-lite"
import PropTypes from "prop-types"
import useFormConfig from "./useFormConfig";
import { toJS } from "mobx";
import { i18n } from "./util/TranslationHelper";


/**
 * Searches for an HTMLElement with that matches the rootId as well as the name
 * and returns the id attribute of that element or null if there is no such element.
 *
 * @param {HTMLFormElement} form      form element
 * @param {String} name               field name / path
 * @return {*}
 */
function getFieldId(rootId, name)
{
    const elem = document.querySelector(`form[data-domain-id="${rootId}"] [name="${name}"]`);
    return elem?.getAttribute("id");
}


function generateErrorList(errors)
{
    const length = errors.length;
    const errorIdList = new Array(length);

    for (let i = 0; i < length; i++)
    {
        const {rootId, path, errorMessages} = errors[i];
        const fieldId = getFieldId(rootId, path);

        errorIdList[i] = {
            fieldId,
            path,
            errorMessages
        }
    }

    return errorIdList;
}


/**
 * Renders a global list of current errors or nothing.
 *
 * The error labels are cross-linked with the input fields by name attribute after mount.
 */
const GlobalErrors = fnObserver(props => {

    const formConfig = useFormConfig();

    const [ counter, setCounter ] = useState(0);

    const errors = formConfig.formContext.getErrors();

    const numErrors = errors.length;

    const errorIdList = generateErrorList(errors);

    useEffect(
        () => {
            if (errors.length && !errorIdList.length)
            {
                //console.log("ERRORS", errors);
                // this only happens if we have form errors in the very first render
                // so we trigger a rerender so that our <label for=""> references are right even in that case
                setCounter(counter + 1);
            }
        },
        []
    );

    const { heading, headingText, text} = props;

    const errorElements = [];

    errorIdList.forEach(entry => {
        const { fieldId, path, errorMessages } = entry;

        // the first error is the preserved user inpu
        for (let i = 1; i < errorMessages.length; i++)
        {
            const err = errorMessages[i];
            errorElements.push(
                <li key={ path + i } className="global-error">
                    <label
                        className="global-error-message text-danger"
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

    //console.log({ errorState });

    return (
        <div
            className="global-errors"
            data-errors={ numErrors }
        >
            <div
                style={{
                    display: !errorElements.length ? "none" : null
                }}>
                {
                    headingText && React.createElement(heading, null, i18n(headingText))
                }
                {
                    text &&
                    <p>
                        {
                            text
                        }
                    </p>
                }
                <ul className="global-error-list">
                    {
                        errorElements
                    }
                </ul>
            </div>
        </div>
    );
});

GlobalErrors.propTypes = {
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

GlobalErrors.defaultProps = {
    headingText: "Errors",
    text: "",
    heading: "h3"
};

export default GlobalErrors
