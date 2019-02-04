"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _classnames = require("classnames");

var _classnames2 = _interopRequireDefault(_classnames);

var _FieldMode = require("./FieldMode");

var _FieldMode2 = _interopRequireDefault(_FieldMode);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Renders a .form-group wrapper from our standard render context. Is used by internally the default field renderers
 * and can be used for implementing custom fields.
 *
 * If you just need a bootstrap form group with arbitrary content, use CustomGroup.
 *
 * Read [Form Customization](./customization.md) for an usage example and make sure FormGroup is what you want.
 */
var FormGroup = function (_React$Component) {
    _inherits(FormGroup, _React$Component);

    function FormGroup() {
        _classCallCheck(this, FormGroup);

        return _possibleConstructorReturn(this, (FormGroup.__proto__ || Object.getPrototypeOf(FormGroup)).apply(this, arguments));
    }

    _createClass(FormGroup, [{
        key: "render",
        value: function render() {
            var _props = this.props,
                formConfig = _props.formConfig,
                fieldId = _props.fieldId,
                label = _props.label,
                helpText = _props.helpText,
                labelClass = _props.labelClass,
                errorMessages = _props.errorMessages,
                mode = _props.mode,
                children = _props.children;


            if (mode === _FieldMode2.default.INVISIBLE) {
                return false;
            }

            var _formConfig$options = formConfig.options,
                horizontal = _formConfig$options.horizontal,
                labelColumnClass = _formConfig$options.labelColumnClass,
                wrapperColumnClass = _formConfig$options.wrapperColumnClass;

            //console.log("RENDER FormGroup", { horizontal, labelColumnClass, wrapperColumnClass });

            var labelElement = label ? _react2.default.createElement(
                "label",
                {
                    className: (0, _classnames2.default)(horizontal ? labelColumnClass : null, horizontal ? "col-form-label" : null, labelClass),
                    htmlFor: fieldId
                },
                label
            ) : horizontal && _react2.default.createElement(
                "div",
                { className: labelColumnClass },
                "\xA0"
            );

            var helpBlock = false;

            var haveErrors = errorMessages && errorMessages.length > 0;

            var formText = haveErrors ? errorMessages.slice(1) : helpText && [helpText];

            if (formText) {
                helpBlock = _react2.default.createElement(
                    "p",
                    { className: (0, _classnames2.default)("form-group", haveErrors ? "invalid-feedback" : "text-muted") },
                    formText.map(function (txt, idx) {
                        return _react2.default.createElement(
                            "span",
                            { key: idx },
                            " ",
                            txt,
                            " "
                        );
                    })
                );
            }

            return _react2.default.createElement(
                "div",
                { className: (0, _classnames2.default)("form-group", horizontal ? "form-row" : null, haveErrors && "has-error") },
                labelElement,
                horizontal ? _react2.default.createElement(
                    "div",
                    { className: wrapperColumnClass || "col-md-9" },
                    children,
                    helpBlock
                ) : children,
                !horizontal && helpBlock
            );
        }
    }]);

    return FormGroup;
}(_react2.default.Component);

FormGroup.propTypes = {
    /**
     * Marker class for the form group, (default is "form-group")
     */
    formGroupClass: _propTypes2.default.string,

    /**
     * Error messages to render for this form group.
     */
    errorMessages: _propTypes2.default.array
};
FormGroup.defaultProps = {
    formGroupClass: "form-group"
};
exports.default = FormGroup;