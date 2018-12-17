'use strict';

// Copy resources
// For more information about Grunt copy, have a look at @openveo/api
var componentsSrc = [];

if (process.production) {
  componentsSrc.push(
    '<%= project.buildCssPath %>/openveo-player.min.css',
    '<%= project.buildJsPath %>/openveo-player.min.js'
  );
} else {
  componentsSrc.push(
    '<%= project.buildCssPath %>/*',
    '<%= project.buildJsPath %>/*'
  );
}

module.exports = {

  // Copy SCSS and JavaScript files to build directory
  // Note that files property is empty because it is filled by the components-set-concat-src task
  // Consequently using this task directly won't have any effect
  'components-sources': {
    files: []
  },

  // Copy generated CSS and JavaScript files to distribution directory
  components: {
    files: [
      {
        src: componentsSrc,
        dest: '<%= project.distPath %>'
      }
    ]
  }

};
