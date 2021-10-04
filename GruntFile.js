'use strict';

/* eslint node/no-sync: 0 */
var path = require('path');
var fs = require('fs');
var openVeoApi = require('@openveo/api');

/**
 * Loads a bunch of grunt configuration files from the given directory.
 *
 * Loaded configurations can be referenced using the configuration file name.
 * For example, if myConf.js returns an object with a property "test", it will be accessible using myConf.test.
 *
 * @param {String} path Path of the directory containing configuration files
 * @return {Object} The list of configurations indexed by filename without the extension
 */
function loadConfig(path) {
  var configuration = {};
  var configurationFiles = fs.readdirSync(path);

  configurationFiles.forEach(function(configurationFile) {
    configuration[configurationFile.replace(/\.js$/, '')] = require(path + '/' + configurationFile);
  });

  return configuration;
}

module.exports = function(grunt) {
  var config = {
    pkg: grunt.file.readJSON('package.json'),
    env: process.env
  };

  // Set "withSourceMaps" property which will be used by grunt tasks to set appropriate configuration
  process.withSourceMaps = (process.argv.length > 3 && process.argv[3] === '--with-source-maps') ? true : false;

  grunt.initConfig(config);
  grunt.config.merge(loadConfig('./tasks'));

  // Load grunt plugins
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-replace');
  grunt.loadNpmTasks('grunt-angular-templates');

  grunt.registerMultiTask('rename', openVeoApi.grunt.renameTask(grunt));
  grunt.registerMultiTask('copy', openVeoApi.grunt.copyTask(grunt));
  grunt.registerMultiTask('ngDp', openVeoApi.grunt.ngDpTask(grunt));

  // Dynamically set src property of concat:components and copy:components-sources tasks
  // The list of sources is built dynamically by the ngDp:components and ngtemplates:components tasks
  grunt.registerTask(
    'components-set-src',
    'Set src of concat:components and copy:components-sources tasks',
    function() {
      var concat = grunt.config('concat');
      var copy = grunt.config('copy');

      // Get the list of sources to concat from the results of ngDp:components task
      var resources = require('./build/ng-components-files.json');
      concat.components.src = [];

      // JavaScript files
      // Ask copy task to copy all JavaScript sources to the build folder respecting the sources tree and ask concat
      // task to concat JavaScript files from build folder
      resources.js.forEach(function(resourcePath) {
        copy['components-sources'].files.push({
          src: '<%= project.sourcesPath %>/' + resourcePath,
          dest: '<%= project.buildJsPath %>/js/' + path.dirname(resourcePath)
        });
        concat.components.src.push('<%= project.buildJsPath %>/js/' + resourcePath);
      });

      // SCSS files
      // Ask copy task to copy all SCSS files to the build folder respecting the sources tree
      resources.css.forEach(function(resourcePath) {
        copy['components-sources'].files.push({
          src: '<%= project.sourcesPath %>/' + resourcePath,
          dest: '<%= project.buildCssPath %>/scss/' + path.dirname(resourcePath)
        });
      });

      // Ask concat task to concat templates file with the other JavaScript files
      concat.components.src.push('<%= project.buildJsPath %>/openveo-player.templates.js');

      grunt.config('concat', concat);
      grunt.config('copy', copy);
    }
  );

  // Build the OpenVeo Player sources
  // Use grunt dist --production to build sources without source maps
  grunt.registerTask('dist', [
    'ngDp:components',
    'ngtemplates:components',
    'components-set-src',
    'copy:components-sources',
    'copy:roboto-scss',
    'replace:roboto-scss-font-paths',
    'replace:inject-components-scss',
    'rename:components-scss',
    'compass:components',
    'replace:roboto-css-font-paths',
    'concat:components',
    'uglify:components',
    'copy:components',
    'copy:fonts',
    'copy:roboto-fonts'
  ]);

};
