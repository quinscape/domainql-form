import Enum from "./util/enum"


const FIELD_MODE_VALUES = {
    // XXX: Keep enum values in sync with domainql/src/main/java/de/quinscape/domainql/model/FieldMode.java
    NORMAL : true,
    DISABLED : true,
    READ_ONLY : true,
    PLAIN_TEXT : true,
    INVISIBLE : true
};

// extend Enum prototype to add disabledIf/readOnlyIf/plainTextIf/invisibleIf
function FieldModeEnum()
{
    Enum.call(this, FIELD_MODE_VALUES);
}

FieldModeEnum.prototype = Object.create(Enum.prototype);
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
FieldModeEnum.prototype.disabledIf = function (cond, otherwise = null) {

    return cond ? FieldMode.DISABLED : otherwise;
};

FieldModeEnum.prototype.plainTextIf = function (cond, otherwise = null) {

    return cond ? FieldMode.PLAIN_TEXT : otherwise;
};

FieldModeEnum.prototype.readOnlyIf = function (cond, otherwise = null) {

    return cond ? FieldMode.READ_ONLY : otherwise;
};

FieldModeEnum.prototype.invisibleIf = function (cond, otherwise = null) {

    return cond ? FieldMode.INVISIBLE : otherwise;
};

/**
 * Form field display mode
 *
 * @readonly
 * @enum {string}
 */
const FieldMode = new FieldModeEnum();

export default FieldMode
