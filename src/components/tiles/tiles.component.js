'use strict';

/**
 * @module ov.player
 */

/**
 * Creates a new AngularJS component as an opl-tiles HTML element to create a list of points of interest.
 *
 * opl-tiles is composed of scrollable list of opl-tile components.
 *
 * Attributes are:
 * - [Array] **opl-data**: The list of tiles description objects as defined in opl-tile component
 * - [Number] **opl-time** The actual time in milliseconds, all tiles with a time inferior to this time will be
 *   marked as past tiles, tile corresponding to actual time will be marked as selected
 * - [Function] **opl-on-tile-select** The function to call when a tile is actioned
 * - [Function] **opl-on-tile-info** The function to call when a tile "more info" button is actioned
 * - [Function] **opl-on-tile-close** The function to call when a tile close button is actioned
 *
 * @example
 *     var tiles = [
 *       {
 *         id: 42,
 *         type: 'text',
 *         title: 'Title',
 *         time: 20000,
 *         description: '<h1>Description</<h1>',
 *         file: {
 *           url: 'http://host.local/document.pdf',
 *           originalName: 'download-name-without-extension'
 *         }
 *       },
 *       {
 *         id: 43,
 *         type: 'image',
 *         time: 40000,
 *         image: {
 *           small: 'http://host.local/image-small.jpg',
 *           large: 'http://host.local/image-large.jpg'
 *         }
 *       }
 *     ];
 *
 *     var time = 2000;
 *
 *     var handleTileSelect = function(tile) {
 *       console.log('Tile ' + tile.id + ' has been actioned');
 *     };
 *
 *     var handleTileInfo = function(tile) {
 *       console.log('Tile ' + tile.id + ' more button has been actioned');
 *     };
 *
 *     var handleTileClose = function(tile) {
 *       console.log('Tile ' + tile.id + ' close button has been actioned');
 *     };
 *
 *     <opl-tiles
 *                opl-data="tiles"
 *                opl-tile="time"
 *                opl-on-tile-select="handleTileSelect(tile)"
 *                opl-on-tile-info="handleTileInfo(tile)"
 *                opl-on-tile-close="handleTileClose(tile)"
 *     ></opl-tiles>
 *
 * @class oplTiles
 */
(function(app) {

  app.component('oplTiles', {
    templateUrl: 'opl-tiles.html',
    controller: 'OplTilesController',
    bindings: {
      oplData: '<',
      oplTime: '<',
      oplOnTileSelect: '&',
      oplOnTileInfo: '&',
      oplOnTileClose: '&'
    }
  });

})(angular.module('ov.player'));
