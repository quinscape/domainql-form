"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _lodash = require("lodash.topath");

var _lodash2 = _interopRequireDefault(_lodash);

var _GlobalConfig = require("./GlobalConfig");

var _GlobalConfig2 = _interopRequireDefault(_GlobalConfig);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _FieldMode = require("./FieldMode");

var _FieldMode2 = _interopRequireDefault(_FieldMode);

var _withFormConfig = require("./withFormConfig");

var _withFormConfig2 = _interopRequireDefault(_withFormConfig);

var _InputSchema = require("./InputSchema");

var _InputSchema2 = _interopRequireDefault(_InputSchema);

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

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Field.__proto__ || Object.getPrototypeOf(Field)).call.apply(_ref, [this].concat(args))), _this), _this.onChange = function (ev) {
            var _ev$target = ev.target,
                name = _ev$target.name,
                value = _ev$target.value;
            var formConfig = _this.props.formConfig;
            var fieldType = _this.state.fieldContext.fieldType;


            formConfig.handleChange(fieldType, name, value);
        }, _this.onBlur = function (ev) {
            var _ev$target2 = ev.target,
                name = _ev$target2.name,
                value = _ev$target2.value;
            var formConfig = _this.props.formConfig;
            var fieldType = _this.state.fieldContext.fieldType;


            formConfig.handleBlur(fieldType, name, value);
        }, _this.state = {
            onChange: _this.onChange,
            onBlur: _this.onBlur,
            fieldContext: null
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Field, [{
        key: "render",
        value: function render() {
            var fieldContext = this.state.fieldContext;


            if (typeof children === "function") {
                return children(fieldContext);
            } else {
                var renderFn = _GlobalConfig2.default.get(fieldContext);
                return renderFn(fieldContext);
            }
        }
    }], [{
        key: "getDerivedStateFromProps",
        value: function getDerivedStateFromProps(nextProps, prevState) {
            var id = nextProps.id,
                name = nextProps.name,
                label = nextProps.label,
                formConfig = nextProps.formConfig,
                autoFocus = nextProps.autoFocus;

            // do we have a field type already and did the form config and id and name not change from last time?

            if (prevState.fieldContext && prevState.id === id && prevState.name === name && prevState.label === label

            // XXX: none of the functionality here should be sensitive to form config changes. Uncomment if this is wrong
            /*&& prevState.formConfig.equals(formConfig)*/
            ) {
                    // yes -> no update
                    //console.log("NO UPDATE");
                    return null;
                }

            var qualifiedName = formConfig.getPath(name);
            var path = (0, _lodash2.default)(qualifiedName);

            var fieldId = void 0;
            var effectiveLabel = void 0;

            if (name && name.length) {
                var lastSegment = path[path.length - 1];
                fieldId = id || "field-" + type + "-" + lastSegment;
                effectiveLabel = typeof label === "string" ? label : formConfig.options.lookupLabel(formConfig, lastSegment);
            } else {
                fieldId = id;
                effectiveLabel = label || "";
            }

            // update field state
            return {
                fieldContext: {
                    formConfig: formConfig,
                    fieldId: fieldId,
                    fieldType: formConfig.schema.resolveType(type, path),
                    qualifiedName: qualifiedName,
                    path: path,
                    label: effectiveLabel,
                    onChange: prevState.onChange,
                    onBlur: prevState.onBlur,
                    autoFocus: autoFocus
                }
            };
        }
    }]);

    return Field;
}(_react2.default.Component);

Field.propTypes = {
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
     * Placeholder text to render for text inputs.
     */
    placeholder: _propTypes2.default.string,

    /**
     * Additional HTML classes for the input element.
     */
    inputClass: _propTypes2.default.string,

    /**
     * Additional HTML classes for the label element.
     */
    labelClass: _propTypes2.default.string,

    /**
     * Optional change handler to use
     */
    onChange: _propTypes2.default.func,

    /**
     * Optional blur handler to use
     */
    onBlur: _propTypes2.default.func,

    /**
     * Pass-through autoFocus attribute for text inputs
     */
    autoFocus: _propTypes2.default.bool
};
exports.default = (0, _withFormConfig2.default)(Field);
//# sourceMappingURL=Field.js.map