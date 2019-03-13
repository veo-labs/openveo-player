'use strict';

/**
 * @module ov.player
 */

/**
 * Creates a new AngularJS component as an HTML element opl-player to create the player.
 *
 * opl-player is composed of three areas: the media, the actual index image associated to current time and a list
 * of points of interest.
 *
 * Attributes are:
 *  - [Object] **opl-data** An AngularJS expression evaluating to a data object
 *    - [Array|String] **mediaId** The list of media ids, one id by source. For the "html" player, the first media id
 *      corresponds to the first source, the second media id to the second source and so on
 *    - [Array] **[sources]** The list of sources, one source by media id (only for the "html" player)
 *      - [Array] **[adaptive]** A list of adaptive videos (DASH or HLS)
 *        - [Number] **height** The video height in pixels
 *        - [String] **mimeType** The source MIME type
 *        - [String] **link** The URL of the source
 *      - [Array] **[files]** A list of MP4 files (qualities)
 *        - [Number] **width** The video width in pixels
 *        - [Number] **height** The video height in pixels
 *        - [String] **link** The URL of the MP4 file
 *    - [String] **[thumbnail]** The URL of the image to display before the video starts (only for the "html" player)
 *    - [Array] **[timecodes]** A list of indexes
 *      - [Number] **timecode** The position of the index relative to the media duration (in milliseconds)
 *      - [Object] **image** The small and large version of the image representing the index
 *        - [String|Object] **small** Either the URL of the small image representing the index or a description object
 *          if small image is contained into a sprite. Small image is displayed in the list of indexes and when pointer
 *          is over the timebar. Expected small image size is 142x80
 *          - [String] **url** The URL of the sprite containing the small image
 *          - [Number] **x** x coordinate of the small image inside the sprite
 *          - [Number] **y** y coordinate of the small image inside the sprite
 *        - [String] **large** URL of the large image representing the index. Displayed in the area 2 when playing time
 *          corresponds to the index time, and when an index of the list of indexes is enlarged
 *    - [Array] **[chapters]** A list of chapters
 *      - [String] **name** The chapter name displayed in the list of chapters and when a chapter is enlarged
 *      - [String] **[description]** The chapter description. The description is displayed when chapter is enlarged.
 *        Description may contain HTML tags
 *      - [Number] **value** The position of the chapter relative to the media duration (in milliseconds)
 *      - [Object] **[file]** A file attached to the chapter
 *        - [String] **url** File URL. The displayed file name is retrieved for the URL when enlarging the chapter
 *        - [String] **originalName** The name presented to the user when downloading the file (should not contain the
 *          extension)
 *    - [Array] **[tags]** A list of tags
 *      - [String] **name** The tag name displayed in the list of tags and when a tag is enlarged
 *      - [String] **[description]** The tag description is displayed when tag is enlarged. Description may contain
 *        HTML tags
 *      - [Number] **value** The position of the tag relative to the media duration (in milliseconds)
 *      - [Object] **[file]** A file attached to the tag
 *        - [String] **url** File URL. The displayed file name is retrieved for the URL when enlarging the tag
 *        - [String] **originalName** The name presented to the user when downloading the file (should not contain the
 *          extension)
 *    - [Array] **[cut]** The list of cuts to apply to the media, for now only start and end cuts are available
 *      - [String] **type** The cut type (either "begin" or "end")
 *      - [Number] **value** The position of the cut relative to the media duration (in milliseconds)
 *  - [Boolean] **opl-fullscreen-icon** true to display the enlarge/reduce icon (default to true)
 *  - [Boolean] **opl-volume-icon** true to display the volume icon (default to true)
 *  - [Boolean] **opl-template-icon** true to display the template selector icon (default to true)
 *  - [Boolean] **opl-settings-icon** true to display the settings icon (default to true)
 *  - [Boolean] **opl-veo-labs-icon** true to display the Veo-Labs icon (default to true)
 *  - [Boolean] **opl-time** true to display the actual time and duration (default to true)
 *  - [Boolean] **opl-chapters-tab** true to display chapters tab (default to true)
 *  - [Boolean] **opl-tags-tab** true to display tags tab (default to true)
 *  - [Boolean] **opl-full-viewport** true to display the player in full viewport (default to false)
 *  - [Boolean] **opl-cuts** true to enable cuts (default to true)
 *  - [String] **opl-language** Player language code (e.g. fr) (default to "en")
 *  - [String] **opl-player-type** The type of player to use to play the media. It can be either "html", "youtube" or
 *    "vimeo" (default to "html")
 *  - [Boolean] **opl-auto-play** true to start playing when media is ready (default to false)
 *  - [Boolean] **opl-remember-position** true to start the media at the position the user was last time (default to
 *    false)
 *  - [String] **opl-template** The template to choose by default (either "split_1", "split_2", "split_50_50"
 *    or "split_25_75") (default to "split_1")
 *
 * Dispatched events are:
 *  - **ready** The player is ready to receive actions
 *  - **waiting** Media playback has stopped because the next frame is not available
 *  - **playing** Media playback is ready to start after being paused or
 *    delayed due to lack of media data
 *  - **durationChange** The duration attribute has just been updated
 *  - **play** Media is no longer paused
 *  - **pause** Media has been paused
 *  - **loadProgress** Got buffering information
 *  - **playProgress** Media playback position has changed
 *  - **end** Media playback has reached the end
 *  - **error** Player has encountered an error
 *  - **needPoiConversion** Player has detected the old format of chapters / tags / indexes.
 *    Time of chapters / tags and indexes have to be expressed in milliseconds and not in percentage
 *
 * Player controller exposed methods are:
 * - **selectTemplate** Select the template to choose by default (either "split_1", "split_2", "split_50_50" or
 *   "split_25_75")
 * - **playPause** Start / stop the media
 * - **setVolume** Change player's volume
 * - **setTime** Seek media to a specific time
 * - **setDefinition** Sets player definition
 * - **setSource** Sets player source if multi-sources
 *
 * @example
 *
 *      // Define the data object as input for the opl-player
 *      $scope.data = {
 *        mediaId: ['136081112'],
 *        timecodes: [
 *          {
 *            timecode: 0,
 *            image: {
 *              small: 'https://host.local/image1.jpeg',
 *              large: 'https://host.local/image1_large.jpeg'
 *            }
 *          },
 *          {
 *            timecode: 1200,
 *            image: {
 *              small: 'https://host.local/image2.jpeg',
 *              large: 'https://host.local/image2_large.jpeg'
 *            }
 *          }
 *          ...
 *        ],
 *        chapters: [
 *          {
 *            name: 'Chapter 1',
 *            description: 'Chapter 1',
 *            value: 1000
 *          },
 *          {
 *            name: 'Chapter 2',
 *            description: 'Chapter 2',
 *            value: 2000,
 *            file: {
 *              url: 'https://host/local/file.ext',
 *              originalName: 'original-name'
 *            }
 *          }
 *          ...
 *        ],
 *        tags: [
 *          {
 *            name: 'Tag 1',
 *            description: 'Tag 1',
 *            value: 1000
 *          },
 *          {
 *            name: 'Tag 2',
 *            description: 'Tag 2',
 *            value: 2000,
 *            file: {
 *              url: 'https://host/local/file.ext',
 *              originalName: 'original-name'
 *            }
 *          }
 *          ...
 *        ],
 *        sources: [
 *          {
 *            adaptive: [
 *              {
 *               height: 720,
 *               mimeType: 'application/dash+xml',
 *               link: 'https://host.local/mp4:video.mp4/manifest.mpd'
 *              },
 *              {
 *               height: 720,
 *               mimeType: 'application/vnd.apple.mpegurl',
 *               link: 'https://host.local/mp4:video.mp4/manifest.m3u8'
 *              }
 *            ],
 *            files: [
 *              {
 *                width: 640,
 *                height: 360,
 *                link: 'http://host.local/pathToSdMp4.mp4'
 *              },
 *              {
 *                width: 1280,
 *                height: 720,
 *                link: 'http://host.local/pathToHdMp4.mp4'
 *              }
 *            ]
 *          }
 *        ],
 *        cut: [
 *          {
 *            type: 'begin',
 *            value: 0
 *          },
 *          {
 *            type: 'end',
 *            value: 1000
 *          }
 *        ]
 *      };
 *
 *      var playerElement = angular.element(document.querySelector('#player-id'));
 *      playerElement.on('ready', function(event){
 *        console.log('ready');
 *        var playerController = playerElement.controller('oplPlayer');
 *
 *        // Selects a new display template ('split_2')
 *        playerController.selectTemplate('split_2');
 *
 *        // Starts / Pauses the player
 *        playerController.playPause();
 *
 *        // Sets volume to 10%
 *        playerController.setVolume(10);
 *
 *        // Seeks media to time 20s
 *        playerController.setTime(20000);
 *
 *        // Changes media source
 *        playerController.setSource(1);
 *      });
 *
 *      playerElement.on('waiting', function(event){
 *        console.log('waiting');
 *      });
 *
 *      playerElement.on('playing', function(event){
 *        console.log('playing');
 *      });
 *
 *      playerElement.on('durationChange', function(event, duration){
 *        console.log('durationChange with new duration = ' + duration);
 *      });
 *
 *      playerElement.on('play', function(event){
 *        console.log('play');
 *      });
 *
 *      playerElement.on('pause', function(event){
 *        console.log('pause');
 *      });
 *
 *      playerElement.on('loadProgress', function(event, percents){
 *        console.log('loadProgress');
 *        console.log('Buffering start = ' + percents.loadedStart);
 *        console.log('Buffering end = ' + percents.loadedPercent);
 *      });
 *
 *      playerElement.on('playProgress', function(event, data){
 *        console.log('playProgress');
 *        console.log('Current time = ' + data.time + 'ms');
 *        console.log('Played percent = ' + data.percent);
 *      });
 *
 *      playerElement.on('end', function(event){
 *        console.log('end');
 *      });
 *
 *      playerElement.on('error', function(event, error){
 *        console.log(error.message);
 *        console.log(error.code);
 *      });
 *
 *      playerElement.on('needPoiConversion', function(event, duration){
 *        console.log('needPoiConversion');
 *        console.log('Video duration = ' + duration + 'ms');
 *      });
 *
 *      <opl-player
 *                  id="player-id"
 *                  opl-data="data"
 *                  opl-fullscreen-icon="true"
 *                  opl-volume-icon="true"
 *                  opl-template="split_50_50"
 *                  opl-template-icon="true"
 *                  opl-settings-icon="true"
 *                  opl-veo-labs-icon="true"
 *                  opl-time="true"
 *                  opl-full-viewport="false"
 *                  opl-language="en"
 *                  opl-player-type="html"
 *                  opl-auto-play="false"
 *                  opl-remember-position="false"
 *                  opl-chapters-tab="true"
 *                  opl-tags-tab="true"
 *                  opl-cuts="true"
 *      ></opl-player>
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
      oplTemplate: '@?',
      oplTemplateIcon: '@?',
      oplSettingsIcon: '@?',
      oplVeoLabsIcon: '@?',
      oplTime: '@?',
      oplFullViewport: '@?',
      oplLanguage: '@?',
      oplPlayerType: '@?',
      oplAutoPlay: '@?',
      oplRememberPosition: '@?',
      oplChaptersTab: '@?',
      oplTagsTab: '@?',
      oplCuts: '@?'
    }
  });

})(angular.module('ov.player'));
