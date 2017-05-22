"use strict";

var Reflux = require('reflux');

// follow Reflux convention for async actions
var asyncChildActions = {children: ["completed", "failed"]};

var ParticipantManagementActions = Reflux.createActions([
  {"swapParticipants": asyncChildActions}
]);

module.exports = ParticipantManagementActions;
