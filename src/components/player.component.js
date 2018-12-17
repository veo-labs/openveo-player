'use strict';

/**
 * @module ov.player
 */

/**
 * Creates a new Angular directive as an HTML element opl-player to create the player.
 *
 * e.g.
 *
 * Available attributes are:
 *  - {Object} **opl-data**: A data object as:
 *   {
 *     mediaId: '136081112', // The id of the media
 *     timecodes: [ // Timecodes
 *       {
 *         timecode: 0, // Timecode in milliseconds (0 ms)
 *         image: { // Image to display at 0 ms
 *           small: 'slide_00000.jpeg', // Small version of the image
 *           large: 'slide_00000_large.jpeg' // Large version of the image
 *         }
 *       },
 *       {
 *         timecode: 1200, // Timecode in milliseconds (1200 ms)
 *         image: { // Image to display at 1200 ms
 *           small: 'slide_00001.jpeg', // Small version of the image
 *           large: 'slide_00001_large.jpeg' // Large version of the image
 *         }
 *       }
 *       ...
 *     ],
 *     chapters: [ // Chapters
 *       {
 *         name: 'Chapter 1', // Chapter name
 *         description: 'Chapter 1', // Chapter description
 *         value: 0.04666666666666667 // Chapter timecode in percent
 *       },
 *       {
 *         name: 'Chapter 2', // Chapter name
 *         description: 'Chapter 2', // Chapter description
 *         value: 0.31666666666666665 // Chapter timecode in percent
 *       }
 *       ...
 *     ],
 *     files: [ // The list of media files (only for "html" player)
 *       {
 *         width: 640, // Media width for this file
 *         height: 360, // Media height for this file
 *         link: 'https://player.vimeo.com/external/136081112.sd.mp4' // Media url
 *       },
 *       {
 *         width: 1280, // Media width for this file
 *         height: 720, // Media height for this file
 *         link: 'https://player.vimeo.com/external/136081112.hd.mp4' // Media url
 *       },
 *       ...
 *     ],
 *     thumbnail: "/1439286245225/thumbnail.jpg", // The media thumbnail (only for "html" player)
 *     chapters: [ // Chapters
 *       {
 *         name: 'Chapter 1', // Chapter name
 *         description: 'Chapter 1', // Chapter description
 *         value: 0.04 // Chapter timecode in percent (percentage of the video)
 *       },
 *       {
 *         name: 'Chapter 2', // Chapter name
 *         description: 'Chapter 2', // Chapter description
 *         value: 0.3 // Chapter timecode in percent (percentage of the video)
 *       }
 *     ],
 *     cut: [ // Cut information (begin and end)
 *       {
 *         type: 'begin', // Cut type
 *         value: 0 // Begin timecode (percentage of the media)
 *       },
 *       {
 *         type: 'end', // Cut type
 *         value: 0.9 // End timecode (percentage of the media)
 *       }
 *     ]
 *   }
 *   nb: Note that small images must be at least 200 pixels width.
 *  - {Boolean} **opl-fullscreen-icon**: true to display the enlarge/reduce icon
 *  - {Boolean} **opl-volume-icon**: true to display the volume icon
 *  - {Boolean} **opl-mode-icon**: true to display the display mode icon
 *  - {Boolean} **opl-settings-icon**: true to display the settings icon
 *  - {Boolean} **opl-time**: true to display the actual time and duration
 *  - {Boolean} **opl-media-sources-icon**: true to display the multi-sources icon
 *  - {Boolean} **opl-hide-chapters-tab**: true to hide chapters tab
 *  - {Boolean} **opl-hide-tags-tab**: true to hide tags tab
 *  - {Boolean} **opl-full-viewport**: true to display the player in full viewport
 *  - {Boolean} **opl-disable-cut**: true to disable cuts
 *  - {String} **opl-language**: Player language code (e.g. fr)
 *  - {String} **opl-player-type**: The type of player to use to play the media. It can be either:
 *      - html: To play the media using HTML player
 *    If no player type is provided, opl-player will figure out which player to use depending on the media type.
 *  - {String} **opl-mode**: The display template to use (either "both", "media", "both-presentation" or "presentation")
 *  - {Boolean} **opl-auto-play**: true to start playing when media is ready
 *  - {Boolean} **opl-remember-position**: true to start the media at the position the user was
 *
 * e.g.
 *
 * // Define the data object as input for the opl-player
 * $scope.data =
 *  {
 *    'type': 'vimeo',
 *    'mediaId': '118502922',
 *    'timecodes': [
 *      {
 *        'timecode': 50000,
 *        'image': {
 *          'small': './slides/slide_00000.jpeg',
 *          'large': './slides/slide_00000_large.jpeg'
 *        }
 *      }
 *    ]
 *  }
 *
 * <opl-player
 *   opl-data="data"
 *   opl-fullscreen-icon="true"
 *   opl-volume-icon="true"
 *   opl-mode-icon="true"
 *   opl-settings-icon="true"
 *   opl-media-sources-icon="true"
 *   opl-time="true"
 *   opl-hide-chapters-tab="true"
 *   opl-hide-tags-tab="true"
 *   opl-full-viewport="true"
 *   opl-disable-cut="true"
 *   opl-language="en"
 *   opl-player-type="html"
 *   opl-auto-play="true"
 *   opl-remember-position="true"
 *   opl-mode="both"
 * ></opl-player>
 *
 * // The whole object can also be changed dynamically
 * $scope.data =
 *  {
 *    'type': 'vimeo',
 *    'mediaId': '118502919',
 *    'timecodes': {
 *      {
 *        'timecode': 0,
 *        'image': {
 *          'small': './slides/slide_00000.jpeg',
 *          'large': './slides/slide_00000_large.jpeg'
 *        }
 *      },
 *      {
 *        'timecode': 20000,
 *        'image': {
 *          'small': './slides/slide_00001.jpeg',
 *          'large': './slides/slide_00001_large.jpeg'
 *        }
 *      }
 *    }
 *  }
 *
 * CAUTION: To update the data of the player the whole object must be changed. There aren't any two way bindings on
 * the data object properties.
 *
 * Listening to events:
 * You can listen to player events using opl-player HTMLElement.
 * Dispatched events are:
 *  - **ready**: The player is ready to receive actions
 *  - **waiting**: Media playback has stopped because the next frame is not available
 *  - **playing**: Media playback is ready to start after being paused or
 *    delayed due to lack of media data
 *  - **durationChange**: The duration attribute has just been updated
 *  - **play**: Media is no longer paused
 *  - **pause**: Media has been paused
 *  - **loadProgress**: Got buffering information
 *  - **playProgress**: Media playback position has changed
 *  - **end**: Media playback has reached the end
 *  - **error**: Player has encountered an error
 *  - **needPoiConversion**: Player has detected the old format of chapters / tags / indexes.
 *    Time of chapters / tags and indexes have to be expressed in milliseconds and not in percentage
 *
 * e.g.
 * <opl-player ... id="myPlayer"></opl-player>
 *
 * var myPlayer = document.getElementById('myPlayer');
 * angular.element(myPlayer).on('ready', function(event){
 *   console.log('ready');
 * });
 *
 * angular.element(test).on('waiting', function(event){
 *   console.log('waiting');
 * });
 *
 * angular.element(test).on('playing', function(event){
 *   console.log('playing');
 * });
 *
 * angular.element(test).on('durationChange', function(event, duration){
 *   console.log('durationChange with new duration = ' + duration);
 * });
 *
 * angular.element(test).on('play', function(event){
 *   console.log('play');
 * });
 *
 * angular.element(test).on('pause', function(event){
 *   console.log('pause');
 * });
 *
 * angular.element(test).on('loadProgress', function(event, percents){
 *   console.log('loadProgress');
 *   console.log('Buffering start = ' + percents.loadedStart);
 *   console.log('Buffering end = ' + percents.loadedPercent);
 * });
 *
 * angular.element(test).on('playProgress', function(event, data){
 *   console.log('playProgress');
 *   console.log('Current time = ' + data.time + 'ms');
 *   console.log('Played percent = ' + data.percent);
 * });
 *
 * angular.element(test).on('end', function(event){
 *   console.log('end');
 * });
 *
 * angular.element(test).on('error', function(event, error){
 *   console.log(error.message);
 *   console.log(error.code);
 * });
 *
 * angular.element(test).on('needPoiConversion', function(event, duration){
 *   console.log('needPoiConversion');
 *   console.log('Video duration = ' + duration + 'ms');
 * });
 *
 * Controlling the player:
 * You can control the player with some basic actions
 * - **selectMode**: Select the display mode (can be 'media', 'both', 'both-presentation' or 'presentation')
 * - **playPause**: Start / stop the media
 * - **setVolume**: Change player's volume
 * - **setTime**: Seek media to a specific time
 * - **setDefinition**: Sets player definition
 * - **setSource**: Sets player source if multi-sources
 *
 * e.g.
 * <opl-player ... id="myPlayer"></opl-player>
 * var myPlayer = document.getElementById('myPlayer');
 *
 * angular.element(myPlayer).on('ready', function(event){
 *  console.log('ready');
 *  var playerController = angular.element(myPlayer).controller('oplPlayer');
 *
 *  // Selects a new display mode ('media')
 *  playerController.selectMode('media');
 *
 *  // Starts / Pauses the player
 *  playerController.playPause();
 *
 *  // Sets volume to 10%
 *  playerController.setVolume(10);
 *
 *  // Seeks media to time 20s
 *  playerController.setTime(20000);
 *
 *  // Changes media source
 *  playerController.setSource(1);
 *
 * });
 *
 * @class oplPlayer
 */
(function(app) {

  app.component('oplPlayer', {
    templateUrl: 'opl-player.html',
    controller: 'OplPlayerController',
    bindings: {
      oplData: '<',
      oplFullscreenIcon: '@?',
      oplVolumeIcon: '@?',
      oplMode: '@?',
      oplModeIcon: '@?',
      oplSettingsIcon: '@?',
      oplMediaSourcesIcon: '@?',
      oplTime: '@?',
      oplFullViewport: '@?',
      oplLanguage: '@?',
      oplPlayerType: '@?',
      oplAutoPlay: '@?',
      oplRememberPosition: '@?',
      oplHideChaptersTab: '@?',
      oplHideTagsTab: '@?',
      oplDisableCut: '@?'
    }
  });

})(angular.module('ov.player'));
