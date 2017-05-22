"use strict";

//
// The Madness theme generator. See BracketTheme for list of available options.
// This is all about dimensions and positioning; BracketTheme manages colors.
//
var MadnessTheme = {
  generate: function(options) {
    var identifierWidth    = 0;
    var seedWidth          = 18;
    var bracketLineMargin  = 14;
    var cornerRadius       = 3;
    var scoreWidth         = 0;
    var outlineWidth       = 2;
    var outlinePadding     = 2;

    if (options.hideSeeds === true) {
      seedWidth = cornerRadius;
    }

    var containerWidth     = 110 + seedWidth;
    var containerXPosition = identifierWidth + outlineWidth + outlinePadding;
    var playerXPosition    = containerXPosition + seedWidth;
    var playerSeparation   = 25;

    if (options.matchWidthMultiplier) {
      containerWidth *= options.matchWidthMultiplier;
    }

    var playerWidth     = containerWidth - seedWidth - scoreWidth;
    var matchWidth      = containerXPosition + containerWidth + bracketLineMargin + outlineWidth + outlinePadding;
    var scoresXPosition = containerXPosition + containerWidth - bracketLineMargin - 15;

    var compressedMultiplier = 7 / 10;
    var compressedMatchWidth = matchWidth * compressedMultiplier;
    var compressedContainerWidth = compressedMatchWidth - containerXPosition - bracketLineMargin - outlineWidth - outlinePadding;
    var compressedPlayerWidth = compressedContainerWidth - seedWidth - scoreWidth;

    return {
      options: options,

      animateBracketLinesOnInitialRender: true,
      compressedMultiplier: compressedMultiplier,

      match: {
        width  : matchWidth,
        compressedWidth : compressedMatchWidth,
        height : 52,
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

        // 1 px outline of container
        outerContainer: {
          visible : true,
          width   : containerWidth + 2 * outlineWidth,
          height  : 44 + 2 * outlineWidth,
          x       : containerXPosition - outlineWidth,
          y       : 5 - outlineWidth,
          rx      : cornerRadius,
          ry      : cornerRadius,

          compressedWidth : compressedContainerWidth + 2 * outlineWidth
        },

        innerContainer: {
          visible : true,
          width   : containerWidth,
          height  : 44,
          x       : containerXPosition,
          y       : 5,
          rx      : cornerRadius,
          ry      : cornerRadius,

          compressedWidth : compressedContainerWidth
        },

        seeds: {
          background : {
            visible : !options.hideSeeds,
            width   : seedWidth + 9,
            height  : 44,
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
            x1         : containerXPosition + 8,
            y1         : 19,
            x2         : containerXPosition + 8,
            y2         : 17 + playerSeparation
          }
        },

        scores: {
          background: {
            visible : false,
            width   : 35,
            height  : 43,
            x       : scoresXPosition,
            y       : 5,
            rx      : cornerRadius,
            ry      : cornerRadius
          },

          text: {
            visible    : false,
            width      : 21,
            height     : 12,
            textAnchor : 'middle',
            x1         : scoresXPosition + 20,
            y1         : 20,
            x2         : scoresXPosition + 20,
            y2         : 43
          },

          winnerBackground: {
            visible : false,
            width   : 3,
            height  : 22,
            x1      : scoresXPosition + 26,
            y1      : 5,
            x2      : scoresXPosition + 26,
            y2      : 28,
            rx      : 0,
            ry      : 0
          },

          winnerBackgroundCorner: {
            visible : false,
            width   : 35,
            height  : 5,
            x1      : scoresXPosition,
            y1      : 22,
            x2      : scoresXPosition,
            y2      : 28
          }
        },

        players: {
          background: {
            visible : true,
            width   : playerWidth,
            height  : playerSeparation - 3,
            x1      : playerXPosition,
            y1      : 5,
            x2      : playerXPosition,
            y2      : playerSeparation + 2,

            compressedWidth: compressedPlayerWidth
          },

          portraitBackdrop: {
            visible : true,
            width   : seedWidth,
            height  : playerSeparation - 3,
            x1      : containerXPosition,
            y1      : 5,
            x2      : containerXPosition,
            y2      : playerSeparation + 2,
            rx      : 0,
            ry      : 0
          },

          portrait: {
            visible : true,
            width   : 18,
            height  : 18,
            x1      : playerXPosition + 5,
            y1      : 7,
            x2      : playerXPosition + 5,
            y2      : 7 + playerSeparation
          },

          text: {
            visible : true,
            width   : playerWidth,
            height  : 13,
            x1      : playerXPosition + 5,
            y1      : 20,
            x2      : playerXPosition + 5,
            y2      : 18 + playerSeparation,
            x1WithPortrait : playerXPosition + 27,
            y1WithPortrait : 20,
            x2WithPortrait : playerXPosition + 27,
            y2WithPortrait : 28 + playerSeparation
          },

          clipPath: {
            width  : playerWidth - 4,
            height : 22,
            x1     : playerXPosition,
            y1     : 5,
            x2     : playerXPosition,
            y2     : 5 + playerSeparation,

            compressedWidth: compressedPlayerWidth - 4
          }
        },

        divider: {
          visible    : true,
          x1         : containerXPosition,
          y1         : 26.5,
          x2         : containerXPosition + containerWidth,
          y2         : 26.5,
          x2WithIcon : containerXPosition + containerWidth - 29,
          y2WithIcon : 26.5,

          x2Compressed : containerXPosition + compressedContainerWidth
        },

        divider2: {
          visible    : true,
          x1         : containerXPosition + seedWidth,
          y1         : 5,
          x2         : containerXPosition + seedWidth,
          y2         : 50
        },

        reportScoresIcon: {
          visible    : true,
          width      : 21,
          height     : 25,
          textAnchor : 'middle',
          x          : scoresXPosition + 16,
          y          : 34
        },

        extensionPlacement: {
          x : (matchWidth - bracketLineMargin - cornerRadius - 6),
          y : 4
        }
      }
    };
  }
};

module.exports = MadnessTheme;
