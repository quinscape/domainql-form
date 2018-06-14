import React from "react"

import FormConfig from "./FormConfig"

/**
 * Convenience HOC that provides the current FormConfig as formConfig prop to the wrapper component, the advantage
 * over just using FormConfig.Provider being that the formConfig prop is also accessible in lifecycle methods and event
 * handlers.
 *
 * @param {ReactElement} Component
 * @return {function} Component that will automatically receive a "formConfig" prop
 */
export default function(Component)
{
    return class extends React.Component
    {
        render()
        {
            return (
                <FormConfig.Consumer>
                    {
                        this.renderWithFormConfig
                    }
                </FormConfig.Consumer>
            )
        }

        renderWithFormConfig = formConfig => (
            <Component
                { ... this.props }
                formConfig={ formConfig }
            />
        )
    }
}