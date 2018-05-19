import React from "react"

import DEFAULT_RENDERERS from "./default-renderers"
import DEFAULT_STATIC_RENDERERS from "./default-static-renderers"

import { isEnumType, isScalarType, unwrapNonNull } from "./InputSchema";

let renderers;
let labelLookup = null;
let staticRenderers;

let noneText = "---";

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
function matchesRule(rule, currentType, currentKind, currentFieldType, currentName)
{
    const { type, fieldType, kind, name } = rule;

    return (
        (type !== undefined && type === currentType) ||
        (kind !== undefined && kind === currentKind) ||
        (fieldType !== undefined && fieldType === currentFieldType) ||
        (name !== undefined && name === currentName)
    );
}

function validateRule(rule, index)
{
    const { type, kind, fieldType, name } = rule;

    if (type === undefined && kind === undefined && fieldType === undefined && name === undefined)
    {
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
function isEqual(ruleA, ruleB)
{
    const { type: typeA, kind: kindA, fieldType: fieldTypeA, name: nameA } = ruleA;
    const { type: typeB, kind: kindB, fieldType: fieldTypeB, name: nameB } = ruleB;
    return typeA === typeB && kindA === kindB && fieldTypeA === fieldTypeB && nameA === nameB;
}

function validateRules(rules)
{
    const len = rules.length;
    if (!rules || !len)
    {
        throw new Error("Rules must be a list of renderer entry objects { rule, renderer }")
    }

    const last = len - 1;
    for (let i = 0; i < len; i++)
    {
        const e = rules[i];

        if (i === last)
        {
            if (e.rule)
            {
                throw new Error("The last rule entry is the default entry and must have a rule = false");
            }
        }
        else
        {
            if (!e.rule)
            {
                throw new Error("Only the last rule entry can have no rule: Entry #" + i + " of " + length + " has no rule" );
            }
            validateRule(e.rule, i);
        }

        if (typeof e.render !== "function")
        {
            throw new Error("render property is not a function:  Entry #" + i + " of " + length );
        }
    }
}

function findRenderer(type, kind, fieldType, fieldName)
{
    const last = renderers.length - 1;
    for (let i = 0; i < last; i++)
    {
        const { rule, render } = renderers[i];

        if (matchesRule(rule, type, kind, fieldType, fieldName))
        {
            //console.log(renderers[i], "matches", {type, fieldType, fieldName});
            return render;
        }
    }
    return renderers[last].render;
}

function defaultStaticRenderer(value)
{
    return String(value);
}

export function resolveStaticRenderer(name)
{
    return staticRenderers[name] || defaultStaticRenderer;
}

/**
 *
 * @type {{get: FormConfig.get, reset: FormConfig.reset, register(*=): void, replaceRenderers: FormConfig.replaceRenderers}}
 */
const FormConfig = {

    /**
     * Resolves the render method for the given context
     *
     * @param fieldContext              field context object
     * @param name                      field name / path
     */
    get: function(fieldContext)
    {
        const { fieldType, path } = fieldContext;

        const actualType = unwrapNonNull(fieldType);

        //console.log("GET RENDERER", fieldType, path, "=>", actualType);

        if ( !isScalarType(actualType) && !isEnumType(actualType))
        {
            throw new Error("Field  type for "+ fieldContext.formContext.type + "." + path + " is no scalar or enum: " + JSON.stringify(actualType));
        }

        return findRenderer( fieldContext.formContext.type, actualType.kind, actualType.name, path[path.length - 1]);
    },

    renderStatic: function(typeName, value)
    {
        return resolveStaticRenderer(typeName)(value);
    },

    reset: function () {

        FormConfig.replaceRenderers(
            DEFAULT_RENDERERS
        );

        staticRenderers = DEFAULT_STATIC_RENDERERS;
    },
    register(newEntry)
    {
        // if we have no rule
        if (!newEntry.rule)
        {
            // we replace the last entry because we can only have one entry without rule / being the default renderer
            const last = renderers.length - 1;
            renderers[last] = newEntry;
        }
        else
        {
            // replace renderer if we find the exact same rule
            for (let i = 0; i < renderers.length; i++)
            {
                const e = renderers[i];

                if (isEqual(e.rule, newEntry.rule))
                {
                    renderers[i] = newEntry;
                    return;
                }
            }

            // otherwise we move it to the first position in the list / to being the highest priority rule
            renderers.unshift(newEntry);
        }
    },

    replaceRenderers: function(newRenderers)
    {
        validateRules(newRenderers);
        renderers = newRenderers;
    },

    registerLabelLookup: function(func)
    {
        labelLookup = func;
    },

    lookupLabel: function(formContext, name) {
        return labelLookup ? labelLookup(formContext, name) : name;
    },

    registerNoneText: function(txt)
    {
        noneText = txt;
    },

    none: function () {
        return noneText;
    }
};


FormConfig.reset();

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
 * @property {string} fieldId           Field id. This is either the id prop given to the GQLField or type-based auto-generated id

 */
export default FormConfig;

