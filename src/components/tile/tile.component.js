'use strict';

/**
 * @module ov.player
 */

/**
 * Creates a new AngularJS component as an opl-tile HTML element to create a point of interest.
 *
 * opl-tile is composed of information about a point of interest. A point of interest is represented by a time and the
 * resources associated to it. The ressources associated to the point of interest depends on its type.
 * The tile is reduced by default and can be enlarged. When tile is reduced only the time and the title (tile of type
 * "text") or the small image (tile of type "image") are displayed. When tile is enlarged a close button, title,
 * description and attachment file are displayed for tiles of type "text" while close button and large image are
 * displayed for tiles of type "image".
 *
 * Attributes are:
 * - [Array] **opl-data** The list of tiles description objects with for each object:
 *   - [Number] **id** The tile id
 *   - [String] **type** The tile type (either "image" or "text")
 *   - [Number] **time** The tile time value in milliseconds
 *
 *   Only for tiles of type "image":
 *   - [Object] **[image]** The tile image with:
 *     - [Object] **small** The small image. Small image is displayed when tile is reduced. Expected small image size
 *       is 148x80
 *       - [String] **url** The URL of the sprite containing the small image
 *       - [Number] **x** x coordinate of the small image inside the sprite
 *       - [Number] **y** y coordinate of the small image inside the sprite
 *     - [String] **large** The Large image URL to display when tile is enlarged
 *
 *   Only for tiles of type "text":
 *     - [String] **title** The tile title
 *     - [String] **[description]** The tile description (may contain HTML)
 *     - [Object] **[file]** The tile attachment file
 *       - [String] **url** The file URL. Displayed file name is retrieved from this URL
 *       - [String] **originalName** The name of the file to propose to the user when downloading
 * - [Boolean] **opl-abstract** true to show the abstract (reduced), false to show the full tile (enlarged)
 * - [Function] **opl-on-select** The function to call when tile is actioned
 * - [Function] **opl-on-more** The function to call when tile "more info" button is actioned
 * - [Function] **opl-on-close** The function to call when tile "close" button is actioned
 * - [Function] **opl-on-ready** The function to call when tile is ready. It can be called several time if the value
 *   of opl-abstract changes
 * - [Function] **opl-on-image-preloaded** The function to call when large image is loaded
 * - [Function] **opl-on-image-error** The function to call when large image couldn't be retrieved
 *
 * @example
 *     var textTile = {
 *       id: 42,
 *       type: 'text',
 *       title: 'Title',
 *       time: 20000,
 *       description: '<h1>Description</<h1>',
 *       file: {
 *         url: 'http://host.local/document.pdf',
 *         originalName: 'download-name-without-extension'
 *       }
 *     };
 *
 *     var imageTile = {
 *       id: 43,
 *       type: 'image',
 *       time: 40000,
 *       image: {
 *         small: 'http://host.local/image-small.jpg',
 *         large: 'http://host.local/image-large.jpg'
 *       }
 *     };
 *
 *     var handleTextTileSelect = function(tile) {
 *       console.log('Tile ' + tile.id + ' has been actioned');
 *     };
 *
 *     var handleTextTileMore = function(tile) {
 *       console.log('Tile ' + tile.id + ' "more info" button has been actioned');
 *     };
 *
 *     var handleTextTileClose = function(tile) {
 *       console.log('Tile ' + tile.id + ' "close" button has been actioned');
 *     };
 *
 *     var handleOnReady = function() {
 *       console.log('Tile is ready');
 *     };
 *
 *     var handleOnImageLoaded = function(tile, size) {
 *       console.log('Image of tile ' + tile.id + ' has been preloaded');
 *       console.log('Image size is ' + size.width + 'x' + size.height);
 *     };
 *
 *     var handleOnImageError = function(tile) {
 *       console.log('Image of tile ' + tile.id + ' is on error');
 *     };
 *
 *     var selected = false;
 *
 *     <opl-tile opl-data="imageTile"></opl-tile>
 *     <opl-tile
 *               opl-data="textTile"
 *               opl-abstract="true"
 *               opl-on-select="handleTextTileSelect(tile)"
 *               opl-on-more="handleTextTileMore(tile)"
 *               opl-on-close="handleTextTileClose(tile)"
 *               opl-on-ready="handleOnReady()"
 *               opl-on-image-preloaded="handleOnImageLoaded(tile, size)"
 *               opl-on-image-error="handleOnImageError(tile)"
 *     ></opl-tile>
 *
 * @class oplTile
 */
(function(app) {

  app.component('oplTile', {
    templateUrl: 'opl-tile.html',
    controller: 'OplTileController',
    bindings: {
      oplData: '<',
      oplAbstract: '<',
      oplOnSelect: '&',
      oplOnMore: '&',
      oplOnClose: '&',
      oplOnReady: '&',
      oplOnImagePreloaded: '&',
      oplOnImageError: '&'
    }
  });

})(angular.module('ov.player'));
