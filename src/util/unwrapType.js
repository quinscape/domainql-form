import { NON_NULL, LIST, OBJECT, SCALAR } from "../kind";

export default function unwrapType(type)
{
    if (type.kind === NON_NULL)
    {
        return unwrapType(type.ofType);
    }
    return type;
}
