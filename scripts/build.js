#!/usr/bin/env node

/**
 * Builds sources.
 *
 * It needs to be run from project root directory.
 *
 * Usage:
 *
 * # Build sources for development
 * # Same as `build development`
 * $ build
 * $ build development
 *
 * # Build sources for production
 * $ build production
 */

'use strict';

const {exec} = require('child_process');
const path = require('path');

const environment = process.argv[2];

/**
 * Logs given message to stdout with a prefix.
 *
 * @param {String} message the message to log
 */
function log(message) {
  console.log(`build > ${message}`);
}

/**
 * Compiles sources files.
 *
 * @return Promise resolving when built
 */
async function build() {
  return new Promise((resolve, reject) => {
    const command = `npx grunt dist ${environment !== 'production' ? '--with-source-maps' : ''}`;
    log(`${process.cwd()} > Build sources`);
    exec(command, {cwd: process.cwd()}, (error, stdout, stderr) => {
      if (error) return reject(error);
      console.log(stdout);
      return resolve();
    });
  });
}

/**
 * Builds sources files.
 */
async function main() {
  await build();
}

main();
