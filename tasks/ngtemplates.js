'use strict';

// Generate AngularJS templates cache
// For more information about Grunt angular templates, have a look at
// https://www.npmjs.com/package/grunt-angular-templates
module.exports = {

  // Generates AngularJS templates cache for components
  components: {
    options: {
      module: 'ov.player',
      url: function(url) {
        return 'opl-' + url.slice(url.lastIndexOf('/') + 1);
      },
      htmlmin: {
        collapseBooleanAttributes: true,
        collapseWhitespace: true,
        removeComments: true,
        removeEmptyAttributes: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true
      }
    },
    cwd: '<%= project.sourcesPath %>',
    src: 'components/**/*.html',
    dest: '<%= project.buildJsPath %>/openveo-player.templates.js'
  }

};
