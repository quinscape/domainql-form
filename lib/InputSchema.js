"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.findNamed = findNamed;
exports.resetConverter = resetConverter;
exports.registerCustomConverter = registerCustomConverter;
exports.isInputType = isInputType;
exports.isScalarType = isScalarType;
exports.isListType = isListType;
exports.isNonNull = isNonNull;
exports.unwrapNonNull = unwrapNonNull;
exports.isEnumType = isEnumType;

var _lodash = require("lodash.topath");

var _lodash2 = _interopRequireDefault(_lodash);

var _defaultConverters = require("./default-converters");

var _defaultConverters2 = _interopRequireDefault(_defaultConverters);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var PLAN_SCALAR_LIST = { __scalar_list: true };
var PLAN_COMPLEX_LIST = { __complex_list: true };
var PLAN_INPUT_OBJECT = { __input_object: true };

var NO_ERRORS = {};

function findNamed(array, name) {
    for (var i = 0; i < array.length; i++) {
        var type = array[i];
        if (type.name === name) {
            return type;
        }
    }

    return null;
}

var converter = void 0;

function resetConverter() {
    converter = _defaultConverters2.default;
}

/**
 * Register new scalar converter / validator
 *
 * @param {String} type                 type name
 * @param {function} validate           validates the given string value and returns an error message if the value is invalid
 * @param {function} scalarToValue      converts the scalar value to a user-editable string representation
 * @param {function} valueToScalar      converts the string representation back to a scalar value
 */
function registerCustomConverter(type, validate, scalarToValue, valueToScalar) {
    converter[type] = {
        validate: validate,
        scalarToValue: scalarToValue,
        valueToScalar: valueToScalar
    };
}

resetConverter();

function isInputType(type) {
    return type && type.kind === "INPUT_OBJECT";
}

function isScalarType(type) {
    return type && type.kind === "SCALAR";
}

function isListType(type) {
    return type && type.kind === "LIST";
}

function isNonNull(type) {
    return type && type.kind === "NON_NULL";
}

function unwrapNonNull(type) {
    if (isNonNull(type)) {
        return type.ofType;
    }
    return type;
}

function resolve(inputSchema, current, path, pos) {
    var len = path.length;

    current = unwrapNonNull(current);

    var prop = path[pos];
    var next = pos + 1;

    if (isListType(current)) {
        current = inputSchema.getType(current.ofType.name);

        if (next === len) {
            return current;
        }

        return resolve(inputSchema, current, path, next);
    } else if (!isInputType(current)) {
        throw new Error("Invalid type '" + current.name + "': " + JSON.stringify(current));
    }

    var found = findNamed(current.inputFields, prop);

    if (!found) {
        throw new Error("Could not find '" + prop + "' ( path = " + path + ", pos = " + pos + ") in " + JSON.stringify(current));
    }

    current = found.type;

    if (!current) {
        throw new Error("Could not find field '" + prop + "' in type '" + current.name + "'");
    }

    if (next === len) {
        return current;
    }

    return resolve(inputSchema, current, path, next);
}

function handlerFn(typeName, handlerName) {
    var entry = converter[typeName];
    if (entry === false) {
        return null;
    } else if (!entry) {
        throw new Error("Unknown scalar '" + typeName + "'");
    }

    var fn = entry[handlerName];

    if (fn === false) {
        return null;
    } else if (!fn) {
        throw new Error("Undefined handler '" + handlerName + "' on " + typeName);
    }
    return fn;
}

function checkNonNull(value) {
    return !value ? "$FIELD required" : null;
}

function checkNonNullBool(value) {
    return value !== true && value !== false ? "$FIELD required" : null;
}

