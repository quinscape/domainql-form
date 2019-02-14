import React from "react"

import Form from "./Form";
import FormConfig from "./FormConfig";
import getDisplayName from "./util/getDisplayName";

/**
 * Convenience HOC that render a domainql-form around the wrapped component, providing
 * it with the form config as props
 *
 * @param {React.Element} Component      component to enhance
 * @param {object} formProps            props for the <Form/> 
 *
 * @return {function} Component that will automatically receive a "formConfig" prop
 */
export default function(Component, formProps)
{
    //console.log("withForm", Component, formProps);

    const enhanced = props => {

        const { value, onSubmit } = props;

        const options = FormConfig.mergeOptions({}, props);

        return (
            <Form
                { ... options }
                { ... formProps}
                onSubmit={ onSubmit }
                value={ value }
            >
                {
                    formConfig => (
                        <Component
                            { ... props }
                            formConfig={ formConfig }
                        />
                    )
                }
            </Form>
        );
    };

    enhanced.displayName = getDisplayName(Component);

    return enhanced;
}
