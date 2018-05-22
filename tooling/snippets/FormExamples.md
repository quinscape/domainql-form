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
