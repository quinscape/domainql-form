"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = function (Component, formProps) {
    var _class, _temp2;

    return _temp2 = _class = function (_React$Component) {
        _inherits(_class, _React$Component);

        function _class() {
            var _ref;

            var _temp, _this, _ret;

            _classCallCheck(this, _class);

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = _class.__proto__ || Object.getPrototypeOf(_class)).call.apply(_ref, [this].concat(args))), _this), _this.onSubmit = function (value, actions) {
                return _this._component.props.onSubmit(value, actions);
            }, _this.renderWithFormConfig = function (formConfig) {
                return _react2.default.createElement(Component, _extends({
                    ref: function ref(c) {
                        return _this._component = c;
                    }
                }, _this.props, {
                    formConfig: formConfig
                }));
            }, _temp), _possibleConstructorReturn(_this, _ret);
        }

        _createClass(_class, [{
            key: "render",
            value: function render() {
                var value = this.props.value;

                return _react2.default.createElement(
                    _Form2.default,
                    _extends({}, formProps, {
                        onSubmit: this.onSubmit,
                        validate: this.props.validate,
                        value: value
                    }),
                    this.renderWithFormConfig
                );
            }
        }]);

        return _class;
    }(_react2.default.Component), _class.displayName = "withForm(" + (0, _getDisplayName2.default)(Component) + ")", _temp2;
};

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _Form = require("./Form");

var _Form2 = _interopRequireDefault(_Form);

var _getDisplayName = require("./util/getDisplayName");

var _getDisplayName2 = _interopRequireDefault(_getDisplayName);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Convenience HOC that render a domainql-form around the wrapped component, providing
 * it with the form config as props
 *
 * @param {ReactElement} Component      component to enhance
 * @param {object} formProps            props for the <Form/> 
 *
 * @return {function} Component that will automatically receive a "formConfig" prop
 */