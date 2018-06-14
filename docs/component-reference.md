# Form Components

## &lt;Form/&gt;

Form description

### Props

 Name | Type | Description 
------|------|-------------
initialValues | func | Optional function to provide the initialValues for Formik without converting them from the typed GraphQL object. Might also be invalid (See isInitialValid)
isInitialValid | bool | true if the initial value is valid
**onSubmit** (required) | func | Submit handler handling the final typed GraphQL result
schema | instance of InputSchema or object | schema to use for this form
**type** (required) | string | form base type
validate | func | Optional validate function. Note that the values object received here is *not* typed, i.e. it contains the raw formik string/boolean values. If you need all values to be converted to a typed GraphQL object, you need to invoke InputSchema.fromValues(type, values) manually on the received values object.
**value** (required) | any | initial value (typed GraphQL object)
… | config props | See "Form Config Props" below
### Simple Form Example

```js
    <Form
        type="FooInput"
        value={ foo }
        horizontal={ true }
        onSubmit={ (foo, actions) => {
    
            // ... your submit code, 
            // foo will have been converted to GraphQL types
        } }
    >
        <Field name="name"/>
        <Field name="num"/>
        <Field name="flag"/>
    </Form>
```

### Advanced Form Example

To support more complex forms, &lt;Form/&gt; also accepts a function as
only child. The function receives the current FormConfig instance which provides
contains the current inherited form configuration and embeds the formik config
object as `formConfig.formikProps` 

```js
    <Form
        type="FooInput"
        value={ foo }
        horizontal={ true }
        onSubmit={ (foo, actions) => {
    
            // ... your submit code, 
            // foo will have been converted to GraphQL types
        } }
    >
        formConfig => (
            <Field name="name"/>
            <Field name="flag"/>
            <Field 
                name="num" 
                disabled={ 
                    !formConfig.formikProps.values.flag 
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
helpText | string | Additional help text for this field. Is rendered for non-erroneous fields in place of the error.
inputClass | string | Additional HTML classes for the input element.
label | string | Label for the field.
labelClass | string | Additional HTML classes for the label element.
mode | FieldMode value | Mode for this field. If not set or set to null, the mode will be inherited from the &lt;Form/&gt; or &lt;FormBlock&gt;.
**name** (required) | string | Name / path for this field (e.g. "name", but also "foos.0.name")
placeholder | string | Placeholder text to render for text inputs.
title | string | Title attribute
### FieldMode

FieldMode is a Javascript enum that controls the render mode of all fields
it is a string with one of these values

 * NORMAL - normal input field
 * DISABLED - disabled input field
 * READ_ONLY - render input field as static field
 
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
mode | FieldMode value | Mode for this field. If not set or set to null, the mode will be inherited from the &lt;Form/&gt; or &lt;FormBlock&gt;.
**name** (required) | string | Name / path for this field (e.g. "name", but also "foos.0.name")
placeholder | string | Placeholder text to render for the empty text area.
rows | number | Rows attribute for the textarea element (default is 3)
title | string | Title attribute
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
onChange | func | Local change handler. can call ev.preventDefault() to cancel change.
placeholder | string | Placeholder text to render for the empty text area.
required | bool | If true, the user must select one of the given values, if false, the user will also be given an empty option.
title | string | Title attribute
**values** (required) | array | Array of values to offer to the user. If required is false, &lt;Select/&gt; will add an empty option.
### &lt;Select/&gt; example

```js
<Form
    type="FooInput"
    value={ foo }
    horizontal={ true }
    onSubmit={ (foo, actions) => {
        // ... your submit code, 
        // foo.name will be the current selection
    } }
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
## &lt;FormList/&gt;

Helper to render a list of inputs. Both a list of scalar values as well as a list of complex input objects is supported.

### Props

 Name | Type | Description 
