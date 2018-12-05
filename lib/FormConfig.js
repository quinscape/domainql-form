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

var _lodash = require("lodash.get");

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require("lodash.set");

var _lodash4 = _interopRequireDefault(_lodash3);

var _mobx = require("mobx");

var _FormConfigPropTypes = require("./FormConfigPropTypes");

var _FormConfigPropTypes2 = _interopRequireDefault(_FormConfigPropTypes);

var _unwrapType = require("./util/unwrapType");

var _unwrapType2 = _interopRequireDefault(_unwrapType);

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

var EMPTY = [];

/**
 @typedef Error
 @type {object}
 @property {string} path                    name/path
 @property {Array<String>} errorMessages    error messages, first value is original user-provided value
 */

/**
 * Finds the error with the given path
 *
 * @param {Array<Error>} errors     errors
 * @param {String} path             name/path
 * @return {number} index of the error
 */
function findError(errors, path) {
    for (var i = 0; i < errors.length; i++) {
        var error = errors[i];
        if (error.path === path) {
            return i;
        }
    }
    return -1;
}

/**
 * Encapsulates the complete configuration of a form field and is provided via React Context.
 *
 * This config is provided by <Form/>, <FormBlock/> and partially by <FormConfigProvider/>.
 *
 * <FormConfigProvider/> can provide defaults for configuration options and schema but does not actually define the
 * actual form context parts. Only the <Form/> component provides the full form context.
 *
 * <FormBlock/> can override configuration options.
 *
 * See FORM_CONFIG_PROP_TYPES for a description of overridable options.
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

        this.handleBlur = function (fieldType, name, value) {
            try {
                //console.log("BLUR", name)
            } catch (e) {
                console.error("HANDLE-BLUR ERROR", e);
            }
        };

        if (schema instanceof _InputSchema2.default) {
            this.schema = schema;
        } else {
            this.schema = schema && new _InputSchema2.default(schema);
        }

        this.options = FormConfig.mergeOptions(DEFAULT_OPTIONS, opts);

        this.button = "";

        // clear form context
        this.setFormContext();
    }

    /**
     * Sets the form context part of the current form config
     *
     * @param {String} [type]               name of the form base input type
     * @param {String} [basePath]           current base path within the form
     * @param {object} [value]              mobx input model
     * @param {function} [formInstance]     Form component instance
     */


    _createClass(FormConfig, [{
        key: "setFormContext",
        value: function setFormContext() {
            var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
            var basePath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
            var value = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
            var formInstance = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

            //console.log("setFormContext", { type, basePath, value, formInstance} );

            this.type = type;
            this.basePath = basePath;
            this.root = value;
            this.formInstance = formInstance;

            this.errors = [];
        }
    }, {
        key: "copy",
        value: function copy() {
            var copy = new FormConfig(this.options, this.schema);
            copy.setFormContext(this.type, this.basePath, this.root);
            copy.button = this.button;
            copy.errors = this.errors;
            copy.root = this.root;
            copy.formInstance = this.formInstance;
            return copy;
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
                if (this.schema !== other.schema || this.type !== other.type || this.basePath !== other.basePath || this.errors !== other.errors || this.root !== other.root) {
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
    }, {
        key: "getErrors",
        value: function getErrors(path) {
            var errors = this.errors;


            for (var i = 0; i < errors.length; i++) {
                var error = errors[i];
                if (error.path === path) {
                    return error.errorMessages;
                }
            }

            return EMPTY;
        }
    }, {
        key: "hasErrors",
        value: function hasErrors() {
            return this.errors.length > 0;
        }

        /**
         * Returns the current form value for the given path, returning the original user-provided value in case of a
         * field with error.
         *
         * @param {String} path     name/path
         * @param {Array<Error>} errorMessages
         * @return {*}
         */

    }, {
        key: "getValue",
        value: function getValue(path) {
            var errorMessages = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.getErrors(path);

            if (errorMessages.length > 0) {
                return errorMessages[0];
            } else {
                var value = (0, _lodash2.default)(this.root, path);
                //console.log("getValue", this.root, path, " = ", value);
                return value;
            }
        }
    }, {
        key: "handleChange",
        value: function handleChange(fieldType, name, value) {
            var _this = this;

            try {
                //            console.log("handleChange", { fieldType, name, value});

                var unwrapped = (0, _unwrapType2.default)(fieldType);

                // COLLECT
                var errorsForField = void 0;

                var error = _InputSchema2.default.validate(unwrapped.name, value);
                var converted = void 0;
                if (error) {
                    errorsForField = [value, error];
                } else {
                    converted = _InputSchema2.default.valueToScalar(unwrapped.name, value);
                }

                // UPDATE

                var currentErrors = this.errors;


                var changedErrors = void 0;
                var index = findError(currentErrors, name);
                if (index < 0) {
                    if (errorsForField) {
                        // ADD ERRORS
                        changedErrors = currentErrors.concat({
                            path: name,
                            errorMessages: errorsForField
                        });
                    }
                } else {
                    if (errorsForField) {
                        // UPDATE ERRORS
                        changedErrors = currentErrors.slice();
                        changedErrors[index] = {
                            path: name,
                            errorMessages: errorsForField
                        };
                    } else {
                        // REMOVE ERRORS
                        changedErrors = currentErrors.slice();
                        changedErrors.splice(index, 1);
                    }
                }

                if (!errorsForField) {
                    //console.log("SET FIELD VALUE", this.root, name, converted);

                    (0, _mobx.runInAction)(function () {
                        return (0, _lodash4.default)(_this.root, name, converted);
                    });
                }

                if (changedErrors) {
                    //                console.log("CHANGED ERRORS", changedErrors);

                    var newFormConfig = this.copy();
                    newFormConfig.errors = changedErrors;

                    this.formInstance.setState({
                        formConfig: newFormConfig
                    });
                }
            } catch (e) {
                console.error("HANDLE-CHANGE ERROR", e);
            }
        }

        /**
         * Internal React Consumer for FormConfig
         * @type {React.Element}
         */


        /**
         * Internal React Provider for FormConfig. Users should use <FormConfigProvider/>, not <FormConfig.Provider/>
         * @type {React.Element}
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
//# sourceMappingURL=FormConfig.js.map