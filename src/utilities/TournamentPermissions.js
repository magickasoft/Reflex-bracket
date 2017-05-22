// This module inspects relevant store states for tournament permissions.

import CurrentUserStore from '../stores/CurrentUserStore';
import TournamentStore from '../stores/TournamentStore';

var TournamentPermissions = {
  canEditRounds: function() {
    return this.isAnAdmin();
  },

  canSeeAttachments: function() {
    return this.storesArePopulated() && this.tournament().accept_attachments;
  },

  canToggleUnderwayMatches: function() {
    return this.isAnAdmin();
  },

  canReportMatchScores: function(permittedUserIds) {
    return this.storesArePopulated() &&
      this.tournament().state !== 'complete' &&
      ((permittedUserIds.indexOf(this.currentUser().id) !== -1) || this.isAnAdmin());
  },

  canEditMatchScores: function(permittedUserIds) {
    return this.canReportMatchScores(permittedUserIds);
  },

  canReopenMatch: function(permittedUserIds) {
    // Opting to not check permittedUserIds as this is primarily an admin action.
    // Non-admin participants with reopen permissions can still trigger reopens
    // by pulling up match details.
    return this.isAnAdmin() && this.tournament().state !== 'complete';
  },

  canSwapParticipantSeeds: function() {
    return this.isAnAdmin() && this.tournament().participants_swappable;
  },

  // "private"

  storesArePopulated: function() {
    return (this.currentUser().id && this.tournament());
  },

  isAnAdmin: function() {
    return this.storesArePopulated() &&
      (this.tournament().admin_ids.indexOf(this.currentUser().id) !== -1);
  },

  currentUser: function() {
    const userStore = CurrentUserStore.singleton;
    return userStore.state.currentUser;
  },

  tournament: function() {
    const tournamentStore = TournamentStore.singleton;
    return tournamentStore.state.tournamentData.tournament;
  }
};

module.exports = TournamentPermissions;
