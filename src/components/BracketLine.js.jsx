import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';
import Match from './Match';
import BrowserDetection from '../utilities/BrowserDetection';

export default class BracketLine extends React.Component {
  componentDidMount() {
    this.ieDetected = !!BrowserDetection.detectIE();

    if (this.props.animateOnInitialRender && !this.ieDetected) {
      // When enabled, the path will get dashed appropriately,
      // but you'll still need to define the animation in css.
      this.dashPathForAnimation('-entering');
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.props.x1 !== nextProps.x1 ||
      this.props.y1 !== nextProps.y1 ||
      this.props.x2 !== nextProps.x2 ||
      this.props.y2 !== nextProps.y2
    );
  }

  // When new bracket lines are created, use a stroke dashing trick to animate
  // them. The animation frame is queued by the -entering class,
  // which expects additional css attributes (dash array and dash offset).
  componentWillEnter(cb) {
    if (this.props.animated && !this.ieDetected) {
      this.dashPathForAnimation('-entering');
    }
    cb();
  }

  componentWillLeave(cb) {
    if (this.props.animated && !this.ieDetected) {
      let $path = $(ReactDOM.findDOMNode(this.refs.path));
      $path.addClass('-leaving');
    }
    cb();
  }

  dashPathForAnimation(classToAdd) {
    let $path = $(ReactDOM.findDOMNode(this.refs.path));
    let lineLength = $path.data('line-length');
    let currentClass = $path.attr('class');
    $path.css({strokeDasharray: lineLength, strokeDashoffset: lineLength});
    if (classToAdd) $path.addClass(classToAdd);
  }

  width() {
    return Math.abs(this.props.x2 - this.props.x1);
  }

  height() {
    return Math.abs(this.props.y2 - this.props.y1);
  }

  lines() {
    const padding = 0;

    let matchTheme = this.props.theme.match;
    let xStart     = this.props.matchWidth - matchTheme.bracketLineMargin + padding;
    let halfWidth  = matchTheme.bracketLineMargin / 2 - padding;
    let xMidWay    = xStart + halfWidth;
    let xEnd       = xStart + 2 * halfWidth;
    let yTop       = 1; // shift 1 pixel to account for line width
    let yBottom    = this.height() - 1; // "
    let path;
    let lineLength = (xEnd - xStart) + (yBottom - yTop);

    // swap the start and end positions when drawing right to left
    if (this.props.x2 < this.props.x1) {
      if (this.props.x2 + 0.6 * this.props.matchWidth > this.props.x1) {
        // HACK: this case is the right semi-finals for a two-single bracket
        //       draw a horizontal line to join the line going up to the finals
        xStart = xMidWay - this.props.matchWidth / 2;
        xMidWay = xStart;
        xEnd = xStart + matchTheme.bracketLineMargin / 2;
        yTop = yBottom;
      } else {
        let tmp = xStart;
        xStart = xEnd;
        xEnd = tmp;
      }
    }

    if (this.props.y1 > this.props.y2) {
      // bottom-up
      path = "M "+xStart+" "+yBottom+" L "+xMidWay+" "+yBottom+" L "+xMidWay+" "+yTop+" L "+xEnd+" "+yTop;
    } else if (this.props.y1 === this.props.y2) {
      // horizontal line
      path = "M "+xStart+" "+yTop+" L "+xEnd+" "+yTop;
    } else if (this.props.standaloneDownLine) {
      // top-down
      path = "M "+xStart+" "+yTop+" L "+xMidWay+" "+yTop+" L "+xMidWay+" "+yBottom+" L "+xEnd+" "+yBottom;
    } else {
      // top-down
      path = "M "+xStart+" "+yTop+" L "+xMidWay+" "+yTop+" L "+xMidWay+" "+this.height();
    }

    return (
      <path ref="path" d={path} className="bracket-line" data-line-length={lineLength} />
    );
  }

  render() {
    const gY = (this.props.y1 > this.props.y2 ? this.props.y2 : this.props.y1) + 0.5 * this.props.theme.match.height;
    const gX = (this.props.x2 > this.props.x1 ? this.props.x1 : this.props.x2);

    return (
      <svg x={gX} y={gY}>
        {this.lines()}
      </svg>
    );
  }
}

BracketLine.propTypes = {
  x1: PropTypes.number.isRequired,
  y1: PropTypes.number.isRequired,
  x2: PropTypes.number.isRequired,
  y2: PropTypes.number.isRequired,
  matchWidth: PropTypes.number.isRequired,
  theme: PropTypes.object.isRequired,
  animated: PropTypes.bool,
  animateOnInitialRender: PropTypes.bool,

  // In some rare cases, we need to connect to the right when drawing a
  // downward line (see below). This right connection is typically only
  // drawn by upward paths.
  // __        __
  //   |  ==>    |
  //   |         |__
  //
  standaloneDownLine: PropTypes.bool
};

BracketLine.defaultProps = {
  animated: false,
  animateOnInitialRender: false,
  standaloneDownLine: false
};
