'use strict';

// Concat files
// For more information about Grunt concat, have a look at https://www.npmjs.com/package/grunt-contrib-concat
module.exports = {
  options: {

    // Generated file header
    banner: '/* openveo-player v<%= pkg.version %> */\n'

  },

  // Concatenate components JavaScript files
  // Use grunt concat:components --with-source-maps to add source maps generation
  // Note that src property is empty because it is filled by the components-set-concat-src task
  // Consequently using this task directly won't have any effect
  components: {
    options: {
      sourceMap: process.withSourceMaps,
      sourceMapStyle: 'link'
    },
    src: [],
    dest: '<%= project.buildJsPath %>/openveo-player.js'
  }

};
