import { useEffect, useRef } from "react";

/**
 * Helper hook to access the previous value of something
 * 
 * ( as suggested by https://reactjs.org/docs/hooks-faq.html#how-to-get-the-previous-props-or-state )
 *
 * @param value     some prop or state
 * 
 * @return {*} previous value
 */
export default function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}
