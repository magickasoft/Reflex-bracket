// libraries
require('setimmediate'); // attaches setImmediate to global
import React, {PropTypes} from 'react';
import Reflux from 'reflux';

// components
import TournamentBracket from '../components/TournamentBracket';

// stores
import CurrentUserStore from '../stores/CurrentUserStore';
import TournamentStore from '../stores/TournamentStore';
import ThemeStore from '../stores/ThemeStore';

// utilities
import I18n from '../utilities/I18n';
import ChallongeAPI from '../utilities/ChallongeAPI';
import TournamentPermissions from '../utilities/TournamentPermissions';

// Use setImmediate polyfill for Reflux's next tick.
// It allows server-side rendering.
window.setImmediate = window.setImmediate.bind(window); // because IE is an asshole
Reflux.nextTick(window.setImmediate);

export default class TournamentController extends Reflux.Component {
  constructor(props) {
    super(props);

    this.stores = [
      CurrentUserStore,
      TournamentStore,
      ThemeStore
    ];
  }

  render() {
    I18n.locale = this.state.currentUser.locale;
    ChallongeAPI.setLocale(this.state.currentUser.locale);

    return (
      <div>
        {
          this.state.themeData.cssOverrides ?
          <style type="text/css" dangerouslySetInnerHTML={{__html: this.state.themeData.cssOverrides}}></style>
          : null
        }
        <TournamentBracket
          requestedPlotter={this.state.tournamentData.requested_plotter}
          tournament={this.state.tournamentData.tournament}
          matchesByRound={this.state.tournamentData.matches_by_round}
          rounds={this.state.tournamentData.rounds}
          thirdPlaceMatch={this.state.tournamentData.third_place_match}
          scaleToFit={this.props.scaleToFit}
          theme={this.state.themeData.componentTheme}
        />
      </div>
    );
  }
}

TournamentController.propTypes = {
  scaleMultiplier: PropTypes.number,
  matchWidthMultiplier: PropTypes.number,
  scaleToFit: PropTypes.bool
};

TournamentController.defaultProps = {
  scaleMultiplier: 1,
  matchWidthMultiplier: 1,
  scaleToFit: false
};
