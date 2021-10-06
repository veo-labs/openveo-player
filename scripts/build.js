#!/usr/bin/env node

/**
 * Builds OpenVeo Player.
 *
 * It needs to be run from project root directory.
 *
 * Usage:
 *
 * # Build OpenVeo Player for development
 * # Same as `build development`
 * $ build
 * $ build development
 *
 * # Build OpenVeo Player for production
 * $ build production
 */

'use strict';

const {exec} = require('child_process');
const {writeFile} = require('fs/promises');
const path = require('path');
const util = require('util');

const openVeoApi = require('@openveo/api');
const packageInformation = require('../package.json');

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
 * Compiles and concat JavaScript files.
 *
 * @param {Array} filesPaths The list of files paths to compile and concat
 * @param {String} outputPath The file output path
 * @return {Promise} Promise resolving when JavaScript files have been compiled
 */
async function compileJavaScriptFiles(workingDirectory, filesPaths, outputPath) {
  return new Promise((resolve, reject) => {
    const command = `npx uglifyjs \
-c \
-m \
${environment !== 'production' ? '--source-map' : ''} \
-o ${outputPath} \
-- ${filesPaths.join(' ')}`;
    log(command);
    exec(command, {cwd: workingDirectory}, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      return resolve();
    });
  });
}

/**
 * Compiles SCSS files.
 *
 * @param {String} scssDirectoryPath The path where to find SCSS files
 * @param {String} mainScssFilePath The path of the main SCSS file to compile
 * @param {String} outputPath The destination directory path
 * @return {Promise} Promise resolving when SCSS files have been compiled
 */
async function compileScssFiles(scssDirectoryPath, mainScssFilePath, outputPath) {
  return new Promise((resolve, reject) => {
    const command = `compass compile -c ./compass.rb \
--force \
--sass-dir ${scssDirectoryPath} \
--css-dir ${outputPath} \
${environment === 'production' ? '-e production -s compressed --no-sourcemap' : ''} \
-- ${mainScssFilePath}
`;
    log(command);
    exec(command, {cwd: process.cwd()}, (error, stdout, stderr) => {
      if (error) return reject(error);
      console.log(stdout);
      return resolve();
    });
  });
}

/**
 * Copies ordered sources to given directory.
 *
 * @param {String} baseSourcesPath The base path of all JavaScript and CSS / SCSS files
 * @param {String} jsDirectoryPath The path of the directory to copy JavaScript files to
 * @param {String} cssDirectoryPath The path of the directory to copy SCSS files to
 * @param {Object} orderedSources The ordered JavaScript and CSS / SCSS sources
 * @param {Object} orderedSources.js The ordered JavaScript sources
 * @param {Object} orderedSources.css The ordered CSS / SCSS sources
 * @return {Promise} Promise resolving when files have been copied
 */
async function copyOrderedSources(baseSourcesPath, jsDirectoryPath, cssDirectoryPath, orderedSources) {
  const copiedOrderedSources = {js: [], css: []};

  const copyFiles = async function(filesToCopy, filesCopied, outputPath) {
    for (let filePath of filesToCopy) {
      const relativeFilePath = filePath.replace(baseSourcesPath, '');
      const destinationPath = path.join(outputPath, relativeFilePath);

      await util.promisify(openVeoApi.fileSystem.copy.bind(openVeoApi.fileSystem))(
        filePath,
        destinationPath
      );
      filesCopied.push(destinationPath);
    }
  };

  await copyFiles(orderedSources.js, copiedOrderedSources.js, jsDirectoryPath);
  await copyFiles(orderedSources.css, copiedOrderedSources.css, cssDirectoryPath);

  return Promise.resolve(copiedOrderedSources);
}

/**
 * Gets the list of JavaScript and SCSS sources ordered by dependence.
 *
 * @param {String} baseSourcesPath The base directory to look for sources
 * @return {Promise} Promise resolving with JavaScript and CSS / SCSS files ordered by dependence
 */
async function getOrderedSources(baseSourcesPath) {
  const filesPaths = [];
  const sources = await util.promisify(openVeoApi.fileSystem.readdir.bind(openVeoApi.fileSystem))(baseSourcesPath);

  for (let source of sources) {
    if (source.isFile() && !/(\.spec\.js|\/index\.scss|\.json|\.html)$/.test(source.path)) {
      filesPaths.push(source.path);
    }
  }

  return util.promisify(openVeoApi.angularJs.parser.orderSources.bind(openVeoApi.angularJs.parser))(filesPaths);
}

