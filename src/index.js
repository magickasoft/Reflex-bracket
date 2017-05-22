import React from 'react';
import ReactDOM from 'react-dom';
import TournamentController from './controllers/TournamentController';

// jQuery needed by TouchScroll
import $ from 'jquery';
window.$ = $;

$(function() {
  ReactDOM.render(
    React.createElement(TournamentController),
    document.getElementById('tournament-bracket-wrapper')
  );
});
