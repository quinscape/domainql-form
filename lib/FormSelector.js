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

var _classnames = require("classnames");

var _classnames2 = _interopRequireDefault(_classnames);

var _lodash = require("lodash.topath");

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require("lodash.get");

var _lodash4 = _interopRequireDefault(_lodash3);

var _ListHelper = require("./util/ListHelper");

var _ListHelper2 = _interopRequireDefault(_ListHelper);

var _FormConfig = require("./FormConfig");

var _FormConfig2 = _interopRequireDefault(_FormConfig);

var _FormConfigPropTypes = require("./FormConfigPropTypes");

var _FormConfigPropTypes2 = _interopRequireDefault(_FormConfigPropTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Helper to edit a list of complex input objects, similar to &lt;FormList/&gt;, it only edits one element at a time and
 * lets the user select from a list of elements.
 */
var FormSelector = function (_React$Component) {
    _inherits(FormSelector, _React$Component);

    function FormSelector() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, FormSelector);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = FormSelector.__proto__ || Object.getPrototypeOf(FormSelector)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
            selectedIndex: 0
        }, _this.selectRow = function (index) {
            return _this.setState({
                selectedIndex: index
            });
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(FormSelector, [{
        key: "render",
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                selector = _props.selector,
                emptyText = _props.emptyText,
                children = _props.children;
            var selectedIndex = this.state.selectedIndex;


            return _react2.default.createElement(
                _ListHelper2.default,
                _extends({}, this.props, {
                    selector: null
                }),
                function (ctx) {
                    var array = ctx.array,
                        path = ctx.path,
                        arrayHelpers = ctx.arrayHelpers,
                        renderToolbar = ctx.renderToolbar,
                        renderRowToolbar = ctx.renderRowToolbar,
                        createLineContext = ctx.createLineContext;

                    var len = array.length;
                    var last = len - 1;

                    return _react2.default.createElement(
                        "div",
                        { className: "form-selector" },
                        renderToolbar(arrayHelpers),
                        _react2.default.createElement(
                            "div",
                            { className: "row" },
                            _react2.default.createElement(
                                "div",
                                { className: "col-md-4" },
                                len > 0 && _react2.default.createElement(
                                    "ul",
                                    { className: "list-group" },
                                    array.map(function (elem, index) {

                                        var isActive = index === selectedIndex;

                                        var label = typeof selector === "function" ? selector(elem) : (0, _lodash4.default)(elem, (0, _lodash2.default)(selector));
                                        return _react2.default.createElement(
                                            "li",
                                            {
                                                key: index,
                                                className: (0, _classnames2.default)("list-group-item", isActive && "active")
                                            },
                                            _react2.default.createElement(
                                                "a",
                                                {
                                                    className: (0, _classnames2.default)("selector btn btn-link", isActive && "disabled"),
                                                    "aria-disabled": isActive,
                                                    onClick: function onClick(ev) {
                                                        _this2.selectRow(index);
                                                        ev.preventDefault();
                                                    }
                                                },
                                                label || "<empty>"
                                            ),
                                            _react2.default.createElement(
                                                "div",
                                                { className: "float-right" },
                                                renderRowToolbar(arrayHelpers, index, last)
                                            )
                                        );
                                    })
                                ),
                                len === 0 && _react2.default.createElement(
                                    _react2.default.Fragment,
                                    null,
                                    emptyText,
                                    _react2.default.createElement("hr", null)
                                )
                            ),
                            selectedIndex < len && _react2.default.createElement(
                                _FormConfig2.default.Provider,
                                {
                                    key: selectedIndex,
                                    value: createLineContext(selectedIndex, path)
                                },
                                _react2.default.createElement(
                                    "div",
                                    { className: "col-md-8" },
                                    _react2.default.createElement(
                                        "div",
                                        { className: "container-fluid" },
                                        typeof children === "function" ? children(selectedIndex, arrayHelpers) : children
                                    )
                                )
                            )
                        )
                    );
                }
            );
        }
    }]);

    return FormSelector;
}(_react2.default.Component);

FormSelector.defaultProps = {
    canRemove: true,
    canSort: true,
    minObjects: 0,
    addLabel: "Add",
    removeCheck: "Remove Object?",
    emptyText: "No Rows",

    // we use horizontal mode as non-inherited default in FormList.
    horizontal: true
};
exports.default = FormSelector;