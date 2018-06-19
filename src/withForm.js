import React from "react"

import Form from "./Form";
import getDisplayName from "./util/getDisplayName";

/**
 * Convenience HOC that render a domainql-form around the wrapped component, providing
 * it with the form config as props
 *
 * @param {ReactElement} Component      component to enhance
 * @param {object} formProps            props for the <Form/> 
 *
 * @return {function} Component that will automatically receive a "formConfig" prop
 */
export default function(Component, formProps)
{
    return class extends React.Component
    {
        static displayName = "withForm(" + getDisplayName(Component) + ")";

        onSubmit = (value, actions) => this._component.props.onSubmit(value, actions);

        render()
        {
            const { value } = this.props;
            return (
                <Form
                    { ... formProps}
                    onSubmit={ this.onSubmit }
                    value={ value }
                >
                {
                    this.renderWithFormConfig
                }
                </Form>
            );
        }

        renderWithFormConfig = formConfig => (
            <Component
                ref={ c => this._component = c }
                { ... this.props }
                formConfig={ formConfig }
            />
        )
    }
}
