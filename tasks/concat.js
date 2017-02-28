'use strict';

module.exports = {
  options: {

    // Generated file header
    banner: '/* openveo-player v<%= pkg.version %> */\n'

  },
  js: {

    // Match all JavaScript files to concat (PlayerApp.js must be the first one)
    src: ['<%= player.jsPath %>/PlayerApp.js', '<%= player.jsPath %>/**/*.js'],

    // Destination file
    dest: '<%= player.distPath %>/openveo-player.js'

  }
};
