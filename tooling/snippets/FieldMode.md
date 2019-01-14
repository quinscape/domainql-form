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

