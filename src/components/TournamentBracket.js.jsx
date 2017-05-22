// libraries
import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';
import ReactTransitionGroup from 'react-addons-transition-group';
import Reflux from 'reflux';
import $ from 'jquery';
import _ from 'lodash';

// components
import Match from './Match';
import BracketLine from './BracketLine';
import Rounds from './Rounds';
import Round from './Round';
import SVGTooltip from './SVGTooltip';

// utilities
import I18n from '../utilities/I18n';
import SingleEliminationBracketPlotter from '../utilities/plotters/SingleEliminationBracketPlotter';

// theme store, in case the prop isn't provided
import ThemeStore from '../stores/ThemeStore';

let matchScheduleRoundLabelLineHeight = 0.85;
let matchScheduleRoundLabelMargin = 0.5;

export default class TournamentBracket extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      numCompressedRounds: 0,
      zoomScale: this.theme().options.multiplier,

      // all in match units (1 unit width == match width, 1 unit height == match height)
      containerWidth: 8,
      containerOffsetY: 0,
      viewportHeight: 20,
      pageScrollY: 0,
      containerScrollX: 0,

      winnerRoundsY: 0,
      loserRoundsY: undefined,
    };
  }

  componentWillMount() {
    this.plotter = this.newPlotter(this.props, this.state);
  }

  componentDidMount() {
    let viewer = new TouchScroll();
    let el = ReactDOM.findDOMNode(this.refs.bracketScroll);
    let pinchEl = ReactDOM.findDOMNode(this.refs.bracketWrapper);
    let _this = this;

    viewer.init({
      el: el,
      draggable: true,
      wait: false,
      pinchEl: pinchEl,
      pinchHandler: this.handleZoom,
      panHandler: function() { _this.setViewportDimensions(_this.state.zoomScale); }
    });

    if (this.props.scaleToFit) {
      this.setZoomScaleToFit();
    } else {
      this.setViewportDimensions(this.state.zoomScale);
    }

    this.initViewportEventHandlers();
  }

  //TODO: remove the need for this by accessing matches from
  //      props.matchesByRound instead of plotter.matchesByIdentifier
  componentWillReceiveProps(nextProps) {
    this.plotter = this.newPlotter(nextProps, this.state);
  }

  //TODO: use md5 or some other approach to detect the need to reinit the plotter
  componentWillUpdate(nextProps, nextState) {
    if (['swiss', 'round robin'].indexOf(this.props.tournament.tournament_type) !== -1 &&
      this.state.containerWidth !== nextState.containerWidth) {
      this.plotter = this.newPlotter(nextProps, nextState);
    }
  }

  componentDidUpdate(lastProps, lastState) {
    if (this.state.zoomScale !== lastState.zoomScale) {
      let $e = $(ReactDOM.findDOMNode(this.refs.bracketScroll));

      // broadcast the window height change in case the bracket's in an iframe
      window.parent.postMessage(
        {
          challongeEvent: "windowHeightChange",
          height: $e.height()
        },
        "*"
      );
    }
  }

  // Allow this component to be rendered directy with the default theme.
  theme() {
    if (this.props.theme) {
      return this.props.theme;
    } else if (!this._defaultTheme) {
      this._defaultTheme = ThemeStore.generateForStaticRender(this.props.tournament);
    }

    return this._defaultTheme;
  }

  newPlotter(props, state) {
    let winnerRounds = _.filter(props.rounds, function(round) { return round.number > 0 });
    let loserRounds = _.filter(props.rounds, function(round) { return round.number < 0 });

    // determine pixel height of round labels
    let winnersRoundLabelPixelHeight = Rounds.heightForRounds(winnerRounds);
    if (winnersRoundLabelPixelHeight > 0) {
      winnersRoundLabelPixelHeight += Round.BOTTOM_MARGIN;
    }

    let losersRoundLabelPixelHeight = Rounds.heightForRounds(loserRounds);
    if (losersRoundLabelPixelHeight > 0) {
      losersRoundLabelPixelHeight += Round.BOTTOM_MARGIN;
    }

    let winnersRoundLabelHeight = winnersRoundLabelPixelHeight / this.theme().match.height;
    let losersRoundLabelHeight  = losersRoundLabelPixelHeight / this.theme().match.height;

    switch (props.requestedPlotter) {
      case 'SingleEliminationBracketPlotter':
        return new SingleEliminationBracketPlotter(props.matchesByRound, props.thirdPlaceMatch, winnersRoundLabelHeight);
      // out of scope for this project
      //case 'TwoSidedSingleEliminationBracketPlotter':
      //  return new TwoSidedSingleEliminationBracketPlotter(props.matchesByRound, props.thirdPlaceMatch, winnersRoundLabelHeight, true, this.compressedRounds(), this.theme().compressedMultiplier);
      //case 'DoubleEliminationBracketPlotter':
      //  return new DoubleEliminationBracketPlotter(props.matchesByRound, props.tournament.participant_count_to_advance, winnersRoundLabelHeight, losersRoundLabelHeight, (this.props.tournament.grand_finals_modifier === 'skip'));
      //case 'SchedulePlotter':
      //  return new SchedulePlotter(props.matchesByRound, matchScheduleRoundLabelLineHeight, matchScheduleRoundLabelMargin, state.containerWidth - 1);
      //default:
      //  return new MatchPlotter(props.matchesByRound, winnersRoundLabelHeight);
    }
  }

  compressedRounds() {
    if (this.props.compressUnopenedRounds) {
      // determine which rounds to compress
      // TODO: refactor!

      let _this = this;
      let expandedRound = null;
      let lastRoundNumber = null;

      // find the first round that should be expanded
      if (this.props.tournament.state === 'pending' || this.props.tournament.state === 'accepting_predictions') {
        expandedRound = 1;
      } else {
        _.each(this.props.matchesByRound, function(matches, round) {
          let roundNumber = parseInt(round);
          lastRoundNumber = roundNumber;

          if (expandedRound === null && _.find(matches, function(match) { return match.state === 'open' })) {
            expandedRound = roundNumber;
          }
        });
      }

      // if all matches are complete, expand the last round
      if (expandedRound === null) {
        expandedRound = lastRoundNumber;
      }

      let compressedRounds = _.map(this.props.matchesByRound, function(matches, round) {
        let roundNumber = parseInt(round);

        if (expandedRound >= (lastRoundNumber - 1)) {
          // once in the final four, expand the final two rounds
          if (roundNumber < (lastRoundNumber - 1)) {
            return roundNumber;
          }
        } else if (roundNumber !== expandedRound) {
          // compress all rounds but expandedRound
          return roundNumber;
        }
      });

      // filter out undefined
      compressedRounds = _.filter(compressedRounds, function(o) { return o !== undefined });

      return compressedRounds;
    } else {
      return [];
    }
  }

  initViewportEventHandlers() {
    const _this = this;

    $(window).on('scroll', function() {
      _this.setViewportDimensions(_this.state.zoomScale);
    });

    $(window).on('resize orientationchange', function() {
      if (_this.props.scaleToFit) {
        _this.setZoomScaleToFit();
      } else {
        _this.setViewportDimensions(_this.state.zoomScale);
      }
    });
  }

  handlePan(e) {
    let point = {x: e.target.scrollLeft, y: e.target.scrollTop};
    let numCompressedRounds = Math.floor(point.x / (this.theme().match.width * this.state.zoomScale)); // to be used later
    let containerScrollX = Math.ceil(point.x / (this.theme().match.width * this.state.zoomScale));

    if (numCompressedRounds < 0) {
      numCompressedRounds = 0;
    }

    if (containerScrollX !== this.state.containerScrollX) {
      this.setState({containerScrollX: containerScrollX});
    }
  }

  handleZoom(zoomScale) {
    this.setViewportDimensions(zoomScale);

    // round down to nearest hundreth
    // *down* to prevent scrolling when scaleToFit is enabled
    zoomScale = Math.floor(zoomScale * 1000) / 1000;
    this.setState({zoomScale: zoomScale});
  }

  setViewportDimensions(zoomScale) {
    let $e = $(ReactDOM.findDOMNode(this.refs.bracketScroll));

    // pixel-based
    let containerTopPx   = $e.offset().top;
    let viewportHeightPx = (document.documentElement.offsetHeight || document.body.offsetHeight);
    let pageScrollPx     = (document.documentElement.scrollTop || document.body.scrollTop);
    let bracketIsVisible = (pageScrollPx + viewportHeightPx > containerTopPx && pageScrollPx < containerTopPx + $e.height());
    let matchPxWidth     = this.theme().match.width * zoomScale;
    let matchPxHeight    = this.theme().match.height * zoomScale;

    // match unit-based
    let containerWidth   = Math.ceil($e.width() / matchPxWidth);
    let containerOffsetY = Math.ceil(containerTopPx / matchPxHeight);
    let viewportHeight   = Math.ceil(viewportHeightPx / matchPxHeight);
    let pageScrollY      = Math.ceil(pageScrollPx / matchPxHeight);
    let containerScrollX = Math.ceil($e.scrollLeft() / matchPxWidth);

    if (bracketIsVisible && (
        this.state.containerWidth !== containerWidth ||
        this.state.containerOffsetY !== containerOffsetY ||
        this.state.viewportHeight !== viewportHeight ||
        this.state.pageScrollY !== pageScrollY ||
        this.state.containerScrollX !== containerScrollX
      )) {
      this.setState({
        containerWidth:   containerWidth,
        containerOffsetY: containerOffsetY,
        viewportHeight:   viewportHeight,
        pageScrollY:      pageScrollY,
        containerScrollX: containerScrollX
      });
    }
  }

  setZoomScaleToFit() {
    this.handleZoom(this.calculateZoomScaleToFit());
  }

  calculateZoomScaleToFit() {
    var $e = $(ReactDOM.findDOMNode(this.refs.bracketScroll));
    var containerPxWidth = $e.width();
    var bracketPxWidth = this.width() * this.theme().match.width;

    return containerPxWidth / bracketPxWidth;
  }

  width() {
    let width = this.plotter.maxX;

    // The right-most match doesn't need bracket line margin, so subtract it.
    width -= (this.theme().match.bracketLineMargin / this.theme().match.width);

    // Accomodate the right-most match's width.
    if (this.props.compressUnopenedRounds && this.compressedRounds().indexOf(1) !== -1) {
      width += this.theme().compressedMultiplier;
    } else {
      width += 1; //+1 to accomodate the plotted match width
    }

    // If needed, leave room for the right-most match's on-hover menu.
    if (this.props.tournament.id && !this.props.svgOnly && this.props.requestedPlotter !== 'TwoSidedSingleEliminationBracketPlotter') {
      width += 1;
    }

    return width;
  }

  height() {
    return this.plotter.maxY + 1; //+1 to accomodate the plotted match height
  }

  coordinatesInBounds(point) {
    // render the entire bracket when SVG-only
    if (this.props.svgOnly) return true;

    let rect = this.viewportRect();

    return point.y >= rect.yMin &&
      point.y <= rect.yMax &&
      point.x >= rect.xMin &&
      point.x <= rect.yMax;
  }

  bracketLineInBounds(pointA, pointB) {
    if (this.props.svgOnly) return true;

    const rect = this.viewportRect();

    const lineXMin = Math.min(pointA.x, pointB.x);
    const lineXMax = Math.max(pointA.x, pointB.x);
    const lineYMin = Math.min(pointA.y, pointB.y);
    const lineYMax = Math.max(pointA.y, pointB.y);

    // check if the line is to the left or right of the viewport
    if (rect.xMin > lineXMin || rect.xMax < lineXMin) return false;

    // check if the line is above or below the viewport
    if (rect.yMin > lineYMax || rect.yMax < lineYMin) return false;

    // Since we can assume pointA.x is within 1 of pointB.x for a bracket line,
    // we don't have to bother with calculating slope and checking line intersection.

    return true;
  }

  viewportRect() {
    // (0,0) ------------------------------->
    //   |
    //   |   (xMin, yMin)     (xMax, yMin)
    //   |        +----------------+
    //   |        |                |
    //   |        |    Viewport    |
    //   |        |                |
    //   |        +----------------+
    //   |   (xMin, yMax)     (xMax, yMax)
    //   |
    //   v

    const prerenderXBuffer = 2;
    const prerenderYBuffer = 4;

    const yMin = this.state.pageScrollY - this.state.containerOffsetY - prerenderYBuffer;
    const yMax = this.state.pageScrollY - this.state.containerOffsetY + this.state.viewportHeight + prerenderYBuffer;
    const xMin = this.state.containerScrollX - prerenderXBuffer;
    const xMax = this.state.containerScrollX + this.state.containerWidth + prerenderXBuffer;

    return {yMin: yMin, yMax: yMax, xMin: xMin, xMax: xMax};
  }

  connectedLosersBracket() {
    return (
      this.props.requestedPlotter === 'DoubleEliminationBracketPlotter' &&
      this.props.tournament.grand_finals_modifier !== 'skip' &&
      this.plotter.grandFinalsRound > 0 &&
      this.plotter.bracketSize() <= 6
    );
  }

  renderWinnerRounds() {
    let winnerRounds = _.filter(this.props.rounds, function(round) { return round.number > 0 });

    if (winnerRounds.length > 0) {
      if (this.props.requestedPlotter === 'SchedulePlotter') {
        let _this = this;

        // map y positions for each round's first match
        let yPositions = _.map(this.props.matchesByRound, function(matches, round) {
          let firstMatchY = _this.plotter.matchesByIdentifier[matches[0].identifier].coords.y;
          return firstMatchY - matchScheduleRoundLabelLineHeight;
        });

        // out of scope for this project
        //return <RoundHeaders
        //  rounds={winnerRounds}
        //  yPositions={yPositions}
        //  groupIndex={this.props.groupIndex}
        //  matchHeight={this.theme().match.height}
        ///>;
      } else {
        return <Rounds
          rounds={winnerRounds}
          x={0}
          initialY={this.state.winnerRoundsY}
          groupIndex={this.props.groupIndex}
          zoomScale={this.state.zoomScale}
          matchWidth={this.theme().match.width}
        />;
      }
    } else {
      return null;
    }
  }

  renderLoserRounds() {
    let loserRounds = _.filter(this.props.rounds, function(round) { return round.number < 0 });

    // horizontally shift the round labels for 3P DE
    let loserRoundsX = (
      this.props.requestedPlotter === 'DoubleEliminationBracketPlotter' &&
      this.plotter.bracketSize() === 3
      ? this.theme().match.width : 0
    );

    if (loserRounds.length > 0) {
      return <Rounds
        rounds={loserRounds}
        x={loserRoundsX}
        initialY={this.state.loserRoundsY ? this.state.loserRoundsY : (this.plotter.winnersBracketHeight + 0.5) * this.theme().match.height}
        groupIndex={this.props.groupIndex}
        zoomScale={this.state.zoomScale}
        matchWidth={this.theme().match.width}
      />;
    } else {
      return null;
    }
  }

  render() {
    if (this.plotter.identifiersInRenderOrder.length === 0) {
      this.plotter.setMatchCoordinates(this.state.numCompressedRounds);
    }

    let matchTheme = this.theme().match;
    let _this   = this;
    let matches = [];
    let lines   = [];
    let thirdPlaceIdentifier = (this.props.thirdPlaceMatch ? this.props.thirdPlaceMatch.identifier : null);
    let connectedLosersBracket = this.connectedLosersBracket();
    let hiddenMatches = [];
    let compressedRounds = this.compressedRounds();

    // render matches and bracket lines
    _.each(this.plotter.identifiersInRenderOrder, function(identifier) {
      let matchData = _this.plotter.matchesByIdentifier[identifier];
      let matchInBounds = _this.coordinatesInBounds(matchData.coords);

      // occlusion culling
      if (matchInBounds) {
        if (_this.props.predictionData) {
          var draggableKeys = _this.props.predictionData.matchData[matchData.match.id];
          var predictions = _this.props.predictionData.predictions;
        } else {
          var draggableKeys = null;
          var predictions = null;
        }

        matches.push(
          <Match
            key={identifier}
            x={matchData.coords.x * matchTheme.width}
            y={matchData.coords.y * matchTheme.height}
            match={matchData.match}
            quickAdvance={_this.props.tournament.quick_advance}
            hideSeeds={_this.props.tournament.hide_seeds}
            draggableKeys={draggableKeys}
            predictions={predictions}
            customerIntegrationData={_this.props.customerIntegrationData}
            svgOnly={_this.props.svgOnly}
            animated={_this.props.tournament.animated}
            compressed={compressedRounds.indexOf(matchData.match.round) !== -1}
            theme={_this.theme()}
          />
        );
      } else {
        let match = matchData.match;
        let names = "";

        if (match.player1) {
          names += match.player1.display_name;
        } else if (match.player1_placeholder_text) {
          names += match.player1_placeholder_text;
        }

        if (match.player2) {
          names += match.player2.display_name;
        } else if (match.player2_placeholder_text) {
          names += match.player2_placeholder_text;
        }

        hiddenMatches.push(
          <div
            key={match.identifier}
            style={{
              left: (matchData.coords.x * matchTheme.width * _this.state.zoomScale) + 'px',
              top: (matchData.coords.y * matchTheme.height * _this.state.zoomScale) + 'px'
            }}>
            {names}
          </div>
        );
      }

      // determine which bracket lines should be drawn
      if (identifier !== thirdPlaceIdentifier) {
        let prereqIdentifiersToConnect = [];
        let skipLosersConnection = (matchData.match.round === _this.plotter.grandFinalsRound && !connectedLosersBracket);
        let standaloneDownLine = (
          (matchData.match.round === _this.plotter.grandFinalsRound && !connectedLosersBracket) ||
          (matchData.match.round === 2 && _this.props.requestedPlotter === 'DoubleEliminationBracketPlotter' && _this.plotter.bracketSize() === 2)
        ); // hack for 2-player double elim

        if (matchData.match.player1_prereq_identifier && !matchData.match.player1_is_prereq_match_loser) {
          prereqIdentifiersToConnect.push(matchData.match.player1_prereq_identifier);
        }

        if (matchData.match.player2_prereq_identifier && !matchData.match.player2_is_prereq_match_loser && !skipLosersConnection) {
          prereqIdentifiersToConnect.push(matchData.match.player2_prereq_identifier);
        }

        let animateBracketLinesOnInitialRender = _this.theme().animateBracketLinesOnInitialRender;

        _.each(prereqIdentifiersToConnect, function(prereqIdentifier) {
          if (_this.plotter.matchesByIdentifier[prereqIdentifier]) {
            let prereqCoords = _this.plotter.matchesByIdentifier[prereqIdentifier].coords;
            let key = prereqIdentifier + '-' + identifier;

            if (matchInBounds || _this.bracketLineInBounds(prereqCoords, matchData.coords)) {
              if (prereqCoords.x < matchData.coords.x) {
                // left to right - use the width of the prereq match
                let prereqMatchRound = _this.plotter.matchesByIdentifier[prereqIdentifier].match.round;
                var matchWidth = compressedRounds.indexOf(prereqMatchRound) === -1 ? matchTheme.width : matchTheme.compressedWidth;
              } else {
                // right to left - use the width of the destination match
                var matchWidth = compressedRounds.indexOf(matchData.match.round) === -1 ? matchTheme.width : matchTheme.compressedWidth;
              }

              lines.push(
                <BracketLine
                  key={key}
                  x1={prereqCoords.x * matchTheme.width}
                  y1={prereqCoords.y * matchTheme.height}
                  x2={matchData.coords.x * matchTheme.width}
                  y2={matchData.coords.y * matchTheme.height}
                  matchWidth={matchWidth}
                  standaloneDownLine={standaloneDownLine}
                  animated={_this.props.tournament.animated}
                  animateOnInitialRender={animateBracketLinesOnInitialRender}
                  theme={_this.theme()}
                />
              );
            }
          }
        });
      }
    });

    // label the 3rd place match
    let thirdPlaceMatchLabel;
    if (this.props.thirdPlaceMatch) {
      let thirdPlaceMatch = this.plotter.matchesByIdentifier[this.props.thirdPlaceMatch.identifier];
      thirdPlaceMatchLabel =
        <text
          className="third-place-match-label"
          x={thirdPlaceMatch.coords.x * matchTheme.width}
          y={thirdPlaceMatch.coords.y * matchTheme.height}
        >
          {I18n.t('js.tournament.bronze_match')}
        </text>;
    }

    // render lines before matches for z-index reasons
    if (this.props.svgOnly) {
      return (
        <svg className="tournament-bracket -for-print" width={this.width() * matchTheme.width} height={this.height() * matchTheme.height}>
          <g>
            {this.renderWinnerRounds()}
            {lines}
            {matches}
            {this.renderLoserRounds()}
          </g>
        </svg>
      );
    } else {
      let svgWidth = Math.round(this.width() * matchTheme.width);
      let svgHeight = Math.round(this.height() * matchTheme.height);

      // Define the viewbox and adjust if the theme specifies a scale multiplier.
      const viewBox = "0 0 " + svgWidth + " " + svgHeight;

      svgWidth = Math.round(svgWidth * this.state.zoomScale);
      svgHeight = Math.round(svgHeight * this.state.zoomScale);

      return (
        <div className="tournament-bracket" ref="bracketWrapper">
          <div className="tournament-bracket--scrollable" ref="bracketScroll">
            {/* Render off-screen names for searching, without affecting bracket
                animation performance */}
            <div className="tournament-bracket--search-layer">
              {hiddenMatches}
            </div>

            <svg className="bracket-svg" width={svgWidth} height={svgHeight} viewBox={viewBox}>
              <g>
                <ReactTransitionGroup component="g">
                  {lines}
                </ReactTransitionGroup>
                {thirdPlaceMatchLabel}
                <ReactTransitionGroup component="g">
                  {matches}
                </ReactTransitionGroup>
                {this.renderWinnerRounds()}
                {this.renderLoserRounds()}
              </g>
            </svg>
          </div>
        </div>
      );
    }
  }
}

TournamentBracket.propTypes = {
  requestedPlotter:        PropTypes.string.isRequired,
  tournament:              PropTypes.object.isRequired,
  matchesByRound:          PropTypes.object.isRequired,
  rounds:                  PropTypes.arrayOf(PropTypes.object).isRequired,
  theme:                   PropTypes.object,
  thirdPlaceMatch:         PropTypes.object,
  groupIndex:              PropTypes.number,
  predictionData:          PropTypes.object,
  customerIntegrationData: PropTypes.object,
  scaleToFit:              PropTypes.bool,
  compressUnopenedRounds:  PropTypes.bool,
  svgOnly:                 PropTypes.bool
};

TournamentBracket.defaultProps = {
  thirdPlaceMatch: null,
  groupIndex: 0, // needed by groups to make unique keys for some components
  predictionData: null,
  scaleToFit: false,
  compressUnopenedRounds: false,
  svgOnly: false
};

// needed for react-rails server-side rendering
module.exports = TournamentBracket;
