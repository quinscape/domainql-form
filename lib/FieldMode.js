"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _enum = require("./util/enum");

var _enum2 = _interopRequireDefault(_enum);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// extend Enum prototype to add disabledIf/readOnlyIf
function FieldModeEnum() {
    _enum2.default.call(this, {
        NORMAL: true,
        DISABLED: true,
        READ_ONLY: true,
        PLAIN_TEXT: true
    });
}

FieldModeEnum.prototype = Object.create(_enum2.default.prototype);
FieldModeEnum.prototype.constructor = FieldModeEnum;

/**
 * Returns DISABLED if the given condition is true or else the parameter "otherwise" which defaults to null, which
 * means taking the default of the surrounding form / block.
 *
 * @param cond          condition
 * @param otherwise     value to return for false (default is null = form / block default)
 *
 * @returns {String}
 */
FieldModeEnum.prototype.disabledIf = function (cond) {
    var otherwise = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;


    return cond ? FieldMode.DISABLED : otherwise;
};

FieldModeEnum.prototype.plainTextIf = function (cond) {
    var otherwise = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;


    return cond ? FieldMode.PLAIN_TEXT : otherwise;
};

FieldModeEnum.prototype.readOnlyIf = function (cond) {
    var otherwise = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;


    return cond ? FieldMode.READ_ONLY : otherwise;
};

/**
 * Form field display mode
 *
 * @readonly
 * @enum {string}
 */
var FieldMode = new FieldModeEnum();

exports.default = FieldMode;
//# sourceMappingURL=FieldMode.js.map