------|------|-------------
addLabel | string | Label to put on the add button (default is "Add")
canRemove | bool | If true (the default), the user can remove objects as long as there are more than "minObjects" objects. If false the user can never remove objects.
canSort | bool | If true (the default), the user can sort the list of objects with up and down buttons for each object.
emptyText | string | Text to render if no rows are rendered.
horizontal | string | Horizontal mode (default is true)
minObjects | number | Mininum number of objects in the list. (default is 0)
**name** (required) | string | Name/path of the list field for this &lt;FormList/&gt;
newObject | func | optional factory method to produce new values. If no newObject prop is given, the user cannot add objects to the list.
removeCheck | string | Text of the remove object confirmation (default is "Remove Object?")
renderRowToolbar | func | render additional elements into the per row toolbars
renderToolbar | func | render additional elements into the list toolbar
… | config props | See "Form Config Props" below
## &lt;FormSelector/&gt;

Helper to edit a list of complex input objects, similar to &lt;FormList/&gt;, it only edits one element at a time and
lets the user select from a list of elements.

### Props

 Name | Type | Description 
------|------|-------------
addLabel | string | Label to put on the add button (default is "Add")
canRemove | bool | If true (the default), the user can remove objects as long as there are more than "minObjects" objects. If false the user can never remove objects.
canSort | bool | If true (the default), the user can sort the list of objects with up and down buttons for each object.
emptyText | string | Text to render if no rows are rendered.
horizontal | string | Horizontal mode (default is true)
minObjects | number | Mininum number of objects in the list. (default is 0)
**name** (required) | string | Name/path of the list field for this <FormSelector/>
newObject | func | optional factory method to produce new values. If no newObject prop is given, the user cannot add objects to the list.
removeCheck | string | Text of the remove object confirmation (default is "Remove Object?")
renderRowToolbar | func | render additional elements into the per row toolbars
renderToolbar | func | render additional elements into the list toolbar
**selector** (required) | string or func | Field to select one object from the list of objects by. Can also be a function that renders a representation of a given object.
… | config props | See "Form Config Props" below
# Form Config Components

## &lt;FormConfigProvider/&gt;

Allows the definition defaults for form config options and schema at the top of the application component hierarchy.

### Props

 Name | Type | Description 
------|------|-------------
schema | instance of InputSchema or object | ...
… | config props | See "Form Config Props" below
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
style | object | Additional CSS styles for this form block.
… | config props | See "Form Config Props" below
## Form Config Props

These properties are available in &lt;Form/&gt;, &lt;FormBlock/&gt; and &lt;FormConfigProvider/&gt; and are inherited from the &lt;Field/&gt; components.

### Props

 Name | Type | Description 
------|------|-------------
currency | custom | Currency ISO code for Currency fields
currencyAddonRight | custom | True if the currency addon is on the right side of the input component.
horizontal | custom | True to use "horizontal" bootstrap form groups
labelColumnClass | custom | Additional label column class to use if in horizontal mode.
lookupLabel | custom | Optional function to look up a form field label based on formConfig and field name / path.
mode | custom | Default mode for input components within the Form. Setting this on a &lt;FormBlock&gt; or a &lt;Form&gt; will control all fields inside the form block or form.
wrapperColumnClass | custom | Additional wrapper column class to use if in horizontal mode.
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
 formikProps | Formik context         | Formik context object. Only defined within a &lt;Form/&gt;.
 schema      | InputSchema instance   | input schema
 options     | object                 | current set of default options
 basePath    | string                 | Current prefix for field names/paths
# Helper Components

## &lt;FormGroup/&gt;

Renders a .form-group wrapper from our standard render context. Is used by internally the default field renderers
and can be used for implementing custom fields.

If you just need a bootstrap form group with arbitrary content, use CustomGroup.

Read [Form Customization](./customization.md) for an usage example and make sure FormGroup is what you want.

### Props

 Name | Type | Description 
------|------|-------------
errorMessage | string | Error message to render for this form group.
formGroupClass | string | Marker class for the form group, (default is "form-group")
