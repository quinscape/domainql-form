import React, { useContext } from "react"

import { FormConfigContext } from "./FormConfig";

/**
 * Convenience hook to access the FormConfigContext. Offers a simpler syntax.
 */
export default function()
{
    return useContext(FormConfigContext)
}
