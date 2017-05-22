"use strict";

import _ from 'lodash';

var MatchPlotter = function(matchesByRound, roundLabelHeight) {
  this.matchesByRound = matchesByRound;
  this.roundLabelHeight = roundLabelHeight;
  this.matchesByIdentifier = {};
  this.maxX = 0;
  this.maxY = 0;
  this.identifiersInRenderOrder = [];
};

MatchPlotter.prototype = {
  setMatchCoordinates: function(numCompressedRounds) {
    this.beforeSetMatchCoordinates(numCompressedRounds);

    var _this = this;

    // store coordinates for all matches
    _.each(_this.matchesByRound, function(matches, round) {
      round = parseInt(round);

      _.each(matches, function(match, index) {
        var coords = _this.coordinatesForMatch(round, index, numCompressedRounds);

        if (coords.x > _this.maxX) {
          _this.maxX = coords.x;
        }
        if (coords.y > _this.maxY) {
          _this.maxY = coords.y;
        }

        _this.matchesByIdentifier[match.identifier] = {
          match: match,
          coords: coords
        };

        _this.identifiersInRenderOrder.unshift(match.identifier);
      });
    });

    this.afterSetMatchCoordinates(numCompressedRounds);
  },

  // basic grid where x ~ round number, y ~ index of match in its round
  coordinatesForMatch: function(roundNumber, index, numCompressedRounds) {
    return {x: roundNumber - 1, y: this.roundLabelHeight + index};
  },

  beforeSetMatchCoordinates: function() {},

  afterSetMatchCoordinates: function() {}
};

module.exports = MatchPlotter;
