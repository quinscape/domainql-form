"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = function (Component) {
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

            return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = _class.__proto__ || Object.getPrototypeOf(_class)).call.apply(_ref, [this].concat(args))), _this), _this.renderWithFormConfig = function (formConfig) {
                return _react2.default.createElement(Component, _extends({}, _this.props, {
                    formConfig: formConfig
                }));
            }, _temp), _possibleConstructorReturn(_this, _ret);
        }

        _createClass(_class, [{
            key: "render",
            value: function render() {
                return _react2.default.createElement(
                    _FormConfig2.default.Consumer,
                    null,
                    this.renderWithFormConfig
                );
            }
        }]);

        return _class;
    }(_react2.default.Component), _class.displayName = "withFormConfig(" + (0, _getDisplayName2.default)(Component) + ")", _temp2;
};

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _FormConfig = require("./FormConfig");

var _FormConfig2 = _interopRequireDefault(_FormConfig);

var _getDisplayName = require("./util/getDisplayName");

var _getDisplayName2 = _interopRequireDefault(_getDisplayName);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Convenience HOC that provides the current FormConfig as formConfig prop to the wrapper component, the advantage
 * over just using FormConfig.Provider being that the formConfig prop is also accessible in lifecycle methods and event
 * handlers.
 *
 * @param {ReactElement} Component
 * @return {function} Component that will automatically receive a "formConfig" prop
 */