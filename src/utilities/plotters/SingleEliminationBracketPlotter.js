"use strict";

var MatchPlotter = require('./MatchPlotter');
import _ from 'lodash';

// constructor
var SingleEliminationBracketPlotter = function(matchesByRound, thirdPlaceMatch, roundLabelHeight, extraSpacingForSmallBrackets) {
  MatchPlotter.call(this, matchesByRound);
  this.thirdPlaceMatch = thirdPlaceMatch;
  this.roundLabelHeight = roundLabelHeight;
  this.extraSpacingForSmallBrackets = (extraSpacingForSmallBrackets === undefined ? true : extraSpacingForSmallBrackets);
};

// extend MatchPlotter
SingleEliminationBracketPlotter.prototype = Object.create(MatchPlotter.prototype);
SingleEliminationBracketPlotter.constructor = SingleEliminationBracketPlotter;

// override afterSetMatchCoordinates()
SingleEliminationBracketPlotter.prototype.afterSetMatchCoordinates = function(numCompressedRounds) {
  var _this = this;

  // reposition qualifying matches
  if (this.hasByes()) {
    var roundOneMatches = this.matchesByRound[2].slice(0);

    _.each(roundOneMatches, function(match) {
      if (match.player1_prereq_identifier && !match.player1_is_prereq_match_loser) {
        _this.matchesByIdentifier[match.player1_prereq_identifier].coords.y = _this.matchesByIdentifier[match.identifier].coords.y - 0.5;
      }

      if (match.player2_prereq_identifier && !match.player2_is_prereq_match_loser) {
        var newY = _this.matchesByIdentifier[match.identifier].coords.y + 0.5;
        _this.matchesByIdentifier[match.player2_prereq_identifier].coords.y = newY;
        if (newY > _this.maxY) {
          _this.maxY = newY;
        }
      }
    });
  }

  // position the 3rd place match, if applicable
  if (this.thirdPlaceMatch) {
    var thirdPlaceCoords = {x: this.maxX + 0.25, y: (this.maxY / 2) + 2.5};

    this.matchesByIdentifier[this.thirdPlaceMatch.identifier] = {
      match: this.thirdPlaceMatch,
      coords: thirdPlaceCoords
    };

    this.maxX = thirdPlaceCoords.x;
    if (thirdPlaceCoords.y > this.maxY) {
      this.maxY = thirdPlaceCoords.y;
    }

    this.identifiersInRenderOrder.push(this.thirdPlaceMatch.identifier);
  }
};

// override coordinatesForMatch()
SingleEliminationBracketPlotter.prototype.coordinatesForMatch = function(roundNumber, index, numCompressedRounds) {
  // TODO: rename these variables
  var paddingHeight = this.paddingHeight(roundNumber - numCompressedRounds); // padding above the round column
  var topPadding    = this.topPadding(roundNumber - numCompressedRounds);    // padding between matches in a round column

  return {
    x: (roundNumber - 1),
    y: (this.roundLabelHeight + topPadding + paddingHeight * index)
  };
};

// "private" methods
SingleEliminationBracketPlotter.prototype.hasByes = function() {
  return (this.matchesByRound[2] && this.matchesByRound[1].length !== this.matchesByRound[2].length * 2);
};

SingleEliminationBracketPlotter.prototype.bracketSize = function() {
  if (this.hasByes()) {
    return (this.matchesByRound[2].length * 2 + this.matchesByRound[1].length);
  } else {
    return (this.matchesByRound[1].length * 2);
  }
};

SingleEliminationBracketPlotter.prototype.paddingHeight = function(roundNumber) {
  var exponentOffset = -1;

  if (this.includeExtraSpacing()) {
    exponentOffset = 0;
  } else if (this.compactWithQualifierMatches()) {
    exponentOffset = -2;
  }

  return Math.pow(2, roundNumber + exponentOffset);
};

SingleEliminationBracketPlotter.prototype.topPadding = function(roundNumber) {
  var padding = this.paddingHeight(roundNumber) / 2;

  if (this.compactWithQualifierMatches()) {
    padding -= 0.5;
  } else if (this.hasByes()) {
    padding -= 1;
  } else {
    padding -= this.paddingHeight(1) / 2;
  }

  return padding;
};

SingleEliminationBracketPlotter.prototype.includeExtraSpacing = function() {
  return (this.extraSpacingForSmallBrackets && [4, 8].indexOf(this.bracketSize()) !== -1);
};

SingleEliminationBracketPlotter.prototype.compactWithQualifierMatches = function() {
  return (this.hasByes() && (!this.extraSpacingForSmallBrackets || this.bracketSize() > 16) && this.matchesByRound[1].length <= this.matchesByRound[2].length);
};

module.exports = SingleEliminationBracketPlotter;
