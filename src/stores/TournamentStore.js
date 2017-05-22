// libraries
import React from 'react';
import Reflux from 'reflux';
Reflux.defineReact(React, Reflux);
import $ from 'jquery';
import _ from 'lodash';

// actions
import TournamentActions from '../actions/TournamentActions';
import MatchActions from '../actions/MatchActions';
import ParticipantManagementActions from '../actions/ParticipantManagementActions';

// utilites
import ChallongeAPI from '../utilities/ChallongeAPI';

export default class TournamentStore extends Reflux.Store {
  constructor() {
    super();

    this.listenables = _.merge({}, TournamentActions, MatchActions, ParticipantManagementActions);

    this.state = {
      tournamentData: {
        tournament: null,
        requested_plotter: null,
        matches_by_round: {},
        rounds: [],
        third_place_match: null,
        loading: false,
        groups: []
      }
    };

    // expose a global refresh function so old views work
    var _this = this;
    window._updateMatches = function(matches) { _this.onMatchesUpdate(matches); };
    window._refreshTournament = function() { _this.onRefresh(); };
    window._loadRefreshData = function(data) { _this.onLoadRefreshData(data); };

    this.lastRefreshRequestId = null;
    this.debouncedRefresh = null;

    // pull initialState from window._initialStoreState if present
    if (window._initialStoreState && window._initialStoreState.TournamentStore) {
      _.merge(this.state.tournamentData, window._initialStoreState.TournamentStore);
    }
  }

  // The loading spinner lives outside of React, so git'n r dun here for now.
  startLoading() {
    this.state.tournamentData.loading = true;
    $('.bracket_refresh_loader').show();
  }

  stopLoading() {
    this.state.tournamentData.loading = false;
    $('.bracket_refresh_loader').hide();
  }

  onMatchesUpdate(updatedMatches) {
    var updatedMatchIds = _.map(updatedMatches, function(match) { return match.id });
    var _this = this;

    // NOTE: This will be cleaner and more efficient with a Match List Store

    // update final stage matches
    _.each(this.state.tournamentData.matches_by_round, function(matches, round) {
      _.each(matches, function(match, index) {
        if (updatedMatchIds.indexOf(match.id) !== -1) {
          var replacementMatch = _.find(updatedMatches, function(m) { return m.id === match.id });
          _this.state.tournamentData.matches_by_round[round][index] = replacementMatch;
        }
      });
    });

    // update group matches
    _.each(this.state.tournamentData.groups, function(group, groupIndex) {
      _.each(group.matches_by_round, function(matches, round) {
        _.each(matches, function(match, index) {
          if (updatedMatchIds.indexOf(match.id) !== -1) {
            var replacementMatch = _.find(updatedMatches, function(m) { return m.id === match.id });
            _this.state.tournamentData.groups[groupIndex].matches_by_round[round][index] = replacementMatch;
          }
        });
      });
    });

    this.triggerUpdate();
  }

  onRefresh() {
    var _this = this;

    var requestRefresh = function() {
      _this.lastRefreshRequestId = "refresh-" + new Date().getTime();

      ChallongeAPI.ajax({
        url: '/tournaments/' + _this.state.tournamentData.tournament.id,
        dataType: 'json',
        requestId: _this.lastRefreshRequestId,
        beforeAction: TournamentActions.refreshRequestStarted,
        successAction: TournamentActions.refreshRequestSucceeded,
        errorAction: TournamentActions.refreshRequestFailed
      });
    };

    if (this.debouncedRefresh === null) {
      this.debouncedRefresh = _.debounce(requestRefresh, 500);
    }

    this.debouncedRefresh();
  }

  onRefreshRequestStarted() {
    this.startLoading();
    this.triggerUpdate();
  }

  onRefreshRequestSucceeded(requestData, responseData) {
    if (requestData.requestId === this.lastRefreshRequestId) {
      this.stopLoading();
      TournamentActions.loadRefreshData(responseData);
    }
  }

  onLoadRefreshData(refreshData) {
    this.state.tournamentData.tournament = refreshData.tournament;
    this.state.tournamentData.requested_plotter = refreshData.requested_plotter;
    this.state.tournamentData.matches_by_round = refreshData.matches_by_round;
    this.state.tournamentData.rounds = refreshData.rounds;
    this.state.tournamentData.third_place_match = refreshData.third_place_match;
    this.state.tournamentData.groups = refreshData.groups;

    this.triggerUpdate();

    // The progress bars live outside of React, so git'n r dun here for now.
    $('#tournament-progress').css('width', this.state.tournamentData.tournament.progress_meter + '%');
    $('#group-stage-progress').css('width', this.state.tournamentData.tournament.group_stage_progress_meter + '%');
  }

