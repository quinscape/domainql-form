"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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

/**
 * Searches for an HTML with the given name attribute and returns the id attribute of that HTML element or null if there
 * is no such element.
 * 
 * @param {HTMLFormElement} form      form element
 * @param {String} name               field name / path
 * @return {*}
 */
function getFieldId(form, name) {
    if (!form) {
        return null;
    }

    var elem = form.querySelector("[name='" + name + "']");
    return elem && elem.getAttribute("id");
}

/**
 * Renders a global list of current errors or nothing.
 *
 * The error labels are cross-linked with the input fields by name attribute after mount.
 */

var GlobalErrors = function (_React$Component) {
    _inherits(GlobalErrors, _React$Component);

    function GlobalErrors() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, GlobalErrors);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = GlobalErrors.__proto__ || Object.getPrototypeOf(GlobalErrors)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
            instance: _this
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(GlobalErrors, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            var errors = this.props.formConfig.errors;

            // if we have initial errors

            if (errors) {
                // we need to update extra once to update the target field ids of our error list
                var errorList = GlobalErrors.findFieldIds(errors, this._listElem);
                this.setState({
                    errorList: errorList
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
            var errorIdList = this.state.errorIdList;

            //console.log({ errorIdList });

            var errors = [];

            errorIdList.forEach(function (entry) {
                var fieldId = entry.fieldId,
                    path = entry.path,
                    errorMessages = entry.errorMessages;

                // the first error is the preserved user input

                for (var i = 1; i < errorMessages.length; i++) {
                    var err = errorMessages[i];
                    errors.push(_react2.default.createElement(
                        "li",
                        { key: path + i },
                        _react2.default.createElement(
                            "label",
                            {
                                className: "text-danger",
                                htmlFor: fieldId,
                                "data-path": fieldId ? null : path
                            },
                            err
                        )
                    ));
                }
            });

            return _react2.default.createElement(
                "div",
                { className: "global-errors", style: {
                        display: !errorIdList.length ? "none" : null
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
                    errors
                )
            );
        }
    }], [{
        key: "getDerivedStateFromProps",
        value: function getDerivedStateFromProps(nextProps, prevState) {
            //console.log("GlobalErrors.getDerivedStateFromProps", {nextProps, prevState});

            var current = prevState.errors;
            var nextErrors = nextProps.formConfig.errors;


            if (!nextErrors || current === nextErrors) {
                return null;
            }

            //console.log("Linearize errors", next);

            var errorIdList = GlobalErrors.findFieldIds(nextErrors, prevState.instance._listElem);

            return {
                errorIdList: errorIdList,
                errors: nextErrors
            };
        }
    }, {
        key: "findFieldIds",
        value: function findFieldIds(errors, component) {
            var form = null;
            if (component) {
                form = component;
                while (form.tagName !== "FORM") {
                    form = form.parentNode;
                }
            }

            var length = errors.length;
            var errorIdList = new Array(length);

            for (var i = 0; i < length; i++) {
                var _errors$i = errors[i],
                    path = _errors$i.path,
                    errorMessages = _errors$i.errorMessages;


                errorIdList[i] = {
                    fieldId: getFieldId(form, path),
                    path: path,
                    errorMessages: errorMessages
                };
            }

            return errorIdList;
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