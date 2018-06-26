"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _lodash = require("lodash.get");

var _lodash2 = _interopRequireDefault(_lodash);

var _GlobalConfig = require("./GlobalConfig");

var _GlobalConfig2 = _interopRequireDefault(_GlobalConfig);

var _FormConfig = require("./FormConfig");

var _FormConfig2 = _interopRequireDefault(_FormConfig);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Helper to render a static value without form or form field.
 */
var StaticText = function (_React$Component) {
    _inherits(StaticText, _React$Component);

    function StaticText() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, StaticText);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = StaticText.__proto__ || Object.getPrototypeOf(StaticText)).call.apply(_ref, [this].concat(args))), _this), _this.renderWithFormContext = function (formConfig) {
            var _this$props = _this.props,
                name = _this$props.name,
                value = _this$props.value,
                type = _this$props.type,
                schema = _this$props.schema;


            var result = void 0,
                resultType = void 0;
            if (name) {
                var path = formConfig.getPath(name);
                resultType = schema.resolveType(formConfig.type, path);
                result = (0, _lodash2.default)(value, path);
            } else {
                resultType = schema.getType(type);
                result = value;
            }

            return _GlobalConfig2.default.renderStatic(resultType.name, result);
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(StaticText, [{
        key: "shouldComponentUpdate",
        value: function shouldComponentUpdate(nextProps, nextState) {
            var props = this.props;


            return props.type !== nextProps.type || props.value !== nextProps.value || props.name !== nextProps.name;
        }
    }, {
        key: "render",
        value: function render() {
            return _react2.default.createElement(
                _FormConfig2.default.Consumer,
                null,
                this.renderWithFormContext
            );
        }
    }]);

    return StaticText;
}(_react2.default.Component);

exports.default = StaticText;