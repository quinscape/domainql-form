"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _withFormConfig = require("./withFormConfig");

var _withFormConfig2 = _interopRequireDefault(_withFormConfig);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function getFieldId(form, name) {
    if (!form) {
        return null;
    }

    var elem = form.querySelector("[name='" + name + "']");
    return elem && elem.getAttribute("id");
}

function pushErrors(errorList, value, name, form) {
    if (!value) {
        return;
    }

    if (value && (typeof value === "undefined" ? "undefined" : _typeof(value)) === "object") {
        if (Array.isArray(value)) {
            for (var i = 0; i < value.length; i++) {
                var e = value[i];

                pushErrors(errorList, e, name + "." + i);
            }
        } else {
            for (var _name in value) {
                if (value.hasOwnProperty(_name)) {
                    var _e = value[_name];

                    pushErrors(errorList, _e, _name + "." + _name);
                }
            }
        }
    } else {
        errorList.push({
            name: name,
            errorMessage: value,
            fieldId: getFieldId(form, name)
        });
    }
}

var GlobalErrors = function (_React$Component) {
    _inherits(GlobalErrors, _React$Component);

    function GlobalErrors() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, GlobalErrors);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = GlobalErrors.__proto__ || Object.getPrototypeOf(GlobalErrors)).call.apply(_ref, [this].concat(args))), _this), _this.state = GlobalErrors.getDerivedStateFromProps(_this.props), _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(GlobalErrors, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            var errors = this.props.formConfig.formikProps.errors;

            if (errors) {
                var errorList = GlobalErrors.linearizeErrors(errors, this._listElem);
                this.setState({
                    errorList: errorList
                });
            }
        }
    }, {
        key: "componentDidUpdate",
        value: function componentDidUpdate(prevProps, prevState) {
            var prevErrors = prevProps.formConfig.formikProps.errors;
            var errors = this.props.formConfig.formikProps.errors;


            if (prevErrors !== errors) {
                var errorList = GlobalErrors.linearizeErrors(errors, this._listElem);

                this.setState({
                    errorList: errorList,
                    errors: errors
                });
            }
        }
    }, {
        key: "render",
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                heading = _props.heading,
                headingText = _props.headingText,
                text = _props.text;
            var errorList = this.state.errorList;

            //console.log({errorList});

            return _react2.default.createElement(
                "div",
                { className: "global-errors", style: {
                        display: !errorList.length ? "none" : null
                    } },
                headingText && _react2.default.createElement(heading, null, headingText),
                text && _react2.default.createElement(
                    "p",
                    null,
                    text
                ),
                _react2.default.createElement(
                    "ul",
                    {
                        ref: function ref(elem) {
                            return _this2._listElem = elem;
                        }
                    },
                    errorList.map(function (entry) {
                        return _react2.default.createElement(
                            "li",
                            { key: entry.name },
                            _react2.default.createElement(
                                "label",
                                { htmlFor: entry.fieldId, className: "text-danger" },
                                entry.errorMessage
                            )
                        );
                    })
                )
            );
        }
    }], [{
        key: "getDerivedStateFromProps",
        value: function getDerivedStateFromProps(nextProps, prevState) {
            //console.log("GlobalErrors.getDerivedStateFromProps", {nextProps, prevState});

            var current = prevState ? prevState.errors : null;
            var next = nextProps.formConfig.formikProps.errors;


            if (!next || prevState && current === next) {
                return null;
            }

            //console.log("Linearize errors", next);

            var errorList = GlobalErrors.linearizeErrors(next, null);

            return {
                errorList: errorList,
                errors: next
            };
        }
    }, {
        key: "linearizeErrors",
        value: function linearizeErrors(errors, component) {
            var form = null;
            if (component) {
                form = component;
                while (form.tagName !== "FORM") {
                    form = form.parentNode;
                }
            }

            var errorList = [];

            for (var name in errors) {
                if (errors.hasOwnProperty(name)) {
                    var value = errors[name];

                    pushErrors(errorList, value, name, form);
                }
            }

            return errorList;
        }
    }]);

    return GlobalErrors;
}(_react2.default.Component);

GlobalErrors.propTypes = {
    /**
     * Text to use as heading (empty = no heading).
     */
    headingText: _propTypes2.default.string,
    /**
     * Additional text below the headline
     */
    text: _propTypes2.default.string,
    /**
     * Tag to surround the errors heading with
     */
    heading: _propTypes2.default.string
};
GlobalErrors.defaultProps = {
    headingText: "Errors",
    text: null,
    heading: "h3"
};
exports.default = (0, _withFormConfig2.default)(GlobalErrors);
//# sourceMappingURL=GlobalErrors.js.map