'use strict';

module.exports = {
  js: {
    options: {

      // Generated file header
      banner: '/* openveo-player v<%= pkg.version %> */\n',

      // Do not make it compatible with IE8
      screwIE8: true

    },
    files: [
      {

        // Obfuscate openveo-player.js
        src: ['<%= player.distPath %>/openveo-player.js'],

        // Destination file
        dest: '<%= player.distPath %>/openveo-player.min.js'

      }
    ]
  }
};
