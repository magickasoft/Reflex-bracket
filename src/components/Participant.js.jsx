// libraries
import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import classNames from 'classnames';
import _ from 'lodash';
var interact;

// actions
import ParticipantManagementActions from '../actions/ParticipantManagementActions';

// utilities
import TournamentPermissions from '../utilities/TournamentPermissions';

export default class Participant extends React.Component {
  constructor(props) {
    super(props);

    let initialToggled = false;

    if (this.props.participant && this.props.customerIntegrationData && this.props.customerIntegrationData.participants) {
      let customerParticipantInfo = this.props.customerIntegrationData.participants[this.props.participant.display_name];

      if (customerParticipantInfo && customerParticipantInfo.toggled) {
        initialToggled = true;
      }
    }

    this.state = {toggled: initialToggled};

    // bind this to event handlers
    this.highlight = this.highlight.bind(this);
    this.unhighlight = this.unhighlight.bind(this);
    this.clickToPredict = this.clickToPredict.bind(this);
    this.broadcastParticipantClick = this.broadcastParticipantClick.bind(this);
    this.handleToggleClick = this.handleToggleClick.bind(this);
  }

  componentDidMount() {
    if (this.props.dropzoneKey || this.isDraggable()) {
      this.initInteract();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.dropzoneKey || this.isDraggable()) {
      this.initInteract();
    }

    let previousParticipantId = (prevProps.participant ? prevProps.participant.id : 0);
    let participantId = (this.props.participant ? this.props.participant.id : 0);

    if (previousParticipantId !== participantId) {
      let clipPath = ReactDOM.findDOMNode(this.refs.clipPath);

      clipPath.animate(
        [
          {width: '0px'},
          {width: $(clipPath).attr('width') + 'px'}
        ],
        {duration: 1000}
      );
    }
  }

  isDraggable() {
    return this.attributes().id && (TournamentPermissions.canSwapParticipantSeeds() || (this.props.draggableKeys && this.props.draggableKeys.length > 0));
  }

  initInteract() {
    interact = require('../utilities/interact.fork.js');
    interact.dynamicDrop(true); // recalculate dropzones while dragging to work nicely with dynamic match mounting/unmounting
    this.initDraggable();
    this.initDropzone();
  }

