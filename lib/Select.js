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

var _GlobalConfig = require("./GlobalConfig");

var _GlobalConfig2 = _interopRequireDefault(_GlobalConfig);

var _withFormConfig = require("./withFormConfig");

var _withFormConfig2 = _interopRequireDefault(_withFormConfig);

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
 * Allows selection from a list of string values for a target field.
 */
var Select = function (_React$Component) {
    _inherits(Select, _React$Component);

    function Select() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, Select);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Select.__proto__ || Object.getPrototypeOf(Select)).call.apply(_ref, [this].concat(args))), _this), _this.handleChange = function (fieldContext, ev) {
            var onChange = _this.props.onChange;


            if (onChange) {
                onChange(ev, fieldContext);
            }

            if (!ev.isDefaultPrevented()) {
                return fieldContext.formConfig.formikProps.handleChange(ev);
            }
        }, _this.renderWithFieldContext = function (fieldContext) {
            //console.log("render Select", fieldContext);

            var _this$props = _this.props,
                values = _this$props.values,
                inputClass = _this$props.inputClass,
                required = _this$props.required;
            var formConfig = fieldContext.formConfig,
                path = fieldContext.path,
                qualifiedName = fieldContext.qualifiedName;
            var formikProps = formConfig.formikProps;


            var errorMessage = (0, _lodash2.default)(formikProps.errors, path);
            var fieldValue = (0, _lodash2.default)(formikProps.values, path);

            var noneText = _GlobalConfig2.default.none();

            return _react2.default.createElement(
                _FormGroup2.default,
                _extends({}, fieldContext, {
                    errorMessage: errorMessage
                }),
                _react2.default.createElement(
                    "select",
                    {
                        className: (0, _classnames2.default)(inputClass, "form-control", errorMessage && "is-invalid"),
                        name: qualifiedName,
                        value: fieldValue,
                        onChange: function onChange(ev) {
                            return _this.handleChange(fieldContext, ev);
                        },
                        onBlur: formikProps.handleBlur
                    },
                    !required && _react2.default.createElement(
                        "option",
                        { key: "", value: "" },
                        noneText
                    ),
                    values.map(function (v) {

                        var name = void 0,
                            value = void 0;
                        if (typeof v === "string") {
                            name = v;
                            value = v;
                        } else {
                            name = v.name;
                            value = v.value;
                        }

                        return _react2.default.createElement(
                            "option",
                            {
                                key: value,
                                value: value
                            },
                            name
                        );
                    })
                )
            );
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Select, [{
        key: "render",
        value: function render() {
            return _react2.default.createElement(
                _Field2.default,
                _extends({}, this.props, {
                    values: null
                }),
                this.renderWithFieldContext
            );
        }
    }]);

    return Select;
}(_react2.default.Component);

Select.defaultProps = {
    required: false
};
exports.default = (0, _withFormConfig2.default)(Select);