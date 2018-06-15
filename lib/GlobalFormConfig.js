"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.resolveStaticRenderer = resolveStaticRenderer;

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _defaultRenderers = require("./default-renderers");

var _defaultRenderers2 = _interopRequireDefault(_defaultRenderers);

var _defaultStaticRenderers = require("./default-static-renderers");

var _defaultStaticRenderers2 = _interopRequireDefault(_defaultStaticRenderers);

var _InputSchema = require("./InputSchema");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var renderers = void 0;
var labelLookup = null;
var staticRenderers = void 0;

var noneText = "---";

/**
 * Checks if the given rule matches the given current fields. If a field exists in the rule it must be equal
 * to the current field value
 *
 * @param {Object} rule             rule object
 * @param {String} currentType          current "type" field, referencing a domain type  
 * @param {String} currentKind          current "kind" field ("ENUM" OR "SCALAR)
 * @param {String} currentFieldType     current scalar "fieldType" field (e.g. "String")
 * @param {String} currentName          current "name" of the field 
 * @returns {boolean}
 */
function matchesRule(rule, currentType, currentKind, currentFieldType, currentName) {
    var type = rule.type,
        fieldType = rule.fieldType,
        kind = rule.kind,
        name = rule.name;


    return type !== undefined && type === currentType || kind !== undefined && kind === currentKind || fieldType !== undefined && fieldType === currentFieldType || name !== undefined && name === currentName;
}

function validateRule(rule, index) {
    var type = rule.type,
        kind = rule.kind,
        fieldType = rule.fieldType,
        name = rule.name;


    if (type === undefined && kind === undefined && fieldType === undefined && name === undefined) {
        throw new Error("Rule must define at least one of type, kind fieldType or name: " + JSON.stringify(rule) + " (index = " + index + " )");
    }
}

/**
 * Returns true if the given two rules are equal, produce the same matches.
 *
 * @param ruleA     Rule a
 * @param ruleB     Rule b
 * @returns {boolean}   true if equal
 */
function isEqual(ruleA, ruleB) {
    var typeA = ruleA.type,
        kindA = ruleA.kind,
        fieldTypeA = ruleA.fieldType,
        nameA = ruleA.name;
    var typeB = ruleB.type,
        kindB = ruleB.kind,
        fieldTypeB = ruleB.fieldType,
        nameB = ruleB.name;

    return typeA === typeB && kindA === kindB && fieldTypeA === fieldTypeB && nameA === nameB;
}

function validateRules(rules) {
    var len = rules.length;
    if (!rules || !len) {
        throw new Error("Rules must be a list of renderer entry objects { rule, renderer }");
    }

    var last = len - 1;
    for (var i = 0; i < len; i++) {
        var e = rules[i];

        if (i === last) {
            if (e.rule) {
                throw new Error("The last rule entry is the default entry and must have a rule = false");
            }
        } else {
            if (!e.rule) {
                throw new Error("Only the last rule entry can have no rule: Entry #" + i + " of " + length + " has no rule");
            }
            validateRule(e.rule, i);
        }

        if (typeof e.render !== "function") {
            throw new Error("render property is not a function:  Entry #" + i + " of " + length);
        }
    }
}

function findRenderer(type, kind, fieldType, fieldName) {
    var last = renderers.length - 1;
    for (var i = 0; i < last; i++) {
        var _renderers$i = renderers[i],
            rule = _renderers$i.rule,
            render = _renderers$i.render;


        if (matchesRule(rule, type, kind, fieldType, fieldName)) {
            //console.log(renderers[i], "matches", {type, fieldType, fieldName});
            return render;
        }
    }
    return renderers[last].render;
}

function defaultStaticRenderer(value) {
    return String(value);
}

function resolveStaticRenderer(name) {
    return staticRenderers[name] || defaultStaticRenderer;
}

/**
 *
 * @type {{get: GlobalFormConfig.get, reset: GlobalFormConfig.reset, register(*=): void, replaceRenderers: GlobalFormConfig.replaceRenderers}}
 */
var GlobalFormConfig = {

    /**
     * Resolves the render method for the given context
     *
     * @param fieldContext              field context object
     * @param name                      field name / path
     */
    get: function get(fieldContext) {
        var fieldType = fieldContext.fieldType,
            path = fieldContext.path;


        var actualType = (0, _InputSchema.unwrapNonNull)(fieldType);

        //console.log("GET RENDERER", fieldType, path, "=>", actualType);

        if (!(0, _InputSchema.isScalarType)(actualType) && !(0, _InputSchema.isEnumType)(actualType)) {
            throw new Error("Field  type for " + fieldContext.formConfig.formContext.type + "." + path + " is no scalar or enum: " + JSON.stringify(actualType));
        }

        return findRenderer(fieldContext.formConfig.formContext.type, actualType.kind, actualType.name, path[path.length - 1]);
    },

    renderStatic: function renderStatic(typeName, value) {
        return resolveStaticRenderer(typeName)(value);
    },

    reset: function reset() {

        GlobalFormConfig.replaceRenderers(_defaultRenderers2.default);

        staticRenderers = _defaultStaticRenderers2.default;
    },
    register: function register(newEntry) {
        // if we have no rule
        if (!newEntry.rule) {
            // we replace the last entry because we can only have one entry without rule / being the default renderer
            var last = renderers.length - 1;
            renderers[last] = newEntry;
        } else {
            // replace renderer if we find the exact same rule
            for (var i = 0; i < renderers.length; i++) {
                var e = renderers[i];

                if (isEqual(e.rule, newEntry.rule)) {
                    renderers[i] = newEntry;
                    return;
                }
            }

            // otherwise we move it to the first position in the list / to being the highest priority rule
            renderers.unshift(newEntry);
        }
    },


    replaceRenderers: function replaceRenderers(newRenderers) {
        validateRules(newRenderers);
        renderers = newRenderers;
    },

    registerLabelLookup: function registerLabelLookup(func) {
        labelLookup = func;
    },

    lookupLabel: function lookupLabel(formConfig, name) {
        return labelLookup ? labelLookup(formConfig, name) : name;
    },

    registerNoneText: function registerNoneText(txt) {
        noneText = txt;
    },

    none: function none() {
        return noneText;
    }
};

GlobalFormConfig.reset();

/**
 * Context object given to the renderer functions.
 * 
 * @typedef {object} FieldRenderContext
 *
 * @property {string} name              path within the form object (e.g. 'value' , 'address.city', 'foos[0].name')
 * @property {string} mode              Field mode 'normal', 'disabled' or 'read-only'
 * @property {string} helpText          Static help text below the field
 * @property {string} title             Field title / tooltip
 * @property {string} label             label to use, defaults to the i18n name of the field (e.g. i18n('Foo:value') )
 * @property {string} placeholder       placeholder text to show inside the input
 * @property {string} inputClass        additional classes for the input element
 * @property {string} wrapperClass      additional classes for the horizontal mode wrapper, ignored if not horizontal
 * @property {string} labelClass        additional classes for the label element
 * @property {object} formik            formik props containing form helper methods ( see https://github.com/jaredpalmer/formik#formik-props )
 * @property {object} formContext       GQLFormContext object from the parent GQLForm
 * @property {string} fieldId           Field id. This is either the id prop given to the Field or type-based auto-generated id

 */
exports.default = GlobalFormConfig;
//# sourceMappingURL=GlobalFormConfig.js.map