"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.toWire = toWire;
exports.fromWire = fromWire;

var _mobx = require("mobx");

function getType(type, obj) {
    if (!type) {
        type = obj._type;

        if (!type) {
            throw new Error("Cannot get type for type = " + type + ", obj = " + JSON.stringify(obj));
        }
    }
    return type;
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
function toWire(type, obj, classes) {
    type = getType(type, obj);

    var TypeClass = classes[type];

    var out = void 0;
    if (TypeClass) {
        out = new TypeClass();
        Object.assign(out, obj);
    } else {
        out = _mobx.observable.map(obj);
    }

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
function fromWire(type, obj) {
    type = getType(type, obj);

    return null;
}
//# sourceMappingURL=wire.js.map