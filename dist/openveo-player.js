/* openveo-player v2.0.2 */
'use strict';

(function(angular) {

  /**
   * Creates the ov.player module.
   *
   * ov.player offers a directive to easily create a player with
   * associated presentation images and chapters. All you have to do is use the
   * directive ovPlayer.
   *
   * The ov-player HTML element needs partials. To be able to locate the
   * directory of the partials, a global variable "ovPlayerDirectory"
   * must be set to the root directory of the player.
   *
   * e.g.
   * var ovPlayerDirectory = '/js/player/';
   *
   * Available attributes are :
   *  - Object ov-data A data object as :
   *   {
   *     mediaId : '136081112', // The id of the media
   *     timecodes : [ // Timecodes
   *       {
   *         timecode : 0, // Timecode in milliseconds (0 ms)
   *         image : { // Image to display at 0 ms
   *           small : 'slide_00000.jpeg', // Small version of the image
   *           large : 'slide_00000_large.jpeg' // Large version of the image
   *         }
   *       },
   *       {
   *         timecode : 1200, // Timecode in milliseconds (1200 ms)
   *         image : { // Image to display at 1200 ms
   *           small : 'slide_00001.jpeg', // Small version of the image
   *           large : 'slide_00001_large.jpeg' // Large version of the image
   *         }
   *       }
   *       ...
   *     ],
   *     chapters : [ // Chapters
   *       {
   *         name : 'Chapter 1', // Chapter name
   *         description : 'Chapter 1', // Chapter description
   *         value : 0.04666666666666667 // Chapter timecode in percent
   *       },
   *       {
   *         name : 'Chapter 2', // Chapter name
   *         description : 'Chapter 2', // Chapter description
   *         value : 0.31666666666666665 // Chapter timecode in percent
   *       }
   *       ...
   *     ],
   *     files : [ // The list of media files (only for "html" player)
   *       {
   *         width : 640, // Media width for this file
   *         height : 360, // Media height for this file
   *         link : 'https://player.vimeo.com/external/136081112.sd.mp4' // Media url
   *       },
   *       {
   *         width : 1280, // Media width for this file
   *         height : 720, // Media height for this file
   *         link : 'https://player.vimeo.com/external/136081112.hd.mp4' // Media url
   *       },
   *       ...
   *     ],
   *     thumbnail : "/1439286245225/thumbnail.jpg", // The media thumbnail (only for "html" player)
   *     chapters : [ // Chapters
   *       {
   *         name : 'Chapter 1', // Chapter name
   *         description : 'Chapter 1', // Chapter description
   *         value : 0.04 // Chapter timecode in percent (percentage of the video)
   *       },
   *       {
   *         name : 'Chapter 2', // Chapter name
   *         description : 'Chapter 2', // Chapter description
   *         value : 0.3 // Chapter timecode in percent (percentage of the video)
   *       }
   *     ],
   *     cut : [ // Cut information (begin and end)
   *       {
   *         type : 'begin', // Cut type
   *         value : 0 // Begin timecode (percentage of the media)
   *       },
   *       {
   *         type : 'end', // Cut type
   *         value : 0.9 // End timecode (percentage of the media)
   *       }
   *     ]
   *   }
   *   nb : Note that small images must be at least 200 pixels width.
   *  - Boolean ov-fullscreen-icon true to display the
   *    enlarge/reduce icon (CAUTION : It must be an assignable variable)
   *  - Boolean ov-volume-icon true to display the volume icon
   *    (CAUTION : It must be an assignable variable)
   *  - Boolean ov-mode-icon true to display the display mode icon
   *    (CAUTION : It must be an assignable variable)
   *  - Boolean ov-settings-icon true to display the settings icon
   *    (CAUTION : It must be an assignable variable)
   *  - Boolean ov-time true to display the actual time and duration
   *    (CAUTION : It must be an assignable variable)
   *  - Boolean ov-full-viewport true to display the player in
   *    full viewport (CAUTION : It must be an assignable variable)
   *  - String ov-language Player language code (e.g. fr)
   *  - String ov-player-type The type of player to use to play the media. It
   *    can be either :
   *      - html : To play the media using HTML player
   *    If no player type is provided, ov-player will figure out which player
   *    to use depending on the media type.
   *  - Boolean ov-auto-play true to start playing when media is ready
   *  - Boolean ov-remember-position true to start the media at the position the user was
   *
   * e.g.
   *
   * // Define the data object as input for the ov-player
   * $scope.data =
   *  {
   *    'type' : 'vimeo',
   *    'mediaId' : '118502922',
   *    'timecodes' : [
   *      {
   *        'timecode' : 50000,
   *        'image' : {
   *          'small' : './slides/slide_00000.jpeg',
   *          'large' : './slides/slide_00000_large.jpeg'
   *        }
   *      }
   *    ]
   *  }
   *
   * <ov-player
   *   ov-data="data"
   *   ov-fullscreen-icon="isFullscreenIconDisplayed"
   *   ov-volume-icon="isVolumeIconDisplayed"
   *   ov-mode-icon="isModeIconDisplayed"
   *   ov-settings-icon="isSettingsIconDisplayed"
   *   ov-time="isTimeDisplayed"
   *   ov-full-viewport="isFullViewport"
   *   ov-language="en"
   *   ov-player-type="html"
   *   ov-auto-play="true"
   *   ov-remember-position="true"
   * ></ov-player>
   *
   * // The whole object can also be changed dynamically
   * $scope.data =
   *  {
   *    'type' : 'vimeo',
   *    'mediaId' : '118502919',
   *    'timecodes' : {
   *      {
   *        'timecode' : 0,
   *        'image' : {
   *          'small' : './slides/slide_00000.jpeg',
   *          'large' : './slides/slide_00000_large.jpeg'
   *        }
   *      },
   *      {
   *        'timecode' : 20000,
   *        'image' : {
   *          'small' : './slides/slide_00001.jpeg',
   *          'large' : './slides/slide_00001_large.jpeg'
   *        }
   *      }
   *    }
   *  }
   *
   * CAUTION : To update the data of the player the whole object
   * must be changed. There aren't any two way bindings on the data
   * object properties.
   *
   * Listening to events :
   * You can listen to player events using ov-player HTMLElement.
   * Dispatched events are :
   *  - ready The player is ready to receive actions
   *  - waiting Media playback has stopped because the next frame is not available
   *  - playing Media playback is ready to start after being paused or
   *    delayed due to lack of media data
   *  - durationChange The duration attribute has just been updated
   *  - play Media is no longer paused
   *  - pause Media has been paused
   *  - loadProgress Got buffering information
   *  - playProgress Media playback position has changed
   *  - end Media playback has reached the end
   *  - error Player has encountered an error
   *
   * e.g.
   * <ov-player ... id="myPlayer"></ov-player>
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
   * Controlling the player :
   * You can control the player with some basic actions
   * - selectMode To select the display mode (can be 'media', 'both',
   *   'both-presentation' or 'presentation')
   * - playPause To start / stop the media
   * - setVolume To change player's volume
   * - setTime To seek media to a specific time
   * - setDefinition Sets player definition
   *
   * e.g.
   * <ov-player ... id="myPlayer"></ov-player>
   * var myPlayer = document.getElementById('myPlayer');
   *
   * angular.element(myPlayer).on('ready', function(event){
   *  console.log('ready');
   *  var playerController = angular.element(myPlayer).controller('ovPlayer');
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
   * });
   *
   * @main ov.player
   */
  var app = angular.module('ov.player', ['ngCookies']);

  if (typeof ovPlayerDirectory === 'undefined' || typeof ovPlayerDirectory !== 'string')
    throw new Error('ovPlayerDirectory global variable must be defined and set to the root path of the openVeo player');

  // Player translations
  app.constant('i18nTranslations', {
    en: {
      VIDEO_TAB_TITLE: 'Video',
      INDEX_TAB_TITLE: 'Index',
      CHAPTERS_TAB_TITLE: 'Chapters',
      LOADING: 'Loading...',
      MEDIA_ERR_NO_SOURCE: 'A network error caused the video download to fail part-way.',
      MEDIA_ERR_NETWORK: 'A network error caused the video download to fail part-way.',
      MEDIA_ERR_DECODE: 'The video playback was aborted due to a corruption problem ' +
      'or because the video used features your browser did not support.',
      MEDIA_ERR_SRC_NOT_SUPPORTED: 'The video could not be loaded, either because the server or network failed ' +
      'or because the format is not supported.',
      MEDIA_ERR_PERMISSION: 'Video not available or private.',
      MEDIA_ERR_DEFAULT: 'An unknown error occurred.'
    },
    fr: {
      VIDEO_TAB_TITLE: 'Vidéo',
      INDEX_TAB_TITLE: 'Index',
      CHAPTERS_TAB_TITLE: 'Chapitres',
      LOADING: 'Chargement...',
      MEDIA_ERR_NO_SOURCE: 'Une erreur réseau à causé l\'échec du téléchargement de la vidéo.',
      MEDIA_ERR_NETWORK: 'Une erreur réseau à causé l\'échec du téléchargement de la vidéo.',
      MEDIA_ERR_DECODE: 'La lecture de la vidéo a été abandonnée en raison d\' un problème de corruption ' +
      'ou parce que la vidéo utilise des fonctionnalités que votre navigateur ne supporte pas.',
      MEDIA_ERR_SRC_NOT_SUPPORTED: 'La vidéo ne peut être chargée , soit parce que le serveur ou le réseau à échoué ' +
      'ou parce que le format ne sont pas supportées.',
      MEDIA_ERR_PERMISSION: 'Vidéo indisponible ou privée.',
      MEDIA_ERR_DEFAULT: 'Une erreur inconnue est survenue.'
    }
  });

  // Player errors
  // Errors from 1 to 4 are the same as in the HTMLVideoElement specification
  app.constant('ovPlayerErrors', {
    MEDIA_ERR_NO_SOURCE: 0,
    MEDIA_ERR_ABORTED: 1,
    MEDIA_ERR_NETWORK: 2,
    MEDIA_ERR_DECODE: 3,
    MEDIA_ERR_SRC_NOT_SUPPORTED: 4,
    MEDIA_ERR_PERMISSION: 5,
    MEDIA_ERR_UNKNOWN: 6
  });

})(angular);

'use strict';

(function(app) {

  /**
   * Creates a new Angular directive as an HTML element ov-chapters to create a list of chapters with title and
   * description.
   * It requires ovPlayerDirectory global variable to be defined and have a value corresponding to the path of
   * the openVeo Player root directory.
   *
   * e.g.
   * <ov-chapters></ov-chapters>
   *
   * @module ov.player
   * @class ovChapters
   */
  function ovChapters(ovChaptersLink) {
    return {
      require: ['^ovPlayer', '^ovTabs'],
      restrict: 'E',
      templateUrl: ovPlayerDirectory + 'templates/chapters.html',
      scope: true,
      link: ovChaptersLink
    };
  }

  app.factory('ovChaptersLink', function() {
    return function(scope, element, attrs, controllers) {

      /**
       * Seeks media to the given timecode.
       *
       * @param {Number} time The timecode to seek to
       */
      scope.goToTimecode = function(time) {
        var playerCtrl = controllers[0],
          tabsCtrl = controllers[1];
        if (time <= scope.duration)
          playerCtrl.setTime(time);
        tabsCtrl.selectTabs('media');
      };

    };
  });

  app.directive('ovChapters', ovChapters);
  ovChapters.$inject = ['ovChaptersLink'];

})(angular.module('ov.player'));

