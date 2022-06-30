/**
 * Check if the property is writable or has a setter
 * @param {Object} obj The object of which the property should be checked
 * @param {String} propertyName The property to be checked
 * @returns {boolean} true if the property is writable, has a setter or does not exist, false otherwise
 */
export function isPropertyWritable(obj, propertyName) {
    const desc = Object.getOwnPropertyDescriptor(obj.constructor.prototype, propertyName);
    return desc == null || desc.writable || desc.set != null;
}