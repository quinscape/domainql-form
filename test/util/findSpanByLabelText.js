import { prettyDOM } from "@testing-library/react";


export default function findSpanByLabelText(container, text)
{
    const labelElem = Array.from(container.querySelectorAll("label")).find(lbl => lbl.innerHTML === text);
    if (!labelElem)
    {
        throw new Error("Found no label with '" + text + "' in " + prettyDOM(container));
    }
    return container.querySelector(`span[id='${labelElem.htmlFor}']`);
}
