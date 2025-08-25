import { useState, useEffect } from 'react';

/**
 * JSDom doesn't know ResizeObservers
 */
if (!("ResizeObserver" in globalThis)) {
    class ResizeObserver {
        observe() {}
        unobserve() {}
    }
    globalThis.ResizeObserver = ResizeObserver;
}

const REGISTRY = new WeakMap();
const OBSERVER = new ResizeObserver((entries) => {
    for (const entry of entries) {
        const refEl = entry.target;
        handleResize(refEl);
    }
});

function handleResize(refEl) {
    if (refEl != null && REGISTRY.has(refEl)) {
        const setElementSize = REGISTRY.get(refEl);
        setElementSize({
            width: refEl.offsetWidth,
            height: refEl.offsetHeight,
        });
    }
}

/**
 * Helper to have a React hook for observing element sizes
 */
export default function useResizeObserver(ref) {
    const [elementSize, setElementSize] = useState({
        width: 0,
        height: 0,
    });

    useEffect(() => {
        const refEl = ref.current;
        if (refEl != null) {
            OBSERVER.observe(refEl);
            REGISTRY.set(refEl, setElementSize);
            handleResize(refEl);
        }
        return () => {
            const refEl = ref.current;
            if (refEl != null) {
                OBSERVER.unobserve(refEl);
                REGISTRY.delete(refEl);
            }
        };
    }, [ref.current]);

    return elementSize;
}