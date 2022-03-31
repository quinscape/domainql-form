let i18nFn = a => a;

/**
 * Register a custom i18n translation function for domainql-form
 * 
 * The function registered by default will return the key as is without altering or translating.
 * If a value that is not a function is passed as translator, the default function will be used.
 * 
 * @param {i18n} translator - the translation function to be registered
 */
export function registerI18n(translator) {
    if (typeof translator === "function") {
        i18nFn = translator;
    } else {
        i18nFn = a => a;
    }
}

/**
 * Returns a translation of the given translation key with additional optional arguments
 *
 * @param {string} key - translation tag/key
 * @param {...string} args - optional translation parameters
 * @returns {string}
 */
export function i18n(key, ...args) {
    return i18nFn(key, args);
}