  initDraggable() {
    //
    // Interact.js doesn't clone an element before dragging it, but the
    // recommended workaround is below.
    //
    if (this.isDraggable()) {
      let draggableKeys = this.props.draggableKeys;
      let containingBracketScroll = $(ReactDOM.findDOMNode(this.refs.draggable)).closest('.tournament-bracket--scrollable')[0];
      let clearPageSelections = this.clearPageSelections;

      if (this.props.compressed) {
        var playerBackgroundWidth = this.props.theme.match.players.background.compressedwidth;
      } else {
        var playerBackgroundWidth = this.props.theme.match.players.background.width;
      }

      interact(ReactDOM.findDOMNode(this.refs.draggable)).draggable({
        // don't start the dragging interaction automatically
        'manualStart': true,
        // scroll the containing bracket as needed when dragging outside boundaries
        'autoScroll': {
          enabled: true,
          container: containingBracketScroll
        },
        // keep track of draggable position with data-x/y
        'onmove': function (event) {
          let target = event.target;
          let scrollTop = $(window).scrollTop();
          let scrollDy = target.getAttribute('data-scroll-top') - scrollTop;
          let posLeft = parseFloat(target.style.left) + event.dx;
          let posTop = parseFloat(target.style.top) + event.dy + scrollDy;

          // position the element
          target.style.top = posTop + "px";
          target.style.left = posLeft + "px";

          target.setAttribute('data-scroll-top', scrollTop);
        },
        // when dropped outside a dropzone, remove the clone
        // TODO: animate it returning to the starting point
        'onend': function (event) {
          $(event.target).remove();
          $('body').removeClass('-drag-and-dropping');
        }
      }).on('move', function (event) {
        let interaction = event.interaction;

        // if the pointer was moved while being held down
        // and an interaction hasn't started yet
        if (interaction.pointerIsDown && !interaction.interacting()) {
          let $participant = $(event.currentTarget);
          let $rect = $participant.find('rect');

          let rectDimensions = $rect[0].getBoundingClientRect();

          // If 0 width is reported (Firefox), try again up the chain.
          if (rectDimensions.width === 0) {
            rectDimensions = $rect.closest('g')[0].getBoundingClientRect();
          }

          let scaleMultiplier = playerBackgroundWidth / rectDimensions.width;
          let draggableTop = event.clientY - rectDimensions.height / 2;
          let draggableLeft = event.clientX - rectDimensions.width / 2;

          // TODO: match the dimensions of $rect, factoring in the zoom level

          // prepare a new draggable element
          let $draggable = $("<div />");
          $draggable.append(
            "<svg viewBox='0 0 " + (rectDimensions.width * scaleMultiplier) + " " + (rectDimensions.height * scaleMultiplier) + "'>" +
              "<g class='match--player -dragging' data-participant-id='" + $participant.attr('data-participant-id') + "'>" +
                "<defs>" +
                  "<clipPath id='draggableClipPath'>" +
                    "<rect x='0' y='0' width='" + $rect.attr('width') + "' height='" + $rect.attr('height') + "' />" +
                  "</clipPath>" +
                "</defs>" +
                $rect.clone().wrap('<div>').parent().html() +
                $participant.find('[class~=match--player-name]').clone().wrap('<div>').parent().html() +
              "</g>" +
            "</svg>"
          );

          // zero the participant box position
          $draggable.find('rect').attr('x', 0);
          $draggable.find('rect').attr('y', 0);

          // adjust the participant box position
          $draggable.find('text').attr('x', parseInt($draggable.find('text').attr('x')) - $rect.attr('x'));
          $draggable.find('text').attr('y', parseInt($draggable.find('text').attr('y')) - $rect.attr('y'));
          $draggable.find('text').attr('clip-path', 'url(#draggableClipPath)');

          // clean up player background
          let $bg = $draggable.find('[class~=match--player-background]');
          $bg.removeAttr('data-reactid');

          // clean up player name
          let $name = $draggable.find('[class~=match--player-name]');
          $name.removeAttr('data-reactid');

          // touch up draggable and add it to the page
          $draggable.addClass('drag-element');
          $draggable.attr("style", "position: fixed; top: " + draggableTop + "px; left: " + draggableLeft +"px");
          $draggable.attr('data-scroll-top', $(window).scrollTop());
          $draggable.attr('width', rectDimensions.width);
          $draggable.attr('height', rectDimensions.height);
          $draggable.find('svg').attr('width', rectDimensions.width);
          $draggable.find('svg').attr('height', rectDimensions.height);
          $draggable.appendTo($('body'));

          // Add a class for each draggable key. These keys are inspected
          // by dropzones to allow or disallow dropping.
          _.each(draggableKeys, function(draggableKey) {
            $draggable.addClass('droppable-in-' + draggableKey);
          });

          // start a drag interaction targeting the clone
          try {
            interaction.start({ name: 'drag' }, event.interactable, $draggable[0]);
            $('body').addClass('-drag-and-dropping');
          }
          catch(err) {
            // Interact fails to get started in some fringe cases.
            // Just clean up the stray draggable and await the next drag event.
            $draggable.remove();
            $('body').removeClass('-drag-and-dropping');
          }

          // prevent anything on the page from getting highlighted while dragging
          clearPageSelections();
        }
      });
    }
  }

  initDropzone() {
    let participantSwapMode = "swap";
    let predictionMode = "predict";

    // enable draggables to be dropped into this
    if (this.attributes().id && TournamentPermissions.canSwapParticipantSeeds()) {
      var acceptSelector = ".drag-element";
      var mode = participantSwapMode;
    } else if (this.props.dropzoneKey) {
      var acceptSelector = ".drag-element.droppable-in-" + this.props.dropzoneKey;
      var mode = predictionMode;
    } else {
      return;
    }

    interact(ReactDOM.findDOMNode(this.refs.draggable)).dropzone({
      // only accept elements matching this CSS selector
      accept: acceptSelector,
      overlap: 0.2,

      // listen for drop related events:
      ondropactivate: function (event) {
        // add active dropzone feedback
        $(event.target).addClass('-drop-active');
      },
      ondragenter: function (event) {
        let draggableElement = event.relatedTarget;
        let dropzoneElement = event.target;

        // feedback the possibility of a drop
        $(dropzoneElement).addClass('-drop-target');
        $(draggableElement).addClass('-can-drop');
      },
      ondragleave: function (event) {
        // remove the drop feedback style
        $(event.target).removeClass('-drop-target');
        $(event.relatedTarget).removeClass('-can-drop');
      },
      ondrop: function (event) {
        let $draggable = $(event.relatedTarget);
        let $dropzone = $(event.target);

        let draggedParticipantId = $draggable.find('.match--player').attr('data-participant-id');
        let dropzoneParticipantId = $dropzone.attr('data-participant-id');
        let dropzoneKey = $dropzone.attr('data-dropzone-key');

        // trigger an action for the drop
        if (mode === participantSwapMode) {
          ParticipantManagementActions.swapParticipants(draggedParticipantId, dropzoneParticipantId)
        } else if (mode === predictionMode) {
          // out of scope of this project
          //PredictionActions.draggedParticipantDrop(draggedParticipantId, dropzoneKey);
        }

        $draggable.remove();
        $('body').removeClass('-drag-and-dropping');
      },
      ondropdeactivate: function (event) {
        // remove active dropzone feedback
        $(event.target).removeClass('-drop-active');
        $(event.target).removeClass('-drop-target');
      }
    });
  }

