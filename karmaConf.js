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
      'lib/angular/angular.js',
      'lib/angular-animate/angular-animate.js',
      'lib/angular-cookies/angular-cookies.js',
      'lib/angular-route/angular-route.js',
      'lib/angular-mocks/angular-mocks.js',
      'lib/video.js/dist/video.min.js',
      'templates/*.html',
      'tests/init.js',
      'js/PlayerApp.js',
      'js/**/*.js',
      'tests/*.js'
    ]

  });

};
