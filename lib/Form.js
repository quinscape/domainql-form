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

var _mobxUtils = require("mobx-utils");

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _FormConfig = require("./FormConfig");

var _FormConfig2 = _interopRequireDefault(_FormConfig);

var _InputSchema = require("./InputSchema");

var _InputSchema2 = _interopRequireDefault(_InputSchema);

var _FormConfigPropTypes = require("./FormConfigPropTypes");

var _FormConfigPropTypes2 = _interopRequireDefault(_FormConfigPropTypes);

var _withFormConfig = require("./withFormConfig");

var _withFormConfig2 = _interopRequireDefault(_withFormConfig);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function getSchema(formConfig, props) {
    var schemaFromProps = props.schema;


    var schema = formConfig && formConfig.schema || schemaFromProps;

    if (!schema) {
        throw new Error("No schema prop given and no FormConfigProvider providing one either");
    }

    return schema;
}

/**
 * Form description
 */

var Form = function (_React$Component) {
    _inherits(Form, _React$Component);

    function Form() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, Form);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Form.__proto__ || Object.getPrototypeOf(Form)).call.apply(_ref, [this].concat(args))), _this), _this.handleSubmit = function (ev) {

            ev.preventDefault();

            var onSubmit = _this.props.onSubmit;
            var formConfig = _this.state.formConfig;


            if (onSubmit) {
                onSubmit(formConfig);
            } else {
                formConfig.model.submit();
            }
        }, _this.handleReset = function (ev) {

            ev.preventDefault();

            var onReset = _this.props.onReset;
            var formConfig = _this.state.formConfig;


            if (onReset) {
                onReset(formConfig);
            } else {
                formConfig.model.reset();
            }
        }, _this.state = {
            instance: _this,
            formConfig: null
        }, _this.validate = function (values) {
            var formConfig = _this.state.formConfig;
            var validate = _this.props.validate;
            var schema = formConfig.schema,
                type = formConfig.type;


            var errors = schema.validate(type, values);

            if (validate) {
                var localErrors = validate(values);
                return Object.assign({}, errors, localErrors);
            }
            return errors;
        }, _this.handleOnClick = function (ev) {
            var target = ev.target;
            var onClick = _this.props.onClick;

            //console.log("Form onClick, target =", target);

            if ((target.tagName === "BUTTON" || target.tagName === "INPUT") && target.getAttribute("type") === "submit") {
                var name = target.getAttribute("name");
                {
                    if (name) {
                        var formConfig = _this.state.formConfig;

                        // XXX: direct, mutable update (should be ok)

                        formConfig.button = name;
                    }
                }
            }

            if (typeof onClick === "function") {
                onClick(ev);
            }
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Form, [{
        key: "render",
        value: function render() {
            var children = this.props.children;
            var formConfig = this.state.formConfig;

            //console.log("RENDER OUTER", formConfig, initial);

            return _react2.default.createElement(
                "form",
                {
                    className: (0, _classnames2.default)("form", false && "was-validated"),
                    onSubmit: this.handleSubmit,
                    onReset: this.handleReset,
                    onClick: this.handleOnClick
                },
                _react2.default.createElement(
                    _FormConfig2.default.Provider,
                    { value: formConfig },
                    typeof children === "function" ? children(formConfig) : children
                )
            );
        }
    }], [{
        key: "getDerivedStateFromProps",
        value: function getDerivedStateFromProps(nextProps, prevState) {
            var value = nextProps.value,
                type = nextProps.type,
                parentConfig = nextProps.formConfig;


            var schema = getSchema(parentConfig, nextProps);

            var formConfig = void 0;
            if (parentConfig) {
                formConfig = new _FormConfig2.default(_FormConfig2.default.mergeOptions(parentConfig.options, nextProps), schema);
            } else {
                formConfig = new _FormConfig2.default(nextProps, schema);
            }

            // did the form config actually change since last time?
            if (prevState.formConfig && prevState.formConfig.equals(formConfig)) {
                // no -> no update

                //console.log("NO UPDATE");

                return null;
            }

            //console.log("NEW formConfig", formConfig, parentConfig);

            formConfig.setFormContext(type, "", (0, _mobxUtils.createViewModel)(value), prevState.instance);

            // update form config in local state
            return {
                formConfig: formConfig
            };
        }

        // called from outer form
        // noinspection JSUnusedGlobalSymbols

    }]);

    return Form;
}(_react2.default.Component);

Form.propTypes = _extends({
    /**
     * Submit handler handling the final typed GraphQL result
     */
    onSubmit: _propTypes2.default.func.isRequired,

    /**
     * schema to use for this form
     */
    schema: _propTypes2.default.oneOfType([_propTypes2.default.instanceOf(_InputSchema2.default), _propTypes2.default.object]),

    /**
     * form base type
     */
    type: _propTypes2.default.string.isRequired,

    /**
     * initial value (typed GraphQL object)
     */
    value: _propTypes2.default.any.isRequired,

    /**
     * true if the initial value is valid
     */
    isInitialValid: _propTypes2.default.bool,

    /**
     * Optional function to provide the initialValues for Formik without converting them from the typed GraphQL object.
     * Might also be invalid (See isInitialValid)
     */
    initialValues: _propTypes2.default.func,

    /**
     * Optional validate function. Note that the values object received here is *not* typed, i.e. it contains the
     * raw formik string/boolean values. If you need all values to be converted to a typed GraphQL object, you
     * need to invoke InputSchema.fromValues(type, values) manually on the received values object.
     */
    validate: _propTypes2.default.func,

    /**
     * Optional onClick handler for the form element.
     */
    onClick: _propTypes2.default.func

}, _FormConfigPropTypes2.default);
Form.defaultProps = {};
exports.default = (0, _withFormConfig2.default)(Form);
//# sourceMappingURL=Form.js.map