"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _classnames = require("classnames");

var _classnames2 = _interopRequireDefault(_classnames);

var _FieldMode = require("./FieldMode");

var _FieldMode2 = _interopRequireDefault(_FieldMode);

var _InputSchema = require("./InputSchema");

var _InputSchema2 = _interopRequireDefault(_InputSchema);

var _GlobalConfig = require("./GlobalConfig");

var _lodash = require("lodash.get");

var _lodash2 = _interopRequireDefault(_lodash);

var _FormGroup = require("./FormGroup");

var _FormGroup2 = _interopRequireDefault(_FormGroup);

var _unwrapType = require("./util/unwrapType");

var _unwrapType2 = _interopRequireDefault(_unwrapType);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function renderStatic(ctx, fieldValue) {
    var fieldId = ctx.fieldId,
        inputClass = ctx.inputClass,
        fieldType = ctx.fieldType;


    var scalarType = (0, _InputSchema.unwrapNonNull)(fieldType);

    var staticRenderer = (0, _GlobalConfig.resolveStaticRenderer)(scalarType.name);

    var value = scalarType.kind === "SCALAR" ? _InputSchema2.default.valueToScalar(scalarType.name, fieldValue) : fieldValue;

    return _react2.default.createElement(
        "span",
        {
            id: fieldId,
            className: (0, _classnames2.default)(inputClass, "form-control-plaintext")
        },
        staticRenderer(value)
    );
}

/**
 * Default rule set.
 */