'use strict';

(function(app) {

  /**
   * Creates a new Angular directive as an HTML element ov-index to create an openVeo player
   * index, with a list of presentation slides.
   * It requires ovPlayerDirectory global variable to be defined and have
   * a value corresponding to the path of the openVeo Player
   * root directory.
   *
   * e.g.
   * <ov-index></ov-index>
   *
   * @module ov.player
   * @class ovIndex
   */
  function ovIndex(ovIndexLink) {
    return {
      require: ['^ovPlayer', '^ovTabs'],
      restrict: 'E',
      templateUrl: ovPlayerDirectory + 'templates/index.html',
      scope: true,
      link: ovIndexLink
    };
  }

  app.factory('ovIndexLink', function() {
    return function(scope, element, attrs, controllers) {

      if (scope.timecodes.length)
        scope.imagePreview = scope.timecodes[0].image.large;

      /**
       * Sets presentation preview corresponding to the given timecode.
       *
       * @param {Number} timecode The timecode (in milliseconds)
       */
      scope.setImagePreview = function(timecode) {
        scope.imagePreview = scope.timecodesByTime[timecode].image.large;
      };

      /**
       * Seeks media to the given timecode.
       *
       * @param {Number} timecode The timecode to seek to
       */
      scope.goToTimecode = function(timecode) {
        var playerCtrl = controllers[0],
          tabsCtrl = controllers[1];
        if (timecode <= scope.duration)
          playerCtrl.setTime(timecode);
        tabsCtrl.selectTabs('media');
      };

    };
  });

  app.directive('ovIndex', ovIndex);
  ovIndex.$inject = ['ovIndexLink'];

})(angular.module('ov.player'));

'use strict';

(function(app) {

  /**
   * Defines a factory describing a player.
   *
   * All players must implement the methods of this object.
   * All events are dispatched to the given jPlayerElement.
   * The following events are emitted by the player :
   *  - "ovPlay" : Player starts playing
   *  - "ovPause" : Player pauses
   *  - "ovLoadProgress" : Player is buffering
   *  - "ovPlayProgress" : Player is playing
   *  - "ivReady" : Player is ready to play the media
   *  - "ovDurationChange" : Media duration has changed
   *  - "ovEnd" : Media has reached the end
   *  - "ovWaiting" : Media is waiting for buffering
   *  - "ovPlaying" : Media is ready to play after buffering
   *  - "ovError" : Player as encountered an error
   *
   * e.g.
   *
   * // Get an instance of the OvVimeoPlayer
   * // (which extends OvPlayer)
   * var OvVimeoPlayer = $injector.get('OvVimeoPlayer');
   * var player = new OvVimeoPlayer(element, 'player_id', '118786909');
   *
   * @module ov.player
   * @class OvPlayer
   */
  function OvPlayer() {

    /**
     * Defines a Player interface which every Player must implement.
     */
    function Player() {}

    /**
     * Checks if data object is valid.
     *
     * @method init
     * @param {Object} jPlayerElement The JQLite HTML element corresponding
     * to the HTML element which will receive events dispatched by
     * the player
     * @param {Object} media Details of the Media
     *   {
     *     mediaId : "136081112", // The id of the media
     *     timecodes : [ // Timecodes
     *       {
     *         timecode : 0, // Timecode in milliseconds (0 ms)
     *         image : { // Image to display at 0 ms
     *           small : "slide_00000.jpeg", // Small version of the image
     *           large : "slide_00000_large.jpeg" // Large version of the image
     *         }
     *       },
     *       {
     *         timecode : 1200, // Timecode in milliseconds (1200 ms)
     *         image : { // Image to display at 1200 ms
     *           small : "slide_00001.jpeg", // Small version of the image
     *           large : "slide_00001_large.jpeg" // Large version of the image
     *         }
     *       }
     *       ...
     *     ]
     *   }
     */
    Player.prototype.init = function(jPlayerElement, media) {
      if (!jPlayerElement || !media)
        throw new Error('A player JQLite Element and a media object are expected as Player arguments');

      this.jPlayerElement = jPlayerElement;
      this.media = media;
      this.playerId = 'player_' + this.media.mediaId;
    };

    /**
     * Gets media id.
     *
     * @method getMediaId
     * @return {String} The media id
     */
    Player.prototype.getMediaId = function() {
      return this.media.mediaId;
    };

    /**
     * Gets player id.
     *
     * @method getId
     * @return {String} The player id
     */
    Player.prototype.getId = function() {
      return this.playerId;
    };

    /**
     * Gets media url.
     *
     * @method getMediaSources
     * @param {Object} definition Media definition object
     * @return {String} The media sources
     */
    Player.prototype.getMediaSources = function(definition) {
      throw new Error('getMediaUrl method not implemented for this player');
    };

    /**
     * Gets media MIME Type.
     *
     * @method getMediaUrl
     * @param {Object} definition Media definition object
     * @return {String} The media url
     */
    Player.prototype.getMediaMIME = function(definition) {
      return definition && definition.mimeType ? definition.mimeType : 'video/mp4';
    };

    /**
     * Gets media definitions.
     *
     * @method getAvailableDefinitions
     * @return {Array} The list of definitions
     */
    Player.prototype.getAvailableDefinitions = function() {
      throw new Error('getAvailableDefinitions method not implemented for this player');
    };

    /**
     * Gets media thumbnail.
     *
     * @method getMediaThumbnail
     * @return {String} The media thumbnail
     */
    Player.prototype.getMediaThumbnail = function() {
      throw new Error('getMediaThumbnail method not implemented for this player');
    };

    /**
     * Inititializes the player after DOM is loaded.
     *
     * @method initialize
     */
    Player.prototype.initialize = function() {
      throw new Error('initialize method not implemented for this player');
    };

    /**
     * Loads current media.
     *
     * @method load
     */
    Player.prototype.load = function() {
      throw new Error('load method not implemented for this player');
    };

    /**
     * Tests if player actual state is pause.
     *
     * @method isPaused
     * @param {Boolean} true if paused, false otherwise
     */
    Player.prototype.isPaused = function() {
      throw new Error('isPaused method not implemented for this player');
    };

    /**
     * Plays or pauses the media depending on media actual state.
     *
     * @method playPause
     */
    Player.prototype.playPause = function() {
      throw new Error('play method not implemented for this player');
    };

    /**
     * Sets volume.
     *
     * @method setVolume
     * @param {Number} volume The new volume from 0 to 100.
     */
    Player.prototype.setVolume = function() {
      throw new Error('setVolume method not implemented for this player');
    };

    /**
     * Sets time.
     *
     * @method setTime
     * @param {Number} time The time to seek to in milliseconds
     */
    Player.prototype.setTime = function() {
      throw new Error('setTime method not implemented for this player');
    };

    /**
     * Gets player type.
     *
     * @method getPlayerTYpe
     * @return {String} A string representation of the player type
     */
    Player.prototype.getPlayerType = function() {
      throw new Error('getPlayerType method not implemented for this player');
    };

    /**
     * Destroys the player.
     *
     * @method destroy
     */
    Player.prototype.destroy = function() {
      throw new Error('destroy method not implemented for this player');
    };

    return Player;
  }

  app.factory('OvPlayer', OvPlayer);

})(angular.module('ov.player'));

'use strict';

