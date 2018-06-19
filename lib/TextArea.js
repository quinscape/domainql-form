"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _FieldMode = require("./FieldMode");

var _FieldMode2 = _interopRequireDefault(_FieldMode);

var _FormGroup = require("./FormGroup");

var _FormGroup2 = _interopRequireDefault(_FormGroup);

var _Field = require("./Field");

var _Field2 = _interopRequireDefault(_Field);

var _lodash = require("lodash.get");

var _lodash2 = _interopRequireDefault(_lodash);

var _classnames = require("classnames");

var _classnames2 = _interopRequireDefault(_classnames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Edits a string GraphQL field with a text area element.
 *
 * This is a good example how to implement custom fields.
 */
var TextArea = function (_React$Component) {
    _inherits(TextArea, _React$Component);

    function TextArea() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, TextArea);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = TextArea.__proto__ || Object.getPrototypeOf(TextArea)).call.apply(_ref, [this].concat(args))), _this), _this.renderWithFieldContext = function (fieldContext) {
            var _this$props = _this.props,
                rows = _this$props.rows,
                cols = _this$props.cols,
                inputClass = _this$props.inputClass,
                placeholder = _this$props.placeholder;
            var qualifiedName = fieldContext.qualifiedName,
                path = fieldContext.path;
            var formikProps = fieldContext.formConfig.formikProps;


            var errorMessage = (0, _lodash2.default)(formikProps.errors, path);
            var fieldValue = (0, _lodash2.default)(formikProps.values, path);

            return _react2.default.createElement(
                _FormGroup2.default,
                _extends({}, fieldContext, {
                    errorMessage: errorMessage
                }),
                _react2.default.createElement("textarea", {
                    className: (0, _classnames2.default)(inputClass, "form-control", errorMessage && "is-invalid"),
                    rows: rows,
                    cols: cols,
                    name: qualifiedName,
                    value: fieldValue,
                    placeholder: placeholder,
                    onChange: formikProps.handleChange,
                    onBlur: formikProps.handleBlur
                })
            );
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(TextArea, [{
        key: "render",
        value: function render() {
            return _react2.default.createElement(
                _Field2.default,
                _extends({}, this.props, {
                    rows: null,
                    cols: null
                }),
                this.renderWithFieldContext
            );
        }
    }]);

    return TextArea;
}(_react2.default.Component);

TextArea.propTypes = {
    /**
     * Name / path for this field (e.g. "name", but also "foos.0.name")
     */
    name: _propTypes2.default.string.isRequired,
    /**
     * Mode for this field. If not set or set to null, the mode will be inherited from the &lt;Form/&gt; or &lt;FormBlock&gt;.
     */
    mode: _propTypes2.default.oneOf(_FieldMode2.default.values()),
    /**
     * Additional help text for this field. Is rendered for non-erroneous fields in place of the error.
     */
    helpText: _propTypes2.default.string,
    /**
     * Title attribute
     */
    title: _propTypes2.default.string,
    /**
     * Label for the field.
     */
    label: _propTypes2.default.string,
    /**
     * Placeholder text to render for the empty text area.
     */
    placeholder: _propTypes2.default.string,

    /**
     * Additional HTML classes for the textarea element.
     */
    inputClass: _propTypes2.default.string,

    /**
     * Additional HTML classes for the label element.
     */
    labelClass: _propTypes2.default.string,

    /**
     * Rows attribute for the textarea element (default is 3)
     */
    rows: _propTypes2.default.number,
    /**
     * Cols attribute for the textarea element (default is 60)
     */
    cols: _propTypes2.default.number
};
TextArea.defaultProps = {
    rows: 3,
    cols: 60
};
exports.default = TextArea;
//# sourceMappingURL=TextArea.js.map