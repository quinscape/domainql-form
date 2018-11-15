"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _mobx = require("mobx");

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

var Converter = function () {
    function Converter(inputSchema, classes) {
        _classCallCheck(this, Converter);

        this.inputSchema = inputSchema;
        this.classes = classes;
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


    _createClass(Converter, [{
        key: "toWire",
        value: function toWire(type, obj) {
            type = getType(type, obj);

            return null;
        }

        /**
         * Converts the JSON wire-format into observable objects.
         *
         * All objects are turned into observable objects. If there is a observable JavaScript class definition for that type an instance
         * of that is created for the object. All scalar values are converted according to their JavaScript version.
         *
         * @param {String} [type]   Complex Type within the GraphQL domain. Optional if the object contains a _type property pointing to the type.
         * @param {Object} obj      type instance as JSON object representation
         *
         * @return {Object} observable object tree
         */

    }, {
        key: "fromWire",
        value: function fromWire(type, obj) {
            type = getType(type, obj);

            var TypeClass = this.classes[type];

            var out = void 0;
            if (TypeClass) {
                out = new TypeClass();
            } else {
                out = {};
            }

            var schemaType = this.inputSchema.getType(type);

            console.log({ schemaType: schemaType });

            return out;
        }
    }]);

    return Converter;
}();

exports.default = Converter;
//# sourceMappingURL=Converter.js.map