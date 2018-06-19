"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.withUserControl = withUserControl;

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _FieldMode = require("./FieldMode");

var _FieldMode2 = _interopRequireDefault(_FieldMode);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function withUserControl(Component) {
    return function (_React$Component) {
        _inherits(_class2, _React$Component);

        function _class2() {
            var _ref;

            var _temp, _this, _ret;

            _classCallCheck(this, _class2);

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = _class2.__proto__ || Object.getPrototypeOf(_class2)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
                control: {
                    horizontal: true,
                    labelColumnClass: "col-md-3",
                    wrapperColumnClass: "col-md-9",
                    mode: _FieldMode2.default.NORMAL,
                    currency: "EUR",
                    currencyAddonRight: true
                }
            }, _this.changeControl = function (name, value) {
                return _this.setState({
                    control: _extends({}, _this.state.control, _defineProperty({}, name, value))
                });
            }, _temp), _possibleConstructorReturn(_this, _ret);
        }

        _createClass(_class2, [{
            key: "render",
            value: function render() {
                var control = this.state.control;


                return _react2.default.createElement(
                    _react2.default.Fragment,
                    null,
                    _react2.default.createElement(UserFormControl, {
                        control: control,
                        changeControl: this.changeControl
                    }),
                    _react2.default.createElement("hr", null),
                    _react2.default.createElement(Component, _extends({
                        control: control
                    }, this.props))
                );
            }
        }]);

        return _class2;
    }(_react2.default.Component);
}

var UserFormControl = function (_React$Component2) {
    _inherits(UserFormControl, _React$Component2);

    function UserFormControl() {
        _classCallCheck(this, UserFormControl);

        return _possibleConstructorReturn(this, (UserFormControl.__proto__ || Object.getPrototypeOf(UserFormControl)).apply(this, arguments));
    }

    _createClass(UserFormControl, [{
        key: "render",
        value: function render() {
            var _props = this.props,
                control = _props.control,
                changeControl = _props.changeControl;


            return _react2.default.createElement(
                "div",
                { className: "form-inline" },
                _react2.default.createElement(
                    "span",
                    { className: "text-info mr-sm-2" },
                    "CONTROL:"
                ),
                _react2.default.createElement(
                    "label",
                    null,
                    "mode",
                    _react2.default.createElement(
                        "select",
                        {
                            className: "form-control mr-sm-2",
                            value: control.mode,
                            onChange: function onChange(ev) {
                                return changeControl("mode", ev.target.value);
                            }
                        },
                        _react2.default.createElement(
                            "option",
                            null,
                            _FieldMode2.default.NORMAL
                        ),
                        _react2.default.createElement(
                            "option",
                            null,
                            _FieldMode2.default.DISABLED
                        ),
                        _react2.default.createElement(
                            "option",
                            null,
                            _FieldMode2.default.READ_ONLY
                        )
                    )
                ),
                _react2.default.createElement(
                    "label",
                    null,
                    "labelColumnClass",
                    _react2.default.createElement("input", {
                        type: "text",
                        className: "form-control mr-sm-2",
                        value: control.labelColumnClass,
                        onChange: function onChange(ev) {
                            return changeControl("labelColumnClass", ev.target.value);
                        }
                    })
                ),
                _react2.default.createElement(
                    "label",
                    null,
                    "wrapperColumnClass",
                    _react2.default.createElement("input", {
                        type: "text",
                        className: "form-control mr-sm-2",
                        value: control.wrapperColumnClass,
                        onChange: function onChange(ev) {
                            return changeControl("wrapperColumnClass", ev.target.value);
                        }
                    })
                ),
                _react2.default.createElement(
                    "label",
                    null,
                    "currency",
                    _react2.default.createElement("input", {
                        type: "text",
                        className: "form-control mr-sm-2",
                        value: control.currency,
                        onChange: function onChange(ev) {
                            return changeControl("currency", ev.target.value);
                        }
                    })
                ),
                _react2.default.createElement(
                    "div",
                    { className: "form-check mr-sm-2" },
                    _react2.default.createElement("input", { className: "form-check-input", type: "checkbox", id: "inlineFormCheck2",
                        checked: control.currencyAddonRight,
                        onChange: function onChange(ev) {
                            return changeControl("currencyAddonRight", !control.currencyAddonRight);
                        }
                    }),
                    _react2.default.createElement(
                        "label",
                        { className: "form-check-label", htmlFor: "inlineFormCheck2" },
                        "currency right?"
                    )
                ),
                _react2.default.createElement(
                    "div",
                    { className: "form-check mr-sm-2" },
                    _react2.default.createElement("input", { className: "form-check-input", type: "checkbox", id: "inlineFormCheck",
                        checked: control.horizontal,
                        onChange: function onChange(ev) {
                            return changeControl("horizontal", !control.horizontal);
                        }
                    }),
                    _react2.default.createElement(
                        "label",
                        { className: "form-check-label", htmlFor: "inlineFormCheck" },
                        "horizontal"
                    )
                )
            );
        }
    }]);

    return UserFormControl;
}(_react2.default.Component);

exports.default = UserFormControl;
//# sourceMappingURL=UserFormControl.js.map