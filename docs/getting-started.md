# Getting Started with domainql-form

*domainql-form* is the client-side companion library of domainql but can also
be used without it.

## GraphQL Compatibility

In general, the library should work for all GraphQL backends, but it expects some 
scalar implementations of the domainql backend. These are the standard graphql-java
scalar types plus a `Timestamp` and `Date` scalar compatible with SQL date and 
timestamp.

## Setup

First you need a GraphQL setup from either the domainql library or another GraphQL implementation. Then you need to 
execute an introspection query that tells domainql-form what types there are and what fields they have. 

If you use DomainQL, it contains a class *de.quinscape.domainql.schema.SchemaDataProvider*
which will automatically push the right schema data as `schema` prop in the initial data
block / DomainQL `PRELOADED_QUERIES`

### Using FormConfigProvider
 
With or without domainql, you usually want to deal with the resulting schema 
once and for all, and you're working with only one schema at a time anyway.

The &lt;FormConfigProvider/&gt; component allows the definition of the schema at the
very top of your component hierarchy, so that all forms in all routes can just receive the schema
and other form configuration via context.

```js
    // 'raw' contains the raw Schema data
    import FormConfigProvider from "domainql-form/lib/FormConfigProvider"
    import InputSchema from "domainql-form/lib/InputSchema"
    
    // ...
    
    ReactDOM.render(
        <FormConfigProvider
            schema={ new InputSchema(raw) }
        >
            <BrowserRouter>
                <Switch>
                  <Route exact path='/' component={ Home }/>
                  <Route path='/about' component={ About }/>
                  <Route path='/contact' component={ Contact }/>
                </Switch>
            </BrowserRouter>
        </FormConfigProvider>,
        container
    )
    
 
```
 
Here we see a configuration example combined with a simple *react-router* 
&lt;BrowserRouter/&gt; component.

## First Form 
 
Having a schema or being able to receive one from context, we can now 
start to create actual forms based on the GraphQL input types of the schema.

Assuming we have an GraphQL input type `FooInput`

```graphql schema
input FooInput {
  name: String!
  flag: Boolean
  num: Int!
  moneys: BigDecimal
  date: Date
}
```

This of course being part of a larger GraphQL schema.
 

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

The `type` prop defines our input type as the base type to use for the form and the
`value` props provides the actual foo value.

Note the the `foo` object is just a natural GraphQL data snippet, Form automatically
handles the conversion to string needed for fomik.

The `onSubmit` arrow function prop then receives the submit result again
as typed GraphQL data.   

The `horizontal` flag puts the whole form into horizontal mode and makes
all fields render horizontally. 

## &lt;Field/&gt; abstraction

Domainql-form works based on a high-level field abstraction that tries to simplify the
components needed to express a form.

&lt;Field/&gt; is the standard field component which adapts to the underlying
type as much as possible. In this example we could have `name` would be 
a normal text input, `num` recognizes the underlying num field and automatically
validates the field to be an `Int` value.

Since `flag` is a `Boolean` field, &lt;Field/&gt;&lt;Field/&gt; will not render an input but a bootstrap 4
checkbox instead.

If the underlying type is a `Enum` type, &lt;Field/&gt;&lt;Field/&gt; will automatically render
a HTML select. 

( WIP: Special Date and Timestamp widgets are still missing at this point. )
 
## Navigation
 
 * **Getting Started**
 * [Component Reference](./component-reference.md)
 * [Customization](./customization.md)
