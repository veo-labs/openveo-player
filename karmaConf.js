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

    // HTML templates mock
    ngHtml2JsPreprocessor: {
      moduleName: 'templates',
      cacheIdFromPath: function(filepath) {
        return filepath.replace(/^(.*\/)(.*)$/, function(match, match1, match2) {
          return 'opl-' + match2;
        });
      }
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
      'js/PlayerApp.js',
      'js/**/*.js',
      'tests/*.js'
    ]

  });

};