function getValidationPlan(inputSchema, typeName) {
    var existing = inputSchema.validationPlan[typeName];
    if (existing) {
        return existing;
    }

    var inputTypeDef = inputSchema.getType(typeName);

    if (!isInputType(inputTypeDef)) {
        throw new Error("'" + typeName + "' is not a known input type");
    }

    var inputFields = inputTypeDef.inputFields;


    var plan = [];

    for (var i = 0; i < inputFields.length; i++) {
        var field = inputFields[i];
        var name = field.name,
            type = field.type;


        var typeIsNonNull = isNonNull(type);
        var actualType = unwrapNonNull(type);
        var isScalar = isScalarType(actualType);

        if (typeIsNonNull) {
            if (isScalar && actualType.name === "Boolean") {
                plan.push(name, checkNonNullBool);
            } else {
                plan.push(name, checkNonNull);
            }
        }

        if (isScalar) {
            var fn = handlerFn(actualType.name, "validate");

            //console.log("Scalar type ", actualType, ": validator = ", fn);

            if (fn) {
                plan.push(name, fn);
            }
        } else if (isInputType(actualType)) {
            var inputTypePlan = getValidationPlan(inputSchema, actualType.name);
            if (inputTypePlan.length) {
                plan.push(name, [PLAN_INPUT_OBJECT].concat(_toConsumableArray(inputTypePlan)));
            }
        } else if (isListType(actualType)) {
            var elementType = inputSchema.getType(actualType.ofType.name);

            if (isScalarType(elementType)) {
                var _fn = handlerFn(elementType.name, "validate");

                if (_fn) {
                    plan.push(name, [PLAN_SCALAR_LIST, _fn]);
                }
            } else {
                var elementPlan = getValidationPlan(inputSchema, elementType.name);
                if (elementPlan.length) {
                    plan.push(name, [PLAN_COMPLEX_LIST].concat(_toConsumableArray(elementPlan)));
                    plan.push(name, elementPlan);
                }
            }
        }
    }

    if (inputSchema.debug) {
        console.log("Validation plan for ", typeName, "is: ", plan);
    }

    inputSchema.validationPlan[typeName] = plan;

    return plan;
}

function isEnumType(fieldType) {
    return fieldType && fieldType.kind === "ENUM";
}

function convertValue(inputSchema, fieldType, value, toScalar) {
    fieldType = unwrapNonNull(fieldType);

    if (isScalarType(fieldType)) {
        var result = void 0;
        if (toScalar) {
            result = InputSchema.valueToScalar(fieldType.name, value);
        } else {
            result = InputSchema.scalarToValue(fieldType.name, value);

            if (fieldType.name !== "Boolean") {
                result = result || "";
            }
        }

        if (inputSchema.debug) {
            console.log(value, "( type", fieldType, ") ==", toScalar ? "toScalar" : "fromScalar", "=> ", result, typeof result === "undefined" ? "undefined" : _typeof(result), path);
        }

        return result;
    } else if (isInputType(fieldType)) {
        if (!value) {
            return null;
        }

        if (inputSchema.debug) {
            console.log("Convert InputObject ", fieldType.name, path);
        }

        return convertInput(inputSchema, inputSchema.getType(fieldType.name), value, toScalar);
    } else if (isListType(fieldType)) {
        if (!value) {
            return null;
        }

        var array = new Array(value.length);

        if (inputSchema.debug) {
            console.log("Convert List of ", fieldType.ofType.name, path);
        }

        for (var j = 0; j < value.length; j++) {
            array[j] = convertValue(inputSchema, inputSchema.getType(fieldType.ofType.name), value[j], toScalar);
        }
        return array;
    } else if (isEnumType(fieldType)) {
        return value;
    } else {
        throw new Error("Unhandled field type : " + JSON.stringify(fieldType));
    }
}

function convertInput(inputSchema, baseTypeDef, value, toScalar) {
    var inputFields = baseTypeDef.inputFields;


    var out = {};

    for (var i = 0; i < inputFields.length; i++) {
        var field = inputFields[i];
        var name = field.name;

        out[name] = convertValue(inputSchema, field.type, value[name], toScalar);
    }
    return out;
}

