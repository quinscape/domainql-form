import React, { useMemo } from "react"
import cx from "classnames"
import toPath from "lodash.topath"
import Field from "./Field";
import FormLayout from "./FormLayout";
import Select from "./Select";
import useFormConfig from "./useFormConfig";
import { FormConfigContext }  from "./FormConfig";
import { renderHelpBlock } from "./FormGroup";


const FieldGroup = ({ labelSeparator = " / ", className, children }) => {

    const parentConfig = useFormConfig();

    const formConfig = useMemo(
        () => {

            if (!parentConfig || !parentConfig.type)
            {
                throw new Error("<FieldGroup/> should only be used inside a <Form/>");
            }

            const formConfig = parentConfig.copy();

            formConfig.options = {
                ... parentConfig.options,
                ... {
                    layout: FormLayout.INLINE,
                    suppressLabels: true
                }
            };
            return formConfig
        },
        [ parentConfig ]
    );

    const labelElems = [];

    const fields = React.Children.toArray( children).filter( kid => kid.type === Field || kid.type === Select);
    const { labelColumnClass } = formConfig.options;

    const horizontal = parentConfig.options.layout === FormLayout.HORIZONTAL;

    const fieldElems = [];
    let errors = [];

    for (let i = 0; i < fields.length; i++)
    {
        const field = fields[i];
        const { name, id, label : labelFromProps , labelClass, wrapperColumnClass } = field.props;

        const qualifiedName = formConfig.getPath(name);
        const path = toPath(qualifiedName);

        let fieldId;
        let label;

        const lastSegment = path[path.length - 1];
        fieldId = id || "field-" + formConfig.type + "-" + qualifiedName;
        label = typeof labelFromProps === "string" ? labelFromProps : formConfig.options.lookupLabel(formConfig, lastSegment);


        if (labelElems.length)
        {
            labelElems.push(labelSeparator)
        }

        const fieldErrorMessages = formConfig.getErrors(qualifiedName);

        const labelElement = label ? (
            <label
                key={i}
                className={
                    cx(
                        labelClass
                    )
                }
                htmlFor={ fieldId }
            >
                { label }
            </label>) : (
            horizontal &&
            <div className={labelColumnClass}>
                {"\u00a0"}
            </div>
        );


        labelElems.push(labelElement);


        errors = errors.concat(fieldErrorMessages);

        fieldElems.push(
            <div
                key={ i }
                className={
                    horizontal ? cx( wrapperColumnClass, "pr-0", i > 0 && "pl-0") : null
                }
            >
                {
                    React.cloneElement(field,{
                        inputClass: horizontal ? cx("m-0", i === fields.length - 1 && "pl-2 pr-0"): null,
                        wrapperColumnClass: null
                    })
                }
            </div>
        );
    }

    const haveErrors = !!errors.length;
    const helpBlock = renderHelpBlock(haveErrors, errors, null);

    return (
        <FormConfigContext.Provider value={ formConfig }>
            <div className={
                cx(
                    "form-group field-group",
                    horizontal ? "form-row" : null,
                    haveErrors && "has-error",
                    className
                )
            }>
                <div
                    className={
                        cx(
                            horizontal ? labelColumnClass : null,
                            horizontal ? "col-form-label" : null
                        )
                    }
                >
                    { labelElems }
                </div>
                {
                    horizontal && (
                        <React.Fragment>
                            { fieldElems }
                            { helpBlock }
                        </React.Fragment>
                    )
                }
                {
                    parentConfig.options.layout === FormLayout.DEFAULT && (
                        fieldElems
                    )
                }
                {
                    !horizontal && helpBlock
                }
            </div>
        </FormConfigContext.Provider>
    );
};

export default FieldGroup;
