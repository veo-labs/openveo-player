'use strict';

// Compass / SASS compilation
// For more information about Grunt compass, have a look at https://www.npmjs.com/package/grunt-contrib-compass
module.exports = {

  // Build OpenVeo Player stylesheet
  // Use grunt compass:components --production to skip source maps generation
  // Note that "banner" option does not work with "sourcemap" property
  components: {
    options: {
      banner: process.production ? '/* openveo-player v<%= pkg.version %> */\n' : null,
      sourcemap: !process.production,
      sassDir: '<%= project.buildCssPath %>',
      cssDir: '<%= project.buildCssPath %>',
      environment: 'production',
      outputStyle: 'compressed',
      specify: '<%= project.buildCssPath %>/openveo-player.min.scss',
      force: true
    }
  }

};
