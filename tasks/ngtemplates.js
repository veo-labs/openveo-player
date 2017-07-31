'use strict';

// For more information about Grunt Angular Templates, have a look at https://www.npmjs.com/package/grunt-angular-templates
module.exports = {

  // Append templates to openveo-player.js file in distribution directory
  templates: {
    src: '<%= player.templatesPath %>/**.html',
    dest: '<%= player.distPath %>/openveo-player.js',
    options: {
      append: true,
      module: 'ov.player',
      quotes: 'single',
      url: function(templateUrl) {
        return templateUrl.replace('.\/templates\/', 'ov-player-');
      },
      htmlmin: {
        collapseWhitespace: true,
        removeComments: true
      }
    }
  }

};
