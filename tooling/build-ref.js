
const reactDocGen = require("react-docgen");
const fs = require("fs");
const path = require("path");

const COMPONENTS = [
    {
        name: "Form Components",
        components: [
            "../src/Form.js",
            "./snippets/FormExamples.md",
            "../src/Field.js",
            "./snippets/FieldMode.md",
            "../src/TextArea.js",
            "../src/Select.js",
            "./snippets/Select.md",
            // XXX: components don't work now
            // "../src/FormList.js",
            // "../src/FormSelector.js",
            "../src/GlobalErrors.js",
            "./snippets/hooks.md",
            "./snippets/HighOrderComponents.md"
        ]
    },
    {
        name: "Form Config Components",
        components: [
            "../src/FormConfigProvider.js",
            "./snippets/FCPExample.md",
            "../src/FormBlock.js"
        ]
    },
    {
        name: "",
        components: [
            generateConfigPseudoComponent,
            "./snippets/FormConfig.md"
        ]
    },
    {
        name: "Helper Components",
        components: [
            "../src/FormGroup.js"
        ]
    }
];

const BREAK = "\n";
const DOUBLE_BREAK = "\n\n";

const FORM_CONFIG_PROPS_SOURCE = (function () {

    // extract proptypes source
    const fileName = path.resolve(__dirname, "../src/FormConfigPropTypes.js");
    const content = fs.readFileSync(fileName);

    const m = /export default \{([\s\S]*)\}/.exec(content);
    if (!m)
    {
        throw new Error("Could not extract from " + fileName)
    }

    //console.log("FORM_CONFIG_PROPS_SOURCE = ", m[1]);

    return m[1];
})();


function generateConfigPseudoComponent()
{
    return (
        "import PropTypes from 'prop-types'" + BREAK +
        "/** " +
        "These properties are available in &lt;Form/&gt;, &lt;FormBlock/&gt; and &lt;FormConfigProvider/&gt; and are inherited from the &lt;Field/&gt; components." +
        "*/" +
        "class FormConfigProps extends React.Component { " + BREAK +
        "static propTypes = {" + FORM_CONFIG_PROPS_SOURCE + "}; " + BREAK +
        "render() { return false; } " + BREAK +
        "}" + BREAK +
        "export default FormConfigProps"
    );
}


function renderType(type)
{
    if (!type)
    {
        return "---";
    }

    const { name, value } = type;

    if (name === "union")
    {

        let s = "";
        for (let i = 0; i < value.length; i++)
        {
            if (i > 0)
            {
                s += " or "
            }

            s += renderType(value[i]);
        }

        return s;
    }
    else if (name === "enum" && value === "FieldMode.values()")
    {
        return "FieldMode value";
    }
    else if (name === "enum" && value === "FORM_CONFIG_PROP_TYPES")
    {
        return "config props";
    }
    else if (name === "instanceOf")
    {
        return "instance of " + value;
    }
    else if (name === "shape" && value === "import FORM_CONFIG_PROP_TYPES from \"./FormConfigPropTypes\"")
    {
        return "Form options";
    }
    else
    {
        return name;
    }
}

function renderDescription(text)
{
    const result = text.replace(/\s+/g, " ");

    //console.log("DESC", result)
    return result || "...";
}

function endsWith(filename, s)
{
    return !s || filename.lastIndexOf(s) === filename.length - s.length;
}

function renderComponentName(displayName)
{
    if (displayName === "FormConfigProps")
    {
        return "Form Options";
    }
    return  "&lt;" + displayName + "/&gt;";
}

function renderComponent(component)
{
    // try
    // {
        let out = "";

        let fileName, content;
        if (typeof component === "function")
        {
            content = component();
            fileName = "fn()";
        }
        else
        {
            fileName = path.resolve(__dirname, component);
            content =  fs.readFileSync( fileName, "UTF-8");
        }

        if (endsWith(fileName, ".md"))
        {
            out += content
        }
        else
        {
            const info = reactDocGen.parse( content);

            out += "## " + renderComponentName(info.displayName) + DOUBLE_BREAK;
            out += info.description + DOUBLE_BREAK;


            const { props } = info;

            out += "### Props" + DOUBLE_BREAK;

            out += " Name | Type | Description " + BREAK;
            out += "------|------|-------------" + BREAK;

            const propNames = Object.keys(props);
            propNames.sort();

            for (let k = 0; k < propNames.length; k++)
            {
                const propName = propNames[k];

                const { type, required, description } = props[propName];

                if (!type)
                {
                    throw new Error("Error in " + fileName + ": Prop " + propName + " has default value, but no propType definition");
                }
                out += (required ? "**" + propName + "**" + " (required)" : propName) + " | " + renderType(type) + " | " + renderDescription(description) + BREAK;
            }


            // console.log(
            //     JSON.stringify(info, null, 4)
            // );
        }
        return out;

    // }
    // catch(e)
    // {
    //     throw new Error("Error rendering component " + component + ": " + e);
    // }
}

function main()

{
    let out = "";

    for (let i = 0; i < COMPONENTS.length; i++)
    {
        const { name, components } = COMPONENTS[i];

        if (name)
        {
            // render chapter H1
            out += "# " + name + DOUBLE_BREAK;
        }

        for (let j = 0; j < components.length; j++)
        {
            const componentName = components[j];
            try
            {
                out += renderComponent(componentName);
            }
            catch(e)
            {
                console.log("Error rendering '" + componentName + "'", e);
            }
        }
    }
    fs.writeFileSync(path.resolve(__dirname, "../docs/component-reference.md"), out);
}

main();

