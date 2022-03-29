let i18nFn = a => a;

const TranslationHelper = {

    registerI18n: function(translator) {
        if (typeof translator === "function") {
            i18nFn = translator;
        } else {
            i18nFn = a => a;
        }
    },

    i18n: function(key, ...args) {
        return i18nFn(key, args);
    }

}

export default TranslationHelper;
