'use strict';

// Obfuscate files
// For more information about Grunt uglify, have a look at https://www.npmjs.com/package/grunt-contrib-uglify
module.exports = {

  // Obfuscate components JavaScript files
  // Use grunt uglify:components --production to skip source maps generation
  // Not that this task should be run after concat:components
  components: {
    options: {
      sourceMap: !process.production,
      sourceMapIn: !process.production ? '<%= project.buildJsPath %>/openveo-player.js.map' : null
    },
    expand: true,
    cwd: '<%= project.buildJsPath %>/',
    src: ['openveo-player.js'],
    ext: '.min.js',
    extDot: 'last',
    dest: '<%= project.buildJsPath %>/'
  }

};
