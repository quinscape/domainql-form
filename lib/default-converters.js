"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.CURRENCY_MULTIPLIER = undefined;

var _bignumber = require("bignumber.js");

var _bignumber2 = _interopRequireDefault(_bignumber);

var _parseNumber = require("./util/parse-number");

var _parseNumber2 = _interopRequireDefault(_parseNumber);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BOOLEAN_RE = /^true|false$/;

var DATE_RE = /^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(.[0-9]+)?(Z)?$/;

var INTEGER_RE = /^-?[0-9]*$/;

function checkInteger(lower, upper, msg) {
    return function (value) {
        var num = +value;
        if (isNaN(num) || value === "" || !INTEGER_RE.test(value) || num < lower || num > upper) {
            return msg;
        }
        return null;
    };
}

function checkNumber(msg) {
    return function (value) {
        var num = +value;
        if (isNaN(num)) {
            return msg;
        }
        return null;
    };
}

function checkRegexp(re, msg) {
    return function (value) {
        if (!re.test(value)) {
            return msg;
        }
        return null;
    };
}

var CURRENCY_MULTIPLIER = exports.CURRENCY_MULTIPLIER = 10000;

var CURRENCY_LIMIT_LOW = Number.MIN_SAFE_INTEGER / CURRENCY_MULTIPLIER;
var CURRENCY_LIMIT_HIGH = Number.MAX_SAFE_INTEGER / CURRENCY_MULTIPLIER;

var DEFAULT_CONVERTERS = {
    "String": false,
    // formik uses boolean values
    "Boolean": {
        validate: checkRegexp(BOOLEAN_RE, "Invalid boolean"),
        scalarToValue: function scalarToValue(scalar) {
            return String(scalar);
        },
        valueToScalar: function valueToScalar(value) {
            return value === "true";
        }
    },
    "Currency": {
        validate: function validate(value) {
            var _BigNumber$config$FOR = _bignumber2.default.config().FORMAT,
                decimalSeparator = _BigNumber$config$FOR.decimalSeparator,
                groupSeparator = _BigNumber$config$FOR.groupSeparator,
                fractionGroupSeparator = _BigNumber$config$FOR.fractionGroupSeparator;

            var decimalPos = value.indexOf(decimalSeparator);

            var num = void 0;
            if (decimalPos < 0) {
                num = +(0, _parseNumber.clean)(value, groupSeparator);
            } else {
                num = +((0, _parseNumber.clean)(value.substring(0, decimalPos), groupSeparator) + "." + (0, _parseNumber.clean)(value.substring(decimalPos + 1), fractionGroupSeparator));
            }
            if (isNaN(num) || num < CURRENCY_LIMIT_LOW || num > CURRENCY_LIMIT_HIGH) {
                return "Invalid currency value";
            }
            return null;
        },

        scalarToValue: function scalarToValue(scalar) {
            return new _bignumber2.default(scalar / CURRENCY_MULTIPLIER).toFormat(2);
        },
        valueToScalar: function valueToScalar(value) {
            var bigNum = (0, _parseNumber2.default)(value);
            return bigNum.times(CURRENCY_MULTIPLIER).toNumber();
        }
    },
    "Byte": {
        validate: checkInteger(-128, 127, "Invalid Byte"),

        scalarToValue: function scalarToValue(scalar) {
            return String(scalar);
        },
        valueToScalar: function valueToScalar(value) {
            return +value;
        }
    },
    "Short": {
        validate: checkInteger(-32768, 32768, "Invalid Short"),

        scalarToValue: function scalarToValue(scalar) {
            return String(scalar);
        },
        valueToScalar: function valueToScalar(value) {
            return +value;
        }
    },
    "Int": {
        validate: checkInteger(-2147483648, 2147483647, "Invalid Integer"),

        scalarToValue: function scalarToValue(scalar) {
            return String(scalar);
        },
        valueToScalar: function valueToScalar(value) {
            return +value;
        }
    },
    "Float": {
        validate: checkNumber("Invalid Number"),

        scalarToValue: function scalarToValue(scalar) {
            return String(scalar);
        },
        valueToScalar: function valueToScalar(value) {
            return +value;
        }
    },
    "Long": {
        validate: checkInteger(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, "Invalid Long"),

        scalarToValue: function scalarToValue(scalar) {
            return String(scalar);
        },
        valueToScalar: function valueToScalar(value) {
            return +value;
        }
    },
    "Date": {
        validate: checkRegexp(DATE_RE),

        scalarToValue: function scalarToValue(scalar) {
            return String(scalar);
        },
        valueToScalar: function valueToScalar(value) {
            return value;
        }
    },
    "Timestamp": {
        validate: checkRegexp(DATE_RE),

        scalarToValue: function scalarToValue(scalar) {
            return String(scalar);
        },
        valueToScalar: function valueToScalar(value) {
            return value;
        }
    }
};

exports.default = DEFAULT_CONVERTERS;
//# sourceMappingURL=default-converters.js.map