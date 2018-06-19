"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _classnames = require("classnames");

var _classnames2 = _interopRequireDefault(_classnames);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _withFormConfig = require("./withFormConfig");

var _withFormConfig2 = _interopRequireDefault(_withFormConfig);

var _FormConfig = require("./FormConfig");

var _FormConfig2 = _interopRequireDefault(_FormConfig);

var _FormConfigPropTypes = require("./FormConfigPropTypes");

var _FormConfigPropTypes2 = _interopRequireDefault(_FormConfigPropTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * A form block defining a changed form configuration for the fields
 * contained within.
 */
var FormBlock = function (_React$Component) {
    _inherits(FormBlock, _React$Component);

    function FormBlock() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, FormBlock);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = FormBlock.__proto__ || Object.getPrototypeOf(FormBlock)).call.apply(_ref, [this].concat(args))), _this), _this.state = FormBlock.getDerivedStateFromProps(_this.props), _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(FormBlock, [{
        key: "render",
        value: function render() {
            var _props = this.props,
                className = _props.className,
                style = _props.style,
                children = _props.children;


            return _react2.default.createElement(
                _FormConfig2.default.Provider,
                { value: this.state.formConfig },
                _react2.default.createElement(
                    "div",
                    { className: (0, _classnames2.default)("dql-block", className), style: style },
                    children
                )
            );
        }
    }], [{
        key: "getDerivedStateFromProps",
        value: function getDerivedStateFromProps(nextProps, prevState) {
            var parentConfig = nextProps.formConfig;


            if (!parentConfig || !parentConfig.schema || !parentConfig.type) {
                throw new Error("<FormBlock/> should only be used inside a <Form/>");
            }

            var formConfig = new _FormConfig2.default(_FormConfig2.default.mergeOptions(parentConfig.options, nextProps), parentConfig.schema);

            formConfig.setFormContext(parentConfig.type, nextProps.basePath || parentConfig.basePath, parentConfig.formikProps);

            // did the form config actually change since last time?
            if (prevState && prevState.formConfig.equals(formConfig)) {
                // no -> no update
                return null;
            }

            // update form config in local state
            return {
                formConfig: formConfig
            };
        }
    }]);

    return FormBlock;
}(_react2.default.Component);

FormBlock.propTypes = _extends({
    /**
     * Additional HTML class for this form block
     */
    className: _propTypes2.default.string,

    /**
     * Optional property to define a common base path for the fields contained within. (e.g. basePath="foos.12" would prefix all fields' name
     * attributes so that &lt;Field name="name"/&gt; would end up being &lt;Field name="foos.12.name"/&gt;
     */
    basePath: _propTypes2.default.string,
    /**
     * Additional CSS styles for this form block.
     */
    style: _propTypes2.default.object
}, _FormConfigPropTypes2.default);
exports.default = (0, _withFormConfig2.default)(FormBlock);
//# sourceMappingURL=FormBlock.js.map