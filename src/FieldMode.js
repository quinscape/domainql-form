import Enum from "./util/enum"

// extend Enum prototype to add disabledIf/readOnlyIf
function FieldModeEnum()
{
    Enum.call(this, {
        NORMAL : true,
        DISABLED : true,
        READ_ONLY : true
    });
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

FieldModeEnum.prototype.readOnlyIf = function (cond, otherwise = null) {

    return cond ? FieldMode.READ_ONLY : otherwise;
};

/**
 * Form field display mode
 *
 * @readonly
 * @enum {string}
 */
const FieldMode = new FieldModeEnum();

export default FieldMode
