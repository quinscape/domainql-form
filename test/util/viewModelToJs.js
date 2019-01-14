import { toJS } from "mobx";


const MOBX_FNS = {
    "isPropertyDirty": true,
    "localComputedValues": true,
    "localValues": true,
    "model": true
};

/**
 * Extracts the current state of a view model without the view model specific fields.
 *
 * @param root
 */
export default function viewModelToJs(root)
{
    const out = {};
    for (let key in root)
    {
        if (!MOBX_FNS[key] && root.hasOwnProperty(key))
        {
            out[key] =  toJS(root[key]);
        }
    }
    return out;
}
