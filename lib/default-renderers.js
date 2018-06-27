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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function renderStatic(fieldType, inputClass, fieldValue) {
    var scalarType = (0, _InputSchema.unwrapNonNull)(fieldType);

    var staticRenderer = (0, _GlobalConfig.resolveStaticRenderer)(scalarType.name);

    return _react2.default.createElement(
        "p",
        { className: (0, _classnames2.default)(inputClass, "form-control-plaintext")
        },
        staticRenderer(_InputSchema2.default.valueToScalar(scalarType.name, fieldValue))
    );
}

/**
 * Default rule set.
 */
var DEFAULT_RENDERERS = [{
    rule: { fieldType: "Boolean" },

    // CHECKBOX

    render: function render(ctx) {
        var mode = ctx.mode,
            formConfig = ctx.formConfig,
            fieldId = ctx.fieldId,
            inputClass = ctx.inputClass,
            label = ctx.label,
            labelClass = ctx.labelClass,
            title = ctx.title,
            path = ctx.path,
            qualifiedName = ctx.qualifiedName;
        var formikProps = formConfig.formikProps;


        var fieldValue = (0, _lodash2.default)(formikProps.values, path);

        var effectiveMode = mode || formConfig.options.mode;

        //console.log("checkbox value = ", fieldValue);

        var checkBoxElement = void 0;

        if (effectiveMode === _FieldMode2.default.READ_ONLY) {
            var staticRenderer = (0, _GlobalConfig.resolveStaticRenderer)("Boolean");

            checkBoxElement = _react2.default.createElement(
                "p",
                { className: "form-control-plaintext" },
                staticRenderer(fieldValue),
                label
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
                    onChange: formikProps.handleChange,
                    onBlur: formikProps.handleBlur,
                    disabled: effectiveMode === _FieldMode2.default.DISABLED
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
            name = ctx.name,
            mode = ctx.mode,
            inputClass = ctx.inputClass,
            placeholder = ctx.placeholder,
            formConfig = ctx.formConfig,
            fieldType = ctx.fieldType,
            title = ctx.title,
            path = ctx.path,
            qualifiedName = ctx.qualifiedName;
        var formikProps = formConfig.formikProps;


        var effectiveMode = mode || formConfig.options.mode;

        var errorMessage = (0, _lodash2.default)(formikProps.errors, path);

        var fieldValue = (0, _lodash2.default)(formikProps.values, path);

        var fieldElement = void 0;
        if (effectiveMode === _FieldMode2.default.READ_ONLY) {
            fieldElement = renderStatic(fieldType, inputClass, fieldValue);
        } else {
            var actualType = (0, _InputSchema.unwrapNonNull)(fieldType);

            var enumType = formConfig.schema.getType(actualType.name);

            fieldElement = _react2.default.createElement(
                "select",
                {
                    id: fieldId,
                    name: qualifiedName,
                    className: (0, _classnames2.default)(inputClass, "form-control", errorMessage && "is-invalid"),
                    title: title,
                    disabled: effectiveMode === _FieldMode2.default.DISABLED,
                    value: fieldValue,
                    onChange: formikProps.handleChange,
                    onBlur: formikProps.handleBlur
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
                errorMessage: errorMessage
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
            name = ctx.name,
            mode = ctx.mode,
            inputClass = ctx.inputClass,
            placeholder = ctx.placeholder,
            formConfig = ctx.formConfig,
            fieldType = ctx.fieldType,
            title = ctx.title,
            path = ctx.path,
            qualifiedName = ctx.qualifiedName;
        var _formConfig$options = formConfig.options,
            currency = _formConfig$options.currency,
            currencyAddonRight = _formConfig$options.currencyAddonRight,
            modeFromOptions = _formConfig$options.mode;

        var effectiveMode = mode || modeFromOptions;

        var formikProps = formConfig.formikProps;


        var errorMessage = (0, _lodash2.default)(formikProps.errors, path);

        var fieldValue = (0, _lodash2.default)(formikProps.values, path);
        //console.log({formikProps, fieldValue});

        var fieldElement = void 0;
        if (effectiveMode === _FieldMode2.default.READ_ONLY) {
            fieldElement = renderStatic(fieldType, inputClass, fieldValue);
        } else {
            fieldElement = _react2.default.createElement("input", {
                id: fieldId,
                name: qualifiedName,
                className: (0, _classnames2.default)(inputClass, "form-control", errorMessage && "is-invalid"),
                type: "text",
                placeholder: placeholder,
                title: title,
                disabled: effectiveMode === _FieldMode2.default.DISABLED,
                value: fieldValue,
                onChange: formikProps.handleChange,
                onBlur: formikProps.handleBlur
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
                errorMessage: errorMessage
            }),
            fieldElement
        );
    }
}];

exports.default = DEFAULT_RENDERERS;