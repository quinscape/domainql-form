"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var NewList = function (_React$Component) {
    _inherits(NewList, _React$Component);

    function NewList() {
        _classCallCheck(this, NewList);

        return _possibleConstructorReturn(this, (NewList.__proto__ || Object.getPrototypeOf(NewList)).apply(this, arguments));
    }

    _createClass(NewList, [{
        key: "render",
        value: function render() {
            var rows = new Array(len);
            for (var i = 0; i < len; i++) {
                rows[i] = this.renderRow(arrayHelpers, i, len - 1, path);
            }
            return _react2.default.createElement(
                "div",
                { className: "form-list" },
                this.renderToolbar(arrayHelpers),
                rows,
                len === 0 && _react2.default.createElement(
                    _react2.default.Fragment,
                    null,
                    emptyText,
                    _react2.default.createElement("hr", null)
                )
            );
        }
    }]);

    return NewList;
}(_react2.default.Component);

exports.default = NewList;
//# sourceMappingURL=NewList.js.map