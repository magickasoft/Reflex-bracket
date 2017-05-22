"use strict";

var Reflux = require('reflux');

var TournamentActions = Reflux.createActions([
  "refresh",
  "refreshRequestStarted",
  "refreshRequestSucceeded",
  "refreshRequestFailed",
  "loadRefreshData",
  "matchesUpdate"
]);

module.exports = TournamentActions;
