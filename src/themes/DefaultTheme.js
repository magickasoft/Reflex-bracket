"use strict";

//
// The default theme generator. See BracketTheme for list of available options.
// This is all about dimensions and positioning; BracketTheme manages colors.
//
var DefaultTheme = {
  generate: function(options) {
    var identifierWidth    = 24;
    var seedWidth          = 24;
    var bracketLineMargin  = 16;
    var cornerRadius       = 3;
    var scoreWidth         = 29;
    var outlineWidth       = 2;

    if (options.hideIdentifiers === true) {
      identifierWidth = 0;
    }

    if (options.hideSeeds === true) {
      seedWidth = cornerRadius;
    }

    var containerWidth     = 176 + seedWidth;
    var containerXPosition = identifierWidth + outlineWidth;
    var playerXPosition    = containerXPosition + seedWidth;

    if (options.matchWidthMultiplier) {
      containerWidth *= options.matchWidthMultiplier;
    }

    var playerWidth     = containerWidth - seedWidth - scoreWidth;
    var matchWidth      = containerXPosition + containerWidth + bracketLineMargin + outlineWidth;
    var scoresXPosition = containerXPosition + containerWidth - scoreWidth - cornerRadius * 2;

    return {
      options: options,

      animateBracketLinesOnInitialRender: false,

      match: {
        width  : matchWidth,
        height : 54,
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
          height  : 45 + outlineWidth * 2,
          x       : containerXPosition - outlineWidth,
          y       : 5 - outlineWidth,
          rx      : cornerRadius,
          ry      : cornerRadius
        },

        innerContainer: {
          visible : true,
          width   : containerWidth,
          height  : 45,
          x       : containerXPosition,
          y       : 5,
          rx      : cornerRadius,
          ry      : cornerRadius
        },

        seeds: {
          background : {
            visible : !options.hideSeeds,
            width   : seedWidth + 9,
            height  : 45,
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
            width   : 35,
            height  : 45,
            x       : scoresXPosition,
            y       : 5,
            rx      : cornerRadius,
            ry      : cornerRadius
          },

          text: {
            visible    : true,
            width      : 21,
            height     : 12,
            textAnchor : 'middle',
            x1         : scoresXPosition + 20,
            y1         : 20,
            x2         : scoresXPosition + 20,
            y2         : 43
          },

          winnerBackground: {
            visible : true,
            width   : 35,
            height  : 22,
            x1      : scoresXPosition,
            y1      : 5,
            x2      : scoresXPosition,
            y2      : 28,
            rx      : cornerRadius,
            ry      : cornerRadius
          },

          winnerBackgroundCorner: {
            visible : true,
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
            height  : 22,
            x1      : playerXPosition,
            y1      : 5,
            x2      : playerXPosition,
            y2      : 28
          },

          portrait: {
            visible : true,
            width   : 18,
            height  : 18,
            x1      : playerXPosition + 5,
            y1      : 7,
            x2      : playerXPosition + 5,
            y2      : 30
          },

          text: {
            visible : true,
            width   : playerWidth,
            height  : 12,
            x1      : playerXPosition + 5,
            y1      : 20,
            x2      : playerXPosition + 5,
            y2      : 43,
            x1WithPortrait : playerXPosition + 27,
            y1WithPortrait : 20,
            x2WithPortrait : playerXPosition + 27,
            y2WithPortrait : 43
          },

          clipPath: {
            width  : playerWidth - 4,
            height : 22,
            x1     : playerXPosition,
            y1     : 5,
            x2     : playerXPosition,
            y2     : 28
          }
        },

        divider: {
          visible    : true,
          x1         : containerXPosition,
          y1         : 27.5,
          x2         : containerXPosition + containerWidth,
          y2         : 27.5,
          x2WithIcon : containerXPosition + containerWidth - 29,
          y2WithIcon : 27.5
        },

        reportScoresIcon: {
          visible    : true,
          width      : 21,
          height     : 25,
          textAnchor : 'middle',
          x          : scoresXPosition + 20,
          y          : 34
        },

        extensionPlacement: {
          x : (matchWidth - bracketLineMargin - cornerRadius),
          y : 4
        }
      }
    };
  }
};

module.exports = DefaultTheme;
