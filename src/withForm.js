import React from "react"

import Form from "./Form";
import getDisplayName from "./util/getDisplayName";


/**
 * Convenience HOC that render a domainql-form around the wrapped component, providing
 * it with the form config as props
 *
 * The <Form/> component receives the rest of the config object without the options documented below.
 *
 * You are supposed to pass the current Form base values as `value` prop to the enhanced component. Same goes for
 * `onSubmit`, `onReset` and custom `options`
 *
 * @param {React.Component} Component       component to enhance
 * @param {object} formProps                Props object passed through to the <Form/> component
 *                                          (should not contain `value`, `options`, `onSubmit` or `onReset`)
 *
 * @return {function} Component that will automatically receive a "formConfig" prop and the rest of enhanced component props
 *                    minus the ones passed on to <Form/>
 */
export default function(Component, formProps)
{
    //console.log("withForm", Component, formProps);

    const EnhancedComponent = props => {

        const { value, options, onSubmit, onReset, ... restProps } = props;

        return (
            <Form
                { ... formProps}
                onSubmit={ onSubmit }
                onReset={ onReset }
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
