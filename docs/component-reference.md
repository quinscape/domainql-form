# Form Components

## &lt;Form/&gt;

Form description

### Props

 Name | Type | Description 
------|------|-------------
id | string | Optional pass-through id attribute for the form element.
onClick | func | Optional onClick handler for the form element.
onReset | func | Reset handler. The default behaviour is to do re-clone the original value
onSubmit | func | Submit handler to receive the current formConfig with the root observable as-is. The default behavior is to do nothing as the (cloned) root object is already updated.
options | Form options | Form options. Options here overwrite options inherited from a FormConfigProvider
type | string | form base type. If it is not defined, a type prop must be given on all Fields.
value | any | initial value (typed GraphQL object)
### Simple Form Example

```js
    <Form
        type="FooInput"
        value={ foo }
        options={{
            layout: FormLayout.HORIZONTAL
        }}
    >
        <Field name="name"/>
        <Field name="num"/>
        <Field name="flag"/>
    </Form>
```

`foo` must be an object containing mobx observable values corresponding to the given type within the input schema.  

### Advanced Form Example

To support more complex forms, &lt;Form/&gt; also accepts a function as
only child. The function receives the current FormConfig instance which provides
contains the current inherited form configuration and embeds the formik config
object as `formConfig.formikProps` 

```js
    <Form
        type="FooInput"
        value={ foo }
        options={{
            layout: FormLayout.HORIZONTAL
        }}
    >
        formConfig => (
            <Field name="name"/>
            <Field name="flag"/>
            <Field 
                name="num" 
                disabled={ 
                    !formConfig.root.flag 
                }
            />
        )
    </Form>
```

Here, we disable the "num" input when the current form value of the flag checkbox is
not checked.
## &lt;Field/&gt;

Renders a bootstrap 4 form group with an input field for the given name/path within the current form object. The actual
field rendered is resolved by the render rules in GlobalConfig.js ( See ["Form Customization"](./customization.md) for details)

### Props

 Name | Type | Description 
------|------|-------------
addons | array | Array of addons as props instead of as children. Only useful if you're writing a component wrapping Field and want to render your addons as field addons while using the render function form.
autoFocus | bool | Pass-through autoFocus attribute for text inputs
fieldContext | func | Callback function that allows complex field implementations to modify the newly created field context ( fieldContext => void ).
formGroupClass | string | Additional HTML classes for the form group element.
helpText | string | Additional help text for this field. Is rendered for non-erroneous fields in place of the error.
inputClass | string | Additional HTML classes for the input element.
label | string | Label for the field.
labelClass | string | Additional HTML classes for the label element.
maxLength | number | Maximum field length (for string fields)
mode | FieldMode value | Mode for this field. If not set or set to null, the mode will be inherited from the &lt;Form/&gt; or &lt;FormBlock&gt;.
**name** (required) | string | Name / path for this field (e.g. "name", but also "foos.0.name")
onBlur | func | Optional blur handler to use
onChange | func | Optional change handler to use to react to the single field changing
placeholder | string | Placeholder text to render for text inputs.
tooltip | string | Tooltip / title attribute for the input element
validate | func | Optional per-field validation function ( (fieldContext, value) => error ). It receives the current value as string and the current field context and returns an error string if there is any or `null` if there is no error. The local validation is executed after the type validation and also prevents invalid values from being written back into the observable. The high-level validation is only executed if the local validation succeeds.
### FieldMode

FieldMode is a Javascript enum that controls the render mode of all fields
it is a string with one of these values

 * NORMAL - normal form field
 * DISABLED - disabled form field
 * READ_ONLY - render a readOnly form field where applicable, otherwise disable
 * PLAIN_TEXT - render field value as static field
 * INVISIBLE - skip rendering the form field and its form-group 
 
The field mode can be given as prop to &lt;Field/&gt; but can also
be inherited from &lt;Form/&gt; or &lt;FormBlock/&gt;.

## &lt;TextArea/&gt;

Edits a string GraphQL field with a text area element.

This is a good example how to implement custom fields.

### Props

 Name | Type | Description 