/**
 * Generates HTML templates cache.
 *
 * @param {String} baseSourcesPath The base directory to look for HTML templates
 * @param {String} outputPath The path of the template cache file
 * @return {Promise} Promise resolving when template cache file has been generated
 */
async function generateTemplatesCache(baseSourcesPath, outputPath) {
  const templatesPaths = [];
  const sources = await util.promisify(openVeoApi.fileSystem.readdir.bind(openVeoApi.fileSystem))(baseSourcesPath);

  for (let source of sources) {
    if (source.isFile() && /\.html$/.test(source.path)) {
      templatesPaths.push(source.path);
    }
  }

  return util.promisify(openVeoApi.angularJs.parser.generateTemplatesCache.bind(openVeoApi.angularJs.parser))(
    templatesPaths,
    outputPath,
    'ov.player',
    'opl-'
  );
}

/**
 * Builds OpenVeo Player.
 */
async function main() {
  const rootPath = path.join(__dirname, '../');
  const baseSourcesPath = path.join(rootPath, 'src');
  const indexScssPath = path.join(baseSourcesPath, 'index.scss');
  const buildPath = path.join(rootPath, 'build');
  const distPath = path.join(rootPath, 'dist');
  const fontsPath = path.join(rootPath, 'fonts');
  const fontsDistPath = path.join(distPath, 'fonts');
  const scssBuildPath = path.join(buildPath, 'scss');
  const scssDistPath = path.join(distPath, 'scss');
  const scssComponentsBuildPath = path.join(scssBuildPath, 'scss');
  const jsBuildPath = path.join(buildPath, 'js');
  const jsDistPath = path.join(distPath, 'js');
  const robotoRootPath = path.join(rootPath, 'node_modules/roboto-fontface');
  const robotoFontsPath = path.join(robotoRootPath, 'fonts/roboto');
  const robotoCssPath = path.join(robotoRootPath, 'css');
  const robotoCssBuildPath = path.join(scssComponentsBuildPath, 'roboto-fontface');
  const robotoMixinsPath = path.join(robotoCssBuildPath, 'mixins.scss');
  const robotoFontsDistPath = path.join(fontsDistPath, 'roboto');
  const indexScssBuildPath = path.join(scssBuildPath, 'openveo-player.min.scss');
  const indexScssDistPath = path.join(distPath, 'openveo-player.min.scss');
  const indexCssBuildPath = path.join(scssBuildPath, 'openveo-player.min.css');
  const indexCssDistPath = path.join(distPath, 'openveo-player.min.css');
  const indexCssSourceMapBuildPath = `${indexCssBuildPath}.map`;
  const indexCssSourceMapDistPath = `${indexCssDistPath}.map`;
  const mainJsDistPath = path.join(distPath, 'openveo-player.min.js');
  const templateCacheBuildPath = path.join(jsBuildPath, 'openveo-player.templates.js');
  const orderedSourcesBuildPath = path.join(buildPath, 'ng-components-files.json');

  const orderedSources = await getOrderedSources(baseSourcesPath);
  log(`Save ordered JavaScript and CSS / SCSS files to ${orderedSourcesBuildPath}`);
  await util.promisify(openVeoApi.fileSystem.mkdir.bind(openVeoApi.fileSystem))(buildPath);
  await writeFile(orderedSourcesBuildPath, JSON.stringify(orderedSources));

  log(`Copy ordered sources to ${jsBuildPath} and ${scssBuildPath}`);
  await copyOrderedSources(
    baseSourcesPath,
    jsBuildPath,
    scssComponentsBuildPath,
    orderedSources
  );

  log(`Generate cache for HTML templates to ${templateCacheBuildPath}`);
  await generateTemplatesCache(baseSourcesPath, templateCacheBuildPath);

  log(`Copy Roboto SCSS files ${robotoCssPath} to ${robotoCssBuildPath}`);
  await util.promisify(openVeoApi.fileSystem.copy.bind(openVeoApi.fileSystem))(robotoCssPath, robotoCssBuildPath);

  log(`Replace Roboto SCSS font paths in ${robotoMixinsPath}`);
  await util.promisify(openVeoApi.fileSystem.replace.bind(openVeoApi.fileSystem))(
    robotoMixinsPath,
    [
      {pattern: /\.\.\/\.\.\/\.\.\/fonts/g, replacement: '../../fonts'}
    ]
  );

  log(`Copy ${indexScssPath} to ${indexScssBuildPath}`);
  await util.promisify(openVeoApi.fileSystem.copy.bind(openVeoApi.fileSystem))(indexScssPath, indexScssBuildPath);

  log(`Inject components SCSS and Roboto SCSS to ${indexScssBuildPath}`);
  await util.promisify(openVeoApi.fileSystem.replace.bind(openVeoApi.fileSystem))(
    indexScssBuildPath,
    [
      {
        pattern: /\/\/ INJECT_SCSS/,
        replacement: orderedSources.css.map(function(cssSourcePath) {
          return '@import "./scss' + cssSourcePath.replace(baseSourcesPath, '') + '";';
        }).join('\n')
      },
      {
        pattern: /\/\/ INJECT_EXTERNAL_FONTS_SCSS/,
        replacement: [
          '@import "./scss/roboto-fontface/roboto/sass/roboto-fontface-regular.scss";',
          '@import "./scss/roboto-fontface/roboto/sass/roboto-fontface-medium.scss";'
        ].join('\n')
      }
    ]
  );

  log(`Compile main SCSS file ${indexScssBuildPath} to ${scssBuildPath}`);
  await compileScssFiles(scssBuildPath, indexScssBuildPath, scssBuildPath);

  log(`Prepend OpenVeo Player version to ${indexCssBuildPath}`);
  await util.promisify(openVeoApi.fileSystem.prepend.bind(openVeoApi.fileSystem))(
    indexCssBuildPath,
    `/* openveo-player v${packageInformation.version} */\n\n`
  );

  log(`Copy CSS file ${indexCssBuildPath} to ${indexCssDistPath}`);
  await util.promisify(openVeoApi.fileSystem.copy.bind(openVeoApi.fileSystem))(indexCssBuildPath, indexCssDistPath);

  if (environment !== 'production') {

    log(`Copy CSS source map file ${indexCssSourceMapBuildPath} to ${indexCssSourceMapDistPath}`);
    await util.promisify(openVeoApi.fileSystem.copy.bind(openVeoApi.fileSystem))(
      indexCssSourceMapBuildPath,
      indexCssSourceMapDistPath
    );

    log(`Copy JavaScript source files ${jsBuildPath} to ${jsDistPath}`);
    await util.promisify(openVeoApi.fileSystem.copy.bind(openVeoApi.fileSystem))(jsBuildPath, jsDistPath);

    log(`Copy main SCSS source files ${indexScssBuildPath} to ${indexScssDistPath}`);
    await util.promisify(openVeoApi.fileSystem.copy.bind(openVeoApi.fileSystem))(indexScssBuildPath, indexScssDistPath);

    log(`Copy SCSS source files ${scssComponentsBuildPath} to ${scssDistPath}`);
    await util.promisify(openVeoApi.fileSystem.copy.bind(openVeoApi.fileSystem))(scssComponentsBuildPath, scssDistPath);

  }

  log(`Replace Roboto CSS font paths in ${indexCssDistPath}`);
  await util.promisify(openVeoApi.fileSystem.replace.bind(openVeoApi.fileSystem))(
    indexCssDistPath,
    [
      {pattern: /\.\.\/\.\.\/fonts/g, replacement: './fonts'}
    ]
  );

  log(`Compile JavaScript file to ${mainJsDistPath} from ${buildPath}`);
  await compileJavaScriptFiles(
    buildPath,
    orderedSources.js.map(function(jsSourcePath) {
      return jsSourcePath.replace(baseSourcesPath, 'js');
    }).concat([templateCacheBuildPath.replace(jsBuildPath, 'js')]),
    mainJsDistPath
  );

  log(`Prepend OpenVeo Player version to ${mainJsDistPath}`);
  await util.promisify(openVeoApi.fileSystem.prepend.bind(openVeoApi.fileSystem))(
    mainJsDistPath,
    `/* openveo-player v${packageInformation.version} */\n`
  );

  log(`Copy ${fontsPath} to ${fontsDistPath}`);
  await util.promisify(openVeoApi.fileSystem.copy.bind(openVeoApi.fileSystem))(fontsPath, fontsDistPath);

  log(`Copy ${robotoFontsPath} to ${robotoFontsDistPath}`);
  await util.promisify(openVeoApi.fileSystem.copy.bind(openVeoApi.fileSystem))(robotoFontsPath, robotoFontsDistPath);

}

main();
