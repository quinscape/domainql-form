"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DEFAULT_NONE_TEXT = undefined;
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

var DEFAULT_NONE_TEXT = exports.DEFAULT_NONE_TEXT = "---";

var noneText = DEFAULT_NONE_TEXT;

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
 * Global static configuration object for field renderers, static type renderers and other global configuration settings.
 *
 * @type {{get: (function(*)), renderStatic: (function(*=, *=): *), reset: GlobalConfig.reset, register(*=): undefined, replaceRenderers: GlobalConfig.replaceRenderers, registerLabelLookup: GlobalConfig.registerLabelLookup, lookupLabel: (function(*=, *=): *), registerNoneText: GlobalConfig.registerNoneText, none: (function(): string)}}
 */
var GlobalConfig = {

    /**
     * Resolves the render method for the given context
     *
     * @param fieldContext              field context object
     */
    getRenderFn: function getRenderFn(formConfig, fieldContext) {
        var fieldType = fieldContext.fieldType,
            path = fieldContext.path;


        var actualType = (0, _InputSchema.unwrapNonNull)(fieldType);

        //console.log("GET RENDERER", fieldType, path, "=>", actualType);

        if (!(0, _InputSchema.isScalarType)(actualType) && !(0, _InputSchema.isEnumType)(actualType)) {
            throw new Error("Field  type for " + formConfig.type + "." + path + " is no scalar or enum: " + JSON.stringify(actualType));
        }

        return findRenderer(formConfig.type, actualType.kind, actualType.name, path[path.length - 1]);
    },

    renderStatic: function renderStatic(typeName, value) {
        return resolveStaticRenderer(typeName)(value);
    },

    reset: function reset() {

        GlobalConfig.replaceRenderers(_defaultRenderers2.default);

        staticRenderers = _defaultStaticRenderers2.default;
    },
    register: function register(newRule) {
        // if we have no rule
        if (!newRule.rule) {
            // we replace the last entry because we can only have one entry without rule / being the default renderer
            var last = renderers.length - 1;
            renderers[last] = newRule;
        } else {
            // replace renderer if we find the exact same rule
            for (var i = 0; i < renderers.length; i++) {
                var e = renderers[i];

                if (isEqual(e.rule, newRule.rule)) {
                    renderers[i] = newRule;
                    return;
                }
            }

            // otherwise we move it to the first position in the list / to being the highest priority rule
            renderers.unshift(newRule);
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

GlobalConfig.reset();

exports.default = GlobalConfig;