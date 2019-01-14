import BigNumber from "bignumber.js"
import parseNumber, { clean } from "./util/parse-number"

const BOOLEAN_RE = /^true|false|on|off$/;

const DATE_RE = /^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(.[0-9]+)?(Z)?$/;

const INTEGER_RE = /^-?[0-9]*$/;

function checkInteger(lower, upper, msg)
{
    return function (value) {
        const num = +value;
        if (isNaN(num) || value === "" || !INTEGER_RE.test(value) || num < lower || num > upper)
        {
            return msg;
        }
        return null;
    }
}

function checkNumber(msg)
{
    return function (value) {
        const num = +value;
        if (isNaN(num))
        {
            return msg;
        }
        return null;
    }
}

function checkRegexp(re, msg)
{
    return function (value) {
        if (!re.test(value))
        {
            return msg;
        }
        return null;
    };
}

export const CURRENCY_MULTIPLIER = 10000;

const CURRENCY_LIMIT_LOW = Number.MIN_SAFE_INTEGER / CURRENCY_MULTIPLIER;
const CURRENCY_LIMIT_HIGH = Number.MAX_SAFE_INTEGER / CURRENCY_MULTIPLIER;

const checkBoolean = checkRegexp(BOOLEAN_RE, "Invalid boolean");
const DEFAULT_CONVERTERS = {
    "String" : false,
    // formik uses boolean values
    "Boolean" : {
        validate: v => typeof v !== "boolean" ? "Invalid boolean" : null,
        scalarToValue: function (scalar) {
            return scalar;
        },
        valueToScalar: function (value) {
            return value;
        }
    },
    "Currency" : {
        validate: function (value) {

            const { decimalSeparator, groupSeparator, fractionGroupSeparator } = BigNumber.config().FORMAT;

            const decimalPos = value.indexOf(decimalSeparator);

            let num;
            if (decimalPos < 0)
            {
                num = +clean(value, groupSeparator);
            }
            else
            {
                num = +(
                    clean(
                        value.substring(0, decimalPos),
                        groupSeparator
                    ) + "." +
                    clean(
                        value.substring(decimalPos + 1),
                        fractionGroupSeparator
                    )
                );
            }
            if (isNaN(num) || num < CURRENCY_LIMIT_LOW || num > CURRENCY_LIMIT_HIGH)
            {
                return "Invalid currency value";
            }
            return null;
        },

        scalarToValue: function (scalar) {
            return new BigNumber(scalar / CURRENCY_MULTIPLIER).toFormat(2);
        },
        valueToScalar: function (value) {
            const bigNum = parseNumber(value);
            return bigNum.times(CURRENCY_MULTIPLIER).toNumber();
        }
    },
    "Byte" : {
        validate: checkInteger(-128, 127, "Invalid Byte"),

        scalarToValue: function (scalar) {
            return String(scalar)
        },
        valueToScalar: function (value) {
            return +value
        }
    },
    "Short" : {
        validate: checkInteger(-32768, 32768, "Invalid Short"),

        scalarToValue: function (scalar) {
            return String(scalar)
        },
        valueToScalar: function (value) {
            return +value
        }
    },
    "Int" : {
        validate: checkInteger(-2147483648, 2147483647, "Invalid Integer"),

        scalarToValue: function (scalar) {
            return String(scalar)
        },
        valueToScalar: function (value) {
            return +value
        }
    },
    "Float" : {
        validate: checkNumber("Invalid Number"),

        scalarToValue: function (scalar) {
            return String(scalar)
        },
        valueToScalar: function (value) {
            return +value
        }
    },
    "Long" : {
        validate: checkInteger(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, "Invalid Long"),

        scalarToValue: function (scalar) {
            return String(scalar)
        },
        valueToScalar: function (value) {
            return +value
        }
    },
    "Date" : {
        validate: checkRegexp(DATE_RE),

        scalarToValue: function (scalar) {
            return String(scalar)
        },
        valueToScalar: function (value) {
            return value
        }
    },
    "Timestamp" : {
        validate: checkRegexp(DATE_RE),

        scalarToValue: function (scalar) {
            return String(scalar)
        },
        valueToScalar: function (value) {
            return value
        }
    }
};

export default DEFAULT_CONVERTERS;