var DEFAULT_RENDERERS = [{
    rule: { fieldType: "Boolean" },

    // CHECKBOX

    render: function render(ctx) {
        var fieldType = ctx.fieldType,
            mode = ctx.mode,
            formConfig = ctx.formConfig,
            fieldId = ctx.fieldId,
            inputClass = ctx.inputClass,
            label = ctx.label,
            labelClass = ctx.labelClass,
            title = ctx.title,
            path = ctx.path,
            qualifiedName = ctx.qualifiedName,
            onChange = ctx.onChange,
            onBlur = ctx.onBlur;

        // no need to convert

        var fieldValue = formConfig.getValue(path);

        var effectiveMode = mode || formConfig.options.mode;

        //console.log("checkbox value = ", fieldValue);

        var checkBoxElement = void 0;

        if (effectiveMode === _FieldMode2.default.PLAIN_TEXT) {
            var staticRenderer = (0, _GlobalConfig.resolveStaticRenderer)("Boolean");

            checkBoxElement = _react2.default.createElement(
                "span",
                { id: fieldId, className: "form-control-plaintext" },
                staticRenderer(fieldValue),
                _react2.default.createElement(
                    "label",
                    {
                        htmlFor: fieldId
                    },
                    label
                )
            );
        } else {

            checkBoxElement = _react2.default.createElement(
                "div",
                { className: "form-check" },
                _react2.default.createElement("input", {
                    id: fieldId,
                    name: qualifiedName,
                    className: (0, _classnames2.default)(inputClass, "form-check-input"),
                    type: "checkbox",
                    title: title,
                    checked: fieldValue,
                    onChange: onChange,
                    onBlur: onBlur,
                    disabled: effectiveMode === _FieldMode2.default.DISABLED || effectiveMode === _FieldMode2.default.READ_ONLY
                }),
                _react2.default.createElement(
                    "label",
                    {
                        htmlFor: fieldId,
                        className: (0, _classnames2.default)("form-check-label", labelClass) },
                    label
                )
            );
        }

        return _react2.default.createElement(
            _FormGroup2.default,
            _extends({}, ctx, {
                label: ""
            }),
            checkBoxElement
        );
    }
}, {
    rule: { kind: "ENUM" },

    // ENUM SELECT

    render: function render(ctx) {
        var fieldId = ctx.fieldId,
            mode = ctx.mode,
            inputClass = ctx.inputClass,
            formConfig = ctx.formConfig,
            fieldType = ctx.fieldType,
            title = ctx.title,
            path = ctx.path,
            qualifiedName = ctx.qualifiedName,
            onChange = ctx.onChange,
            onBlur = ctx.onBlur;


        var effectiveMode = mode || formConfig.options.mode;

        var errorMessages = formConfig.getErrors(path);
        var fieldValue = formConfig.getValue(path, errorMessages);

        var fieldElement = void 0;
        if (effectiveMode === _FieldMode2.default.PLAIN_TEXT) {
            fieldElement = renderStatic(ctx, fieldValue);
        } else {
            var actualType = (0, _InputSchema.unwrapNonNull)(fieldType);

            var enumType = formConfig.schema.getType(actualType.name);

            fieldElement = _react2.default.createElement(
                "select",
                {
                    id: fieldId,
                    name: qualifiedName,
                    className: (0, _classnames2.default)(inputClass, "form-control", errorMessages.length > 0 && "is-invalid"),
                    title: title,
                    disabled: effectiveMode === _FieldMode2.default.DISABLED || effectiveMode === _FieldMode2.default.READ_ONLY,
                    value: fieldValue,
                    onChange: onChange,
                    onBlur: onBlur
                },
                enumType.enumValues.map(function (enumValue) {
                    return _react2.default.createElement(
                        "option",
                        { key: enumValue.name },
                        enumValue.name
                    );
                })
            );
        }

        return _react2.default.createElement(
            _FormGroup2.default,
            _extends({}, ctx, {
                errorMessages: errorMessages
            }),
            fieldElement
        );
    }
}, {
    // DEFAULT RULE
    rule: false,

    /**
     *
     * @param {FieldRenderContext} ctx
     * @returns {*}
     */
    render: function render(ctx) {
        var fieldId = ctx.fieldId,
            mode = ctx.mode,
            inputClass = ctx.inputClass,
            placeholder = ctx.placeholder,
            formConfig = ctx.formConfig,
            fieldType = ctx.fieldType,
            title = ctx.title,
            path = ctx.path,
            qualifiedName = ctx.qualifiedName,
            onChange = ctx.onChange,
            onBlur = ctx.onBlur,
            autoFocus = ctx.autoFocus;
        var _formConfig$options = formConfig.options,
            currency = _formConfig$options.currency,
            currencyAddonRight = _formConfig$options.currencyAddonRight,
            modeFromOptions = _formConfig$options.mode;

        var effectiveMode = mode || modeFromOptions;

        var errorMessages = formConfig.getErrors(qualifiedName);
        var fieldValue = _InputSchema2.default.scalarToValue((0, _unwrapType2.default)(fieldType).name, formConfig.getValue(path, errorMessages));

        //console.log("RENDER FIELD",{ ctx, fieldValue });

        var fieldElement = void 0;
        if (effectiveMode === _FieldMode2.default.PLAIN_TEXT) {
            fieldElement = renderStatic(ctx, fieldValue);
        } else {
            fieldElement = _react2.default.createElement("input", {
                id: fieldId,
                name: qualifiedName,
                className: (0, _classnames2.default)(inputClass, "form-control", errorMessages.length > 0 && "is-invalid"),
                type: "text",
                placeholder: placeholder,
                title: title,
                disabled: effectiveMode === _FieldMode2.default.DISABLED,
                readOnly: effectiveMode === _FieldMode2.default.READ_ONLY,
                value: fieldValue,
                onChange: onChange,
                onBlur: onBlur,
                autoFocus: autoFocus ? true : null
            });

            if (fieldType.name === "Currency") {
                if (currencyAddonRight) {
                    fieldElement = _react2.default.createElement(
                        "div",
                        { className: "input-group mb-3" },
                        fieldElement,
                        _react2.default.createElement(
                            "span",
                            { className: "input-group-append" },
                            _react2.default.createElement(
                                "span",
                                { className: "input-group-text" },
                                currency
                            )
                        )
                    );
                } else {

                    fieldElement = _react2.default.createElement(
                        "div",
                        { className: "input-group mb-3" },
                        _react2.default.createElement(
                            "span",
                            { className: "input-group-prepend" },
                            _react2.default.createElement(
                                "span",
                                { className: "input-group-text" },
                                currency
                            )
                        ),
                        fieldElement
                    );
                }
            }
        }

        return _react2.default.createElement(
            _FormGroup2.default,
            _extends({}, ctx, {
                errorMessages: errorMessages
            }),
            fieldElement
        );
    }
}];

exports.default = DEFAULT_RENDERERS;
//# sourceMappingURL=default-renderers.js.map