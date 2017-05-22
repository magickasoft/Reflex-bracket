"use strict";

var Reflux = require('reflux');

var MatchActions = Reflux.createActions([
  "markUnderway",
  "unmarkUnderway",
  "reopen",
  "markUnderwayRequestStarted",
  "markUnderwayRequestSucceeded",
  "markUnderwayRequestFailed",
  "unmarkUnderwayRequestStarted",
  "unmarkUnderwayRequestSucceeded",
  "unmarkUnderwayRequestFailed",
  "reopenRequestStarted",
  "reopenRequestSucceeded",
  "reopenRequestFailed"
]);

module.exports = MatchActions;