(function(angular, app) {

  // Available display modes
  // Display mode tells how presentation and media are structured
  //  - "media" mode : Only the media is displayed
  //  - "both" mode : Both media and presentation are displayed (50/50)
  //  - "both-presentation" mode : Both media and presentation
  //    are displayed with more interest on the presentation (25/75)
  //  - "presentation" mode : Only the presentation is displayed
  var modes = ['media', 'both', 'both-presentation', 'presentation'];

  /**
   * Creates a new Angular directive as HTML element ov-player to create an openVeo player.
   *
   * It requires ovPlayerDirectory global variable to be defined and have
   * a value corresponding to the path of the openVeo Player
   * root directory.
   * For more information on the ov-player element, have a look at the
   * PlayerApp.js file.
   *
   * @module ov.player
   * @class ovPlayer
   */
  function ovPlayer($injector, $document, $sce, $filter, $timeout, PlayerService, i18nPlayerService, $cookies,
                     ovPlayerErrors) {
    return {
      restrict: 'E',
      templateUrl: ovPlayerDirectory + 'templates/player.html',
      scope: {
        ovData: '=',
        ovFullscreenIcon: '=?',
        ovVolumeIcon: '=?',
        ovModeIcon: '=?',
        ovSettingsIcon: '=?',
        ovTime: '=?',
        ovFullViewport: '=?',
        ovLanguage: '@?',
        ovPlayerType: '@?',
        ovAutoPlay: '@?',
        ovRememberPosition: '@?'
      },
      controller: ['$scope', '$element', function($scope, $element) {
        var self = this;
        var lastTime = 0;
        var hideSettingsTimeoutPromise;
        var fullscreen = false;
        var document = $document[0];
        var element = $element[0];
        var rootElement = $element.children()[0];
        var timeBar = element.getElementsByClassName('ov-time-ghost')[0];
        var volumeBar = element.getElementsByClassName('ov-volume-ghost')[0];
        var volumeBarRect = volumeBar.getBoundingClientRect();
        var volumeBarHeight = volumeBarRect.bottom - volumeBarRect.top;
        var timeBarRect = timeBar.getBoundingClientRect();
        var timeBarWidth = timeBarRect.right - timeBarRect.left;
        var playerService = new PlayerService();
        $scope.player = null;

        /**
         * Tests if browser implements the fullscreen API or not.
         *
         * @return {Boolean} true if fullscreen API is implemented, false otherwise
         */
        function implementFullScreenAPI() {
          return (rootElement.requestFullScreen ||
                  rootElement.mozRequestFullScreen ||
                  rootElement.webkitRequestFullScreen ||
                  rootElement.msRequestFullscreen);
        }

        // Set default value for attributes
        var apiEnable = implementFullScreenAPI();
        $scope.ovFullscreenIcon = (typeof $scope.ovFullscreenIcon === 'undefined') ? true : $scope.ovFullscreenIcon;
        $scope.fullscreenIcon = apiEnable && $scope.ovFullscreenIcon;

        $scope.ovVolumeIcon = (typeof $scope.ovVolumeIcon === 'undefined') ? true : $scope.ovVolumeIcon;
        $scope.ovModeIcon = (typeof $scope.ovModeIcon === 'undefined') ? true : $scope.ovModeIcon;
        $scope.ovSettingsIcon = (typeof $scope.ovSettingsIcon === 'undefined') ? true : $scope.ovSettingsIcon;
        $scope.ovTime = (typeof $scope.ovTime === 'undefined') ? true : $scope.ovTime;
        $scope.ovFullViewport = (typeof $scope.ovFullViewport === 'undefined') ? false : $scope.ovFullViewport;
        var rememberPosition =
                (typeof $scope.ovRememberPosition === 'undefined') ? false : JSON.parse($scope.ovRememberPosition);
        $scope.ovLanguage = (typeof $scope.ovLanguage === 'undefined') ? 'en' : $scope.ovLanguage;
        var autoPlay = (typeof $scope.ovAutoPlay === 'undefined') ? false : JSON.parse($scope.ovAutoPlay);

        /**
         * Tests if device is a touch device.
         *
         * @return {Boolean} true if the device is a touch one, false otherwise
         */
        function isTouchDevice() {
          return true == ('ontouchstart' in window || window.DocumentTouch && document instanceof DocumentTouch);
        }

        /**
         * Executes, safely, the given function in AngularJS process.
         *
         * @param {Function} functionToExecute The function to execute as part of
         * the angular digest process.
         */
        function safeApply(functionToExecute) {

          // Execute each apply on a different loop
          $timeout(function() {

            // Make sure we're not on a digestion cycle
            var phase = $scope.$root.$$phase;

            if (phase === '$apply' || phase === '$digest')
              functionToExecute();
            else
              $scope.$apply(functionToExecute);

          }, 1);

        }

        /**
         * Gets closest timecode, from the list of timecodes, to
         * the given time.
         *
         * @param {Number} time The time to look for in milliseconds
         * @return {Number} The actual timecode for the given time
         */
        function findTimecode(time) {

          if ($scope.timecodes.length) {

            if (time < $scope.timecodes[0].timecode) return null;

            for (var i = 0; i < $scope.timecodes.length; i++) {
              if (time >= $scope.timecodes[i].timecode &&
                  ($scope.timecodes[i + 1] &&
                   time < $scope.timecodes[i + 1].timecode))
                return $scope.timecodes[i].timecode;
            }

            return $scope.timecodes[$scope.timecodes.length - 1].timecode;
          }

          return 0;
        }

        /**
         * Handles mouse move events on volume bar area to update the
         * volume preview accordingly.
         *
         * @param {MouseEvent} event The dispatched event
         */
        function volumeMouseMove(event) {
          safeApply(function() {
            $scope.volumePreview = Math.round(((volumeBarRect.bottom - event.pageY) / volumeBarHeight) * 100);
          });
        }

        /**
         * Handles mouse out events on volume bar area to reset volume
         * preview and clear event listeners.
         */
        function volumeMouseOut() {
          $document.off('mousemove', volumeMouseMove);
          angular.element(volumeBar).off('mouseout', volumeMouseOut);

          safeApply(function() {
            $scope.volumePreview = 0;
          });
        }

        /**
         * Handles mouse move events on time bar area to update the
         * time / presentation preview accordingly.
         *
         * @param {MouseEvent} event The dispatched event
         */
        function timeMouseMove(event) {
          var timecode = findTimecode(
                  ((event.pageX - timeBarRect.left) / timeBarWidth) * $scope.duration + playerService.getRealCutStart()
                  );

          safeApply(function() {
            if (timecode !== null && $scope.timecodesByTime[timecode])
              $scope.timePreview = $scope.timecodesByTime[timecode].image.large;
            else $scope.timePreview = null;

            $scope.timePreviewPosition = ((event.pageX - timeBarRect.left) / timeBarWidth) * 100;
          });
        }

        /**
         * Handles mouse out events on time bar area to reset the
         * time preview and clear the event listeners.
         */
        function timeMouseOut() {
          $document.off('mousemove', timeMouseMove);
          angular.element(timeBar).off('mouseout', timeMouseOut);

          safeApply(function() {
            $scope.timePreviewPosition = 0;
            $scope.timePreviewOpened = false;
          });
        }

        /**
         * Hides timecodes.
         *
         * Hide the index tab, the display mode selector and set display mode to
         * "media" (only player is visible).
         */
        function hideTimecodes() {
          $scope.displayIndexTab = false;
          $scope.ovModeIcon = false;
          $scope.selectedMode = modes[0];
        }

        /**
         * Displays timecodes.
         *
         * Display the index tab, the display mode selector and set display mode
         * to "both" (both player and presentation)
         */
        function displayTimecodes() {
          $scope.displayIndexTab = true;
          $scope.ovModeIcon = true;
          $scope.selectedMode = modes[1];
        }

        /**
         * Hides chapters.
         *
         * Hide the chapters tab.
         */
        function hideChapters() {
          $scope.displayChapterTab = false;
        }

        /**
         * Displays chapters.
         *
         * Display the chapters tab.
         */
        function displayChapters() {
          $scope.displayChapterTab = true;
        }

        /**
         * Initializes the list of chapters.
         *
         * Display the chapters tab only if there is at least one chapter.
         */
        function initChapters() {
          $scope.chapters = playerService.getMediaChapters() || [];
          if ($scope.chapters.length) {
            displayChapters();
          } else {

            // No chapters
            hideChapters();

          }
        }

        /**
         * Initializes the list of timecodes.
         *
         * Display the index tab only if there is at least one timecode.
         * Also prepare a copy of the list of timecodes ordered by time to avoid
         * parsing it systematically.
         */
        function initTimecodes() {
          $scope.timecodes = playerService.getMediaTimecodes() || [];
          $scope.timecodesByTime = playerService.getMediaTimecodesByTime() || {};

          // Got timecodes associated to the media
          if ($scope.timecodes.length) {
            // Use the first image of the first timecode as
            // the current presentation image
            var timecode = findTimecode($scope.time);
            $scope.timePreview = timecode !== null ? $scope.timecodesByTime[timecode].image.large : null;
            $scope.presentation = timecode !== null ? $scope.timecodesByTime[timecode].image.large : null;

            displayTimecodes();
          } else {

            // No timecodes
            hideTimecodes();

          }
        }

        /**
         * Initializes the player.
         */
        function initPlayer() {

          if ($scope.data.mediaId) {
            var playerType = $scope.ovPlayerType || $scope.data.type || 'html';
            $scope.mediaTemplate = ovPlayerDirectory + 'templates/' + playerType + '.html';
            $scope.data.language = $scope.ovLanguage;

            // Get an instance of a player depending on player's type
            switch (playerType.toLowerCase()) {
              case 'youtube':
                var OvYoutubePlayer = $injector.get('OvYoutubePlayer');
                $scope.player = new OvYoutubePlayer($element, $scope.data);
                break;
              case 'vimeo':
                var OvVimeoPlayer = $injector.get('OvVimeoPlayer');
                $scope.player = new OvVimeoPlayer($element, $scope.data);
                break;
              case 'html':
                var OvHTMLPlayer = $injector.get('OvHTMLPlayer');
                $scope.player = new OvHTMLPlayer($element, $scope.data);
                break;
              default:
                throw new Error('Player ' + playerType + ' is not supported');
            }
          }
        }

        /**
         * Initializes player attributes.
         *
         * Some attributes may change regarding on player data.
         */
        function initAttributes() {

          if (!$scope.player)
            return;

          // Icon to change player definition is only available for the html player with, at least, one definition
          if ($scope.player.getPlayerType() == 'vimeo' || !$scope.player.getAvailableDefinitions())
            $scope.ovSettingsIcon = false;

          // Media volume can't be changed on touch devices
          if (isTouchDevice())
            $scope.ovVolumeIcon = false;

          // Full viewport and no FullScreen API available
          // Consider the player as in fullscreen
          if ($scope.ovFullViewport && !implementFullScreenAPI()) {
            $scope.fullscreenButton = 'reduce';
            fullscreen = true;
          }

          // Set player language
          i18nPlayerService.setLanguage($scope.ovLanguage);
        }

        /**
         * Initializes isolated scope properties and player.
         */
        function init() {

          // Set scope default values
          $scope.data = angular.copy($scope.ovData) || {};
          playerService.setMedia($scope.data);

          // Retrieve last stopped time
          if (rememberPosition) {
            var cookie = $cookies.getObject('videoStopped_' + $scope.data.mediaId);
            if (cookie) {
              $scope.seenPercent = cookie.percent;
              $scope.time = cookie.time;
              lastTime = $scope.time;
            }
          }

          initPlayer();

          if (!$scope.player)
            return;

          $scope.isCut = $scope.data.cut && $scope.data.cut.length;
          $scope.timecodes = [];
          $scope.timecodesByTime = {};
          $scope.chapters = [];
          $scope.presentation = null;
          $scope.playerId = $scope.player.getId();
          $scope.timePreviewOpened = false;
          $scope.volumeOpened = false;
          $scope.modesOpened = false;
          $scope.definitionOpened = false;
          $scope.modes = angular.copy(modes);
          $scope.selectedMode = modes[1];
          $scope.playPauseButton = 'play';
          $scope.fullscreenButton = 'enlarge';
          $scope.volumePreview = 0;
          $scope.volume = 100;
          $scope.loadedStart = 0;
          $scope.loadedPercent = 0;
          $scope.seenPercent = 0;
          $scope.time = 0;

          $scope.duration = 0;
          $scope.timePreviewPosition = 0;
          $scope.displayIndexTab = true;
          $scope.displayChapterTab = true;
          $scope.mediaThumbnail = $scope.player.getMediaThumbnail();

          // Get available definition : if null, definitions are managed in the player
          $scope.mediaDefinitions = $scope.player.getAvailableDefinitions();
          $scope.selectedDefinition = $scope.mediaDefinitions &&
            $scope.mediaDefinitions[$scope.mediaDefinitions.length - 1] || null;

          // Get sources for a definition: if definition is not selected sources should be always the same
          // and definition will be managed in the player (ex adatptive streaming, youtube player...)
          $scope.mediaSources = $scope.player.getMediaSources($scope.selectedDefinition);
          $scope.loading = true;
          $scope.initializing = true;
          $scope.error = null;

          // Video is cut
          // Real media duration is required to be able to display either the
          // list of chapters or the list of timecodes
          if ($scope.isCut) {
            hideTimecodes();
            hideChapters();
          } else {
            // Video is not cut
            // Timecodes and chapters can be immediately displayed
            initTimecodes();
            initChapters();
          }

          initAttributes();
        }

        init();

        /**
         * Hides all opened settings menu with a timeout.
         */
        function hideSettingsWithTimeout() {
          if (hideSettingsTimeoutPromise)
            $timeout.cancel(hideSettingsTimeoutPromise);

          if ($scope.modesOpened || $scope.definitionOpened || $scope.volumeOpened)
            hideSettingsTimeoutPromise = $timeout(function() {
              $scope.modesOpened = $scope.definitionOpened = $scope.volumeOpened = false;
            }, 3000);
        }

        /**
         * Toggles display mode selection list.
         *
         * If the list of display modes is opened, close it, open it
         * otherwise. Close volume if opened.
         * Automatically close display modes after 3 seconds.
         */
        $scope.toggleModes = function() {
          $scope.volumeOpened = false;
          $scope.definitionOpened = false;
          $scope.modesOpened = !$scope.modesOpened;
          hideSettingsWithTimeout();
        };

        /**
         * Toggles the volume.
         *
         * If the volume selector is opened, close it, open it
         * otherwise. Close display modes if opened.
         * Automatically close volume after 3 seconds.
         */
        $scope.toggleVolume = function() {
          $scope.modesOpened = false;
          $scope.definitionOpened = false;
          $scope.volumeOpened = !$scope.volumeOpened;
          hideSettingsWithTimeout();
        };

        /**
         * Toggles definition selector.
         *
         * If definition selector is already opened, close it, open it otherwise.
         * Close both volume and modes if opened.
         * Automatically close definition selector after 3 seconds.
         */
        $scope.toggleDefinition = function() {
          $scope.volumeOpened = false;
          $scope.modesOpened = false;
          $scope.definitionOpened = !$scope.definitionOpened;
          hideSettingsWithTimeout();
        };

        /**
         * Toggles player full screen.
         *
         * If player is in full screen, reduce player to frame,
         * otherwise, display player in full screen.
         */
        $scope.toggleFullscreen = function() {

          // Fullscreen API is available
          if (rootElement.requestFullScreen ||
              rootElement.mozRequestFullScreen ||
              rootElement.webkitRequestFullScreen ||
              rootElement.msRequestFullscreen) {

            if ((document.fullScreenElement !== 'undefined' && document.fullScreenElement === null) ||
                (document.msFullscreenElement !== 'undefined' && document.msFullscreenElement === null) ||
                (document.mozFullScreen !== 'undefined' && document.mozFullScreen === false) ||
                (document.webkitFullscreenElement !== 'undefined' && document.webkitFullscreenElement === null)) {
              if (rootElement.requestFullScreen)
                rootElement.requestFullScreen();
              else if (rootElement.mozRequestFullScreen)
                rootElement.mozRequestFullScreen();
              else if (rootElement.webkitRequestFullScreen)
                rootElement.webkitRequestFullScreen();
              else if (rootElement.msRequestFullscreen)
                rootElement.msRequestFullscreen();

              $scope.fullscreenButton = 'reduce';
            } else {
              if (document.exitFullscreen)
                document.exitFullscreen();
              else if (document.mozCancelFullScreen)
                document.mozCancelFullScreen();
              else if (document.webkitExitFullscreen)
                document.webkitExitFullscreen();
              else if (document.msExitFullscreen)
                document.msExitFullscreen();

              $scope.fullscreenButton = 'enlarge';
            }

          } else {

            // Fullscreen API not available
            // Use viewport fullscreen instead
            fullscreen = $scope.ovFullViewport = !fullscreen;
            $scope.fullscreenButton = fullscreen ? 'reduce' : 'enlarge';

          }
        };

        // Listen to player template loaded event
        $scope.$on('$includeContentLoaded', function() {
          $timeout(function() {
            // Initialize player
            $scope.player.initialize();

          }, 1);
        });

        // listen to player destroy event
        $scope.$on('$destroy', function() {
          $scope.player.destroy();
        });

        // Watch for ov-data attribute changes
        $scope.$watch('ovData', function() {
          $scope.data = angular.copy($scope.ovData) || {};

          // Media id has changed
          if ($scope.data.mediaId && (!$scope.player || $scope.data.mediaId != $scope.player.getMediaId())) {

            if ($scope.player) {

              // Destroy previous player
              $scope.player.destroy();

            }

            // Reset all
            init();

          }

        });

        // Watch for icons attributes changes
        $scope.$watch('ovModeIcon', initAttributes);
        $scope.$watch('ovVolumeIcon', initAttributes);
        $scope.$watch('ovSettingsIcon', initAttributes);
        $scope.$watch('ovFullViewport', initAttributes);

        /**
         * Sets the player volume.
         *
         * Volume is retrieved from the position of the cursor on the
         * volume selector area.
         *
         * @param {MouseEvent} event The dispatched event when cliking
         * on the volume selector.
         */
        $scope.setVolume = function(event) {
          var volume = Math.min(Math.round(((volumeBarRect.bottom - event.pageY) / volumeBarHeight) * 100), 100);
          self.setVolume(volume);
        };

        /**
         * Sets the player time.
         *
         * Time is retrieved from the position of the cursor on the
         * time bar area.
         *
         * @param {MouseEvent} event The dispatched event when cliking
         * on the volume selector.
         */
        $scope.setTime = function(event) {
          timeBarRect = timeBar.getBoundingClientRect();
          timeBarWidth = timeBarRect.right - timeBarRect.left;
          self.setTime(((event.pageX - timeBarRect.left) / timeBarWidth) * $scope.duration);
        };

        /**
         * Sets the display mode.
         *
         * @method selectMode
         * @param {String} mode The display mode to activate, available
         * display modes are set just before ovPlayer definition
         */
        this.selectMode = $scope.selectMode = function(mode) {
          $scope.selectedMode = mode;
        };

        /**
         * Starts / Pauses the player.
         *
         * @method playPause
         */
        this.playPause = $scope.playPause = function() {
          if (!$scope.loading && !$scope.error)
            $scope.player.playPause();
        };

        /**
         * Sets the player volume.
         *
         * @method setVolume
         * @param {Number} volume The volume to set from 0 to 100
         */
        this.setVolume = function(volume) {
          $scope.volume = volume;
          $scope.player.setVolume($scope.volume);
        };

        /**
         * Sets the player time.
         *
         * @method setTime
         * @param {Number} time The time to set in milliseconds
         */
        this.setTime = function(time) {
          $scope.player.setTime(playerService.getRealTime(time));
        };

        /**
         * Sets the media definition.
         *
         * @method setDefinition
         * @param {Object} definition The new definition
         */
        this.setDefinition = $scope.setDefinition = function(definition) {
          if (definition && (
                    definition.link !== $scope.selectedDefinition.link ||
                    ($scope.player.getPlayerType() == 'youtube' && definition !== $scope.selectedDefinition))
              ) {
            lastTime = $scope.time;
            autoPlay = !$scope.player.isPaused();
            $scope.selectedDefinition = definition;
            $scope.mediaSources = $scope.player.getMediaSources($scope.selectedDefinition);
            $scope.loading = true;
            $scope.initializing = true;
            safeApply(function() {
              $scope.player.load();
            });
          }
        };

        /**
         * Handles mouse over events on volume bar area to be able to
         * display a preview of the future volume level.
         *
         * @param {MouseEvent} event The dispatched event
         */
        angular.element(volumeBar).on('mouseover', function() {
          volumeBarRect = volumeBar.getBoundingClientRect();
          volumeBarHeight = volumeBarRect.bottom - volumeBarRect.top;
          $document.on('mousemove', volumeMouseMove);
          angular.element(volumeBar).on('mouseout', volumeMouseOut);
        });

        /**
         * Handles mouse over events on time bar area to be able to
         * display a time /presentation preview.
         *
         * @param {MouseEvent} event The dispatched event
         */
        angular.element(timeBar).on('mouseover', function(event) {
          timeBarRect = timeBar.getBoundingClientRect();
          timeBarWidth = timeBarRect.right - timeBarRect.left;

          if ($scope.timecodes && $scope.timecodes.length) {
            timeMouseMove(event);
            $document.on('mousemove', timeMouseMove);
            angular.element(timeBar).on('mouseout', timeMouseOut);

            safeApply(function() {
              $scope.timePreviewOpened = true;
            });
          }
        });

        // Listen to player ready event
        $element.on('ovReady', function(event) {
          event.stopImmediatePropagation();

          safeApply(function() {
            $scope.player.setVolume(100);
            $scope.error = null;
            $scope.loading = false;
            $scope.initializing = false;
            self.setTime(lastTime);
            $element.triggerHandler('ready');

            if (autoPlay)
              self.playPause();
          });
          return false;
        });

        // Listen to player waiting event
        $element.on('ovWaiting', function(event) {
          event.stopImmediatePropagation();

          safeApply(function() {
            $scope.loading = true;
            $element.triggerHandler('waiting');
          });
          return false;
        });

        // Listen to player playing event
        $element.on('ovPlaying', function(event) {
          event.stopImmediatePropagation();

          safeApply(function() {
            $scope.loading = false;
            $scope.playPauseButton = 'pause';
            $element.triggerHandler('playing');
          });
          return false;
        });

        // Listen to player durationChange event
        $element.on('ovDurationChange', function(event, duration) {
          event.stopImmediatePropagation();

          safeApply(function() {
            playerService.setRealMediaDuration(duration);
            $scope.startCutTime = playerService.getRealCutStart();
            $scope.duration = playerService.getCutDuration();

            // Media is cut and was waiting for the real media duration
            if ($scope.isCut) {
              initTimecodes();
              initChapters();
              self.setTime(lastTime);
            }

            // Change value of chapter to get timestamp once video duration is known
            playerService.processChaptersTime($scope.chapters);

            $element.triggerHandler('durationChange', $scope.duration);
          });
          return false;
        });

        // Listen to player play event
        $element.on('ovPlay', function(event) {
          event.stopImmediatePropagation();

          safeApply(function() {
            $scope.mediaDefinitions = $scope.mediaDefinitions || $scope.player.getAvailableDefinitions();
            $scope.selectedDefinition = $scope.selectedDefinition ||
                    ($scope.mediaDefinitions && $scope.mediaDefinitions[$scope.mediaDefinitions.length - 1]) ||
                    null;
            $scope.ovSettingsIcon = true;
            initAttributes();
            $scope.loading = false;
            $scope.playPauseButton = 'pause';
            $element.triggerHandler('play');
          });
          return false;
        });

        // Listen to player pause event
        $element.on('ovPause', function(event) {
          event.stopImmediatePropagation();

          safeApply(function() {
            $scope.playPauseButton = 'play';
            $element.triggerHandler('pause');
          });
          return false;
        });

        // Listen to player loadProgress event
        $element.on('ovLoadProgress', function(event, data) {
          event.stopImmediatePropagation();

          safeApply(function() {
            $scope.loadedStart = playerService.getCutPercent(data.loadedStart);
            $scope.loadedPercent = playerService.getCutDurationPercent(data.loadedPercent);
            $element.triggerHandler('loadProgress', {
              loadedStart: $scope.loadedStart,
              loadedPercent: $scope.loadedPercent
            });
          });
          return false;
        });

        // Listen to player playProgress event
        $element.on('ovPlayProgress', function(event, data) {
          event.stopImmediatePropagation();

          // Unnecessary playProgress events are sometimes dispatched when initializing the media
          if ($scope.initializing)
            return;

          $scope.loading = false;
          var timecode = findTimecode(data.time);

          var updateTime = function() {
            $scope.time = playerService.getCutTime(data.time);
            $scope.seenPercent = playerService.getCutPercent(data.percent);

            $scope.presentation = timecode !== null &&
                    $scope.timecodesByTime[timecode] ? $scope.timecodesByTime[timecode].image.large : null;

            var timeObject = {
              time: $scope.time,
              percent: $scope.seenPercent
            };
            $element.triggerHandler('playProgress', timeObject);
            var expireDate = new Date();
            expireDate.setDate(expireDate.getDate() + 1);

            if (rememberPosition)
              $cookies.putObject('videoStopped_' + $scope.data.mediaId, timeObject, {expires: expireDate});
          };

          // Media virtual end reached
          if ($scope.duration && playerService.getCutTime(data.time) > playerService.getCutDuration()) {
            $scope.player.setTime(playerService.getRealTime(0));
            if (rememberPosition)
              $cookies.remove('videoStopped_' + $scope.data.mediaId);
            lastTime = 0;
            $scope.player.playPause();
          } else
            safeApply(updateTime);

          return false;
        });

        // Listen to player end event
        $element.on('ovEnd', function(event) {
          event.stopImmediatePropagation();

          safeApply(function() {
            if (rememberPosition)
              $cookies.remove('videoStopped_' + $scope.data.mediaId);
            $scope.time = $scope.seenPercent = 0;
            lastTime = 0;
            $scope.playPauseButton = 'play';

            var timecode = findTimecode($scope.time);
            if (timecode !== null && $scope.timecodes.length)
              $scope.presentation =
                    $scope.timecodesByTime[timecode] ? $scope.timecodesByTime[timecode].image.large : null;

            // Media is cut
            // Return to the cut start edge
            if ($scope.isCut)
              $scope.player.setTime(playerService.getRealTime(0));

            $element.triggerHandler('end');
          });

          return false;
        });

        // Listen to player error event
        $element.on('ovError', function(event, code) {
          safeApply(function() {
            $scope.loading = false;
            $scope.initializing = false;

            switch (code) {
              case ovPlayerErrors.MEDIA_ERR_NO_SOURCE:
                $scope.error = $filter('ovTranslate')('MEDIA_NO_SOURCE');
                break;
              case ovPlayerErrors.MEDIA_ERR_NETWORK:
                $scope.error = $filter('ovTranslate')('MEDIA_ERR_NETWORK');
                break;
              case ovPlayerErrors.MEDIA_ERR_DECODE:
                $scope.error = $filter('ovTranslate')('MEDIA_ERR_DECODE');
                break;
              case ovPlayerErrors.MEDIA_ERR_SRC_NOT_SUPPORTED:
                $scope.error = $filter('ovTranslate')('MEDIA_ERR_SRC_NOT_SUPPORTED');
                break;
              case ovPlayerErrors.MEDIA_ERR_PERMISSION:
                $scope.error = $filter('ovTranslate')('MEDIA_ERR_PERMISSION');
                break;
              default:
                $scope.error = $filter('ovTranslate')('MEDIA_ERR_DEFAULT');
                break;
            }

            $element.triggerHandler('error', {code: code, message: $scope.error});
          });
        });
      }]
    };
  }

  app.directive('ovPlayer', ovPlayer);
  ovPlayer.$inject = [
    '$injector',
    '$document',
    '$sce',
    '$filter',
    '$timeout',
    'PlayerService',
    'i18nPlayerService',
    '$cookies',
    'ovPlayerErrors'
  ];

})(angular, angular.module('ov.player'));

