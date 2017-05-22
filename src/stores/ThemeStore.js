// libraries
import React from 'react';
import Reflux from 'reflux';
Reflux.defineReact(React, Reflux);
import _ from 'lodash';

// connected stores
import TournamentStore from './TournamentStore';

// themes
import DefaultTheme from '../themes/DefaultTheme';
import MadnessTheme from '../themes/MadnessTheme';
import BFGTheme from '../themes/BFGTheme';

//==============================================================================

export default class ThemeStore extends Reflux.Store {
  constructor() {
    super();

    this.state = {
      themeData: {
        themeGeneratorName: "Default",
        cssOptions: null,
        cssOverrides: null,
        options: {
          hideIdentifiers: false,
          hideSeeds: false,
          multiplier: 1,
          matchWidthMultiplier: 1
        }
      }
    };

    // To listen to other stores, we need to make sure they've been instantiated.
    if (!TournamentStore.singleton) {
      TournamentStore.singleton = new TournamentStore();
    }

    this.listenTo(TournamentStore.singleton, this.setTournamentOptions.bind(this));

    // pull initialState from window._initialStoreState if present
    if (window._initialStoreState && window._initialStoreState.ThemeStore) {
      _.merge(this.state.themeData, window._initialStoreState.ThemeStore);
    }

    this.generateComponentTheme();
    this.generateCSSOverrides();
  }

  static generateForStaticRender(tournament) {
    let theme = new ThemeStore();
    theme.state.themeData.options.hideIdentifiers = tournament.hide_identifiers;
    theme.state.themeData.options.hideSeeds = tournament.hide_seeds;
    theme.generateComponentTheme();

    return theme.state.themeData.componentTheme;
  }

  setTournamentOptions(tournamentStoreState) {
    var tournament = tournamentStoreState.tournamentData.tournament;

    if (tournament.hide_identifiers !== this.state.themeData.options.hideIdentifiers || tournament.hide_seeds !== this.state.themeData.options.hideSeeds) {
      this.state.themeData.options.hideIdentifiers = tournament.hide_identifiers;
      this.state.themeData.options.hideSeeds = tournament.hide_seeds;
      this.generateComponentTheme();
      this.triggerUpdate();
    }
  }

  generateComponentTheme() {
    switch(this.state.themeData.themeGeneratorName) {
      case 'Madness':
        this.state.themeData.componentTheme = MadnessTheme.generate(this.state.themeData.options);
        break;
      case 'BFG':
        this.state.themeData.componentTheme = BFGTheme.generate(this.state.themeData.options);
        break;
      default:
        this.state.themeData.componentTheme = DefaultTheme.generate(this.state.themeData.options);
    }
  }

  generateCSSOverrides() {
    if (!this.state.themeData.cssOptions) return;

    var colors = this.state.themeData.cssOptions;

    this.state.themeData.cssOverrides = '' +
      'body.tournaments-module, .full-screen-target {' +
        'background-color: ' + (colors.bg ? '#' + colors.bg + ';' : 'transparent') +
      '}' +
      '.tournament-bracket {' +
        'text-shadow: none;' +
        'background-color: ' + (colors.bg ? '#' + colors.bg + ';' : 'transparent') +
        (colors.bold ? 'font-weight: bold;' : '') +
      '}' +
      '.bracket-line { stroke: #' + colors.bracket_lines + '; }' +
      '.match--base-background { fill: #' + colors.match_bg + '; }' +
      (colors.match_outline ? '.match--wrapper-background { fill: #' + colors.match_outline + '; fill-opacity: 1; }' : '') +
      '.match--wrapper-background.-underway { fill: #08C; }' +
      '.match--scores-wrapper, .match--menu-wrapper {' +
        'fill: #' + colors.match_bg + ';' +
        'stroke: transparent;' +
      '}' +
      '.match--score { fill: #' + colors.text + '; }' +
      '.match--score.-winner { fill: #' + colors.text + '; }' +
      '.match--identifier { fill: #' + colors.label_text + '; }' +
      '.match--seed { fill: #' + colors.alt_text + '; }' +
      '.match--seed-background { fill: #' + colors.alt_match_bg + '; }' +
      '.match--scores-background { fill: #' + colors.alt_match_bg + '; }' +
      '.match--winner-background { fill: #' + colors.winner_bg + '; }' +
      '.match--player-name { fill: #' + colors.text + '; }' +
      '.match--player-name.-placeholder { fill: #' + colors.placeholder_text + '; }' +
      '.match--player-score { fill: #' + colors.alt_text + '; }' +
      '.match--player-background { fill: #' + colors.match_bg + '; }' +
      '.match--player-divider { stroke: #' + (colors.match_outline ? colors.match_outline : (colors.bg ? colors.bg : '444')) + '; }' +
      '.third-place-match-label { fill: #e9e9e9; }' +
      '.match--fa-icon { font-weight: normal; fill: #' + colors.links + '; }' +
      '.match--fa-icon:hover { fill: #' + colors.links + '; }' +
      '.round-label rect { fill: #' + colors.label_bg + '; }' +
      '.round-label text { fill: #' + colors.label_text + '; }' +
      '.round-label:hover rect { fill: #' + colors.label_bg + '; }' +
      '.round-label--best-of { fill: #6cf; }' +
      '.match--player.-over .match--player-background { fill: #' + colors.hover_bg + '; }' +
      '.match--player.-over .match--player-name { fill: #' + colors.hover_text + '; }' +
      '.match--player-portrait-backdrop { fill: #' + colors.portrait_backdrop + '; }' +
      'body.tournaments-module .nav-tabs-container .nav.nav-tabs {' +
        'background-color: ' + (colors.bg ? '#' + colors.bg + ';' : 'transparent') +
      '}' +
      'body.tournaments-module .nav-tabs-container a {' +
        'color: #' + colors.links  + ';' +
      '}' +
      'body.tournaments-module .nav-tabs-container .nav.nav-tabs .active a,' +
      'body.tournaments-module .nav-tabs-container .nav.nav-tabs .active a:hover,' +
      'body.tournaments-module .nav-tabs-container .nav.nav-tabs .active a:focus {' +
        'background-color: #' + (colors.bg ? colors.bg : colors.label_bg) + ';' +
        'color: #' + colors.label_text + ';' +
        'text-shadow: none;' +
      '}' +
      'body.tournaments-module table.table.standings {' +
        'color: #' + colors.label_text + ';' +
      '}' +
      'body.tournaments-module table.table.standings th {' +
        'background-color: #' + colors.label_bg + ';' +
        'colors: #' + colors.label_text + ';' +
      '}' +
      'body.tournaments-module ul.group-nav li a { color: #bbb; }' +
      'body.tournaments-module ul.group-nav li.active a {' +
        'border-color: #' + colors.winner_bg + ';' +
        'color: #f0f0f0;' +
      '}' +
      'body.tournaments-module ul.group-nav li a:hover {' +
        'background-color: #666;' +
        'color: #f0f0f0;' +
        'text-shadow: 1px 1px 1px #111;' +
      '}' +
      'body.tournaments-module .group-name { color: #f0f0f0; }';
  }

  onPreviewTheme(themeAttributes) {
    this.state.themeData.cssOptions = _.merge({}, this.state.themeData.cssOptions, themeAttributes);
    this.generateCSSOverrides();
    this.triggerUpdate();
  }

  triggerUpdate() {
    this.trigger(this.state);
  }

  static get id() {
    return 'themeStore';
  }
}