------|------|-------------
cols | number | Cols attribute for the textarea element (default is 60)
helpText | string | Additional help text for this field. Is rendered for non-erroneous fields in place of the error.
inputClass | string | Additional HTML classes for the textarea element.
label | string | Label for the field.
labelClass | string | Additional HTML classes for the label element.
maxLength | number | Maximum field length
mode | FieldMode value | Mode for this field. If not set or set to null, the mode will be inherited from the &lt;Form/&gt; or &lt;FormBlock&gt;.
**name** (required) | string | Name / path for this field (e.g. "name", but also "foos.0.name")
placeholder | string | Placeholder text to render for the empty text area.
rows | number | Rows attribute for the textarea element (default is 3)
tooltip | string | Tooltip / title attribute
validate | func | Optional per-field validation function ( (fieldContext, value) => error ). It receives the current value as string and the current field context and returns an error string if there is any or `null` if there is no error. The local validation is executed after the type validation and also prevents invalid values from being written back into the observable. The high-level validation is only executed if the local validation succeeds.
## &lt;Select/&gt;

Allows selection from a list of string values for a target field.

### Props

 Name | Type | Description 
------|------|-------------
helpText | string | Additional help text for this field. Is rendered for non-erroneous fields in place of the error.
inputClass | string | Additional HTML classes for the textarea element.
label | string | Label for the field.
labelClass | string | Additional HTML classes for the label element.
mode | FieldMode value | Mode for this field. If not set or set to null, the mode will be inherited from the &lt;Form/&gt; or &lt;FormBlock&gt;.
**name** (required) | string | Name / path for this field (e.g. "name", but also "foos.0.name")
nameProperty | string | Property of the row values to use as display name (default: "name")
onChange | func | Local change handler. can call ev.preventDefault() to cancel change.
required | bool | If true, the user must select one of the given values, if false, the user will also be given an empty option.
tooltip | string | Title attribute
valueProperty | string | Property of the row values to use as value. Values can be string, number or boolean. (default: "value")
**values** (required) | array | Array of values to offer to the user. If required is false, &lt;Select/&gt; will add an empty option. The values can be either a string or an object with `name` and `value` property.
### &lt;Select/&gt; example

```js
<Form
    type="FooInput"
    value={ foo }
        options={{
            layout: FormLayout.HORIZONTAL
        }}
>
    <Select 
        name="name" 
        values={ [
            'AAA', 
            'BBB', 
            'CCC'
            ] 
        }
    />
    
</Form>
```
## &lt;GlobalErrors/&gt;

Renders a global list of current errors or nothing.

The error labels are cross-linked with the input fields by name attribute after mount.

### Props

 Name | Type | Description 
------|------|-------------
heading | string | Tag to surround the errors heading with
headingText | string | Text to use as heading (empty = no heading).
text | string | Additional text below the headline
# useFormConfig Hook

The preferred form of react component is now a functional component. To receive the current form config object we added
a `useFormConfig()` hook.
## High Order Components

The library comes with two high order components.


### withForm()

withForm() is an easy way to set up complex form implementations, it receives a form body 
component that gets wrapped in a domainql-form form and that provides the formConfig of
that form as props to the wrapped component.

#### Example: FooForm.js

```js
import React from "react";
import withForm from "domainql-form/lib/withForm"
import Field from "domainql-form/lib/Field"


class FooForm extends React.Component {
    render()
    {
        return (
            <React.Fragment>
                <Field name="name"/>
                <Field name="num"/>
            </React.Fragment>
        )
    }
    
export default withForm( 
    FooForm, 
    { 
        type: "FooInput" 
    } 
)
```

withForm()can simplify the setup of a domainql-form like seen above. We just need
to define the fields and the HOC generates the form element automatically.

We also receive a `formConfig` prop for our form, so that we can use it in all
event and lifecycle methods.

Now that the enhance form component is defined we can import it into our application

```js
import FooForm from "./FooForm"

//...
        
<EnhancedForm
    value={{
       name: "Hans",
       num: 21
   }}
    validate={
        (foo, actions) => {
            // ... validation code here ...
        }
    }
    onSubmit={
        (foo, actions) => {
            // ... submit code here ...
        } 
    }
/>
```

