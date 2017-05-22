import React from 'react';
import Reflux from 'reflux';
Reflux.defineReact(React, Reflux);
import Cookies from 'js-cookie';
import _ from 'lodash';

export default class CurrentUserStore extends Reflux.Store {
  constructor() {
    super();

    this.state = {
      currentUser: {
        id: null,
        username: null,
        portrait_url: null,
        locale: 'en',
        premier: false,
        organization_memberships: [],
        team_memberships: []
      }
    };

    // pull initialState from window._initialStoreState if present
    if (window._initialStoreState && window._initialStoreState.CurrentUserStore) {
      _.merge(this.state.currentUser, window._initialStoreState.CurrentUserStore);
    }

    // check if user id is stored as a cookie
    if (typeof document !== 'undefined' && this.state.currentUser.id === null) {
      var cookies = Cookies.get();

      if (cookies['_current_user_id']) {
        this.state.currentUser.id = parseInt(cookies['_current_user_id']);
      } else if (cookies['user_credentials']) {
        this.state.currentUser.id = parseInt(cookies['user_credentials'].split('::')[1]);
      }
    }
  }

  static get id() {
    return 'currentUser';
  }
}
