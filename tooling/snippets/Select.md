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
