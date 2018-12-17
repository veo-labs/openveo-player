'use strict';

var path = require('path');

module.exports = {
  rootPath: path.join(__dirname, '..'),
  buildPath: '<%= project.rootPath %>/build',
  buildCssPath: '<%= project.buildPath %>/css',
  buildJsPath: '<%= project.buildPath %>/js',
  distPath: '<%= project.rootPath %>/dist',
  docPath: '<%= project.rootPath %>/site',
  sourcesPath: '<%= project.rootPath %>/src'
};
