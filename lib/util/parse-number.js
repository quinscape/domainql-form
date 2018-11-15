"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.clean = clean;

exports.default = function (value) {
    var _BigNumber$config$FOR = _bignumber2.default.config().FORMAT,
        decimalSeparator = _BigNumber$config$FOR.decimalSeparator,
        groupSeparator = _BigNumber$config$FOR.groupSeparator,
        fractionGroupSeparator = _BigNumber$config$FOR.fractionGroupSeparator;

    var decimalPos = value.indexOf(decimalSeparator);
    if (decimalPos < 0) {
        return new _bignumber2.default(clean(value, groupSeparator));
    } else {
        return new _bignumber2.default(clean(value.substring(0, decimalPos), groupSeparator) + "." + clean(value.substring(decimalPos + 1), fractionGroupSeparator));
    }
};

var _bignumber = require("bignumber.js");

var _bignumber2 = _interopRequireDefault(_bignumber);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var RE = {};

function clean(value, c) {
    if (!c) {
        return value;
    }

    var regex = RE[c];
    if (!regex) {
        regex = RE[c] = new RegExp("\\" + c, "g");
    }
    return value.replace(regex, "");
}

/**
 * Parses the given formatted number string by cleaning it up using the current BigNumber configuration before
 * creating the BigNumber instance
 *
 * @param value
 */
//# sourceMappingURL=parse-number.js.map