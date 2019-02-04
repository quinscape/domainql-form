"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _mobx = require("mobx");

var _withFormConfig = require("./withFormConfig");

var _withFormConfig2 = _interopRequireDefault(_withFormConfig);

var _lodash = require("lodash.debounce");

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require("lodash.isequal");

var _lodash4 = _interopRequireDefault(_lodash3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * A component that renders no output but causes a debounced auto-submit of the form whenever its content changes.
 * 
 */
var AutoSubmit = function (_React$Component) {
    _inherits(AutoSubmit, _React$Component);

    function AutoSubmit() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, AutoSubmit);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = AutoSubmit.__proto__ || Object.getPrototypeOf(AutoSubmit)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
            instance: _this
        }, _this.triggerSubmit = (0, _lodash2.default)(function () {
            return _this.props.formConfig.submitForm();
        }, _this.props.timeout), _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(AutoSubmit, [{
        key: "render",
        value: function render() {
            // render nothing
            return false;
        }
    }], [{
        key: "getDerivedStateFromProps",
        value: function getDerivedStateFromProps(nextProps, prevState) {
            var formConfig = nextProps.formConfig;

            //console.log("AutoSubmit.getDerivedStateFromProps", nextProps, prevState);

            if (!prevState.formConfig) {
                //console.log("NO prevState or config, set ", formConfig);

                return {
                    formConfig: formConfig
                };
            }

            if (prevState.formConfig !== formConfig) {
                var oldConfig = prevState.formConfig,
                    instance = prevState.instance;
                var prevValue = oldConfig.value;
                var value = formConfig.value;


                if (!_mobx.comparer.structural(prevValue, value)) {
                    //console.log("triggerSubmit");
                    instance.triggerSubmit();
                }

                //console.log("Update ", prevValues, values, formConfig);

                return {
                    formConfig: formConfig
                };
            }

            return null;
        }
    }]);

    return AutoSubmit;
}(_react2.default.Component);

AutoSubmit.propTypes = {
    /**
     * Debounce timeout in milliseconds.
     */
    timeout: _propTypes2.default.number
};
AutoSubmit.defaultProps = {
    timeout: 300
};
exports.default = (0, _withFormConfig2.default)(AutoSubmit);