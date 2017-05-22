import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';

const tooltipPadding = 10;

export default class SVGTooltip extends React.Component {
  constructor(props) {
    super(props);
    this.state = {width: 100};
  }

  componentDidMount() {
    this.recalculateTextWidth();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.text !== this.props.text) {
      this.recalculateTextWidth();
    }
  }

  recalculateTextWidth() {
    const el = ReactDOM.findDOMNode(this.refs.tooltipText);
    const textWidth = el.getBBox().width;
    const tooltipWidth = (textWidth + 2 * tooltipPadding);

    this.setState({
      width: tooltipWidth
    });
  }

  render() {
    let containerY = 0;
    let halfWidth = this.state.width / 2;
    let trianglePoints = (halfWidth - 5) + "," + SVGTooltip.HEIGHT + "," + (halfWidth + 5) + "," + SVGTooltip.HEIGHT + "," + halfWidth + "," + (SVGTooltip.HEIGHT + 5);

    if (this.props.position === 'bottom') {
      containerY = 5;
      trianglePoints = (halfWidth - 5) + ",5," + (halfWidth + 5) + ",5," + halfWidth + ",0";
    }

    return (
      <svg className="svg-tooltip" x={this.props.x - halfWidth} y={this.props.y}>
        <rect x="0" y={containerY} height={SVGTooltip.HEIGHT} width={this.state.width} rx="3" ry="3" />
        <polygon points={trianglePoints} />
        <text
          ref="tooltipText"
          x={halfWidth}
          y={containerY + 17}
          height="20"
          width={this.state.width}
          textAnchor="middle"
        >
          {this.props.text}
        </text>
      </svg>
    );
  }
}

SVGTooltip.HEIGHT = 26;

SVGTooltip.propTypes = {
  text: PropTypes.string.isRequired,
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  position: PropTypes.string.isRequired // top, bottom
};
