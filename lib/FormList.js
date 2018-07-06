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
 * Helper to render a list of inputs. Both a list of scalar values as well as a list of complex input objects is supported.
 */
var FormList = function (_React$Component) {
    _inherits(FormList, _React$Component);

    function FormList() {
        _classCallCheck(this, FormList);

        return _possibleConstructorReturn(this, (FormList.__proto__ || Object.getPrototypeOf(FormList)).apply(this, arguments));
    }

    _createClass(FormList, [{
        key: "render",
        value: function render() {
            var _props = this.props,
                emptyText = _props.emptyText,
                children = _props.children;


            return _react2.default.createElement(
                _ListHelper2.default,
                this.props,
                function (ctx) {
                    var array = ctx.array,
                        path = ctx.path,
                        arrayHelpers = ctx.arrayHelpers,
                        renderToolbar = ctx.renderToolbar,
                        renderRowToolbar = ctx.renderRowToolbar,
                        createLineContext = ctx.createLineContext;


                    var len = array.length;
                    var last = len - 1;

                    var rows = new Array(len);

                    for (var index = 0; index < len; index++) {
                        rows[index] = _react2.default.createElement(
                            _FormConfig2.default.Provider,
                            {
                                key: index,
                                value: createLineContext(index, path)
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
                                    renderRowToolbar(arrayHelpers, index, last)
                                )
                            ),
                            _react2.default.createElement("hr", null)
                        );
                    }

                    return _react2.default.createElement(
                        "div",
                        { className: "form-list" },
                        renderToolbar(arrayHelpers),
                        rows,
                        len === 0 && _react2.default.createElement(
                            _react2.default.Fragment,
                            null,
                            emptyText,
                            _react2.default.createElement("hr", null)
                        )
                    );
                }
            );
        }
    }]);

    return FormList;
}(_react2.default.Component);

FormList.propTypes = _extends({

    /**
     * Name/path of the list field for this &lt;FormList/&gt;
     */
    name: _propTypes2.default.string.isRequired,

    /**
     * If true (the default), the user can remove objects as long as there are more than "minObjects" objects. If false
     * the user can never remove objects.
     */
    canRemove: _propTypes2.default.bool,

    /**
     * If true (the default), the user can sort the list of objects with up and down buttons for each object.
     */
    canSort: _propTypes2.default.bool,

    /**
     * Label to put on the add button (default is "Add")
     */
    addLabel: _propTypes2.default.string,
    /**
     * Text of the remove object confirmation (default is "Remove Object?")
     */
    removeCheck: _propTypes2.default.string,
    /**
     * Mininum number of objects in the list. (default is 0)
     */
    minObjects: _propTypes2.default.number,

    /**
     * optional factory method to produce new values. If no newObject prop is given, the user cannot add objects
     * to the list.
     */
    newObject: _propTypes2.default.func,
    /**
     * render additional elements into the list toolbar
     */
    renderToolbar: _propTypes2.default.func,
    /**
     * render additional elements into the per row toolbars
     */
    renderRowToolbar: _propTypes2.default.func,

    /**
     * Text to render if no rows are rendered.
     */
    emptyText: _propTypes2.default.string,

    /**
     * Horizontal mode (default is true)
     */
    horizontal: _propTypes2.default.string

}, _FormConfigPropTypes2.default);
FormList.defaultProps = {
    canRemove: true,
    canSort: true,
    minObjects: 0,
    addLabel: "Add Object",
    removeCheck: "Delete Row?",
    emptyText: "No Rows",

    // we use horizontal mode as non-inherited default in FormList.
    horizontal: true
};
exports.default = FormList;