'use strict';

(function(app) {

  /**
   * Defines a player service factory to manipulate a media in a playing context.
   *
   * Media is not only a media file but also timecodes (slides), chapters and
   * eventually a virtual cut with a start and end edge to display present only
   * small part of the video.
   * PlayerService helps dealing with cut edges, its helps synchronize information
   * returned from the player to apply it to the cut range.
   * Term "real" is relative to the full video (wihtout cut edges).
   *
   * @module ov.player
   * @class PlayerService
   */
  function PlayerService() {
    this.media = null;
    this.cutStart = 0;
    this.cutEnd = null;
    this.realMediaDuration = null;
    this.isCut = false;
  }

  /**
   * Gets cut start edge in milliseconds.
   *
   * The beginning of the media can be virtually cut, thus the start time may be
   * not 0 but a virtual start.
   *
   * @method getRealCutStart
   * @return {Number} The start time in milliseconds according to the cut
   */
  PlayerService.prototype.getRealCutStart = function() {
    if (this.realMediaDuration)
      return (this.cutStart) ? this.realMediaDuration * this.cutStart : 0;

    return 0;
  };

  /**
   * Gets cut end edge in milliseconds.
   *
   * The media can be virtually cut, thus the end time may not be the media
   * duration but a virtual end time.
   *
   * @method getRealCutEnd
   * @return {Number} The end time in milliseconds according to the cut
   */
  PlayerService.prototype.getRealCutEnd = function() {
    if (this.realMediaDuration)
      return (this.cutEnd) ? this.realMediaDuration * this.cutEnd : this.realMediaDuration;

    return 0;
  };

  /**
   * Gets the real time based on the time relative to the cut media.
   *
   * @method getRealTime
   * @param {Number} time Time in milliseconds relative to the cut media
   * @return {Number} time Time in milliseconds relative to the full media
   */
  PlayerService.prototype.getRealTime = function(time) {
    return time + this.getRealCutStart();
  };

  /**
   * Gets the cut time based on the real time (relative to the full media).
   *
   * @method getCutTime
   * @param {Number} time Time in milliseconds relative to the full media
   * @return {Number} Time in milliseconds relative to the cut media
   */
  PlayerService.prototype.getCutTime = function(time) {
    return Math.max(time - this.getRealCutStart(), 0);
  };

  /**
   * Sets player media.
   *
   * @method setMedia
   * @param {Object} newMedia The media object
   */
  PlayerService.prototype.setMedia = function(newMedia) {
    this.media = newMedia;
    this.isCut = this.media.cut && this.media.cut.length;

    // Media is cut
    if (this.isCut) {

      // Retrive cut edges (start and end)
      for (var i = 0; i < this.media.cut.length; i++) {
        if (this.media.cut[i].type === 'begin')
          this.cutStart = Math.max(this.media.cut[i].value, 0);
        else if (this.media.cut[i].type === 'end')
          this.cutEnd = Math.min(this.media.cut[i].value, 1);
      }

      // Media duration can't be equal to 0
      if (this.cutStart === this.cutEnd) {
        this.cutStart = 0;
        this.cutEnd = null;
      }

    } else {
      this.cutStart = 0;
      this.cutEnd = null;
    }

  };

  /**
   * Gets media timecodes.
   *
   * Only timecodes within the cut range are returned.
   *
   * @method getMediaTimecodes
   * @return {Array} The list of media timecodes
   */
  PlayerService.prototype.getMediaTimecodes = function() {

    // Media is cut
    if (this.isCut && this.realMediaDuration && this.media.timecodes) {
      var filteredTimecodes = [];
      var realCutStart = this.getRealCutStart();
      var realCutEnd = this.getRealCutEnd();

      // Filter timecodes depending on cut edges
      // Timecodes not in the range [startCut - endCut] must be removed
      for (var i = 0; i < this.media.timecodes.length; i++) {
        var timecode = this.media.timecodes[i].timecode;

        if (timecode >= realCutStart && timecode <= realCutEnd)
          filteredTimecodes.push(this.media.timecodes[i]);
      }

      return filteredTimecodes;
    }

    return this.media.timecodes;
  };

  /**
   * Gets media timecodes ordered by time.
   *
   * Index timecodes by time to avoid parsing the whole array several times.
   *
   * @method getMediaTimecodesByTime
   * @return {Object} The list of media timecodes ordered by time
   */
  PlayerService.prototype.getMediaTimecodesByTime = function() {
    var timecodesByTime = {};
    var timecodes = this.getMediaTimecodes();
    if (timecodes) {

      for (var i = 0; i < timecodes.length; i++) {
        var timecode = timecodes[i];
        timecodesByTime[timecode.timecode] = {
          image: {
            small: timecode.image.small,
            large: timecode.image.large
          }
        };
      }

    }
    return timecodesByTime;
  };

  /**
   * Gets the list of chapters.
   *
   * Only chapters within the cut range are returned.
   *
   * @method getMediaChapters
   * @return {Object} The media chapter
   */
  PlayerService.prototype.getMediaChapters = function() {

    // Media is cut
    if (this.isCut && this.realMediaDuration && this.media.chapters) {
      var filteredChapters = [];
      var realCutStart = this.getRealCutStart();
      var realCutEnd = this.getRealCutEnd();

      // Filter chapters depending on cut edges
      // Chapters not in the range [startCut - endCut] must be removed
      for (var i = 0; i < this.media.chapters.length; i++) {
        var timecode = this.realMediaDuration * this.media.chapters[i].value;

        if (timecode > realCutStart && timecode < realCutEnd)
          filteredChapters.push(this.media.chapters[i]);
      }
      return filteredChapters;
    }
    return this.media.chapters;
  };

  /**
   * Change a list of chapters which value is a percent in a timestamp value according to media duration
   * @param {Array} chapters chapters array to modify from percent to timestamp
   * @param {int} mediaDuration media original duration in ms
   */
  PlayerService.prototype.processChaptersTime = function(chapters) {
    for (var i = 0; i < chapters.length; i++) {
      chapters[i].value = (chapters[i].value * this.realMediaDuration) -
                          Math.floor(this.cutStart * this.realMediaDuration);
    }
  };

  /**
   * Gets media virtual duration according to cut.
   *
   * The beginning and the end of the media can be virtually cut, thus
   * the duration is not systematically the real duration of the media but
   * can be a virtual duration.
   *
   * @method getCutDuration
   * @return {Number} The duration in milliseconds according to the cut
   */
  PlayerService.prototype.getCutDuration = function() {
    if (this.realMediaDuration) {
      var end = this.getRealCutEnd();
      var start = this.getRealCutStart();
      return end - start;
    }
    return 0;
  };

  /**
   * Converts a time percentage relative to the full media into a percentage relative
   * to the cut media.
   *
   * @method getCutPercent
   * @param {Number} percent The percentage of the video corresponding to
   * beginning of the loaded data (from 0 to 100)
   * @return {Number} The percentage of the video corresponding to
   * beginning of the loaded data (from 0 to 100)
   */
  PlayerService.prototype.getCutPercent = function(percent) {
    if (this.realMediaDuration) {
      var time = this.realMediaDuration * (percent / 100);
      return Math.min(Math.max(((time - this.getRealCutStart()) / this.getCutDuration()) * 100, 0), 100);
    }
    return percent;
  };

  /**
   * Converts a duration percentage relative to the full media into a percentage relative
   * to the cut media.
   *
   * @method getCutDurationPercent
   * @param {Number} percent The duration percentage of the video (from 0 to 100)
   * @return {Number} The duration percentage of the video (from 0 to 100)
   */
  PlayerService.prototype.getCutDurationPercent = function(percent) {
    if (this.realMediaDuration) {
      var time = this.realMediaDuration * (percent / 100);
      return Math.min(Math.max((time / this.getCutDuration()) * 100, 0), 100);
    }
    return percent;
  };

  /**
   * Sets real media duration.
   *
   * @method setRealMediaDuration
   * @param {Number} duration Real media duration in milliseconds
   */
  PlayerService.prototype.setRealMediaDuration = function(duration) {
    this.realMediaDuration = duration;
  };

  app.value('PlayerService', PlayerService);

})(angular.module('ov.player'));

