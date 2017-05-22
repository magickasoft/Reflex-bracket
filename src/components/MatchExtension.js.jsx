// libraries
import React, {PropTypes} from 'react';

// actions
import MatchActions from '../actions/MatchActions';

// components
import MatchScores from './MatchScores';

// utilities
import I18n from '../utilities/I18n';
import ChallongeAPI from '../utilities/ChallongeAPI';
import TournamentPermissions from '../utilities/TournamentPermissions';

export default class MatchExtension extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      togglingUnderway: false,
      reopening: false
    };

    // bind this to event handlers
    this.unmarkUnderway = this.unmarkUnderway.bind(this);
    this.markUnderway = this.markUnderway.bind(this);
    this.reopen = this.reopen.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.match.underway_at !== this.props.match.underway_at || prevProps.match.state !== this.props.match.state) {
      this.setState({
        togglingUnderway: false,
        reopening: false
      });
    };
  }

  markUnderway() {
    if (!this.state.togglingUnderway) {
      this.setState({togglingUnderway: true});
      MatchActions.markUnderway(this.props.match.id);
    }
  }

  unmarkUnderway() {
    if (!this.state.togglingUnderway) {
      this.setState({togglingUnderway: true});
      MatchActions.unmarkUnderway(this.props.match.id);
    }
  }

  reopen() {
    if (!this.state.reopening) {
      if (confirm(I18n.t("js.match_extension.reopen_match_confirmation"))) {
        this.setState({reopening: true});
        MatchActions.reopen(this.props.match.id);
      }
    }
  }

  render() {
    let showScoreSets = (this.props.match.games.length > 1);
    let menuX = (showScoreSets ? MatchScores.renderWidth(this.props.match.games.length) : 0);
    let iconLinks = [];
    let iconXPosition = menuX + 25;

    if (this.props.showReportScoresIcon) {
      iconLinks.push(
        <text
          x={iconXPosition}
          y="30"
          width="21"
          height="25"
          textAnchor="middle"
          className="match--fa-icon"
          dangerouslySetInnerHTML={{__html: "&#xf044"}}
          data-toggle="modal"
          data-href={"/matches/" + this.props.match.id + "/edit"}
          data-tooltip={I18n.t("js.match_extension.report_scores")}
          onMouseOver={this.props.showTooltip}
          onMouseOut={this.props.hideTooltip}
        />
      );

      iconXPosition += 30;
    }

    if (this.props.match.state === 'open' && TournamentPermissions.canToggleUnderwayMatches()) {
      // assume the report scores icon is already rendered in Match
      var wrapperClass = (this.state.togglingUnderway ? "-pulsing" : null);

      if (this.props.match.underway_at) {
        iconLinks.push(
          <g key="unmark-underway" onClick={this.unmarkUnderway} onTouchStart={this.unmarkUnderway} className={wrapperClass}>
            <text
              x={iconXPosition}
              y="30"
              width="21"
              height="25"
              textAnchor="middle"
              className="match--fa-icon"
              dangerouslySetInnerHTML={{__html: "&#xf04c"}}
              data-tooltip={I18n.t("js.match_extension.unmark_as_underway")}
              onMouseOver={this.props.showTooltip}
              onMouseOut={this.props.hideTooltip}
            />
          </g>
        );
      } else {
        iconLinks.push(
          <g key="mark-underway" onClick={this.markUnderway} onTouchStart={this.markUnderway} className={wrapperClass}>
            <text
              x={iconXPosition}
              y="30"
              width="21"
              height="25"
              textAnchor="middle"
              className="match--fa-icon"
              dangerouslySetInnerHTML={{__html: "&#xf04b"}}
              data-tooltip={I18n.t("js.match_extension.mark_as_underway")}
              onMouseOver={this.props.showTooltip}
              onMouseOut={this.props.hideTooltip}
            />
          </g>
        );
      }

      iconXPosition += 30;
    } else if (this.props.match.state === 'complete') {
      if (TournamentPermissions.canEditMatchScores(this.props.match.editable_by_user_ids)) {
        iconLinks.push(
          <text
            key="edit-scores"
            x={iconXPosition}
            y="30"
            width="21"
            height="25"
            textAnchor="middle"
            className="match--fa-icon"
            dangerouslySetInnerHTML={{__html: "&#xf044"}}
            data-toggle="modal"
            data-href={"/matches/" + this.props.match.id + "/edit"}
            data-tooltip={I18n.t("js.match_extension.edit_scores")}
            onMouseOver={this.props.showTooltip}
            onMouseOut={this.props.hideTooltip}
          />
        );
        iconXPosition += 30;
      }

      if (TournamentPermissions.canReopenMatch(this.props.match.editable_by_user_ids)) {
        var reopenWrapperClass = (this.state.reopening ? "-pulsing" : null);
        iconLinks.push(
          <g key="reopen" onClick={this.reopen} onTouchStart={this.reopen} className={reopenWrapperClass}>
            <text
              x={iconXPosition}
              y="30"
              width="21"
              height="25"
              textAnchor="middle"
              className="match--fa-icon"
              dangerouslySetInnerHTML={{__html: "&#xf01e"}}
              data-tooltip={I18n.t("js.match_extension.reopen")}
              onMouseOver={this.props.showTooltip}
              onMouseOut={this.props.hideTooltip}
            />
          </g>
        );
        iconXPosition += 30;
      }
    }

    //TODO: find a better home for these routes
    if (this.props.match.id) { // persisted?
      var matchDetailsPath = ChallongeAPI.routePrefix() + '/matches/' + this.props.match.id;
    } else {
      let params = {
        p1: (this.props.match.player1 ? (this.props.match.player1.participant_id ? this.props.match.player1.participant_id : this.props.match.player1.id) : ''),
        p2: (this.props.match.player2 ? (this.props.match.player2.participant_id ? this.props.match.player2.participant_id : this.props.match.player2.id) : ''),
        identifier: this.props.match.identifier
      };
      var matchDetailsPath = ChallongeAPI.routePrefix() + '/tournaments/' + this.props.match.tournament_id + '/matches/details_preview?' + $.param(params);
    }

    iconLinks.push(
      <text
        key="match-details"
        x={iconXPosition}
        y="30"
        width="21"
        height="25"
        textAnchor="middle"
        className="match--fa-icon"
        dangerouslySetInnerHTML={{__html: "&#xf002"}}
        data-toggle="modal"
        data-href={matchDetailsPath}
        data-tooltip={I18n.t("js.match_extension.match_details")}
        onMouseOver={this.props.showTooltip}
        onMouseOut={this.props.hideTooltip}
      />
    );
    iconXPosition += 30;

    if (this.props.match.id && TournamentPermissions.canSeeAttachments()) {
      iconLinks.push(
        <text
          key="attachments"
          x={iconXPosition}
          y="30"
          width="21"
          height="25"
          textAnchor="middle"
          className={"match--fa-icon" + (this.props.match.has_attachment ? ' -highlighted' : '')}
          dangerouslySetInnerHTML={{__html: "&#xf0c6"}}
          data-toggle="modal"
          data-href={"/matches/" + this.props.match.id + "/attachments"}
          data-tooltip={I18n.t("js.match_extension.attachments")}
          onMouseOver={this.props.showTooltip}
          onMouseOut={this.props.hideTooltip}
        />
      );
      iconXPosition += 30;
    }

    return (
      <svg x={this.props.x} y={this.props.y} className="match-extension">
        {
          showScoreSets ?
          <MatchScores scores={this.props.match.games} x={0} y={0} />
          : null
        }
        <rect x={menuX} y="0" width={iconXPosition - menuX - 10} height="47" className="match--menu-wrapper" />
        {iconLinks}
      </svg>
    );
  }
}

MatchExtension.propTypes = {
  match:       PropTypes.object.isRequired,
  x:           PropTypes.number.isRequired,
  y:           PropTypes.number.isRequired,
  showTooltip: PropTypes.func,
  hideTooltip: PropTypes.func,
  showReportScoresIcon: PropTypes.bool
};

MatchExtension.defaultProps = {
  showTooltip: function() {},
  hideTooltip: function() {},
  showReportScoresIcon: false
};
