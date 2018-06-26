"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DEFAULT_OPTIONS = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _InputSchema = require("./InputSchema");

var _InputSchema2 = _interopRequireDefault(_InputSchema);

var _FieldMode = require("./FieldMode");

var _FieldMode2 = _interopRequireDefault(_FieldMode);

var _GlobalConfig = require("./GlobalConfig");

var _GlobalConfig2 = _interopRequireDefault(_GlobalConfig);

var _keys = require("./util/keys");

var _keys2 = _interopRequireDefault(_keys);

var _FormConfigPropTypes = require("./FormConfigPropTypes");

var _FormConfigPropTypes2 = _interopRequireDefault(_FormConfigPropTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DEFAULT_OPTIONS = exports.DEFAULT_OPTIONS = {
    horizontal: true,
    labelColumnClass: "col-md-5",
    wrapperColumnClass: "col-md-7",
    mode: _FieldMode2.default.NORMAL,
    currency: "EUR",
    currencyAddonRight: true,
    lookupLabel: _GlobalConfig2.default.lookupLabel
};

var FORM_OPTION_NAMES = (0, _keys2.default)(_FormConfigPropTypes2.default);

var context = _react2.default.createContext(null);

/**
 * Encapsulates the complete configuration of a form field and is provided via React Context.
 *
 * This config is provided by <Form/>, <FormBlock/> and partially by <FormConfigProvider/>.
 *
 * <FormConfigProvider/> can provide defaults for configuration options and schema but does not actually define the
 * actual form context parts. Only the <Form/> component provides the form context parts which include the formikProps
 * object.
 *
 * <FormBlock/> can override configuration options.
 *
 * See FORM_CONFIG_PROPTYPES for a description of overridable options.
 *
 */

var FormConfig = function () {
    /**
     *
     * @param {Object} opts                     form config options
     * @param {InputSchema|Object} [schema]     Schema (raw data or InputSchema instance)
     */
    function FormConfig(opts) {
        var schema = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

        _classCallCheck(this, FormConfig);

        if (schema instanceof _InputSchema2.default) {
            this.schema = schema;
        } else {
            this.schema = schema && new _InputSchema2.default(schema);
        }

        this.options = FormConfig.mergeOptions(DEFAULT_OPTIONS, opts);

        // clear form context
        this.setFormContext("", "", null);
    }

    /**
     * Sets the form context part of the current form config
     *
     * @param {String} type         Name of the form base input type
     * @param {String} basePath     current base path within the form
     * @param {Object} formikProps  formik context object
     */


    _createClass(FormConfig, [{
        key: "setFormContext",
        value: function setFormContext(type, basePath, formikProps) {
            this.type = type;
            this.basePath = basePath;
            this.formikProps = formikProps;
        }
    }, {
        key: "getPath",
        value: function getPath(name) {
            var nameIsDot = name === ".";
            var basePath = this.basePath;

            if (basePath) {
                return nameIsDot ? basePath : basePath + "." + name;
            } else {
                if (nameIsDot) {
                    throw new Error("'.' is only a valid name with a non-empty base-path (e.g. inside a FormList)");
                }
                return name;
            }
        }

        /**
         * Merges two option objects and returns a new merged options object. The returned object will be filtered so
         * that it only contains option keys defined in FORM_PROPTYPES.
         *
         * @param a     options A
         * @param b     options B
         */

    }, {
        key: "equals",


        /**
         * Compares this form config to another form config
         *
         * @param {FormConfig} other     other config
         *
         * @return {boolean} true if both configs are equal
         */
        value: function equals(other) {
            if (other instanceof FormConfig) {
                if (this.formikProps !== other.formikProps || // <- most common reason for inequality
                this.schema !== other.schema || this.type !== other.type || this.basePath !== other.basePath) {
                    return false;
                }

                var options = this.options;
                var otherOptions = other.options;


                var len = FORM_OPTION_NAMES.length;
                for (var i = 0; i < len; i++) {
                    var name = FORM_OPTION_NAMES[i];
                    if (options[name] !== otherOptions[name]) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        }

        /**
         * Internal React Consumer for FormConfig
         * @type {ReactElement}
         */


        /**
         * Internal React Provider for FormConfig. Users should use <FormConfigProvider/>, not <FormConfig.Provider/>
         * @type {ReactElement}
         */

    }], [{
        key: "mergeOptions",
        value: function mergeOptions(a, b) {
            if (!b) {
                return a;
            }

            var newOptions = {};

            var len = FORM_OPTION_NAMES.length;
            for (var i = 0; i < len; i++) {
                var name = FORM_OPTION_NAMES[i];
                var value = b[name];
                newOptions[name] = value !== undefined ? value : a[name];
            }
            return newOptions;
        }
    }]);

    return FormConfig;
}();

FormConfig.Consumer = context.Consumer;
FormConfig.Provider = context.Provider;
exports.default = FormConfig;