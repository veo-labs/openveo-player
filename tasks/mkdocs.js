'use strict';

// Generate documentation based on markdown files
// For more information about Grunt mkdocs, have a look at https://www.npmjs.com/package/grunt-mkdocs
module.exports = {

  // Generate OpenVeo Player documentation
  doc: {
    src: '.',
    options: {
      clean: true
    }
  }

};
