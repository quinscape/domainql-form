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

var _FormConfig = require("./FormConfig");

var _FormConfig2 = _interopRequireDefault(_FormConfig);

var _FormConfigPropTypes = require("./FormConfigPropTypes");

var _FormConfigPropTypes2 = _interopRequireDefault(_FormConfigPropTypes);

var _InputSchema = require("./InputSchema");

var _InputSchema2 = _interopRequireDefault(_InputSchema);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Allows the definition defaults for form config options and schema at the top of the application component hierarchy.
 */
var FormConfigProvider = function (_React$Component) {
    _inherits(FormConfigProvider, _React$Component);

    function FormConfigProvider() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, FormConfigProvider);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = FormConfigProvider.__proto__ || Object.getPrototypeOf(FormConfigProvider)).call.apply(_ref, [this].concat(args))), _this), _this.state = FormConfigProvider.getDerivedStateFromProps(_this.props, null), _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(FormConfigProvider, [{
        key: "render",
        value: function render() {
            var children = this.props.children;


            return _react2.default.createElement(
                _FormConfig2.default.Provider,
                { value: this.state.formConfig },
                children
            );
        }
    }], [{
        key: "getDerivedStateFromProps",
        value: function getDerivedStateFromProps(nextProps, prevState) {
            var formConfig = new _FormConfig2.default(nextProps, nextProps.schema);

            if (prevState && formConfig.equals(prevState.formConfig)) {
                return null;
            }

            return {
                formConfig: formConfig
            };
        }
    }]);

    return FormConfigProvider;
}(_react2.default.Component);

FormConfigProvider.propTypes = _extends({
    // provides the input schema for all child <Form/> components.
    schema: _propTypes2.default.oneOfType([_propTypes2.default.instanceOf(_InputSchema2.default), _propTypes2.default.object])
}, _FormConfigPropTypes2.default);
exports.default = FormConfigProvider;