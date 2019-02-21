import React from "react"

import Form from "./Form";
import FormConfig from "./FormConfig";
import getDisplayName from "./util/getDisplayName";

/**
 * Convenience HOC that render a domainql-form around the wrapped component, providing
 * it with the form config as props
 *
 * @param {React.Element} Component      component to enhance
 * @param {object} formProps             props for the <Form/>
 *
 * @return {function} Component that will automatically receive a "formConfig" prop
 */
export default function(Component, formProps)
{
    //console.log("withForm", Component, formProps);

    const EnhancedComponent = props => {

        const { value, options, onSubmit, ... restProps } = props;

        return (
            <Form
                { ... formProps}
                onSubmit={ onSubmit }
                value={ value }
                options={ options }
            >
                {
                    formConfig => (
                        <Component
                            { ... restProps }
                            formConfig={ formConfig }
                        />
                    )
                }
            </Form>
        );
    };

    EnhancedComponent.displayName = getDisplayName(Component);

    return EnhancedComponent;
}
