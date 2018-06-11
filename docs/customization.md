# Form Customization

There are several ways extending the field functionality 

## Custom Groups

If you just want to put components aligned with the form layout components,
you can use the &lt;CustomGroup/&gt; component which renders a form-group
without any field.

Custom Groups are not meant to actually edit form content, that is they 
are not *fields*.

```js
    <CustomGroup label="Label">
        <em>Any component content</em>
    </CustomGroup>
```

The label is required but can be empty.

## Field: custom renderer

Field renders the fields as defined in the GlobalConfig.js module which
allows extension of renders.

The global config holds a list of render rule objects that
are used to match the renderer function to use for a given field.

### Render rules

```graphql schema

    type RenderRule {
      # name of the form base type
      type: String
    
      # Scalar field type name
      fieldType: String
    
      # field name
      name: String
    
      # GraphQL "kind" field
      kind: String
    }

```

any field that is defined must match the corresponding field property.


### Default Rules

By default, there are three rules defined:

Rule                   | Renderer Description
-----------------------|---------------------
fieldType == "Boolean" | Renders a checkbox group
kind == "Enum"         | Renders an enum select element
none                   | Default Renderer


New rules can be defined by calling GlobalConfig.register()

```js

    // at startup 
    
    GlobalConfig.register({
        rule: { type: "MyScalar" },
        renderer: ctx => {
            
            // render your field based on the field context
        }
    })

```

.register() will either register an alternate default rule if the rule is `false`, 
otherwise a new rule is added with highest precedence.

## Implementing your own Field

As convenient as it is to have automatic field type support, often you
need ( a lot) more information to render your field. Select.js and TextArea.js are examples of that.
&lt;TextArea/&gt; doesn't really need more information, it's more of special mode.

### Field Implementation skeleton

```js
class MyField extends React.Component
{
    render()
    {
        return (
            <Field
                { ...this.props }
            >
                {
                    ctx => {
                        
                        // your render code 
                        // err is a potential error message or null
                        
                        return (
                            <FormGroup
                                { ... ctx }
                                errorMessage={ err }
                            >
                                {
                                    /* Custom field components */
                                }    
                            </FormGroup>
                        )
                    }
                }
            </Field>
        )
    }
}

```
 
See TextArea.js and Select.js for in-library examples of this.

The &lt;FormGroup/&gt; component renders the default surrounding markup
for a bootstrap 4 form group and given field context.

**Note**: make sure you spread over all properties of the field context received from &lt;Field/&gt;. 
 
## Field Context

Both the GlobalConfig renderers and the render prop renderer above receive
a field context object that provides everything needed to render a working
field element.

 Name          | Type         | Description
 --------------|--------------|------------- 
 formConfig    | FormConfig   | current form config
 fieldId       | string       | id attribute for the field
 fieldType     | GraphQL Type | GraphQL type for the field
 qualifiedName | string       | full qualified path as string
 path          | array        | full qualified path
 ...           | Props        | all props of the current &lt;Field/&gt;
 
* [Getting started](./getting-started.md)
* [Component Reference](./component-reference.md)
* **Customization**
