"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _classnames = require("classnames");

var _classnames2 = _interopRequireDefault(_classnames);

var _bignumber = require("bignumber.js");

var _bignumber2 = _interopRequireDefault(_bignumber);

var _defaultConverters = require("./default-converters");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DEFAULT_STATIC_RENDERERS = {
    "Boolean": function Boolean(value) {
        return _react2.default.createElement("span", { className: (0, _classnames2.default)(
            // color
            value ? "text-success" : "text-danger",
            // icon
            "far", value ? "fa-check-square" : "fa-square",
            // margin-right
            "mr-sm-2") });
    },
    "Currency": function Currency(value) {

        return _react2.default.createElement(
            "span",
            { className: (0, _classnames2.default)("mr-sm-2", "currency") },
            new _bignumber2.default(value / _defaultConverters.CURRENCY_MULTIPLIER).toFormat(2),
            _react2.default.createElement(
                "em",
                null,
                " EUR"
            )
        );
    }
};

exports.default = DEFAULT_STATIC_RENDERERS;