  clearPageSelections() {
    // prevent text from getting selected while we drag
    if (window.getSelection) {
      if (window.getSelection().empty) {  // Chrome
        window.getSelection().empty();
      } else if (window.getSelection().removeAllRanges) {  // Firefox
        window.getSelection().removeAllRanges();
      }
    } else if (document.selection) {  // IE?
      document.selection.empty();
    }
  }

  attributes() {
    if (this.props.predictedParticipant) {
      return this.props.predictedParticipant;
    } else if (this.props.customerIntegrationData && this.props.participant && this.props.customerIntegrationData.participants[this.props.participant.display_name]) {
      return _.merge({}, this.props.participant, this.props.customerIntegrationData.participants[this.props.participant.display_name]);
    } else if (this.props.participant) {
      return this.props.participant;
    } else if (this.props.placeholderText) {
      return {placeholder: true, display_name: this.props.placeholderText};
    } else {
      return {};
    }
  }

  highlight() {
    if (this.attributes().id) {
      $('[data-participant-id="' + this.attributes().id + '"]').addClass('-over');
    }
  }

  unhighlight() {
    if (this.attributes().id) {
      $('[data-participant-id="' + this.attributes().id + '"]').removeClass('-over');
    }
  }

  clickToPredict() {
    // out of scope of this project
    //PredictionActions.draggableParticipantClick(this.attributes().id, this.props.dropzoneKey);
  }

  participantInfoEnabled() {
    if (!this.props.svgOnly && this.props.customerIntegrationData) {
      return !!this.props.customerIntegrationData.linkToParticipantInfo;
    } else {
      return false;
    }
  }

  broadcastParticipantClick(e) {
    window.parent.postMessage(
      {
        challongeEvent: "participantClick",
        participant: this.attributes()
      },
      "*"
    );
  }

  handleToggleClick(e) {
    var _this = this;

    this.setState({toggled: !this.state.toggled}, function() {
      window.parent.postMessage(
        {
          challongeEvent: "participantToggled",
          participant: _this.attributes(),
          toggleState: _this.state.toggled
        },
        "*"
      );
    });

    e.stopPropagation();
  }

