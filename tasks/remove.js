'use strict';

// Remove resources
// For more information about Grunt remove, have a look at @openveo/api
module.exports = {

  // Remove OpenVeo Player documentation
  doc: {
    src: ['<%= project.docPath %>/']
  },

  // Remove project's built files and directories
  build: {
    src: [
      '<%= project.buildPath %>',
      '<%= project.distPath %>'
    ]
  }

};