# Form Config Components

## &lt;FormConfigProvider/&gt;

Allows the definition defaults for form config options and schema at the top of the application component hierarchy.

### Props

 Name | Type | Description 
------|------|-------------
options | Form options | Default form options
schema | instance of InputSchema or object | provides the input schema for all child <Form/> components.
### &lt;FormConfigProvider/&gt; Example

```js
<FormConfigProvider
    schema={ rawSchema }
>
    {/*
        All Forms within the FormConfigProvider 
        inherit the schema and other options 
    */}
</FormConfigProvider>
```
## &lt;FormBlock/&gt;

A form block defining a changed form configuration for the fields
contained within.

### Props

 Name | Type | Description 
------|------|-------------
basePath | string | Optional property to define a common base path for the fields contained within. (e.g. basePath="foos.12" would prefix all fields' name attributes so that &lt;Field name="name"/&gt; would end up being &lt;Field name="foos.12.name"/&gt;
className | string | Additional HTML class for this form block
options | Form options | Form options. Options here overwrite options inherited from a FormConfigProvider
style | object | Additional CSS styles for this form block.
## Form Options

These properties are available in &lt;Form/&gt;, &lt;FormBlock/&gt; and &lt;FormConfigProvider/&gt; and are inherited from the &lt;Field/&gt; components.

### Props

 Name | Type | Description 
------|------|-------------
autoSubmit | bool | Whether the form automatically does a (debounced) submit on every change.
currency | string | Currency ISO code for Currency fields
currencyAddonRight | bool | True if the currency addon is on the right side of the input component.
isolation | bool | Whether to protect the original observable value from changing by cloning (default: true)
labelColumnClass | string | Additional label column class to use if in horizontal mode.
layout | enum | Form layout: "DEFAULT" - Label on top of input. "HORIZONTAL" - label to the left of input in layout column "INLINE" - inline field elements without form group element
lookupLabel | func | Optional function to look up a form field label based on formConfig and field name / path.
mode | FieldMode value | Default mode for input components within the Form. Setting this on a &lt;FormBlock&gt; or a &lt;Form&gt; will control all fields inside the form block or form.
revalidate | bool | If true, revalidate all field of the current form context (Default is true)
submitTimeOut | number | Timeout in milliseconds for submit debouncing.
suppressLabels | bool | Render no label in inline mode at all.
wrapperColumnClass | string | Additional wrapper column class to use if in horizontal mode.
## FormConfig

The FormConfig class encapsulates the current form config state within the 
form component hierarchy influencing it.
 
 * optionally &lt;FormConfigProvider/&gt; 
 * &lt;Form/&gt; 
 * optionally &lt;FormBlock/&gt; 
 * Fields: &lt;Field/&gt; / &lt;TextArea/&gt; / &lt;Select/&gt; ...
 
The current FormConfig instance is provided via React context and can 
be consumed with FormConfig.Consumer.

The library contains also a very simple `withFormConfig()` high order
component that provides that current FormConfig instance as `formConfig` prop. 
This is an easy way to access the FormConfig instance and have it
being available in all lifecycle methods etc pp.

### FormConfig properties

  Name       | Type                   | Description
-------------|------------------------|------------------------------------------------------
 type        | string                 | Name of the base input type of the form. Only defined within a &lt;Form/&gt;.
 options     | object                 | current set of default options
 basePath    | string                 | Current prefix for field names/paths
 root        | Mobx view model        | Current form base value (is not set outside of <Form/>)
 errors      | Array                  | Current form errors
 ctx         | InternalContext        | Contains some internal functions (setRoot, setErrors, submit)
 
 
# Helper Components

## &lt;FormGroup/&gt;

Renders a .form-group wrapper from our standard render context. Is used by internally the default field renderers
and can be used for implementing custom fields.

If you just need a bootstrap form group with arbitrary content, use CustomGroup.

Read [Form Customization](./customization.md) for an usage example and make sure FormGroup is what you want.

### Props

 Name | Type | Description 
------|------|-------------
errorMessages | array | Error messages to render for this form group.
formGroupClass | string | Additional classes the form group