  render() {
    let theme = this.props.theme.match;
    let attributes = this.attributes();
    let p1 = (this.props.index === 0);
    let portrait;
    let textX;
    let textY;

    if (attributes.portrait_url) {
      var portraitImageTag = '<image xlink:href="' + attributes.portrait_url +
        '" x="' + (p1 ? theme.players.portrait.x1 : theme.players.portrait.x2) +
        '" y="' + (p1 ? theme.players.portrait.y1 : theme.players.portrait.y2) +
        '" height="' + theme.players.portrait.height +
        '" width= "' + theme.players.portrait.width + '" />';
      portrait = (<g dangerouslySetInnerHTML={{__html: portraitImageTag }} />);
      textX = (p1 ? theme.players.text.x1WithPortrait : theme.players.text.x2WithPortrait);
      textY = (p1 ? theme.players.text.y1WithPortrait : theme.players.text.y2WithPortrait);
    }
    else {
      textX = (p1 ? theme.players.text.x1 : theme.players.text.x2);
      textY = (p1 ? theme.players.text.y1 : theme.players.text.y2);
    }

    // denote correct and incorrect predictions with checks or crosses and CSS
    let predictionNamePrefix = "";
    let predictionCorrectPrefix = "✓ ";
    let predictionIncorrectPrefix = "✗ ";

    if (this.props.participant && this.props.predictedParticipant) {
      if (this.props.participant.id === this.props.predictedParticipant.id) {
        predictionNamePrefix = predictionCorrectPrefix;
      } else {
        predictionNamePrefix = predictionIncorrectPrefix;
      }
    }

    let playerClassNames = classNames(
      'match--player',
      {'-drop-incomplete': (!this.attributes().id && this.props.dropzoneKey)},
      {'-correct': (predictionNamePrefix === predictionCorrectPrefix)},
      {'-incorrect': (predictionNamePrefix === predictionIncorrectPrefix)},
      {'-draggable': this.isDraggable()}
    );

    let randomKey = Math.floor(Math.random() * 10000000);
    let clickEvent = null;

    if (this.isDraggable()) {
      clickEvent = this.clickToPredict;
    } else if (this.participantInfoEnabled()) {
      clickEvent = this.broadcastParticipantClick;
    }

    return (
      <g
        className={playerClassNames}
        onMouseEnter={this.highlight}
        onMouseLeave={this.unhighlight}
        onClick={clickEvent}
        data-participant-id={attributes.id}
        data-dropzone-key={this.props.dropzoneKey}
        ref="draggable"
      >
        <title>{attributes.display_name}</title>
        <defs>
          <clipPath id={'clipPath' + randomKey}>
            <rect
              ref="clipPath"
              x={p1 ? theme.players.clipPath.x1 : theme.players.clipPath.x2}
              y={p1 ? theme.players.clipPath.y1 : theme.players.clipPath.y2}
              width={this.props.compressed ? theme.players.clipPath.compressedWidth : theme.players.clipPath.width}
              height={theme.players.clipPath.height}
            />
          </clipPath>
        </defs>
        {
          theme.players.background.visible ?
          <rect
            x={p1 ? theme.players.background.x1 : theme.players.background.x2}
            y={p1 ? theme.players.background.y1 : theme.players.background.y2}
            width={this.props.compressed ? theme.players.background.compressedWidth : theme.players.background.width}
            height={theme.players.background.height}
            className="match--player-background"
          />
          : null
        }
        {
          theme.players.portraitBackdrop && theme.players.portraitBackdrop.visible ?
          <rect
            x={p1 ? theme.players.portraitBackdrop.x1 : theme.players.portraitBackdrop.x2}
            y={p1 ? theme.players.portraitBackdrop.y1 : theme.players.portraitBackdrop.y2}
            width={theme.players.portraitBackdrop.width}
            height={theme.players.portraitBackdrop.height}
            rx={theme.players.portraitBackdrop.rx}
            ry={theme.players.portraitBackdrop.ry}
            className="match--player-portrait-backdrop"
          />
          : null
        }
        {
          theme.seeds.text.visible ?
          <text
            x={p1 ? theme.seeds.text.x1 : theme.seeds.text.x2}
            y={p1 ? theme.seeds.text.y1 : theme.seeds.text.y2}
            width={theme.seeds.text.width}
            height={theme.seeds.text.height}
            textAnchor={theme.seeds.text.textAnchor}
            className="match--seed"
          >
            {attributes.seed}
          </text>
          : null
        }
        {
          theme.players.text.visible && attributes.display_name ?
          <text
            clipPath={'url(#clipPath' + randomKey + ')'}
            x={textX}
            y={textY}
            width={theme.players.text.width}
            height={theme.players.text.height}
            className={"match--player-name " + (attributes.placeholder ? "-placeholder" : "")}
          >
            {predictionNamePrefix + attributes.display_name}
          </text>
          : null
        }
        {theme.players.portrait.visible ? portrait : null}

        {/* participant info icon with backdrop */
          this.participantInfoEnabled() ?
          <text
            textAnchor="start"
            x={theme.players.background.width + 18}
            y={p1 ? "28" : "63"}
            width="18"
            height="18"
            className="match--fa-icon match--player-info-icon"
            dangerouslySetInnerHTML={{__html: "&#xf05a"}}
          />
          : null
        }
        {
          this.props.showToggleButton ?
          <rect
            x={p1 ? theme.players.toggleButtonBackground.x1 : theme.players.toggleButtonBackground.x2}
            y={p1 ? theme.players.toggleButtonBackground.y1 : theme.players.toggleButtonBackground.y2}
            width={theme.players.toggleButtonBackground.width}
            height={theme.players.toggleButtonBackground.height}
            rx={theme.players.toggleButtonBackground.rx}
            ry={theme.players.toggleButtonBackground.ry}
            onClick={this.handleToggleClick}
            className={'match--player-toggle-button-background ' + (this.state.toggled ? '-toggled' : '')}
          >
            <title>Add {attributes.display_name} to your donation cart</title>
          </rect>
          : null
        }
        {
          this.props.showToggleButton ?
          <text
            x={p1 ? theme.players.toggleButtonText.x1 : theme.players.toggleButtonText.x2}
            y={p1 ? theme.players.toggleButtonText.y1 : theme.players.toggleButtonText.y2}
            width={theme.players.toggleButtonText.width}
            height={theme.players.toggleButtonText.height}
            textAnchor={theme.players.toggleButtonText.textAnchor}
            dangerouslySetInnerHTML={{__html: (this.state.toggled ? "&#xf004" : "&#xf067")}}
            className="match--player-toggle-button-text"
          />
          : null
        }
      </g>
    );
  }
}

Participant.propTypes = {
  index:                   PropTypes.number.isRequired,
  theme:                   PropTypes.object.isRequired,
  participant:             PropTypes.object,
  placeholderText:         PropTypes.string,
  dropzoneKey:             PropTypes.string,
  draggableKeys:           PropTypes.array,
  predictedParticipant:    PropTypes.object,
  customerIntegrationData: PropTypes.object,
  compressed:              PropTypes.bool,
  showToggleButton:        PropTypes.bool,
  svgOnly:                 PropTypes.bool
};

Participant.getDefaultProps = {
  compressed: false,
  showToggleButton: false,
  svgOnly: false
};