  onRefreshRequestFailed() {
    if (requestData.requestId === this.lastRefreshRequestId) {
      // just need to be responsive to any resulting airbrakes for now
      // will revisit once we have a common alert handy for failed requests
      this.stopLoading();
      this.triggerUpdate();
    }
  }

  onReopen(matchId) {
    ChallongeAPI.ajax({
      url: '/matches/' + matchId + '/reopen',
      dataType: 'json',
      type: 'POST',
      data: {_method: 'put'},
      beforeAction: MatchActions.reopenRequestStarted,
      successAction: MatchActions.reopenRequestSucceeded,
      errorAction: MatchActions.reopenRequestFailed
    });
  }

  onReopenRequestStarted() {
    this.startLoading();
    this.triggerUpdate();
  }

  onReopenRequestSucceeded(requestData, responseData) {
    this.stopLoading();
    TournamentActions.matchesUpdate(responseData);
  }

  onReopenRequestFailed() {
    // just need to be responsive to any resulting airbrakes for now
    // will revisit once we have a common alert handy for failed requests
    this.stopLoading();
    this.triggerUpdate();
  }

  onMarkUnderway(matchId) {
    ChallongeAPI.ajax({
      url: '/matches/' + matchId + '/mark_as_underway',
      dataType: 'json',
      type: 'POST',
      data: {_method: 'put'},
      beforeAction: MatchActions.markUnderwayRequestStarted,
      successAction: MatchActions.markUnderwayRequestSucceeded,
      errorAction: MatchActions.markUnderwayRequestFailed
    });
  }

  onMarkUnderwayRequestStarted() {
    this.startLoading();
    this.triggerUpdate();
  }

  onMarkUnderwayRequestSucceeded(requestData, responseData) {
    this.stopLoading();
    TournamentActions.matchesUpdate(responseData);
  }

  onMarkUnderwayRequestFailed() {
    // just need to be responsive to any resulting airbrakes for now
    // will revisit once we have a common alert handy for failed requests
    this.stopLoading();
    this.triggerUpdate();
  }

  onUnmarkUnderway(matchId) {
    ChallongeAPI.ajax({
      url: '/matches/' + matchId + '/unmark_as_underway',
      dataType: 'json',
      type: 'POST',
      data: {_method: 'put'},
      beforeAction: MatchActions.unmarkUnderwayRequestStarted,
      successAction: MatchActions.unmarkUnderwayRequestSucceeded,
      errorAction: MatchActions.unmarkUnderwayRequestFailed
    });
  }

  onUnmarkUnderwayRequestStarted() {
    this.startLoading();
    this.triggerUpdate();
  }

  onUnmarkUnderwayRequestSucceeded(requestData, responseData) {
    this.stopLoading();
    TournamentActions.matchesUpdate(responseData);
  }

  onUnmarkUnderwayRequestFailed() {
    // just need to be responsive to any resulting airbrakes for now
    // will revisit once we have a common alert handy for failed requests
    this.stopLoading();
    this.triggerUpdate();
  }

  onSwapParticipants(participant1Id, participant2Id) {
    var requestUrl = '/tournaments/' + this.state.tournamentData.tournament.id +
      '/participants/' + participant1Id + '/swap_seed';

    ChallongeAPI.ajax({
      url: requestUrl,
      dataType: 'json',
      type: 'POST',
      data: {swap_participant_id: participant2Id},
      beforeAction: function() { },
      successAction: ParticipantManagementActions.swapParticipants.completed,
      errorAction: ParticipantManagementActions.swapParticipants.failed
    });

    this.startLoading();
    this.triggerUpdate();
  }

  onSwapParticipantsCompleted() {
    this.stopLoading();
    TournamentActions.refresh();
  }

  onSwapParticipantsFailed() {
    // just need to be responsive to any resulting airbrakes for now
    // will revisit once we have a common alert handy for failed requests
    this.stopLoading();
    this.triggerUpdate();
  }

  triggerUpdate() {
    this.trigger(this.state);
  }

  static get id() {
    return 'tournamentData';
  }
}
