'use strict';

// Watch files for modifications
// For more information about Grunt watch, have a look at https://www.npmjs.com/package/grunt-contrib-watch
module.exports = {

  // Automatically rebuild player when a file is modified
  components: {
    files: [
      '<%= project.sourcesPath %>/**/*',
      '!<%= project.sourcesPath %>/**/*.spec.js'
    ],
    tasks: [
      'dist'
    ]
  }

};
