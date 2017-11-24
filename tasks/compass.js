'use strict';

module.exports = {
  dev: {
    options: {
      sourcemap: true,
      sassDir: '<%= player.sass %>',
      cssDir: '<%= player.distPath %>',
      environment: 'development',
      watch: true
    }
  },
  dist: {
    options: {
      sourcemap: false,
      sassDir: '<%= player.sass %>',
      cssDir: '<%= player.distPath %>',
      outputStyle: 'compressed',
      environment: 'production',
      force: true
    }
  }
};
