"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _kind = require("./kind");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function getType(type, obj) {
    if (!type) {
        type = obj._type;

        if (!type) {
            throw new Error("Cannot get type for type = " + type + ", obj = " + JSON.stringify(obj));
        }
    }
    return type;
}

function normDate(dateObj) {
    dateObj.setUTCHours(0);
    dateObj.setUTCMinutes(0);
    dateObj.setUTCSeconds(0);
    dateObj.setUTCMilliseconds(0);
    return dateObj;
}

var DEFAULT_TO_WIRE = {
    // "BigDecimal": function (v) {
    //     return null
    // },
    // "BigInteger": function (v) {
    //     return null
    // },
    // "Boolean": function (v) {
    //     return null
    // },
    // "Byte": function (v) {
    //     return null
    // },
    "Date": function Date(v) {
        normDate(v);
        return v && v.toISOString();
    },
    // "Float": function (v) {
    //     return null
    // },
    // "Int": function (v) {
    //     return null
    // },
    // "Long": function (v) {
    //     return null
    // },
    // "Short": function (v) {
    //     return null
    // },
    // "String": function (v) {
    //     return null
    // },
    "Timestamp": function Timestamp(v) {
        normDate(v);
        return v && v.toISOString();
    }

};

var DEFAULT_FROM_WIRE = {

    // "BigDecimal": function (v) {
    //     return null
    // },
    // "BigInteger": function (v) {
    //     return null
    // },
    // "Boolean": function (v) {
    //     return null
    // },
    // "Byte": function (v) {
    //     return null
    // },
    "Date": function (_Date) {
        function Date(_x) {
            return _Date.apply(this, arguments);
        }

        Date.toString = function () {
            return _Date.toString();
        };

        return Date;
    }(function (v) {
        if (v) {
            var d = new Date(v);
            normDate(d);
            return d;
        }
        return v;
    }),
    // "Float": function (v) {
    //     return null
    // },
    // "Int": function (v) {
    //     return null
    // },
    // "Long": function (v) {
    //     return null
    // },
    // "Short": function (v) {
    //     return null
    // },
    // "String": function (v) {
    //     return null
    // },
    "Timestamp": function Timestamp(v) {
        return v && new Date(v);
    }
};

var WireFormat = function () {
    function WireFormat(inputSchema) {
        var classes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        _classCallCheck(this, WireFormat);

        if (!inputSchema) {
            throw new Error("Need inputSchema");
        }

        this.inputSchema = inputSchema;
        this.classes = classes;

        this.ToWireConverters = _extends({}, DEFAULT_TO_WIRE);
        this.FromWireConverters = _extends({}, DEFAULT_FROM_WIRE);
    }

    /**
     * Converts an observable object into the JSON wire format.
     *
     * All observable objects are simplified into JavaScript objects and the scalar values are converted to their wire format
     * representation.
     *
     * @param {String} [type]       Complex Type within the GraphQL domain. Optional if the object contains a _type property pointing to the type.
     * @param {Object} obj          type instance as observable object
     * @param {Object} classes      object map mapping type names to observable class implementations.
     *
     * @return {Object} type instance in wire format
     */


    _createClass(WireFormat, [{
        key: "toWire",
        value: function toWire(type, obj) {
            type = getType(type, value);

            return convert(this, {
                kind: _kind.OBJECT,
                name: type
            }, value, false);
        }
    }, {
        key: "registerConverter",
        value: function registerConverter(type, fromWire, toWire) {
            this.FromWireConverters[type] = fromWire;
            this.ToWireConverters[type] = toWire;
        }

        /**
         * Converts the JSON wire-format into observable objects.
         *
         * All objects are turned into observable objects. If there is a observable JavaScript class definition for that type an instance
         * of that is created for the object. All scalar values are converted according to their JavaScript version.
         *
         * @param {String} [type]   Complex Type within the GraphQL domain. Optional if the object contains a _type property pointing to the type.
         * @param {Object} value      type instance as JSON object representation
         *
         * @return {Object} observable object tree
         */

    }, {
        key: "fromWire",
        value: function fromWire(type, value) {
            type = getType(type, value);

            return convert(this, {
                kind: _kind.OBJECT,
                name: type
            }, value, true);
        }

        /**
         * Does the actual conversion based on a GraphQL schema type reference
         *
         * @param {Object} typeRef      GraphQL schema type reference
         * @param {*} value             value
         * @param {boolean} fromWire    true if the value is to be converted from wire format into JavaScript, false otherwise
         *
         * @return {*} JavaScript value
         */

    }, {
        key: "convert",
        value: function convert(typeRef, value, fromWire) {
            if (typeRef.kind === _kind.NON_NULL) {
                if (value === null) {
                    throw new Error("NON_NULL value is null: typeRef = " + JSON.stringify(typeRef) + ", value = " + JSON.stringify(value));
                }

                return this.convert(typeRef.ofType, value, fromWire);
            }

            if (typeRef.kind === _kind.SCALAR) {

                var scalarName = typeRef.name;

                var fn = this[fromWire ? "FromWireConverters" : "ToWireConverters"][scalarName];
                //console.log("CONVERT SCALAR", scalarName, value);
                return fn ? fn(value) : value;
            } else if (typeRef.kind === _kind.OBJECT) {
                if (value) {
                    var out = void 0;
                    var typeName = typeRef.name;
                    if (fromWire) {
                        var TypeClass = this.classes[typeName];
                        out = TypeClass ? new TypeClass() : {};
                    } else {
                        out = {};
                    }

                    if (fromWire) {
                        out._type = typeName;
                    }

                    var typeDef = this.inputSchema.getType(typeName);
                    if (!typeDef) {
                        throw new Error("Could not find type '" + typeName + "' in schema");
                    }

                    var fields = fromWire ? typeDef.fields : typeDef.inputFields;

                    if (!fields) {
                        throw new Error("Type '" + typeName + "' has no fields: " + JSON.stringify(typeDef));
                    }

                    for (var i = 0; i < fields.length; i++) {
                        var _fields$i = fields[i],
                            name = _fields$i.name,
                            type = _fields$i.type;


                        var fieldValue = value[name];
                        if (fieldValue !== undefined) {
                            //console.log("CONVERT FIELD", name, type, fieldValue, fromWire)
                            out[name] = this.convert(type, fieldValue, fromWire);
                        }
                    }
                    return out;
                }
                return null;
            } else if (typeRef.kind === _kind.LIST) {
                if (value) {
                    var elementType = typeRef.ofType;
                    var _out = new Array(value.length);

                    for (var j = 0; j < value.length; j++) {
                        //console.log("CONVERT ELEMENT", elementType, value[j], fromWire);
                        _out[j] = this.convert(elementType, value[j], fromWire);
                    }
                    return _out;
                }
                return null;
            }
        }
    }]);

    return WireFormat;
}();

exports.default = WireFormat;