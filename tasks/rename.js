'use strict';

// Rename resources
// For more information about Grunt rename, have a look at @openveo/api
module.exports = {

  // Rename main SCSS file
  'components-scss': {
    src: '<%= project.buildCssPath %>/index.scss',
    dest: '<%= project.buildCssPath %>/openveo-player.min.scss'
  }

};
