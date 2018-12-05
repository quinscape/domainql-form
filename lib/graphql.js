"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.defaultErrorHandler = defaultErrorHandler;

exports.default = function (params) {

    //console.log("QUERY: ", params);

    var _config = (0, _c2.default)(),
        csrfToken = _config.csrfToken,
        contextPath = _config.contextPath;

    return fetch(window.location.origin + contextPath + "/graphql", {
        method: "POST",
        credentials: "same-origin",
        headers: _defineProperty({
            "Content-Type": "application/json"

        }, csrfToken.header, csrfToken.value),
        body: JSON.stringify(params)
    }).then(function (response) {
        return response.json();
    }).then(function (_ref) {
        var data = _ref.data,
            errors = _ref.errors;

        if (errors) {
            return Promise.reject(errors);
        }
        return data;
    });
};

var _c = require("./c");

var _c2 = _interopRequireDefault(_c);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Logs graphql errors
 * @param errors
 */
function defaultErrorHandler(errors) {
    console.error("GraphQL Request failed");
    console.table(errors);
}

/**
 * GraphQL query service
 *
 * @param {Object} params               Parameters
 * @param {String} params.query         query string
 * @param {Object} [params.variables]   query variables
 *
 * @returns {Promise<any>} Promise resolving to query data
 */
//# sourceMappingURL=graphql.js.map