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

var _FieldMode = require("./FieldMode");

var _FieldMode2 = _interopRequireDefault(_FieldMode);

var _FormGroup = require("./FormGroup");

var _FormGroup2 = _interopRequireDefault(_FormGroup);

var _Field = require("./Field");

var _Field2 = _interopRequireDefault(_Field);

var _lodash = require("lodash.get");

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require("lodash.toPath");

var _lodash4 = _interopRequireDefault(_lodash3);

var _classnames = require("classnames");

var _classnames2 = _interopRequireDefault(_classnames);

var _reactstrap = require("reactstrap");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SelectorModal = function (_React$Component) {
    _inherits(SelectorModal, _React$Component);

    function SelectorModal() {
        _classCallCheck(this, SelectorModal);

        return _possibleConstructorReturn(this, (SelectorModal.__proto__ || Object.getPrototypeOf(SelectorModal)).apply(this, arguments));
    }

    _createClass(SelectorModal, [{
        key: "componentDidUpdate",
        value: function componentDidUpdate() {}
    }, {
        key: "render",
        value: function render() {
            var _props = this.props,
                isOpen = _props.isOpen,
                toggle = _props.toggle;


            return _react2.default.createElement(
                _reactstrap.Modal,
                {
                    isOpen: isOpen,
                    toggle: toggle

                },
                _react2.default.createElement(
                    _reactstrap.ModalHeader,
                    { toggle: toggle },
                    "Select Target Object"
                ),
                _react2.default.createElement(
                    _reactstrap.ModalBody,
                    null,
                    _react2.default.createElement(
                        "table",
                        { className: "table table-hover table-striped" },
                        _react2.default.createElement("thead", null),
                        _react2.default.createElement("tbody", null)
                    )
                )
            );
        }
    }]);

    return SelectorModal;
}(_react2.default.Component);

function renderAutoTable(props) {}

function renderStatic(fieldContext, displayValue) {}

/**
 * Edits a string GraphQL field with a text area element.
 *
 * This is a good example how to implement custom fields.
 */

var ForeignKeySelect = function (_React$Component2) {
    _inherits(ForeignKeySelect, _React$Component2);

    function ForeignKeySelect() {
        var _ref;

        var _temp, _this2, _ret;

        _classCallCheck(this, ForeignKeySelect);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this2 = _possibleConstructorReturn(this, (_ref = ForeignKeySelect.__proto__ || Object.getPrototypeOf(ForeignKeySelect)).call.apply(_ref, [this].concat(args))), _this2), _this2.state = {
            modalOpen: false,
            selectValues: null,
            selectValueKeys: null
        }, _this2.toggle = function () {
            var _this2$state = _this2.state,
                modalOpen = _this2$state.modalOpen,
                selectValues = _this2$state.selectValues;


            var nextOpenState = !modalOpen;

            if (nextOpenState && !selectValues) {
                _this2.props.fetch().then(function (selectValues) {
                    return _this2.setState({
                        selectValues: selectValues,
                        modalOpen: nextOpenState
                    });
                });
            } else {
                _this2.setState({
                    modalOpen: nextOpenState
                });
            }
        }, _this2.renderWithFieldContext = function (fieldContext) {
            var _this2$state2 = _this2.state,
                modalOpen = _this2$state2.modalOpen,
                selectValues = _this2$state2.selectValues;
            var _this2$props = _this2.props,
                fetch = _this2$props.fetch,
                render = _this2$props.render,
                display = _this2$props.display,
                renderDisplay = _this2$props.renderDisplay,
                inputClass = _this2$props.inputClass,
                placeholder = _this2$props.placeholder;
            var qualifiedName = fieldContext.qualifiedName,
                path = fieldContext.path,
                fieldType = fieldContext.fieldType,
                formConfig = fieldContext.formConfig;
            var formikProps = formConfig.formikProps;


            var errorMessage = (0, _lodash2.default)(formikProps.errors, path);
            var fieldValue = (0, _lodash2.default)(formikProps.values, path);

            var displayPath = (0, _lodash4.default)(display);
            var displayValue = (0, _lodash2.default)(formikProps.values, displayPath);

            return _react2.default.createElement(
                _react2.default.Fragment,
                null,
                _react2.default.createElement(
                    _FormGroup2.default,
                    _extends({}, fieldContext, {
                        errorMessage: errorMessage
                    }),
                    renderDisplay(fieldContext, displayValue),
                    _react2.default.createElement(
                        "button",
                        {
                            type: "button",
                            onClick: _this2.toggle
                        },
                        "\u2026"
                    )
                ),
                _react2.default.createElement(SelectorModal, {
                    isOpen: modalOpen,
                    toggle: _this2.toggle,
                    fieldContext: fieldContext,
                    selectValues: selectValues,
                    render: render,
                    current: fieldValue
                })
            );
        }, _temp), _possibleConstructorReturn(_this2, _ret);
    }

    _createClass(ForeignKeySelect, [{
        key: "render",
        value: function render() {
            return _react2.default.createElement(
                _Field2.default,
                this.props,
                this.renderWithFieldContext
            );
        }
    }]);

    return ForeignKeySelect;
}(_react2.default.Component);

ForeignKeySelect.propTypes = {
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
     * Placeholder text to render for the empty text area.
     */
    placeholder: _propTypes2.default.string,

    /**
     * Additional HTML classes for the textarea element.
     */
    inputClass: _propTypes2.default.string,

    /**
     * Additional HTML classes for the label element.
     */
    labelClass: _propTypes2.default.string,

    /**
     * Name/path to the display value
     */
    display: _propTypes2.default.string,

    /**
     * Optional function to render the display value  (fieldContext, value) =>
     */
    renderDisplay: _propTypes2.default.func,

    /**
     * Data fetching function. Must return a promise resolving to a List of values
     */
    fetch: _propTypes2.default.func.isRequired,

    /**
     * Render function for the fetched values.
     */
    render: _propTypes2.default.func
};
ForeignKeySelect.defaultProps = {

    renderDisplay: renderStatic,
    render: renderAutoTable
};
exports.default = ForeignKeySelect;
//# sourceMappingURL=ForeignKeySelect.js.map