'use strict';

(function(app) {

  /**
   * Creates a new Angular directive as HTML element ov-tabs to be able to manage a list of
   * views (ov-view elements) and switch between them using tabs.
   * ov-tabs element does not have any attributes.
   * It requires ovPlayerDirectory global variable to be defined and have
   * a value corresponding to the path of the openVeo Player
   * root directory.
   *
   * e.g.
   * <ov-tabs>
   *  <ov-view title="Tab 1 title">
   *    Content of the first view
   *  </ov-view>
   *  <ov-view title="Tab 2 title">
   *    Content of the second view
   *  </ov-view>
   * </ov-tabs>
   *
   * @module ov.player
   * @class ovTabs
   */
  function ovTabs() {
    return {
      restrict: 'E',
      templateUrl: ovPlayerDirectory + 'templates/tabs.html',
      scope: {},
      transclude: true,
      controller: ['$scope', '$filter', function($scope, $filter) {
        $scope.views = [];

        /**
         * Selects a view.
         *
         * @param {Object} view The ovView to select
         */
        $scope.select = function(view) {
          angular.forEach($scope.views, function(view) {
            view.selected = false;
          });
          view.selected = true;
        };

        /**
         * Selects a tab.
         *
         * @method selectTabs
         * @param {String} viewId The id of the view to select
         */
        this.selectTabs = function(viewId) {
          var view = $filter('filter')($scope.views, {
            viewId: viewId
          },
          true);
          if (view.length != 0)
            $scope.select(view[0]);
        };

        /**
         * Add the scope of an ovView directive to the list of tabs.
         *
         * @method addView
         * @param {Object} view The ovView to add to tabs
         */
        this.addView = function(view) {
          if (!$scope.views.length)
            $scope.select(view);

          $scope.views.push(view);
        };

      }]
    };
  }

  app.directive('ovTabs', ovTabs);

})(angular.module('ov.player'));

