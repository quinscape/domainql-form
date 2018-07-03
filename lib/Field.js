"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _lodash = require("lodash.topath");

var _lodash2 = _interopRequireDefault(_lodash);

var _GlobalConfig = require("./GlobalConfig");

var _GlobalConfig2 = _interopRequireDefault(_GlobalConfig);

var _FormConfig = require("./FormConfig");

var _FormConfig2 = _interopRequireDefault(_FormConfig);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _FieldMode = require("./FieldMode");

var _FieldMode2 = _interopRequireDefault(_FieldMode);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Renders a bootstrap 4 form group with an input field for the given name/path within the current form object. The actual
 * field rendered is resolved by the render rules in GlobalConfig.js ( See ["Form Customization"](./customization.md) for details)
 */
var Field = function (_React$Component) {
    _inherits(Field, _React$Component);

    function Field() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, Field);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Field.__proto__ || Object.getPrototypeOf(Field)).call.apply(_ref, [this].concat(args))), _this), _this.renderWithFormConfig = function (formConfig) {
            var _this$props = _this.props,
                id = _this$props.id,
                name = _this$props.name,
                label = _this$props.label,
                children = _this$props.children,
                onChange = _this$props.onChange,
                onBlur = _this$props.onBlur,
                autoFocus = _this$props.autoFocus;
            var type = formConfig.type,
                formikProps = formConfig.formikProps;


            var fieldId = void 0;
            var qualifiedName = void 0;
            var path = void 0;
            var fieldType = void 0;
            var effectiveLabel = void 0;

            if (name && name.length) {
                qualifiedName = formConfig.getPath(name);
                path = (0, _lodash2.default)(qualifiedName);
                var lastSegment = path[path.length - 1];

                fieldId = id || "field-" + type + "-" + lastSegment;

                fieldType = formConfig.schema.resolveType(type, path);
                effectiveLabel = typeof label === "string" ? label : formConfig.options.lookupLabel(formConfig, lastSegment);
            } else {
                fieldId = id;
                qualifiedName = null;
                path = null;
                fieldType = null;
                effectiveLabel = label || "";
            }

            var fieldContext = _extends({
                formConfig: formConfig,
                fieldId: fieldId,
                fieldType: fieldType,
                qualifiedName: qualifiedName,
                path: path,
                label: effectiveLabel,
                onChange: onChange || formikProps.handleChange,
                onBlur: onBlur || formikProps.handleBlur,
                autoFocus: autoFocus
            }, _this.props);

            if (typeof children === "function") {
                return children(fieldContext);
            } else {
                var renderFn = _GlobalConfig2.default.get(fieldContext);
                return renderFn(fieldContext);
            }
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Field, [{
        key: "render",
        value: function render() {
            return _react2.default.createElement(
                _FormConfig2.default.Consumer,
                null,
                this.renderWithFormConfig
            );
        }
    }]);

    return Field;
}(_react2.default.Component);

exports.default = Field;