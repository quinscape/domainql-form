"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _FieldMode = require("./FieldMode");

var _FieldMode2 = _interopRequireDefault(_FieldMode);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {

  /**
   * True to use "horizontal" bootstrap form groups
   */
  horizontal: _propTypes2.default.bool,
  /**
   * Additional label column class to use if in horizontal mode.
   */
  labelColumnClass: _propTypes2.default.string,
  /**
   * Additional wrapper column class to use if in horizontal mode.
   */
  wrapperColumnClass: _propTypes2.default.string,

  /**
   * Currency ISO code for Currency fields
   */
  currency: _propTypes2.default.string,

  /**
   * True if the currency addon is on the right side of the input component.
   */
  currencyAddonRight: _propTypes2.default.bool,

  /**
   * Optional function to look up a form field label based on formConfig and field name / path.
   */
  lookupLabel: _propTypes2.default.func,

  /**
   * Default mode for input components within the Form. Setting this on a &lt;FormBlock&gt; or a &lt;Form&gt; will control
   * all fields inside the form block or form.
   */
  mode: _propTypes2.default.oneOf(_FieldMode2.default.values()),

  /**
   * If true (the default), make button with name attributes set formikProps.status.button with that name.
   */
  buttonStatus: _propTypes2.default.bool
};