'use strict';

(function(app) {

  /**
   * Creates a filter to convert a time in milliseconds to
   * an hours:minutes:seconds format.
   *
   * e.g.
   * {{60000 | millisecondsToTime}} // 01:00
   * {{3600000 | millisecondsToTime}} // 01:00:00
   *
   * @module ov.player
   * @class millisecondsToTime
   */
  function MillisecondsToTime() {
    return function(time) {
      if (time < 0 || isNaN(time))
        return '';

      time = parseInt(time);

      var seconds = parseInt((time / 1000) % 60);
      var minutes = parseInt((time / (60000)) % 60);
      var hours = parseInt((time / (3600000)) % 24);

      hours = (hours < 10) ? '0' + hours : hours;
      minutes = (minutes < 10) ? '0' + minutes : minutes;
      seconds = (seconds < 10) ? '0' + seconds : seconds;

      return ((hours !== '00') ? hours + ':' : '') + minutes + ':' + seconds;
    };
  }

  app.filter('millisecondsToTime', MillisecondsToTime);

})(angular.module('ov.player'));

'use strict';

(function(app) {

  /**
   * Creates a new Angular directive as HTML element ov-view to be able to group HTML elements
   * which will be added to an ov-tabs element.
   * It requires ovPlayerDirectory global variable to be defined and have
   * a value corresponding to the path of the openVeo Player
   * root directory.
   *
   * Available attributes are :
   *  - String title The title that will be display in the tab
   *    corresponding to the view
   *  - String view A CSS class that will be added to the main container
   *    of the view
   *
   * e.g.
   * <ov-tabs>
   *  <ov-view title="Tab 1 title" view="view-1">
   *    Content of the first view
   *  </ov-view>
   *  <ov-view title="Tab 2 title" view="view-2">
   *    Content of the second view
   *  </ov-view>
   * </ov-tabs>
   *
   * @module ov.player
   * @class ovView
   */
  function ovView(ovViewLink) {
    return {
      restrict: 'E',
      require: '^ovTabs',
      transclude: true,
      templateUrl: ovPlayerDirectory + 'templates/view.html',
      scope: {
        title: '@',
        view: '@',
        viewId: '@'
      },
      link: ovViewLink
    };
  }

  app.factory('ovViewLink', function() {
    return function(scope, element, attrs, tabsController) {
      tabsController.addView(scope);
    };
  });

  app.directive('ovView', ovView);
  ovView.$inject = ['ovViewLink'];

})(angular.module('ov.player'));

'use strict';

(function(app) {

  /**
   * Defines a filter to translate an id, contained inside a dictionary of translations,
   * into the appropriated text.
   *
   * @module ov.player
   * @class TranslateFilter
   */
  function TranslateFilter(i18nPlayerService) {

    /**
     * Translates an id into the appropriated text.
     *
     * @method translate
     * @param {String} id The id of the translation
     * @return {String} The translated string
     */
    return function(id) {
      return i18nPlayerService.translate(id);
    };

  }

  app.filter('ovTranslate', TranslateFilter);
  TranslateFilter.$inject = ['i18nPlayerService'];

})(angular.module('ov.player'));

'use strict';

(function(angular, app) {

  /**
   * Defines an internationalization service to manage string translations.
   *
   * @module ov.player
   * @class I18nService
   */
  function I18nService(i18nTranslations) {
    var currentLanguage = navigator.language || navigator.browserLanguage;

    /**
     * Tests if a language is supported.
     *
     * @method isLanguageSupported
     * @param {String} language The language code to test (e.g en-CA)
     * @return {Boolean} true if supported, false otherwise
     */
    function isLanguageSupported(language) {
      return Object.keys(i18nTranslations).indexOf(language) >= 0;
    }

    /**
     * Sets current language.
     *
     * @method setLanguage
     * @param {String} language The current language country code (e.g en-CA)
     */
    function setLanguage(language) {
      if (isLanguageSupported(language))
        currentLanguage = language;
      else
        currentLanguage = 'en';
    }

    /**
     * Gets current language.
     *
     * @method getLanguage
     * @return {String} The current language country code (e.g en-US)
     */
    function getLanguage() {
      return currentLanguage;
    }

    /**
     * Translates the given id using current language.
     *
     * @method translate
     * @param {String} id The id of the translation
     * @return {String} The translated string
     */
    function translate(id) {
      var translatedText = (i18nTranslations[currentLanguage] && i18nTranslations[currentLanguage][id]) || id;

      // Translation does not exist
      // Use english language as default
      if (translatedText === id)
        translatedText = i18nTranslations['en'][id] || id;

      return translatedText;
    }

    return {
      translate: translate,
      isLanguageSupported: isLanguageSupported,
      setLanguage: setLanguage,
      getLanguage: getLanguage
    };

  }

  app.service('i18nPlayerService', I18nService);
  I18nService.$inject = ['i18nTranslations'];

})(angular, angular.module('ov.player'));

'use strict';

