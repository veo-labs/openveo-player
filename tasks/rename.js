'use strict';

// Rename resources
// For more information about Grunt rename, have a look at @openveo/api
module.exports = {

  // Rename version documentation directory to the target version
  doc: {
    src: '<%= project.docPath %>/version',
    dest: '<%= project.docPath %>/<%= pkg.version %>'
  },

  // Rename main SCSS file
  'components-scss': {
    src: '<%= project.buildCssPath %>/index.scss',
    dest: '<%= project.buildCssPath %>/openveo-player.min.scss'
  }

};