function executeValidationPlan(values, validationPlan, start) {
    if (validationPlan[start] === PLAN_SCALAR_LIST) {
        var result = validationPlan[start + 1](values);

        //console.log("Scalar List elem ", values, " => ", result);

        return result;
    }

    var errors = null;

    for (var i = start; i < validationPlan.length; i += 2) {
        var name = validationPlan[i];
        var fnOrArray = validationPlan[i + 1];

        var fieldValue = values[name];
        if (typeof fnOrArray === "function") {
            var error = fnOrArray(fieldValue);

            //console.log("field ", name, ": ", fieldValue, " => ", error);
            if (error) {
                errors = errors || {};
                errors[name] = error;
            }
        } else {
            if (fnOrArray[0] === PLAN_COMPLEX_LIST) {
                if (fieldValue) {
                    var array = null;

                    for (var j = 0; j < fieldValue.length; j++) {
                        var err = executeValidationPlan(fieldValue[j], fnOrArray, 1);
                        if (err) {
                            array = array || new Array(fieldValue.length);
                            array[j] = err;
                        }
                    }

                    if (array) {
                        errors = errors || {};
                        errors[name] = array;
                    }
                }
            } else if (fnOrArray[0] === PLAN_INPUT_OBJECT) {
                if (fieldValue) {
                    var _err = executeValidationPlan(fieldValue, fnOrArray, 1);
                    if (_err) {
                        errors = errors || {};
                        errors[name] = _err;
                    }
                }
            }
        }
    }
    return errors;
}

var InputSchema = function () {
    function InputSchema(schema) {
        var debug = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        _classCallCheck(this, InputSchema);

        var types = schema.types;


        if (!types || typeof types.length !== "number") {
            throw new Error("Given Schema object has no 'types' array property");
        }

        this.schema = schema;
        this.validationPlan = {};
        this.debug = debug;
    }

    /**
     * Resolves a complex type definition
     *
     * @param typeName      name of type
     */


    _createClass(InputSchema, [{
        key: "getType",
        value: function getType(typeName) {
            var types = this.schema.types;


            return findNamed(types, typeName);
        }

        /**
         * Resolves the type of a name expression
         *
         * @param typeName      base type
         * @param name          name expression (e.g. 'name', 'values[0]', 'address.city')
         */

    }, {
        key: "resolveType",
        value: function resolveType(typeName, name) {
            var path = typeof name === "string" ? (0, _lodash2.default)(name) : name;

            var currentType = this.getType(typeName);

            return resolve(this, currentType, path, 0);
        }
    }, {
        key: "toValues",
        value: function toValues(typeName, value) {
            var baseTypeDef = this.getType(typeName);
            if (!isInputType(baseTypeDef)) {
                throw new Error(typeName + " is not a known input type: " + JSON.stringify(baseTypeDef));
            }

            if (!value) {
                throw new Error("Root object of type '" + typeName + "' cannot be falsy: " + value);
            }

            return convertInput(this, baseTypeDef, value, false);
        }
    }, {
        key: "fromValues",
        value: function fromValues(typeName, values) {
            var baseTypeDef = this.getType(typeName);
            if (!isInputType(baseTypeDef)) {
                throw new Error(typeName + " is not a known input type: " + JSON.stringify(baseTypeDef));
            }
            if (!values) {
                throw new Error("Form values cannot be falsy: " + values);
            }

            return convertInput(this, baseTypeDef, values, true);
        }
    }, {
        key: "getTypes",
        value: function getTypes() {
            return this.schema.types;
        }
    }, {
        key: "validate",
        value: function validate(type, values) {
            var validationPlan = getValidationPlan(this, type);

            var errors = executeValidationPlan(values, validationPlan, 0) || NO_ERRORS;

            if (this.debug) {
                console.log("Errors for ", values, "=>", errors);
            }

            return errors;
        }
    }], [{
        key: "validate",
        value: function validate(scalarType, value) {
            var fn = handlerFn(scalarType, "validate");
            return fn ? fn(value) : "";
        }
    }, {
        key: "scalarToValue",
        value: function scalarToValue(scalarType, value) {
            var fn = handlerFn(scalarType, "scalarToValue");
            return fn ? fn(value) : value;
        }
    }, {
        key: "valueToScalar",
        value: function valueToScalar(scalarType, value) {
            var fn = handlerFn(scalarType, "valueToScalar");
            return fn ? fn(value) : value;
        }
    }]);

    return InputSchema;
}();

exports.default = InputSchema;