(function(angular, app) {

  /**
   * Creates an HTML player factory which observes OvPlayer interface.
   * More information on HTML player
   * at http://www.w3.org/TR/html5/embedded-content-0.html.
   *
   * @module ov.player
   * @class OvHTMLPlayer
   */
  function OvHTMLPlayer(OvPlayer, $window, $document, $sce) {

    /**
     * Handles all player media events.
     *
     * @param {Event} event The received event
     */
    function handlePlayerEvents(event) {

      // Events
      switch (event.type) {

        // Fetching metadata
        case 'progress':

          // Got buffering information
          // Caution, the progress event maybe dispatched event if buffer
          // is empty
          var buffer = this.player.buffered();
          if (buffer.length >= 1) {
            var loadedStart = (this.player.currentTime() / this.player.duration());
            this.jPlayerElement.triggerHandler('ovLoadProgress', {
              loadedStart: Math.max(0, Math.min(loadedStart, 1)) * 100,
              loadedPercent: this.player.bufferedPercent() * 100
            });
          }
          break;

        // The duration attribute has just been updated
        case 'durationchange':
          var duration = this.player.duration() || this.media.metadata && this.media.metadata.duration;
          this.jPlayerElement.triggerHandler('ovDurationChange', duration * 1000);
          break;

        // Ready to render the media data at the current playback position
        // for the first time
        case 'loadeddata':
          this.loaded = true;
          this.jPlayerElement.triggerHandler('ovReady');
          break;

        // Media is no longer paused
        case 'play':
          this.jPlayerElement.triggerHandler('ovPlay');
          break;

        // Media has been paused
        case 'pause':
          this.jPlayerElement.triggerHandler('ovPause');
          break;

        // Media playback has reached the end
        case 'ended':
          this.jPlayerElement.triggerHandler('ovEnd');
          break;

        // Media playback has stopped because the next frame is not available
        case 'waiting':
          this.jPlayerElement.triggerHandler('ovWaiting');
          break;

        // Media playback is ready to start after being paused or delayed
        // due to lack of media data
        case 'playing':
          this.jPlayerElement.triggerHandler('ovPlaying');
          break;

        // Media playback position has changed
        case 'timeupdate':
          var current_time = this.player.currentTime();
          var playedPercent = (current_time / this.player.duration()) * 100;
          this.jPlayerElement.triggerHandler('ovPlayProgress', {
            time: current_time * 1000,
            percent: playedPercent
          });
          break;

        // Media error
        case 'error':
          if (this.player.networkState() == this.player.NETWORK_NO_SOURCE) {
            event.target.error = {code: 'NO_SOURCE', MEDIA_NO_SOURCE: 'NO_SOURCE'};
          }
          this.jPlayerElement.triggerHandler('error', event.target.error.code);
          break;

        default:
          break;
      }
    }

    // All HTML player events
    var events = [
      'loadeddata',
      'progress',
      'playing',
      'waiting',
      'ended',
      'durationchange',
      'loadedmetadata',
      'timeupdate',
      'play',
      'pause',
      'error'
    ];

    /**
     * Creates a new HTMLPlayer.
     *
     * @constructor
     * @extends Player
     * @param Object jPlayerElement The JQLite HTML element corresponding
     * to the element which will receive events dispatched by the player
     * @param Object media Details about the media
     *   {
     *     mediaId : "136081112", // The id of the media
     *     sources : {
     *       adaptive : [
     *         {
     *          link : 'http://streaming/platform/mp4:video.mp4/manifest.mpd'
     *          mimeType : 'application/dash+xml'
     *         },
     *         {
     *          link : 'http://streaming/platform/mp4:video.mp4/playlist.m3u8'
     *          mimeType : 'application/x-mpegURL'
     *         },
     *         ...
     *       ],
     *       files : [ // The list of media files (required for "html" player)
     *         {
     *           width : 640, // Media width for this file
     *           height : 360, // Media height for this file
     *           link : "https://player.vimeo.com/external/136081112.sd.mp4" // Media url
     *         },
     *         {
     *           width : 1280, // Media width for this file
     *           height : 720, // Media height for this file
     *           link : "https://player.vimeo.com/external/136081112.hd.mp4" // Media url
     *         },
     *         ...
     *       ]
     *     },
     *     thumbnail : "/1439286245225/thumbnail.jpg" // The media thumbnail (only for "html" player)
     *   }
     */
    function HTMLPlayer(jPlayerElement, media) {
      OvPlayer.prototype.init.call(this, jPlayerElement, media);

      // Order media definitions from better quality to lower quality
      if (this.media.sources.files)
        this.media.sources.files.sort(function(def1, def2) {
          if (def1.height < def2.height)
            return 1;

          return -1;
        });
    }

    HTMLPlayer.prototype = new OvPlayer();
    HTMLPlayer.prototype.constructor = HTMLPlayer;

    /**
     * Gets media sources.
     *
     * If definitions are not available, so video sources are adaptive
     *
     * @method getMediaSources
     * @param {Object} definition Media definition object
     * @return String The media sources
     */
    HTMLPlayer.prototype.getMediaSources = function(definition) {

      if (!definition)
        return this.media.sources.adaptive.map(
                function(obj) {
                  var rObj = {};
                  rObj['link'] = $sce.trustAsResourceUrl(obj.link);
                  rObj['mimeType'] = obj.mimeType;
                  return rObj;
                }
        );

      return [{link: $sce.trustAsResourceUrl(definition.link), mimeType: 'video/mp4'}];
    };

    /**
     * Gets media thumbnail.
     * Get the higher thumbnail quality.
     *
     * @method getMediaThumbnail
     * @return String The media thumbnail url
     */
    HTMLPlayer.prototype.getMediaThumbnail = function() {
      return this.media.thumbnail;
    };

    /**
     * Inititializes the player when DOM is loaded.
     *
     * Retrieves player HTML element and attach listeners to it to be able
     * to receive media events.
     *
     * @method initialize
     */
    HTMLPlayer.prototype.initialize = function() {
      var self = this;
      this.loaded = false;

      this.player = videojs(this.playerId,
        {
          techOrder: ['html5', 'flash'],
          autoplay: false,
          preload: 'auto'
        },
        function() {
          self.handlePlayerEventsFn = angular.bind(self, handlePlayerEvents);

          // Set media events listeners
          for (var i = 0; i < events.length; i++)
            this.on(events[i], self.handlePlayerEventsFn);

          // Start loading media
          if (!this.error_)
            self.load();
        }
       );
    };

    /**
     * Starts loading current media.
     *
     * @method load
     */
    HTMLPlayer.prototype.load = function() {
      this.player.load();
    };

    /**
     * Tests if player actual state is pause.
     *
     * @method isPaused
     * @return {Boolean} true if paused, false otherwise
     */
    HTMLPlayer.prototype.isPaused = function() {
      return this.player.paused();
    };

    /**
     * Plays or pauses the media depending on media actual state.
     *
     * @method playPause
     */
    HTMLPlayer.prototype.playPause = function() {
      if (this.player.paused() || this.player.ended())
        this.player.play();
      else
        this.player.pause();
    };

    /**
     * Sets volume.
     *
     * @method setVolume
     * @param Number volume The new volume from 0 to 100.
     */
    HTMLPlayer.prototype.setVolume = function(volume) {
      this.player.volume(volume / 100);
    };

    /**
     * Sets time.
     *
     * @method setTime
     * @param Number time The time to seek to in milliseconds
     */
    HTMLPlayer.prototype.setTime = function(time) {
      time = parseInt(time) || 0.1;
      this.player.currentTime(time / 1000);
    };

    /**
     * Gets player type.
     *
     * @method getPlayerType
     * @return {String} "html"
     */
    HTMLPlayer.prototype.getPlayerType = function() {
      return 'html';
    };

    /**
     * Gets media definitions.
     *
     * Files definition array is send if there is no adaptive sources
     *
     * @method getAvailableDefinitions
     * @return {Array} The list of available media definitions
     */
    HTMLPlayer.prototype.getAvailableDefinitions = function() {
      return !this.media.sources.adaptive || this.media.sources.adaptive.length == 0 ? this.media.sources.files : null;
    };

    /**
     * Destroys the player.
     *
     * Remove all events listeners.
     *
     * @method destroy
     */
    HTMLPlayer.prototype.destroy = function() {
      this.handlePlayerEventsFn = angular.bind(this, handlePlayerEvents);
      var jPlayer = angular.element(this.player);

      for (var i = 0; i < events.length; i++)
        jPlayer.off(events[i], this.handlePlayerEventsFn);

      this.loaded = false;
      this.player.dispose();
      this.player = null;
    };

    return HTMLPlayer;
  }

  app.factory('OvHTMLPlayer', OvHTMLPlayer);
  OvHTMLPlayer.$inject = ['OvPlayer', '$window', '$document', '$sce'];

})(angular, angular.module('ov.player'));

'use strict';

(function(angular, app) {

  /**
   * Creates a Vimeo player factory which observes OvPlayer interface.
   * More information on Vimeo player can be found
   * at https://developer.vimeo.com/player.
   * The Vimeo embeded player exposes a JavaSript API to interact with
   * (https://developer.vimeo.com/player/js-api).
   *
   * @module ov.player
   * @class OvVimeoPlayer
   */
  function OvVimeoPlayer(OvPlayer, $window, $document, $sce) {

    /**
     * Sends a post message to the player with the action and the value.
     *
     * @param String action The action to perform (see
     * https://developer.vimeo.com/player/js-api)
     * @param String The value associated to the action
     */
    function postActionToPlayer(action, value) {
      if (this.loaded) {
        var data = {
          method: action
        };

        if (value)
          data.value = value;

        return this.player.contentWindow.postMessage(JSON.stringify(data), this.postMessageTargetOrigin);
      }

      return null;
    }

    /**
     * Handles ready event to fully initialize the player.
     * Register event listeners to the player and retrieve the vimeo
     * iframe corresponding to the player.
     */
    function handleReady() {
      this.postMessageTargetOrigin = 'https://player.vimeo.com/video/' + this.media.mediaId;
      this.player = $document[0].getElementById(this.playerId);
      this.loaded = true;
      this.playing = 0;

      // Register event listeners
      postActionToPlayer.call(this, 'addEventListener', 'loadProgress');
      postActionToPlayer.call(this, 'addEventListener', 'playProgress');
      postActionToPlayer.call(this, 'addEventListener', 'play');
      postActionToPlayer.call(this, 'addEventListener', 'pause');
      postActionToPlayer.call(this, 'addEventListener', 'finish');
    }

    /**
     * Handles all player post messages.
     *
     * @param {MessageEvent|Event} event The post message
     * @param {Object} data If post messages are not implemented, a simple
     * event can by used with data as second parameter instead of data
     * inside the MessageEvent object (event.data)
     */
    function handlePlayerEvents(event, data) {
      data = event.data ? JSON.parse(event.data) : data;

      // Do not handle other player events
      if (data.player_id === this.playerId) {

        // Events
        switch (data.event) {

          // Player is ready to accept commands
          case 'ready':
            handleReady.call(this);
            postActionToPlayer.call(this, 'getDuration');
            this.jPlayerElement.triggerHandler('ovReady');
            break;

            // Media is loading
          case 'loadProgress':

            // No indication about the playback position of the loading
            // percentage, assume it to be 0
            this.jPlayerElement.triggerHandler('ovLoadProgress', {
              loadedStart: 0,
              loadedPercent: data.data.percent * 100
            });

            break;

            // Media is playing
          case 'playProgress':

            // In Internet Explorer 11 an extra "playProgress" event
            // is emitted with a percent greater than 1, after the "end"
            // event
            if (data.data.percent <= 1)
              this.jPlayerElement.triggerHandler('ovPlayProgress', {
                time: data.data.seconds * 1000,
                percent: data.data.percent * 100
              });

            break;

            // Media begins to play
          case 'play':
            this.playing = 1;
            this.jPlayerElement.triggerHandler('ovPlay');
            break;

            // Media pauses
          case 'pause':
            this.playing = 0;
            this.jPlayerElement.triggerHandler('ovPause');
            break;

            // Media playback reaches the end
          case 'finish':
            this.playing = 0;
            this.jPlayerElement.triggerHandler('ovEnd');
            break;

          default:
            break;
        }

        // Actions
        switch (data.method) {
          case 'getDuration':
            this.duration = data.value;
            this.jPlayerElement.triggerHandler('ovDurationChange', this.duration * 1000);
            break;

          default:
            return;
        }
      }

    }

    /**
     * Inititializes the player.
     *
     * Vimeo player uses postMessage API to be able to communicate with
     * the player.
     * Before doing anything on the Vimeo player the ready event
     * must be handled.
     */
    function initialize() {
      this.loaded = false;

      // Handle post messages
      this.handlePlayerEventsFn = angular.bind(this, handlePlayerEvents);
      angular.element($window).on('message', this.handlePlayerEventsFn);
    }

    /**
     * Creates a new VimeoPlayer.
     *
     * @constructor
     * @extends Player
     * @param {Object} jPlayerElement The JQLite HTML element corresponding
     * to the element which will receive events dispatched by the player
     * @param {Object} media Details of the media
     *   {
     *     mediaId : "136081112" // The id of the media
     *   }
     */
    function VimeoPlayer(jPlayerElement, media) {
      OvPlayer.prototype.init.call(this, jPlayerElement, media);
      initialize.call(this);
    }

    VimeoPlayer.prototype = new OvPlayer();
    VimeoPlayer.prototype.constructor = VimeoPlayer;

    /**
     * Gets media url.
     *
     * @method getMediaSources
     * @param {Object} definition Media definition object
     * @return {String} The media sources
     */
    VimeoPlayer.prototype.getMediaSources = function(definition) {
      if (definition && definition.link)
        return $sce.trustAsResourceUrl(definition.link);
      else
        return $sce.trustAsResourceUrl('//player.vimeo.com/video/' + this.media.mediaId + '?api=1&player_id=' +
                                       this.playerId);
    };

    /**
     * Gets media thumbnail.
     *
     * No need to manage the thumbnail it is already done by the Vimeo player.
     *
     * @method getMediaThumbnail
     * @return {Null} null
     */
    VimeoPlayer.prototype.getMediaThumbnail = function() {
      return null;
    };

    /**
     * Intitializes the player.
     *
     * Nothing to do, the player is already initialized.
     *
     * @method initialize
     */
    VimeoPlayer.prototype.initialize = function() {
    };

    /**
     * Plays or pauses the media depending on media actual state.
     *
     * @method playPause
     */
    VimeoPlayer.prototype.playPause = function() {
      postActionToPlayer.call(this, this.playing ? 'pause' : 'play');
    };

    /**
     * Sets volume.
     *
     * @method setVolume
     * @param {Number} volume The new volume from 0 to 100.
     */
    VimeoPlayer.prototype.setVolume = function(volume) {
      postActionToPlayer.call(this, 'setVolume', volume / 100);
    };

    /**
     * Sets time.
     *
     * @method setTime
     * @param {Number} time The time to seek to in milliseconds
     */
    VimeoPlayer.prototype.setTime = function(time) {
      time = parseInt(time) || 0;
      postActionToPlayer.call(this, 'seekTo', time / 1000);

      // Send a playProgress event because the Vimeo flash player (old
      // browsers) does not trigger the playProgress event while in pause
      // as the HTML5 player does
      if (!this.playing)
        this.jPlayerElement.triggerHandler('ovPlayProgress', {
          time: time,
          percent: (time / this.duration) * 100
        });
    };

    /**
     * Gets player type.
     *
     * @method getPlayerType
     * @return {String} "vimeo"
     */
    VimeoPlayer.prototype.getPlayerType = function() {
      return 'vimeo';
    };

    /**
     * Gets media definitions.
     *
     * No definitions available for vimeo player, adaptive streaming is managed by vimeo player.
     *
     * @method getAvailableDefinitions
     * @return {Null} null
     */
    VimeoPlayer.prototype.getAvailableDefinitions = function() {
      return null;
    };

    /**
     * Destroys the player.
     *
     * Remove all events listeners.
     *
     * @method destroy
     */
    VimeoPlayer.prototype.destroy = function() {
      angular.element($window).off('message', this.handlePlayerEventsFn);
      this.loaded = false;
      this.playing = 0;
      this.player = null;
    };

    return VimeoPlayer;
  }

  app.factory('OvVimeoPlayer', OvVimeoPlayer);
  OvVimeoPlayer.$inject = ['OvPlayer', '$window', '$document', '$sce'];

})(angular, angular.module('ov.player'));

