'use strict';

// JavaScript linter
// For more information about Grunt eslint, have a look at https://www.npmjs.com/package/grunt-eslint
module.exports = {

  player: {
    src: [
      'karmaConf.js',
      'Gruntfile.js',
      'tasks/**/*.js',
      'src/**/*.js'
    ]
  }

};
