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

var _withFormConfig = require("./withFormConfig");

var _withFormConfig2 = _interopRequireDefault(_withFormConfig);

var _lodash = require("lodash.topath");

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require("lodash.get");

var _lodash4 = _interopRequireDefault(_lodash3);

var _InputSchema = require("./InputSchema");

var _formik = require("formik");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function Icon(props) {
    var className = props.className;


    return _react2.default.createElement("i", { className: "fas " + className });
}

var FormList = function (_React$Component) {
    _inherits(FormList, _React$Component);

    function FormList() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, FormList);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = FormList.__proto__ || Object.getPrototypeOf(FormList)).call.apply(_ref, [this].concat(args))), _this), _this.renderToolbar = function (arrayHelpers) {
            var _this$props = _this.props,
                newObject = _this$props.newObject,
                addLabel = _this$props.addLabel,
                renderToolbar = _this$props.renderToolbar,
                formConfig = _this$props.formConfig;


            var canAdd = typeof newObject === "function";
            var extraToolbar = typeof renderToolbar === "function";

            return _react2.default.createElement(
                _react2.default.Fragment,
                null,
                (canAdd || extraToolbar) && _react2.default.createElement(
                    "div",
                    { className: "btn-toolbar" },
                    canAdd && _react2.default.createElement(
                        "button",
                        {
                            type: "button",
                            className: "b-add btn btn-default",
                            onClick: function onClick(ev) {
                                return arrayHelpers.push(newObject());
                            }
                        },
                        _react2.default.createElement("i", { className: "fas fa-plus" }),
                        " " + addLabel
                    ),
                    extraToolbar && renderToolbar(formConfig, arrayHelpers)
                ),
                (canAdd || extraToolbar) && _react2.default.createElement("hr", null)
            );
        }, _this.createLineContext = function (index, path) {
            var formConfig = _this.props.formConfig;


            var lineConfig = new _FormConfig2.default(_FormConfig2.default.mergeOptions(formConfig.options, _this.props), formConfig.schema);

            lineConfig.setFormContext(formConfig.type, path + "." + index, formConfig.formikProps);

            return lineConfig;
        }, _this.renderRowToolbar = function (arrayHelpers, index, last) {
            var _this$props2 = _this.props,
                canRemove = _this$props2.canRemove,
                canSort = _this$props2.canSort,
                removeCheck = _this$props2.removeCheck,
                renderRowToolbar = _this$props2.renderRowToolbar,
                minRows = _this$props2.minRows;


            return _react2.default.createElement(
                _react2.default.Fragment,
                null,
                renderRowToolbar && renderRowToolbar(arrayHelpers, index, last),
                canSort && _react2.default.createElement(
                    "div",
                    { className: "btn-group", role: "group", "aria-label": "Sort Buttons" },
                    _react2.default.createElement(
                        "button",
                        {
                            type: "button",
                            className: "b-up btn btn-link",
                            "aria-label": "Move Item Up",
                            onClick: function onClick(ev) {
                                return arrayHelpers.swap(index, index - 1);
                            },
                            disabled: index === 0
                        },
                        _react2.default.createElement(Icon, { className: "fa-arrow-up" })
                    ),
                    _react2.default.createElement(
                        "button",
                        {
                            type: "button",
                            className: "b-down btn btn-link",
                            onClick: function onClick(ev) {
                                return arrayHelpers.swap(index, index + 1);
                            },
                            "aria-label": "Move Item Down",
                            disabled: index === last
                        },
                        _react2.default.createElement(Icon, { className: "fa-arrow-down" })
                    )
                ),
                canRemove && minRows <= last && _react2.default.createElement(
                    "button",
                    {
                        type: "button",
                        className: "b-remove btn btn-link",
                        "aria-label": "Remove Row",
                        onClick: function onClick(ev) {
                            if (confirm(removeCheck)) arrayHelpers.remove(index);
                        }
                    },
                    _react2.default.createElement(Icon, { className: "fa-times" })
                )
            );
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(FormList, [{
        key: "render",
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                name = _props.name,
                keyField = _props.keyField,
                emptyText = _props.emptyText,
                children = _props.children,
                formConfig = _props.formConfig;


            var path = (0, _lodash2.default)(formConfig.getPath(name));

            // check type in development
            if (__DEV) {
                var fieldType = formConfig.schema.resolveType(formConfig.type, path);

                if (!(0, _InputSchema.isListType)((0, _InputSchema.unwrapNonNull)(fieldType))) {
                    throw new Error("FormList expected 'List' type: is " + JSON.stringify(fieldType));
                }
            }

            var array = (0, _lodash4.default)(formConfig.formikProps.values, path);
            var len = array.length;
            var last = len - 1;

            return _react2.default.createElement(_formik.FieldArray, {
                name: name,
                render: function render(arrayHelpers) {

                    children({
                        array: array,
                        arrayHelpers: arrayHelpers,
                        renderRowToolbar: _this2.renderRowToolbar,
                        renderToolbar: _this2.renderToolbar,
                        createLineContext: _this2.createLineContext
                    });
                }
            });
        }
    }, {
        key: "renderRow",
        value: function renderRow(arrayHelpers, index, last, path) {
            var children = this.props.children;


            return _react2.default.createElement(
                _FormConfig2.default.Provider,
                {
                    key: index,
                    value: this.createLineContext(index, path)
                },
                _react2.default.createElement(
                    "div",
                    { className: "form-row" },
                    _react2.default.createElement(
                        "div",
                        { className: "col-md-9" },
                        _react2.default.createElement(
                            "div",
                            { className: "container-fluid" },
                            typeof children === "function" ? children(index, arrayHelpers) : children
                        )
                    ),
                    _react2.default.createElement(
                        "div",
                        { className: "col-md-3" },
                        this.renderRowToolbar(arrayHelpers, index, last)
                    )
                ),
                _react2.default.createElement("hr", null)
            );
        }
    }]);

    return FormList;
}(_react2.default.Component);

FormList.propTypes = _extends({
    name: _propTypes2.default.string.isRequired,

    canRemove: _propTypes2.default.bool,
    canSort: _propTypes2.default.bool,
    addLabel: _propTypes2.default.string,
    removeCheck: _propTypes2.default.string,
    minRows: _propTypes2.default.number,

    // triggers alternate list view: row selector and single row form
    keyField: _propTypes2.default.oneOfType([

    // field name/path within the array element type
    _propTypes2.default.string,
    // function that renders the description for the array element
    _propTypes2.default.func]),

    // optional factory method to produce new values
    newObject: _propTypes2.default.func,
    // render additional elements into the list toolbar
    renderToolbar: _propTypes2.default.func,
    // render additional elements into the per row toolbars
    renderRowToolbar: _propTypes2.default.func

}, _FormConfig.FORM_CONFIG_PROPTYPES);
FormList.defaultProps = {
    canRemove: true,
    canSort: true,
    minRows: 0,
    addLabel: "Add Object",
    removeCheck: "Delete Row?",
    emptyText: "No Rows",

    // we use horizontal mode as non-inherited default in FormList.
    horizontal: true
};
exports.default = (0, _withFormConfig2.default)(FormList);
//# sourceMappingURL=FormList.js.map