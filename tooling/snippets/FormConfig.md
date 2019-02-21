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
 schema      | InputSchema instance   | input schema
 options     | object                 | current set of default options
 basePath    | string                 | Current prefix for field names/paths
 root        | Mobx view model        | Current form base value (is not set outside of <Form/>)
 errors      | Array                  | Current form errors
 ctx         | InternalContext        | Contains some internal functions (setRoot, setErrors, submit)
 
 
