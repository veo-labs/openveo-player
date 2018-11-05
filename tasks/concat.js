'use strict';

module.exports = {
  options: {

    // Generated file header
    banner: '/* openveo-player v<%= pkg.version %> */\n'

  },
  js: {

    // Match all JavaScript files to concat
    // grunt ngtemplates:player needs to be executed before this task
    src: [
      '<%= player.jsPath %>/PlayerApp.js',
      '<%= player.buildPath %>/openveo-player.templates.js',
      '<%= player.jsPath %>/**/*.js'
    ],

    // Destination file
    dest: '<%= player.distPath %>/openveo-player.js'

  }
};
