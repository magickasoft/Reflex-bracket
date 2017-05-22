"use strict";

var $ = require('jquery');
import _ from 'lodash';

var routePrefix = '';

var ChallongeAPI = {
  setLocale: function(locale) {
    if (locale !== 'en') {
      routePrefix = '/' + locale;
    }
  },

  routePrefix: function() {
    return routePrefix;
  },

  ajax: function(settings) {
    var defaultSettings = {
      type: 'GET',
      dataType: 'json',
      contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
      processData: true
    };

    var dfd = $.Deferred();

    settings = _.merge(defaultSettings, settings);

    $.ajax({
      type: settings.type,
      url: routePrefix + settings.url,
      data: settings.data,
      dataType: settings.dataType,
      contentType: settings.contentType,
      processData: settings.processData,
      beforeSend: function(xhr) {
        xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'));
        settings.beforeAction(settings);
      },
      success: function(data, statusText, xhr) {
        settings.successAction(settings, data, xhr.status)
        dfd.resolve();
      },
      error: function(xhr, statusText, errorThrown) {
        settings.errorAction(settings, xhr.responseJSON, xhr.status);
        dfd.reject();
      }
    });

    return dfd.promise();
  }
};

module.exports = ChallongeAPI;
