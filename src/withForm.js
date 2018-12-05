import React from "react"

import Form from "./Form";
import FormConfig from "./FormConfig";
import getDisplayName from "./util/getDisplayName";

import { observer } from "mobx-react"

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
    return class extends React.Component
    {
        static displayName = getDisplayName(Component);

        render()
        {
            const { value, validate, onSubmit } = this.props;

            const options = FormConfig.mergeOptions({}, this.props);

            return (
                <Form
                    { ... formProps}
                    validate={ validate }
                    onSubmit={ onSubmit }
                    value={ value }
                    { ... options }
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
