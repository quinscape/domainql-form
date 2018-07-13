### High Order Components

The library comes with two high order components.


#### withForm()

withForm() is an easy way to set up complex form implementations, it receives a form body 
component that gets wrapped in a domainql-form form and that provides the formConfig of
that form as props to the wrapped component.

##### Example

```js

```


#### withFormConfig()

withFormConfig() is a HOC useful if you have a component that wants to receive the 
current formConfig (which includes the current formik state), but which is not
a field in itself.

If you want to implement a new field type, look at [Customization](./customization.md).

withFormConfig provides the current formConfig object as prop to the wrapped component.


