"use strict";

//
// The BFG theme generator. See BracketTheme for list of available options.
// This is all about dimensions and positioning; BracketTheme manages colors.
//
var BFGTheme = {
  generate: function(options) {
    options.hideIdentifiers = true;
    options.hideSeeds = true;

    var identifierWidth          = 24;
    var seedWidth                = 24;
    var bracketLineMargin        = 16;
    var cornerRadius             = 5;
    var scoreWidth               = 50;
    var outlineWidth             = 3;
    var portraitBackdropWidth    = 35;
    var participantSelectorWidth = 32;

    if (options.hideIdentifiers === true) {
      identifierWidth = 0;
    }

    if (options.hideSeeds === true) {
      seedWidth = cornerRadius;
    }

    var containerWidth     = 330 + seedWidth;
    var containerXPosition = identifierWidth + outlineWidth;
    var playerXPosition    = containerXPosition + seedWidth + portraitBackdropWidth - cornerRadius;

    if (options.matchWidthMultiplier) {
      containerWidth *= options.matchWidthMultiplier;
    }

    var playerWidth     = containerWidth - portraitBackdropWidth - participantSelectorWidth - seedWidth - scoreWidth;
    var matchWidth      = containerXPosition + containerWidth + bracketLineMargin + outlineWidth;
    var scoresXPosition = containerXPosition + containerWidth - scoreWidth - participantSelectorWidth - cornerRadius * 2;

    var compressedMultiplier = 1 / 3;

    return {
      options: options,

      animateBracketLinesOnInitialRender: true,
      compressedMultiplier: compressedMultiplier,

      match: {
        width  : matchWidth,
        compressedWidth : matchWidth * compressedMultiplier,
        height : 82,
        bracketLineMargin : bracketLineMargin,
        outlineWidth : outlineWidth,

        identifier: {
          visible    : !options.hideIdentifiers,
          width      : identifierWidth,
          x          : 11,
          y          : 31,
          height     : 10,
          textAnchor : 'middle'
        },

        // outline of container
        outerContainer: {
          visible : true,
          width   : containerWidth + outlineWidth * 2,
          height  : 69 + outlineWidth * 2,
          x       : containerXPosition - outlineWidth,
          y       : 5 - outlineWidth,
          rx      : cornerRadius,
          ry      : cornerRadius,

          compressedWidth : (containerWidth * compressedMultiplier) + outlineWidth * 2 - bracketLineMargin
        },

        innerContainer: {
          visible : true,
          width   : containerWidth,
          height  : 69,
          x       : containerXPosition,
          y       : 5,
          rx      : cornerRadius,
          ry      : cornerRadius,

          compressedWidth : containerWidth * compressedMultiplier - bracketLineMargin
        },

        seeds: {
          background : {
            visible : !options.hideSeeds,
            width   : seedWidth + 9,
            height  : 69,
            x       : containerXPosition,
            y       : 5,
            rx      : cornerRadius,
            ry      : cornerRadius
          },

          text: {
            visible    : !options.hideSeeds,
            width      : 10,
            height     : 12,
            textAnchor : 'middle',
            x1         : containerXPosition + 12,
            y1         : 19,
            x2         : containerXPosition + 12,
            y2         : 42
          }
        },

        scores: {
          background: {
            visible : true,
            width   : 60,
            height  : 69,
            x       : scoresXPosition,
            y       : 5,
            rx      : 0,
            ry      : 0,

            compressedX: 39
          },

          text: {
            visible    : true,
            width      : 46,
            height     : 13,
            textAnchor : 'end',
            x1         : scoresXPosition + 53,
            y1         : 27,
            x2         : scoresXPosition + 53,
            y2         : 62,

            compressedX1: 92,
            compressedX2: 92
          },

          winnerBackground: {
            visible : true,
            width   : 60,
            height  : 34,
            x1      : scoresXPosition,
            y1      : 5,
            x2      : scoresXPosition,
            y2      : 38,
            rx      : 0,
            ry      : 0,

            compressedX1: 39,
            compressedX2: 39
          },

          winnerBackgroundCorner: {
            visible : false,
            width   : 60,
            height  : 5,
            x1      : scoresXPosition,
            y1      : 34,
            x2      : scoresXPosition,
            y2      : 40
          }
        },

        players: {
          background: {
            visible : true,
            width   : playerWidth,
            height  : 35,
            x1      : playerXPosition,
            y1      : 5,
            x2      : playerXPosition,
            y2      : 39,

            compressedWidth : 0
          },

          portraitBackdrop: {
            visible : true,
            width   : portraitBackdropWidth,
            height  : 34,
            x1      : containerXPosition,
            y1      : 5,
            x2      : containerXPosition,
            y2      : 40,
            rx      : 0,
            ry      : 0
          },

          portrait: {
            visible : true,
            width   : 34,
            height  : 34,
            x1      : containerXPosition,
            y1      : 5,
            x2      : containerXPosition,
            y2      : 40
          },

          text: {
            visible : true,
            width   : playerWidth,
            height  : 12,
            x1      : playerXPosition + 5,
            y1      : 27,
            x2      : playerXPosition + 5,
            y2      : 62,
            x1WithPortrait : playerXPosition + 5,
            y1WithPortrait : 27,
            x2WithPortrait : playerXPosition + 5,
            y2WithPortrait : 62
          },

          clipPath: {
            width  : playerWidth - 4,
            height : 45,
            x1     : playerXPosition,
            y1     : 5,
            x2     : playerXPosition,
            y2     : 28
          },

          toggleButtonBackground: {
            visible : true,
            width   : 32,
            height  : 35,
            x1      : playerXPosition + playerWidth + 55,
            y1      : 5,
            x2      : playerXPosition + playerWidth + 55,
            y2      : 39,
            rx      : 0,
            ry      : 0
          },

          toggleButtonText: {
            width      : 30,
            height     : 12,
            textAnchor : 'middle',
            x1         : playerXPosition + playerWidth + 71,
            y1         : 27,
            x2         : playerXPosition + playerWidth + 71,
            y2         : 62
          }
        },

        divider: {
          visible    : true,
          x1         : containerXPosition,
          y1         : 39.5,
          x2         : containerXPosition + containerWidth,
          y2         : 39.5,
          x2WithIcon : containerXPosition + containerWidth - 29,
          y2WithIcon : 39.5,
          x2Compressed : containerXPosition + (containerWidth * compressedMultiplier) - bracketLineMargin
        },

        divider2: {
          visible    : true,
          x1         : containerXPosition + portraitBackdropWidth,
          y1         : 5,
          x2         : containerXPosition + portraitBackdropWidth,
          y2         : 76
        },

        reportScoresIcon: {
          visible    : false,
          width      : 21,
          height     : 25,
          textAnchor : 'middle',
          x          : scoresXPosition + 77,
          y          : 45
        },

        extensionPlacement: {
          x : (matchWidth - bracketLineMargin - cornerRadius),
          y : 4
        }
      }
    };
  }
};

module.exports = BFGTheme;
