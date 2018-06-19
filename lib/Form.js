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

var _objectAssign = require("object-assign");

var _objectAssign2 = _interopRequireDefault(_objectAssign);

var _formik = require("formik");

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _FormConfig = require("./FormConfig");

var _FormConfig2 = _interopRequireDefault(_FormConfig);

var _InputSchema = require("./InputSchema");

var _InputSchema2 = _interopRequireDefault(_InputSchema);

var _FormConfigPropTypes = require("./FormConfigPropTypes");

var _FormConfigPropTypes2 = _interopRequireDefault(_FormConfigPropTypes);

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
 * "Inner" form component.
 *
 * Indirection created to have the two coalesced contexts as props.
 *
 */

var InnerForm = function (_React$Component) {
    _inherits(InnerForm, _React$Component);

    function InnerForm() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, InnerForm);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = InnerForm.__proto__ || Object.getPrototypeOf(InnerForm)).call.apply(_ref, [this].concat(args))), _this), _this.state = InnerForm.getDerivedStateFromProps(_this.props), _this.onSubmit = function (values, actions) {
            var formConfig = _this.state.formConfig;
            var schema = formConfig.schema,
                type = formConfig.type;


            var converted = schema.fromValues(type, values);

            try {
                return _this.props.onSubmit(converted, actions);
            } catch (e) {
                console.error("Error in onSubmit", e);
            }
        }, _this.validate = function (values) {
            var formConfig = _this.state.formConfig;
            var validate = _this.props.validate;
            var schema = formConfig.schema,
                type = formConfig.type;


            var errors = schema.validate(type, values);

            if (validate) {
                var localErrors = validate(values);
                return (0, _objectAssign2.default)({}, errors, localErrors);
            }
            return errors;
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(InnerForm, [{
        key: "render",
        value: function render() {
            var children = this.props.children;
            var formConfig = this.state.formConfig;
            var formikProps = formConfig.formikProps;


            return _react2.default.createElement(
                "form",
                {
                    className: (0, _classnames2.default)("form", formikProps.submitCount > 0 && "was-validated"),
                    onSubmit: formikProps.handleSubmit,
                    onReset: formikProps.handleReset
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
            var type = nextProps.type,
                formikProps = nextProps.formikProps,
                parentConfig = nextProps.formConfig;


            var schema = getSchema(parentConfig, nextProps);

            var formConfig = void 0;
            if (parentConfig) {
                formConfig = new _FormConfig2.default(_FormConfig2.default.mergeOptions(parentConfig.options, nextProps), schema);
            } else {
                formConfig = new _FormConfig2.default(nextProps, schema);
            }
            formConfig.setFormContext(type, "", formikProps);

            // did the form config actually change since last time?
            if (prevState && prevState.formConfig.equals(formConfig)) {
                // no -> no update

                //console.log("NO UPDATE");

                return null;
            }

            //console.log("NEW formConfig", formConfig, parentConfig);

            // update form config in local state
            return {
                formConfig: formConfig
            };
        }

        // called from outer form
        // noinspection JSUnusedGlobalSymbols


        // called from outer form
        // noinspection JSUnusedGlobalSymbols

    }]);

    return InnerForm;
}(_react2.default.Component);

/**
 * Form description
 */


var Form = function (_React$Component2) {
    _inherits(Form, _React$Component2);

    function Form() {
        var _ref2;

        var _temp2, _this2, _ret2;

        _classCallCheck(this, Form);

        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
        }

        return _ret2 = (_temp2 = (_this2 = _possibleConstructorReturn(this, (_ref2 = Form.__proto__ || Object.getPrototypeOf(Form)).call.apply(_ref2, [this].concat(args))), _this2), _this2.onSubmit = function (values, actions) {
            return _this2._innerForm.onSubmit(values, actions);
        }, _this2.validate = function (values) {
            return _this2._innerForm.validate(values);
        }, _temp2), _possibleConstructorReturn(_this2, _ret2);
    }

    _createClass(Form, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            this._component.getFormikBag().validateForm();
        }
    }, {
        key: "render",
        value: function render() {
            var _this3 = this;

            var _props = this.props,
                value = _props.value,
                type = _props.type,
                initialValues = _props.initialValues,
                isInitialValid = _props.isInitialValid,
                children = _props.children;


            return _react2.default.createElement(
                _FormConfig2.default.Consumer,
                null,
                function (formConfig) {

                    var schema = getSchema(formConfig, _this3.props);

                    var initial = initialValues != null ? initialValues() : schema.toValues(type, value);
                    //console.log("RENDER OUTER", formConfig, initial);

                    return _react2.default.createElement(_formik.Formik, {
                        ref: function ref(c) {
                            return _this3._component = c;
                        },
                        isInitialValid: isInitialValid,
                        initialValues: initial,
                        validate: _this3.validate,
                        onSubmit: _this3.onSubmit,
                        render: function render(formikProps) {
                            return _react2.default.createElement(
                                InnerForm,
                                _extends({}, _this3.props, {
                                    ref: function ref(c) {
                                        return _this3._innerForm = c;
                                    },
                                    formConfig: formConfig,
                                    formikProps: formikProps
                                }),
                                children
                            );
                        }
                    });
                }
            );
        }
    }]);

    return Form;
}(_react2.default.Component);

/**
 * Globally change the currency  default
 *
 * @param currency              currency symbol
 * @param currencyAddonRight    displayed on the right?
 */
// export function setCurrencyDefaults(currency, currencyAddonRight)
// {
//     GQLForm.defaultProps.currency = currency;
//     GQLForm.defaultProps.currencyAddonRight = currencyAddonRight;
// }

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
    validate: _propTypes2.default.func

}, _FormConfigPropTypes2.default);
Form.defaultProps = {
    // whether the initial state of the form is considered valid (passed to formik)
    isInitialValid: true
};
exports.default = Form;
//# sourceMappingURL=Form.js.map