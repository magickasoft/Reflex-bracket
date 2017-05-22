"use strict";

// NOTE: To update translations available from js, you need to edit
//       js.* yaml translations and run `rake i18n:js:export`

// temporarily assign I18n to window so we can require the rake-generated translations.js
window.I18n = require('i18n-js');
require('./translations');

// scope it
var I18n = window.I18n;
delete window.I18n;

I18n.defaultLocale = 'en';

module.exports = I18n;
