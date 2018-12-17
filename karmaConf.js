'use strict';

var path = require('path');

/**
 * Resolves an NPM module path.
 *
 * @param {String} npmModule The module to resolve
 * @return {String} The NPM module absolute path
 */
function resolveModulePath(npmModule) {
  return path.dirname(require.resolve(path.join(npmModule, 'package.json')));
}

// Karma configuration
module.exports = function(config) {
  var resources = require('./build/ng-components-files.json');
  var files = [];

  // Libraries
  files.push(path.join(resolveModulePath('angular'), 'angular.min.js'));
  files.push(path.join(resolveModulePath('angular-animate'), 'angular-animate.min.js'));
  files.push(path.join(resolveModulePath('angular-cookies'), 'angular-cookies.min.js'));
  files.push(path.join(resolveModulePath('angular-route'), 'angular-route.min.js'));
  files.push(path.join(resolveModulePath('angular-mocks'), 'angular-mocks.js'));
  files.push(path.join(resolveModulePath('video.js'), 'dist/video.min.js'));
  files.push(path.join(resolveModulePath('chai-spies'), 'chai-spies.js'));

  // Sources
  resources.js.forEach(function(file) {
    files.push('src/' + file);
  });

  // Templates
  files.push('src/**/*.html');

  // Tests
  files.push('src/**/*.spec.js');

  config.set({

    // Base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // Plugins to load
    plugins: [
      'karma-chai',
      'karma-mocha',
      'karma-chrome-launcher',
      'karma-ng-html2js-preprocessor'
    ],

    // HTML templates mock
    ngHtml2JsPreprocessor: {
      moduleName: 'templates',
      cacheIdFromPath: function(filepath) {
        return filepath.replace(/^(.*\/)(.*)$/, function(match, match1, match2) {
          return 'opl-' + match2;
        });
      }
    },

    // Files to preprocess
    preprocessors: {
      'src/**/*.html': ['ng-html2js']
    },

    // List of files / patterns to load in the browser
    files: files

  });

};
