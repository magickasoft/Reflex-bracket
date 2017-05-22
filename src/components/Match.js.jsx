// libraries
import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';

// components
import MatchExtension from './MatchExtension';
import Participant from './Participant';
import SVGTooltip from './SVGTooltip';

// utilities
import I18n from '../utilities/I18n';
import TournamentPermissions from '../utilities/TournamentPermissions';

export default class Match extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hovered: false,
      tooltipVisible: false,
      tooltipText: "",
      tooltipCoords: {x: 0, y: 0},
      tooltipPosition: 'bottom'
    };

    // bind this to event handlers
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.showTooltip = this.showTooltip.bind(this);
    this.hideTooltip = this.hideTooltip.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.state.hovered !== nextState.hovered ||
      this.state.tooltipVisible !== nextState.tooltipVisible ||
      this.props.match.md5 !== nextProps.match.md5 ||
      this.props.x !== nextProps.x ||
      this.props.y !== nextProps.y ||
      this.props.quickAdvance !== nextProps.quickAdvance ||
      nextProps.draggableKeys ||
      nextProps.predictions ||
      (nextProps.customerIntegrationData !== undefined)
    );
  }

  componentWillEnter(cb) {
    if (this.props.animated) {
      let $el = $(ReactDOM.findDOMNode(this));
      let currentClass = $el.attr('class');
      $el.attr('class', currentClass + " -entering");
    }
    cb();
  }

  componentWillLeave(cb) {
    if (this.props.animted) {
      let $el = $(ReactDOM.findDOMNode(this));
      let currentClass = $el.attr('class');
      $el.attr('class', currentClass + " -leaving");
    }
    cb();
  }

  onMouseEnter() {
    this.setState({hovered: true});
  }

  onMouseLeave() {
    this.setState({hovered: false, tooltipVisible: false});
  }

  showTooltip(e) {
    let $target = $(e.target);
    let $match = $(ReactDOM.findDOMNode(this));
    let x = parseInt($target.attr('x'));

    // support tooltips in child components
    if ($target.parent().attr('class') !== 'match') {
      let parentSVG = $target.closest('svg');
      x += parseInt(parentSVG.attr('x'));
    }

    this.setState({
      tooltipVisible: true,
      tooltipCoords: {x: x, y: this.props.theme.match.height},
      tooltipText: $target.attr('data-tooltip')
    });

    // immediately trigger a click on iOS devices, otherwise you need to double-tap
    if (navigator.userAgent.match(/(iPod|iPhone|iPad)/)) {
      window.$(e.target).trigger('click');
    }
  }

  hideTooltip(e) {
    this.setState({tooltipVisible: false});
  }

  render() {
    let theme = this.props.theme.match;
    let scoreBg;
    let winnerBg1;
    let winnerBg2;
    let player1Score;
    let player2Score;
    let player1Text = null;
    let player2Text = null;
    let scores = this.props.match.scores;
    let showReportScoresIconInExtension = false;

    let showReportScoresIcon = (
      theme.reportScoresIcon.visible &&
      this.props.svgOnly !== true &&
      this.props.match.state === 'open' &&
      TournamentPermissions.canReportMatchScores(this.props.match.editable_by_user_ids)
    );


    if (showReportScoresIcon && scores.length > 0 && !this.props.quickAdvance) {
      showReportScoresIcon = false;
      showReportScoresIconInExtension = true;
    }

    if (this.props.match.state === 'complete') {
      if (this.props.match.player1 && this.props.match.winner_id === this.props.match.player1.id) {
        winnerBg1 = (
          <rect
            x={this.props.compressed ? theme.scores.winnerBackground.compressedX1 : theme.scores.winnerBackground.x1}
            y={theme.scores.winnerBackground.y1}
            width={theme.scores.winnerBackground.width}
            height={theme.scores.winnerBackground.height}
            rx={theme.scores.winnerBackground.rx}
            ry={theme.scores.winnerBackground.ry}
            className="match--winner-background"
          />
        );
        winnerBg2 = (
          <rect
            x={theme.scores.winnerBackgroundCorner.x1}
            y={theme.scores.winnerBackgroundCorner.y1}
            width={theme.scores.winnerBackgroundCorner.width}
            height={theme.scores.winnerBackgroundCorner.height}
            className="match--winner-background"
          />
        );
        player1Text = (this.props.quickAdvance === true ? '✓' : scores[0]);
        player2Text = (this.props.quickAdvance === true ? '' : scores[1]);
      } else if (this.props.match.player2 && this.props.match.winner_id === this.props.match.player2.id) {
        winnerBg1 = (
          <rect
            x={this.props.compressed ? theme.scores.winnerBackground.compressedX2 : theme.scores.winnerBackground.x2}
            y={theme.scores.winnerBackground.y2}
            width={theme.scores.winnerBackground.width}
            height={theme.scores.winnerBackground.height}
            rx={theme.scores.winnerBackground.rx}
            ry={theme.scores.winnerBackground.ry}
            className="match--winner-background"
          />
        );
        winnerBg2 = (
          <rect
            x={theme.scores.winnerBackgroundCorner.x2}
            y={theme.scores.winnerBackgroundCorner.y2}
            width={theme.scores.winnerBackgroundCorner.width}
            height={theme.scores.winnerBackgroundCorner.height}
            className="match--winner-background"
          />
        );
        player1Text = (this.props.quickAdvance === true ? '' : scores[0]);
        player2Text = (this.props.quickAdvance === true ? '✓' : scores[1]);
      } else {
        player1Text = (this.props.quickAdvance === true ? '' : scores[0]);
        player2Text = (this.props.quickAdvance === true ? '✓' : scores[1]);
      }
    } else if (this.props.match.state === 'open' && !this.props.quickAdvance && scores.length > 0) {
      // show current score of ongoing match
      player1Text = scores[0];
      player2Text = scores[1];
    }

    if (player1Text !== null) {
      scoreBg = (
        <rect
          x={this.props.compressed ? theme.scores.background.compressedX : theme.scores.background.x}
          y={theme.scores.background.y}
          width={theme.scores.background.width}
          height={theme.scores.background.height}
          rx={theme.scores.background.rx}
          ry={theme.scores.background.ry}
          className="match--scores-background"
        />
      );
      player1Score = (
        <text
          x={this.props.compressed ? theme.scores.text.compressedX1 : theme.scores.text.x1}
          y={theme.scores.text.y1}
          width={theme.scores.text.width}
          height={theme.scores.text.height}
          textAnchor={theme.scores.text.textAnchor}
          className="match--player-score"
        >
          {player1Text}
        </text>
      );
      player2Score = (
        <text
          x={this.props.compressed ? theme.scores.text.compressedX2 : theme.scores.text.x2}
          y={theme.scores.text.y2}
          width={theme.scores.text.width}
          height={theme.scores.text.height}
          textAnchor={theme.scores.text.textAnchor}
          className="match--player-score"
        >
          {player2Text}
        </text>
      );
    }

    const persistedTournament = !!(this.props.match.tournament_id);
    const showPlayerToggles = this.props.match.state === 'open' && theme.players.toggleButtonBackground && theme.players.toggleButtonBackground.visible;

    return (
      <svg
        x={this.props.x}
        y={this.props.y}
        className={"match -" + this.props.match.state + " " + (this.props.compressed ? "-compressed" : "")}
        data-identifier={this.props.match.identifier}
        data-match-id={this.props.match.id}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        onClick={this.onMouseEnter}
      >
        {/* set scores and controls */
          this.state.hovered && persistedTournament ?
          <MatchExtension
            match={this.props.match}
            x={theme.extensionPlacement.x}
            y={theme.extensionPlacement.y}
            showTooltip={this.showTooltip}
            hideTooltip={this.hideTooltip}
            showReportScoresIcon={showReportScoresIconInExtension}
          />
          : null
        }

        {
          theme.identifier.visible ?
          <text
            x={theme.identifier.x}
            y={theme.identifier.y}
            width={theme.identifier.width}
            height={theme.identifier.height}
            textAnchor={theme.identifier.textAnchor}
            className={"match--identifier" + (this.props.match.has_attachment ? ' -highlighted' : '')}
          >
            {this.props.match.identifier}
          </text>
          : null
        }

        {/* outer box */
          theme.outerContainer.visible ?
          <rect
            x={theme.outerContainer.x}
            y={theme.outerContainer.y}
            width={this.props.compressed ? theme.outerContainer.compressedWidth : theme.outerContainer.width}
            height={theme.outerContainer.height}
            rx={theme.outerContainer.rx}
            ry={theme.outerContainer.ry}
            className={"match--wrapper-background " + (this.props.match.state === 'open' && this.props.match.underway_at ? "-underway" : "")}
          />
          : null
        }

        {
          theme.innerContainer.visible ?
          <rect
            x={theme.innerContainer.x}
            y={theme.innerContainer.y}
            width={this.props.compressed ? theme.innerContainer.compressedWidth : theme.innerContainer.width}
            height={theme.innerContainer.height}
            rx={theme.innerContainer.rx}
            ry={theme.innerContainer.ry}
            className="match--base-background"
          />
          : null
        }

        {/* seed background */
          theme.seeds.background.visible && !this.props.compressed ?
          <rect
            x={theme.seeds.background.x}
            y={theme.seeds.background.y}
            width={theme.seeds.background.width}
            height={theme.seeds.background.height}
            rx={theme.seeds.background.rx}
            ry={theme.seeds.background.ry}
            className="match--seed-background"
          />
          : null
        }

        {/* score text and backgrounds */}
        {theme.scores.background.visible ? scoreBg : null}
        {theme.scores.winnerBackground.visible ? winnerBg1 : null}
        {theme.scores.winnerBackgroundCorner.visible ? winnerBg2 : null}
        {theme.scores.text.visible ? player1Score : null}
        {theme.scores.text.visible ? player2Score : null}

        {/* player 1 */}
        <Participant
          participant={this.props.match.player1}
          index={0}
          placeholderText={this.props.match.player1_placeholder_text}
          dropzoneKey={this.props.draggableKeys ? this.props.match.id + "-0" : null}
          draggableKeys={this.props.draggableKeys}
          predictedParticipant={this.props.predictions ? this.props.predictions[this.props.match.id + "-0"] : null}
          customerIntegrationData={this.props.customerIntegrationData}
          compressed={this.props.compressed}
          showToggleButton={showPlayerToggles}
          svgOnly={this.props.svgOnly}
          theme={this.props.theme}
        />

        {/* player 2 */}
        <Participant
          participant={this.props.match.player2}
          index={1}
          placeholderText={this.props.match.player2_placeholder_text}
          dropzoneKey={this.props.draggableKeys ? this.props.match.id + "-1" : null}
          draggableKeys={this.props.draggableKeys}
          predictedParticipant={this.props.predictions ? this.props.predictions[this.props.match.id + "-1"] : null}
          customerIntegrationData={this.props.customerIntegrationData}
          compressed={this.props.compressed}
          showToggleButton={showPlayerToggles}
          svgOnly={this.props.svgOnly}
          theme={this.props.theme}
        />

        {/* divider */
          theme.divider.visible ?
          <line
            x1={theme.divider.x1}
            y1={theme.divider.y1}
            x2={showReportScoresIcon ? theme.divider.x2WithIcon : (this.props.compressed ? theme.divider.x2Compressed : theme.divider.x2)}
            y2={showReportScoresIcon ? theme.divider.y2WithIcon : theme.divider.y2}
            className="match--player-divider"
          />
          : null
        }

        {/* divider2 */
          theme.divider2 && theme.divider2.visible ?
          <line
            x1={theme.divider2.x1}
            y1={theme.divider2.y1}
            x2={theme.divider2.x2}
            y2={theme.divider2.y2}
            className="match--player-divider"
          />
          : null
        }

        {/* report scores icon */
          showReportScoresIcon ?
          <text
            x={theme.reportScoresIcon.x}
            y={theme.reportScoresIcon.y}
            width={theme.reportScoresIcon.width}
            height={theme.reportScoresIcon.height}
            textAnchor={theme.reportScoresIcon.textAnchor}
            className="match--fa-icon"
            dangerouslySetInnerHTML={{__html: "&#xf044"}}
            data-toggle="modal"
            data-href={"/matches/" + this.props.match.id + "/edit"}
            data-tooltip={I18n.t("js.match_extension.report_scores")}
            onMouseOver={this.showTooltip}
            onMouseOut={this.hideTooltip}
          />
          : null
        }

        {/* tooltip */
          this.state.tooltipVisible ?
          <SVGTooltip
            text={this.state.tooltipText}
            x={this.state.tooltipCoords.x}
            y={this.state.tooltipCoords.y}
            position={this.state.tooltipPosition}
          />
          : null
        }
      </svg>
    );
  }
}

Match.propTypes = {
  match:                   PropTypes.object.isRequired,
  x:                       PropTypes.number.isRequired,
  y:                       PropTypes.number.isRequired,
  theme:                   PropTypes.object.isRequired,
  quickAdvance:            PropTypes.bool,
  draggableKeys:           PropTypes.array,
  predictions:             PropTypes.object,
  customerIntegrationData: PropTypes.object,
  svgOnly:                 PropTypes.bool,
  animated:                PropTypes.bool,
  compressed:              PropTypes.bool
};

Match.defaultProps = {
  quickAdvance: false,
  svgOnly: false,
  animated: false,
  compressed: false
};
