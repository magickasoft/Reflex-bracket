import React, {PropTypes} from 'react';
import _ from 'lodash';

// components
import Match from './Match';

// utilities
import I18n from '../utilities/I18n';
import TournamentPermissions from '../utilities/TournamentPermissions';

export default class Round extends React.Component {
  render() {
    let y = Round.PADDING;
    let textLines = [];
    let rectHeight = this.props.height;
    let bestOfRect;
    let bestOfText;
    let matchWidth = this.props.matchWidth;
    let isEditable = TournamentPermissions.canEditRounds();

    _.each(this.props.round.title_lines, function(line, index) {
      y += Round.LINE_HEIGHT;

      textLines.push(
        <text
          key={"line-" + index}
          x={matchWidth / 2}
          y={y - 3}
          width={matchWidth - 1}
          height={Round.LINE_HEIGHT}
          textAnchor="middle"
        >
          {line}
        </text>
      );
    });

    if (this.props.showBestOf) {
      rectHeight -= Round.LINE_HEIGHT + Round.PADDING * 2 + Round.BEST_OF_MARGIN_TOP;
      y = rectHeight + Round.BEST_OF_MARGIN_TOP;
      bestOfRect = <rect y={y} width={matchWidth - 1} height={Round.LINE_HEIGHT + 2 * Round.PADDING} />;
      y += Round.LINE_HEIGHT + Round.PADDING;
      bestOfText = (
        <text
          className="round-label--best-of"
          x={matchWidth / 2}
          y={y - 3}
          width={matchWidth - 1}
          height={Round.LINE_HEIGHT}
          textAnchor="middle"
        >
          {I18n.t("js.round.best_of_x", {x: this.props.round.best_of})}
        </text>
      );
    }

    return (
      <svg className="round" x={this.props.x}>
        <g
          className={'round-label' + (isEditable ? ' -editable' : '')}
          data-toggle={'' + (isEditable ? 'modal' : '')}
          data-href={this.props.round.href}
        >
          <rect width={matchWidth - 1} height={rectHeight} />
          {textLines}
          {bestOfRect}
          {bestOfText}
        </g>
      </svg>
    );
  }
}

Round.LINE_HEIGHT = 15;
Round.PADDING = 5;
Round.BOTTOM_MARGIN = 10;
Round.BEST_OF_MARGIN_TOP = 0;

Round.propTypes = {
  round: PropTypes.object.isRequired,
  x: PropTypes.number.isRequired,
  matchWidth: PropTypes.number.isRequired,

  // used to give round labels consistent height
  height: PropTypes.number.isRequired,
  showBestOf: PropTypes.bool.isRequired
};
