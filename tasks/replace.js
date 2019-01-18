'use strict';

// Replace placeholders
// For more information about Grunt replace, have a look at https://www.npmjs.com/package/grunt-replace
module.exports = {

  // Inject SCSS files into its main SCSS file
  // It makes sure SCSS files are loaded in the right order
  // Note that it must be run after ngDp:components task
  'inject-components-scss': {
    options: {
      usePrefix: false,
      patterns: [
        {
          json: function(done) {
            var resources = require('../build/ng-components-files.json');
            var componentsScss = '';
            var fontScss = '';

            resources.css.forEach(function(resource) {
              componentsScss += '@import "./scss/' + resource + '";\n';
            });

            fontScss += '@import "./scss/roboto-fontface/roboto/sass/roboto-fontface-regular.scss";\n';
            fontScss += '@import "./scss/roboto-fontface/roboto/sass/roboto-fontface-medium.scss";\n';

            done({
              '// INJECT_SCSS': componentsScss,
              '// INJECT_EXTERNAL_FONTS_SCSS': fontScss
            });
          }
        }
      ]
    },
    cwd: '<%= project.sourcesPath %>',
    src: 'index.scss',
    dest: '<%= project.buildCssPath %>/',
    expand: true
  },

  // Replace Roboto font path in SCSS file
  'roboto-scss-font-paths': {
    options: {
      usePrefix: false,
      patterns: [
        {
          match: '../../../fonts',
          replacement: '../../fonts'
        }
      ]
    },
    cwd: '<%= project.buildCssPath %>/scss/roboto-fontface',
    src: 'mixins.scss',
    dest: '<%= project.buildCssPath %>/scss/roboto-fontface/',
    expand: true
  },

  // Replace Roboto font path in CSS file
  'roboto-css-font-paths': {
    options: {
      usePrefix: false,
      patterns: [
        {
          match: '../../fonts/',
          replacement: './fonts/'
        }
      ]
    },
    cwd: '<%= project.buildCssPath %>',
    src: 'openveo-player.min.css',
    dest: '<%= project.buildCssPath %>/',
    expand: true
  }

};