'use strict';

(function(angular, app) {

  /**
   * Creates a Youtube player factory which observes OvPlayer interface.
   * More information on Youtube player can be found
   * at https://developers.google.com/youtube/v3/docs/.
   * The Youtube embeded player exposes a JavaSript API to interact with
   * (https://developers.google.com/youtube/iframe_api_reference).
   */
  function OvYoutubePlayer(OvPlayer, $window, ovPlayerErrors) {

    /**
     * Handles all player post messages.
     *
     * @param {MessageEvent|Event} event The post message
     * @param {Object} data If post messages are not implemented, a simple
     * event can by used with data as second parameter instead of data
     * inside the MessageEvent object (event.data)
     */
    function handlePlayerEvents(event, data) {
      data = event.data ? JSON.parse(event.data) : data;

      // Events
      switch (data.event) {
        case 'infoDelivery':

          if (data.info.currentTime !== undefined && this.duration)
            this.jPlayerElement.triggerHandler('ovPlayProgress', {
              time: data.info.currentTime * 1000,
              percent: data.info.currentTime / this.duration * 100
            });

          if (data.info.videoLoadedFraction)
            this.jPlayerElement.triggerHandler('ovLoadProgress', {
              loadedStart: 0,
              loadedPercent: data.info.videoLoadedFraction * 100
            });
          break;

        case 'onStateChange':
          if (data.info != YT.PlayerState.PLAYING) {
            this.playing = 0;
            this.jPlayerElement.triggerHandler('ovPause');

            if (data.info == YT.PlayerState.ENDED) {
              this.jPlayerElement.triggerHandler('ovEnd');
            }
          } else {
            this.playing = 1;
            this.jPlayerElement.triggerHandler('ovPlay');

            if (this.requestPause) {
              this.requestPause = false;
              this.player.pauseVideo();
            }

            // As described in Youtube player API the video duration is only available when player have started
            // (https://developers.google.com/youtube/iframe_api_reference#getDuration)
            var duration = this.player.getDuration();
            if (!this.duration && duration) {
              this.duration = duration;
              this.jPlayerElement.triggerHandler('ovDurationChange', this.duration * 1000);
            }

          }
          break;

        default:
          break;
      }
    }

    // All Youtube player events
    var events = [
      'onStateChange',
      'infoDelivery',
      'infoDelivery',
      'onPlaybackQualityChange',
      'loadeddata',
      'progress',
      'playing',
      'ended',
      'timeupdate',
      'error'
    ];

    /**
     * Inititializes the player.
     *
     * Youtube player uses postMessage API to be able to communicate with
     * the player.
     * Before doing anything on the Youtube player the ready event
     * must be handled.
     */
    function initialize() {
      if (this.ressourceLoaded && this.apiLoaded) {

        var self = this;
        this.loaded = false;

        this.player = new YT.Player(this.playerId, {
          playerVars: {
            fs: 0,
            rel: 0,
            autoplay: 0,
            html5: 1,
            theme: 'light',
            modesbranding: 1,
            color: 'white',
            iv_load_policy: 3,
            showinfo: 0,
            controls: 0,
            hl: this.media.language
          },
          events: {
            onReady: function() { // Youtube API is ready to be called
              self.jPlayerElement.triggerHandler('ovReady');

              // Handle post messages
              self.handlePlayerEventsFn = angular.bind(self, handlePlayerEvents);
              angular.element($window).on('message', self.handlePlayerEventsFn);

              // Set media events listeners
              var jPlayer = angular.element(self.player);
              for (var i = 0; i < events.length; i++)
                jPlayer.on(events[i], self.handlePlayerEventsFn);

              self.loaded = true;
              self.playing = 0;
            },
            onError: function(error) {
              switch (error.data) {
                case 100:
                case 101:
                case 150:
                  self.jPlayerElement.triggerHandler('ovError', ovPlayerErrors.MEDIA_ERR_PERMISSION);
                  break;
                default:
                  self.jPlayerElement.triggerHandler('ovError', ovPlayerErrors.MEDIA_ERR_UNKNOWN);
                  break;
              }
            }
          },
          videoId: this.media.mediaId
        });
      }
    }

    /**
     * Creates a new YoutubePlayer.
     *
     * @constructor
     * @extends Player
     * @param {Object} jPlayerElement The JQLite HTML element corresponding
     * to the element which will receive events dispatched by the player
     * @param {Object} media Details of the media
     *   {
     *     mediaId : "136081112" // The id of the media
     *   }
     */
    function YoutubePlayer(jPlayerElement, media) {
      var self = this;
      var youtubeApiScriptId = 'youtube-iframe-api';
      OvPlayer.prototype.init.call(this, jPlayerElement, media);
      this.requestPause = false;

      var tag = document.createElement('script');
      tag.setAttribute('id', youtubeApiScriptId);
      tag.src = 'https://www.youtube.com/iframe_api';

      $window.onYouTubeIframeAPIReady = function() {
        self.apiLoaded = true;
        initialize.call(self);
      };

      // Add youtube API script if not already included
      if (!document.getElementById(youtubeApiScriptId)) {
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        this.apiLoaded = true;
        initialize.call(self);
      }
    }

    YoutubePlayer.prototype = new OvPlayer();
    YoutubePlayer.prototype.constructor = YoutubePlayer;

    /**
     * Gets media sources.
     *
     * Youtube player manages media sources itself, only the definition is exposed. This will set the new player
     * definition.
     *
     * @method getMediaSources
     * @param {Object} definition Media definition object
     * @return {Null} null
     */
    YoutubePlayer.prototype.getMediaSources = function(definition) {
      if (this.player) {
        this.player.setPlaybackQuality(definition);
        this.jPlayerElement.triggerHandler('ovReady');
      }
      return null;
    };

    /**
     * Gets media thumbnail.
     *
     * No need to manage the thumbnail it is already done by the Youtube player.
     *
     * @method getMediaThumbnail
     * @return {Null} null
     */
    YoutubePlayer.prototype.getMediaThumbnail = function() {
      return null;
    };

    /**
     * Intitializes the player.
     *
     * Nothing to do, the player is already initialized.
     *
     * @method initialize
     */
    YoutubePlayer.prototype.initialize = function() {
      this.ressourceLoaded = true;
      initialize.call(this);
    };

    /**
     * Plays or pauses the media depending on media actual state.
     *
     * @method playPause
     */
    YoutubePlayer.prototype.playPause = function() {
      if (this.playing)
        this.player.pauseVideo();
      else {
        this.requestPause = false;
        this.player.playVideo();
      }
    };

    /**
     * Sets volume.
     *
     * @method setVolume
     * @param {Number} volume The new volume from 0 to 100.
     */
    YoutubePlayer.prototype.setVolume = function(volume) {
      this.player.setVolume(volume);
    };

    /**
     * Sets time.
     *
     * @method setTime
     * @param {Number} time The time to seek to in milliseconds
     */
    YoutubePlayer.prototype.setTime = function(time) {
      var playerState = this.player.getPlayerState();
      time = parseInt(time) || 0;

      // Youtube workaround to deactivate autoplay.
      // Youtube seekTo method autoplay the video even if the video is in cued state with autoplay deactivated
      // as described in Youtube player API (https://developers.google.com/youtube/iframe_api_reference#seekTo).
      // Thus, if the video is in cued state, we have to wait for the video to start and then make a pause to have
      // the excpected behavior.
      if (!this.playing && playerState === YT.PlayerState.CUED)
        this.requestPause = true;

      this.player.seekTo(time / 1000, true);

      // Send a playProgress event because the Youtube flash player (old
      // browsers) does not trigger the playProgress event while in pause
      // as the HTML5 player does
      if (!this.playing)
        this.jPlayerElement.triggerHandler('ovPlayProgress', {
          time: time,
          percent: (time / this.duration) * 100
        });
    };

    /**
     * Gets player type.
     *
     * @method getPlayerType
     * @return {String} "youtube"
     */
    YoutubePlayer.prototype.getPlayerType = function() {
      return 'youtube';
    };

    /**
     * Tests if player actual state is pause.
     *
     * @method isPaused
     * @return {Boolean} true if paused, false otherwise
     */
    YoutubePlayer.prototype.isPaused = function() {
      return this.player.getPlayerState() != YT.PlayerState.PAUSED;
    };

    /**
     * Loads player.
     *
     * Nothing to do, load is made by getMediaUrl method...
     *
     * @method load
     */
    YoutubePlayer.prototype.load = function() {
    };

    /**
     * Gets media definitions.
     *
     * No definitions available for youtube player, adaptive streaming is managed by youtube player.
     *
     * @method getAvailableDefinitions
     * @return {Array} The list of available definitions
     */
    YoutubePlayer.prototype.getAvailableDefinitions = function() {
      var definitions;
      if (this.player) {
        definitions = this.player.getAvailableQualityLevels();
      }
      return definitions;
    };

    /**
     * Destroys the player.
     *
     * Remove all events listeners.
     *
     * @method destroy
     */
    YoutubePlayer.prototype.destroy = function() {
      angular.element($window).off('message', this.handlePlayerEventsFn);
      this.player.destroy();
      this.loaded = false;
      this.playing = 0;
      this.player = null;
    };

    return YoutubePlayer;
  }

  app.factory('OvYoutubePlayer', OvYoutubePlayer);
  OvYoutubePlayer.$inject = ['OvPlayer', '$window', 'ovPlayerErrors'];

})(angular, angular.module('ov.player'));
