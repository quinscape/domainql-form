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

var _FormGroup = require("./FormGroup");

var _FormGroup2 = _interopRequireDefault(_FormGroup);

var _Field = require("./Field");

var _Field2 = _interopRequireDefault(_Field);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var count = 0;

/**
 * Custom form group to render arbitrary content encapsulated by a form group with label. If you need an actual
 * custom input, use Field in your own component. (see e.g. TextArea as an example of a custom field)
 */

var CustomGroup = function (_React$Component) {
    _inherits(CustomGroup, _React$Component);

    function CustomGroup() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, CustomGroup);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = CustomGroup.__proto__ || Object.getPrototypeOf(CustomGroup)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
            fieldId: _this.props.id || "custom-" + count++
        }, _this.renderWithFieldContext = function (formConfig, fieldContext) {
            var _this$props = _this.props,
                label = _this$props.label,
                labelClass = _this$props.labelClass,
                children = _this$props.children;


            if (typeof children !== "function") {
                throw new Error("GQLCustomGroup expects a single function child");
            }

            return _react2.default.createElement(
                _FormGroup2.default,
                _extends({}, fieldContext, {
                    formConfig: formConfig,
                    label: label,
                    labelClass: labelClass
                }),
                children(fieldContext)
            );
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(CustomGroup, [{
        key: "render",
        value: function render() {
            return _react2.default.createElement(
                _Field2.default,
                _extends({}, this.props, {
                    id: this.state.fieldId,
                    name: ""
                }),
                this.renderWithFieldContext
            );
        }
    }]);

    return CustomGroup;
}(_react2.default.Component);

CustomGroup.propTypes = {
    // label text
    label: _propTypes2.default.string.isRequired,
    children: _propTypes2.default.func.isRequired,
    // optional field id
    id: _propTypes2.default.string,
    // optional label class
    labelClass: _propTypes2.default.string
};
CustomGroup.defaultProps = {
    rows: 5,
    columns: 60
};
exports.default = CustomGroup;