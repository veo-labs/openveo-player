'use strict';

// Karma configuration
module.exports = function(config) {

  config.set({

    // Base path that will be used to resolve all patterns
    // (eg. files, exclude)
    basePath: '',

    // Templates mock
    preprocessors: {
      'templates/*.html': 'ng-html2js'
    },

    // List of files / patterns to load in the browser
    files: [
      'node_modules/angular/angular.js',
      'node_modules/angular-animate/angular-animate.js',
      'node_modules/angular-cookies/angular-cookies.js',
      'node_modules/angular-route/angular-route.js',
      'node_modules/angular-mocks/angular-mocks.js',
      'node_modules/video.js/dist/video.js',
      'templates/*.html',
      'tests/init.js',
      'js/PlayerApp.js',
      'js/**/*.js',
      'tests/*.js'
    ]

  });

};
