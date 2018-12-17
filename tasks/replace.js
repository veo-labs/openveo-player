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

            resources.css.forEach(function(resource) {
              componentsScss += '@import "./scss/' + resource + '";\n';
            });

            done({
              '// INJECT_SCSS': componentsScss
            });
          }
        }
      ]
    },
    cwd: '<%= project.sourcesPath %>',
    src: 'index.scss',
    dest: '<%= project.buildCssPath %>/',
    expand: true
  }

};
