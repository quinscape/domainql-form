### FieldMode

FieldMode is a Javascript enum that controls the render mode of all fields
it is a string with one of these values

 * NORMAL - normal input field
 * DISABLED - disabled input field
 * READ_ONLY - render input field as static field
 
The field mode can be given as prop to &lt;Field/&gt; but can also
be inherited from &lt;Form/&gt; or &lt;FormBlock/&gt;.
