"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = unwrapType;

var _kind = require("../kind");

function unwrapType(type) {
    if (type.kind === _kind.NON_NULL) {
        return unwrapType(type.ofType);
    }
    return type;
}
//# sourceMappingURL=unwrapType.js.map