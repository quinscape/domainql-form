let i18nFn = a => a;

export function registerI18n(translator) {
    if (typeof translator === "function") {
        i18nFn = translator;
    } else {
        i18nFn = a => a;
    }
}

export function i18n(key, ...args) {
    return i18nFn(key, args);
}
