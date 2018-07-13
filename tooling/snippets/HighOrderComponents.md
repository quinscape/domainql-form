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


### withFormConfig()

withFormConfig() is a HOC useful if you have a component that wants to receive the 
current formConfig (which includes the current formik state), but which is not
a field in itself.

If you want to implement a new field type, look at [Customization](./customization.md).

withFormConfig provides the current formConfig object as prop to the wrapped component.


