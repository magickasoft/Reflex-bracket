import React, {PropTypes} from 'react';
import _ from 'lodash';

const scoreColumnWidth = 24;
const scoreRowHeight = 23;
const leftOffset = 9;
const rightPadding = 5;

export default class MatchScores extends React.Component {
  static renderWidth(numberOfSets) {
    return numberOfSets * scoreColumnWidth + leftOffset + rightPadding;
  }

  render() {
    const _this = this;
    const width = MatchScores.renderWidth(this.props.scores.length);
    let x = scoreColumnWidth / 2 + leftOffset;
    let y = 16;
    let setNumber = 0;

    return (
      <svg x={this.props.x} y={this.props.y}>
        <rect x="0" y="0" width={width} height="47" className="match--scores-wrapper" />
        {
          _.map(this.props.scores, function(scoreSet) {
            setNumber += 1;

            if (setNumber > 1) x += scoreColumnWidth;

            let score1Classes = "match--score";
            let score2Classes = "match--score";

            if (scoreSet[0] > scoreSet[1]) {
              score1Classes += " -winner";
            } else if (scoreSet[1] > scoreSet[0]) {
              score2Classes += " -winner";
            }

            return (
              <g key={"set" + setNumber}>
                <text textAnchor="middle" className={score1Classes} x={x} y={y}>{scoreSet[0] > 999 ? "✓" : scoreSet[0]}</text>
                <text textAnchor="middle" className={score2Classes} x={x} y={y + scoreRowHeight}>{scoreSet[1] > 999 ? "✓" : scoreSet[1]}</text>
              </g>
            );
          })
        }
      </svg>
    );
  }
}

MatchScores.propTypes = {
  scores: PropTypes.array.isRequired,
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired
};
