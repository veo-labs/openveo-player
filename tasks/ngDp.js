'use strict';

// Builds AngularJS applications dependencies file
// For more information about Grunt ngDp, have a look at https://github.com/veo-labs/openveo-api
module.exports = {

  // Generates a file containing the ordered list of SCSS and JavaScript files of the player
  // Paths will be transformed, replacing basePath by cssPrefix or jsPrefix
  components: {
    options: {
      basePath: '<%= project.sourcesPath %>/',
      cssPrefix: ''
    },
    files: [
      {
        src: [
          '<%= project.sourcesPath %>/**/*.*',
          '!<%= project.sourcesPath %>/index.scss',
          '!<%= project.sourcesPath %>/**/*.spec.js'
        ],
        dest: '<%= project.buildPath %>/ng-components-files.json'
      }
    ]
  }

};
