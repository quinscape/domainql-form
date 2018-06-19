"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _FormConfig = require("../FormConfig");

var _FormConfig2 = _interopRequireDefault(_FormConfig);

var _withFormConfig = require("../withFormConfig");

var _withFormConfig2 = _interopRequireDefault(_withFormConfig);

var _lodash = require("lodash.topath");

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require("lodash.get");

var _lodash4 = _interopRequireDefault(_lodash3);

var _Icon = require("./Icon");

var _Icon2 = _interopRequireDefault(_Icon);

var _InputSchema = require("../InputSchema");

var _formik = require("formik");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * List helper component used by <FormList/> and <FormSelector/>. Uses a
 */
var ListHelper = function (_React$Component) {
    _inherits(ListHelper, _React$Component);

    function ListHelper() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, ListHelper);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = ListHelper.__proto__ || Object.getPrototypeOf(ListHelper)).call.apply(_ref, [this].concat(args))), _this), _this.renderToolbar = function (arrayHelpers) {
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
                        _react2.default.createElement(_Icon2.default, { className: "fa-plus" }),
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
                minObjects = _this$props2.minObjects;


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
                        _react2.default.createElement(_Icon2.default, { className: "fa-arrow-up" })
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
                        _react2.default.createElement(_Icon2.default, { className: "fa-arrow-down" })
                    )
                ),
                canRemove && minObjects <= last && _react2.default.createElement(
                    "button",
                    {
                        type: "button",
                        className: "b-remove btn btn-link",
                        "aria-label": "Remove Row",
                        onClick: function onClick(ev) {
                            if (confirm(removeCheck)) arrayHelpers.remove(index);
                        }
                    },
                    _react2.default.createElement(_Icon2.default, { className: "fa-times" })
                )
            );
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(ListHelper, [{
        key: "render",
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                name = _props.name,
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

            return _react2.default.createElement(_formik.FieldArray, {
                name: name,
                render: function render(arrayHelpers) {
                    return children({
                        array: array,
                        path: path,
                        arrayHelpers: arrayHelpers,
                        renderRowToolbar: _this2.renderRowToolbar,
                        renderToolbar: _this2.renderToolbar,
                        createLineContext: _this2.createLineContext
                    });
                }
            });
        }
    }]);

    return ListHelper;
}(_react2.default.Component);

exports.default = (0, _withFormConfig2.default)(ListHelper);
//# sourceMappingURL=ListHelper.js.map