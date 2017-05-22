// libraries
import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import _ from 'lodash';

// components
import Round from './Round';

export default class Rounds extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      y: this.props.initialY,
      visible: true
    };

    this.repositionRoundLabels = this.repositionRoundLabels.bind(this);
  }

  componentDidMount() {
    const _this = this;
    $(window).on(
      'resize scroll orientationchange',
      _this.repositionRoundLabels
    );
  }

  repositionRoundLabels() {
    let $e = $(ReactDOM.findDOMNode(this)).closest('.tournament-bracket--scrollable');
    let containerTopPx = $e.offset().top;
    let pageScrollPx = (document.documentElement.scrollTop || document.body.scrollTop);
    pageScrollPx /= this.props.zoomScale;

    let newY = pageScrollPx - containerTopPx;

    if (newY < this.props.initialY) {
      newY = this.props.initialY;
    }

    this.setState({y: newY});
  }

  showBestOf() {
    let showIt = false;

    _.each(this.props.rounds, function(round) {
      if (round.best_of !== 1) showIt = true;
    });

    return showIt;
  }

  render() {
    let matchWidth = this.props.matchWidth;
    let rounds = [];
    let width  = matchWidth * this.props.rounds.length;
    let height = Rounds.heightForRounds(this.props.rounds);
    let showBestOf = this.showBestOf();
    let _this = this;

    _.each(this.props.rounds, function(round, index) {
      rounds.push(
        <Round
          key={"round-" + round.number + "-" + _this.props.groupIndex}
          round={round}
          x={index * matchWidth}
          matchWidth={matchWidth}
          height={height}
          showBestOf={showBestOf}
        />
      );
    });

    return (
      <g
        className={"rounds" + (this.state.visible ? "" : " -hidden")}
        transform={"translate("+this.props.x+","+this.state.y+")"}
      >
        {rounds}
      </g>
    );
  }
}

Rounds.heightForRounds = (rounds) => {
  let maxHeight = 0;
  let maxPxHeight = 0;
  let showBestOf = false;

  _.each(rounds, function(round) {
    if (round.title_lines.length > maxHeight) {
      maxHeight = round.title_lines.length;
    }
    if (round.best_of !== 1) {
      showBestOf = true;
    }
  });

  if (maxHeight > 0) {
    maxPxHeight = maxHeight * Round.LINE_HEIGHT + 2 * Round.PADDING;

    if (showBestOf) {
      maxPxHeight += Round.LINE_HEIGHT + 2 * Round.PADDING + Round.BEST_OF_MARGIN_TOP;
    }
  }

  return maxPxHeight;
}

Rounds.propTypes = {
  rounds:     PropTypes.arrayOf(PropTypes.object).isRequired,
  initialY:   PropTypes.number.isRequired,
  x:          PropTypes.number.isRequired,
  matchWidth: PropTypes.number.isRequired,
  groupIndex: PropTypes.number,
  zoomScale:  PropTypes.number
};

Rounds.defaultProps = {
  groupIndex: 0,
  zoomScale:  0
};
