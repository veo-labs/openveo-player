/* openveo-player v1.0.1 */
'use strict';

(function(angular) {

  /**
   * Creates the ov.player module.
   * ov.player offers a directive to easily create a player with
   * associated presentation images. All you have to do is use the
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
   *  - String ov-player-type The type of player to use to play the media. It
   *    can be either :
   *      - html : To play the media using HTML player
   *    If no player type is provided, ov-player will figure out which player
   *    to use depending on the media type.
   *  - Boolean ov-fullscreen-icon true to display the
   *    enlarge/reduce icon (CAUTION : It must be an assignable variable)
   *  - Boolean ov-volume-icon true to display the volume icon
   *    (CAUTION : It must be an assignable variable)
   *  - Boolean ov-mode-icon true to display the display mode icon
   *    (CAUTION : It must be an assignable variable)
   *  - Boolean ov-time true to display the actual time and duration
   *    (CAUTION : It must be an assignable variable)
   *  - Boolean ov-full-viewport true to display the player in
   *    full viewport (CAUTION : It must be an assignable variable)
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
   *   ov-fullscreen-icon="displayFullscreenIcon"
   *   ov-volume="displayVolumeIcon"
   *   ov-mode="displayModeIcon"
   *   ov-time="displayTime"
   *   ov-full-viewport="fullViewport"
   *   ov-player-type="html"
   *   ov-language="fr"
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
   * Controlling the player :
   * You can control the player with some basic actions
   * - selectMode To select the display mode (can be 'media', 'both',
   *   'both-presentation' or 'presentation')
   * - playPause To start / stop the media
   * - setVolume To change player's volume
   * - setTime To seek media to a specific time
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
   */
  var app = angular.module('ov.player', []);

  if (typeof ovPlayerDirectory === 'undefined' || typeof ovPlayerDirectory !== 'string')
    throw new Error('ovPlayerDirectory global variable must be defined and set to the root path of the openVeo player');

  // Player translations
  app.constant('i18nTranslations', {
    en: {
      VIDEO_TAB_TITLE: 'Video',
      INDEX_TAB_TITLE: 'Index',
      CHAPTERS_TAB_TITLE: 'Chapters',
      LOADING: 'Loading...'
    },
    fr: {
      VIDEO_TAB_TITLE: 'Vidéo',
      INDEX_TAB_TITLE: 'Index',
      CHAPTERS_TAB_TITLE: 'Chapitres',
      LOADING: 'Chargement...'
    }
  });

})(angular);

'use strict';

(function(app) {

  /**
   * Creates a new HTML element ov-index to create an openVeo player
   * index, with a list of presentation slides.
   * It requires ovPlayerDirectory global variable to be defined and have
   * a value corresponding to the path of the openVeo Player
   * root directory.
   *
   * e.g.
   * <ov-index></ov-index>
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

      // toggle chapter
      scope.open = function(chapter) {
        if (chapter.description && chapter.description != '') {
          if (!chapter.isOpen)
            angular.forEach(scope.chapters, function(value) {
              value.isOpen = false;
            });
          chapter.isOpen = !chapter.isOpen;
        }
      };

      /**
       * Seeks media to the given timecode.
       * @param Number timecode The timecode to seek to
       */
      scope.goToTimecode = function(time) {
        var playerCtrl = controllers[0],
          tabsCtrl = controllers[1];
        if (time <= 1)
          playerCtrl.setTime(time * scope.duration);
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
   * Creates a new HTML element ov-index to create an openVeo player
   * index, with a list of presentation slides.
   * It requires ovPlayerDirectory global variable to be defined and have
   * a value corresponding to the path of the openVeo Player
   * root directory.
   *
   * e.g.
   * <ov-index></ov-index>
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
       * @param Number timecode The timecode (in milliseconds)
       */
      scope.setImagePreview = function(timecode) {
        scope.imagePreview = scope.timecodesByTime[timecode].image.large;
      };

      /**
       * Seeks media to the given timecode.
       * @param Number timecode The timecode to seek to
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
   * Defines a service describing a player.
   * All players must implements the methods of this object.
   * All events are dispatched to the given jPlayerElement.
   * The following events are emitted by the player :
   *  - "play" : Player starts playing
   *  - "pause" : Player pauses
   *  - "loadProgress" : Player is buffering
   *  - "playProgress" : Player is playing
   *  - "ready" : Player is ready to play the media
   *  - "durationChange" : Media duration has changed
   *  - "end" : Media has reached the end
   *  - "waiting" : Media is waiting for buffering
   *  - "playing" : Media is ready to play after buffering
   *
   * e.g.
   *
   * // Get an instance of the OvVimeoPlayer
   * // (which extends OvPlayer)
   * var OvVimeoPlayer = $injector.get("OvVimeoPlayer");
   * var player = new OvVimeoPlayer(element, "player_id", "118786909");
   *
   * // Listen to "ready" event
   * element.on("ready", function(event){
   *   console.log("Player is ready");
   * });
   *
   * // Listen to "waiting" event
   * element.on("waiting", function(event){
   *   console.log("Player is buffering");
   * });
   *
   * // Listen to "playing" event
   * element.on("playing", function(event){
   *   console.log("Player has stopped buffering and can play");
   * });
   *
   * // Listen to "durationChange" event
   * element.on("durationChange", function(event, duration){
   *   console.log("Media duration " + duration);
   * });
   *
   * // Listen to "play" event
   * element.on("play", function(event){
   *   console.log("Player is playing");
   * });
   *
   * // Listen to "pause" event
   * element.on("pause", function(event){
   *   console.log("Player is in pause");
   * });
   *
   * // Listen to "loadProgress" event
   * element.on("loadProgress", function(event, data){
   *   console.log("Loading started at" + data.loadedStart + " percents of the media");
   *   console.log(data.loadedPercent + " percents of the media loaded");
   * });
   *
   * // Listen to "playProgress" event
   * element.on("playProgress", function(event, data){
   *   console.log("Actual time " + data.time);
   *   console.log(data.percent + " percents of the media played");
   * });
   *
   * // Listen to "end" event
   * element.on("end", function(event){
   *   console.log("Media has reached the end");
   * });
   */
  function OvPlayer() {

    /**
     * Defines a Player interface which every Player must implement.
     */
    function Player() {}

    /**
     * Checks if data object is valid.
     * @param Object jPlayerElement The JQLite HTML element corresponding
     * to the HTML element which will receive events dispatched by
     * the player
     * @param Object media Details of the Media
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
     * @return String The media id
     */
    Player.prototype.getMediaId = function() {
      return this.media.mediaId;
    };

    /**
     * Gets player id.
     * @return String The player id
     */
    Player.prototype.getId = function() {
      return this.playerId;
    };

    /**
     * Gets media url.
     * @return String The media url
     */
    Player.prototype.getMediaUrl = function() {
      throw new Error('getMediaUrl method not implemented for this player');
    };

    /**
     * Gets media thumbnail.
     * @return String The media thumbnail
     */
    Player.prototype.getMediaThumbnail = function() {
      throw new Error('getMediaThumbnail method not implemented for this player');
    };

    /**
     * Inititializes the player after DOM is loaded.
     */
    Player.prototype.initialize = function() {
      throw new Error('initialize method not implemented for this player');
    };

    /**
     * Plays or pauses the media depending on media actual state.
     */
    Player.prototype.playPause = function() {
      throw new Error('play method not implemented for this player');
    };

    /**
     * Sets volume.
     * @param Number volume The new volume from 0 to 100.
     */
    Player.prototype.setVolume = function() {
      throw new Error('setVolume method not implemented for this player');
    };

    /**
     * Sets time.
     * @param Number time The time to seek to in milliseconds
     */
    Player.prototype.setTime = function() {
      throw new Error('setTime method not implemented for this player');
    };

    /**
     * Gets player type.
     * @return String A string representation of the player type
     */
    Player.prototype.getPlayerType = function() {
      throw new Error('getPlayerType method not implemented for this player');
    };

    /**
     * Destroys the player.
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
   * Creates a new HTML element ov-player to create an openVeo player.
   * It requires ovPlayerDirectory global variable to be defined and have
   * a value corresponding to the path of the openVeo Player
   * root directory.
   * For more information on the ov-player element, have a look at the
   * PlayerApp.js file.
   */
  function ovPlayer($injector, $document, $sce, $filter, $timeout, playerService, i18nPlayerService) {
    return {
      restrict: 'E',
      templateUrl: ovPlayerDirectory + 'templates/player.html',
      scope: {
        ovData: '=',
        ovFullscreenIcon: '=?',
        ovVolumeIcon: '=?',
        ovModeIcon: '=?',
        ovTime: '=?',
        ovFullViewport: '=?',
        ovLanguage: '=?',
        ovPlayerType: '@?'
      },
      controller: ['$scope', '$element', function($scope, $element) {
        var self = this;
        var modesTimeoutPromise;
        var volumeTimeoutPromise;
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
        $scope.player = null;

        // Set default value for attributes
        $scope.ovFullscreenIcon = (typeof $scope.ovFullscreenIcon === 'undefined') ? true : $scope.ovFullscreenIcon;
        $scope.ovVolumeIcon = (typeof $scope.ovVolumeIcon === 'undefined') ? true : $scope.ovVolumeIcon;
        $scope.ovModeIcon = (typeof $scope.ovModeIcon === 'undefined') ? true : $scope.ovModeIcon;
        $scope.ovTime = (typeof $scope.ovTime === 'undefined') ? true : $scope.ovTime;
        $scope.ovFullViewport = (typeof $scope.ovFullViewport === 'undefined') ? false : $scope.ovFullViewport;
        $scope.ovLanguage = (typeof $scope.ovLanguage === 'undefined') ? 'en' : $scope.ovLanguage;

        /**
         * Tests if browser implements the fullscreen API or not.
         * @return true if fullscreen API is implemented, false otherwise
         */
        function implementFullScreenAPI() {
          return (rootElement.requestFullScreen ||
                  rootElement.mozRequestFullScreen ||
                  rootElement.webkitRequestFullScreen ||
                  rootElement.msRequestFullscreen);
        }

        /**
         * Tests if device is a touch device.
         * @return Boolean true if the device is a touch one, false
         * otherwise
         */
        function isTouchDevice() {
          return true == ('ontouchstart' in window || window.DocumentTouch && document instanceof DocumentTouch);
        }

        /**
         * Executes, safely, the given function in AngularJS process.
         *
         * @param Function functionToExecute The function to execute as part of
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
         * @param Number time The time to look for in milliseconds
         * @return Number The actual timecode for the given time
         */
        function findTimecode(time) {

          if ($scope.timecodes.length) {
            for (var i = 0; i < $scope.timecodes.length; i++) {
              if (time > $scope.timecodes[i].timecode &&
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
         * @param MouseEvent event The dispatched event
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
         * @param MouseEvent event The dispatched event
         */
        function timeMouseMove(event) {
          var timecode = findTimecode(((event.pageX - timeBarRect.left) / timeBarWidth) * $scope.duration);

          safeApply(function() {
            if ($scope.timecodesByTime[timecode])
              $scope.timePreview = $scope.timecodesByTime[timecode].image.large;

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
         * Hide the index tab, the display mode selector and set display mode to
         * "media" (only player is visible).
         */
        function hideTimecodes() {
          $scope.displayIndexTab = false;
          $scope.selectedMode = modes[0];
          $scope.ovModeIcon = false;
        }

        /**
         * Displays timecodes.
         * Display the index tab, the display mode selector and set display mode
         * to "both" (both player and presentation)
         */
        function displayTimecodes() {
          $scope.displayIndexTab = true;
          $scope.selectedMode = modes[1];
          $scope.ovModeIcon = true;
        }

        /**
         * Hides chapters.
         * Hide the chapters tab.
         */
        function hideChapters() {
          $scope.displayChapterTab = false;
        }

        /**
         * Displays chapters.
         * Display the chapters tab.
         */
        function displayChapters() {
          $scope.displayChapterTab = true;
        }

        /**
         * Initializes the list of chapters.
         * Display the chapters tab only if there is at least one chapter.
         */
        function initChapters() {
          $scope.chapters = playerService.getMediaChapters() || [];
          if ($scope.chapters.length) {
            $scope.displayChapterTab = $scope.chapters.length;
            displayChapters();
          }

          // No chapters
          else
            hideChapters();
        }

        /**
         * Initializes the list of timecodes.
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
            $scope.timePreview = $scope.presentation = $scope.timecodes[0].image.large;

            displayTimecodes();
          }

          // No timecodes
          else
            hideTimecodes();
        }

        /**
         * Initializes the player.
         */
        function initPlayer() {

          if ($scope.data.mediaId) {
            var playerType = $scope.ovPlayerType || $scope.data.type || 'html';
            $scope.mediaTemplate = ovPlayerDirectory + 'templates/' + playerType + '.html';

            // Get an instance of a player depending on player's type
            switch (playerType.toLowerCase()) {
              case 'vimeo':
                var OvVimeoPlayer = $injector.get('OvVimeoPlayer');
                $scope.player = new OvVimeoPlayer($element, $scope.data);
                break;
              case 'html':
                var OvHTMLPlayer = $injector.get('OvHTMLPlayer');
                $scope.player = new OvHTMLPlayer($element, $scope.data);
                break;
              case 'flowplayer':
                var OvFlowPlayer = $injector.get('OvFlowPlayer');
                $scope.player = new OvFlowPlayer($element, $scope.data);
                break;
              default:
                throw new Error('Player ' + playerType + ' is not supported');
            }

          }
        }

        /**
         * Initializes isolated scope properties and player.
         */
        function init() {

          // Set scope default values
          $scope.data = angular.copy($scope.ovData) || {};
          playerService.setMedia($scope.data);
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
          $scope.mediaUrl = $sce.trustAsResourceUrl($scope.player.getMediaUrl());
          $scope.mediaThumbnail = $scope.player.getMediaThumbnail();
          $scope.loading = true;

          // Set player language
          i18nPlayerService.setLanguage($scope.ovLanguage);

          // Full viewport and no FullScreen API available
          // Consider the player as in fullscreen
          if ($scope.ovFullViewport && !implementFullScreenAPI()) {
            $scope.fullscreenButton = 'reduce';
            fullscreen = true;
          }

          // Media volume can't be changed on touch devices
          if (isTouchDevice())
            $scope.ovVolumeIcon = false;

          // Video is cut
          // Real media duration is required to be able to display either the
          // list of chapters or the list of timecodes
          if ($scope.isCut) {
            $scope.displayChapterTab = false;
            hideTimecodes();
            hideChapters();
          } else {

            // Video is not cut
            // Timecodes and chapters can be immediately displayed
            initTimecodes();
            initChapters();

          }

        }

        init();

        /**
         * Toggles display mode selection list.
         * If the list of display modes is opened, close it, open it
         * otherwise. Close volume if opened.
         * Automatically close display modes after 3 seconds.
         */
        $scope.toggleModes = function() {
          if (modesTimeoutPromise)
            $timeout.cancel(modesTimeoutPromise);

          $scope.volumeOpened = false;
          $scope.modesOpened = !$scope.modesOpened;

          if ($scope.modesOpened)
            modesTimeoutPromise = $timeout(function() {
              $scope.modesOpened = false;
            },
              3000);
        };

        /**
         * Toggles the volume.
         * If the volume selector is opened, close it, open it
         * otherwise. Close display modes if opened.
         * Automatically close volume after 3 seconds.
         */
        $scope.toggleVolume = function() {
          if (volumeTimeoutPromise)
            $timeout.cancel(volumeTimeoutPromise);

          $scope.modesOpened = false;
          $scope.volumeOpened = !$scope.volumeOpened;

          if ($scope.volumeOpened)
            volumeTimeoutPromise = $timeout(function() {
              $scope.volumeOpened = false;
            },
              3000);
        };

        /**
         * Toggles player full screen.
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

        // Watch for ov-mode-icon attribute changes
        $scope.$watch('ovModeIcon', function() {

          // Do not display mode icon if no timecodes are available
          if ($scope.timecodes && !$scope.timecodes.length && $scope.ovModeIcon)
            $scope.ovModeIcon = false;

        });

        // Watch for ov-volume-icon attribute changes
        $scope.$watch('ovVolumeIcon', function() {

          // Media volume can't be changed on touch devices
          if (isTouchDevice())
            $scope.ovVolumeIcon = false;

        });

        /**
         * Sets the player volume.
         * Volume is retrieved from the position of the cursor on the
         * volume selector area.
         * @param MouseEvent event The dispatched event when cliking
         * on the volume selector.
         */
        $scope.setVolume = function(event) {
          var volume = Math.min(Math.round(((volumeBarRect.bottom - event.pageY) / volumeBarHeight) * 100), 100);
          self.setVolume(volume);
        };

        /**
         * Sets the player time.
         * Time is retrieved from the position of the cursor on the
         * time bar area.
         * @param MouseEvent event The dispatched event when cliking
         * on the volume selector.
         */
        $scope.setTime = function(event) {
          self.setTime(((event.pageX - timeBarRect.left) / timeBarWidth) * $scope.duration);
        };

        /**
         * Sets the display mode.
         * @param String mode The display mode to activate, available
         * display modes are set just before ovPlayer definition
         */
        this.selectMode = $scope.selectMode = function(mode) {
          $scope.selectedMode = mode;
        };

        /**
         * Starts / Pauses the player.
         */
        this.playPause = $scope.playPause = function() {
          if (!$scope.loading)
            $scope.player.playPause();
        };

        /**
         * Sets the player volume.
         * @param Number volume The volume to set from 0 to 100
         */
        this.setVolume = function(volume) {
          $scope.volume = volume;
          $scope.player.setVolume($scope.volume);
        };

        /**
         * Sets the player time.
         * @param Number time The time to set in milliseconds
         */
        this.setTime = function(time) {
          $scope.player.setTime(playerService.getRealTime(time));
        };

        /**
         * Handles mouse over events on volume bar area to be able to
         * display a preview of the future volume level.
         * @param MouseEvent event The dispatched event
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
         * @param MouseEvent event The dispatched event
         */
        angular.element(timeBar).on('mouseover', function(event) {
          if ($scope.timecodes && $scope.timecodes.length) {
            timeBarRect = timeBar.getBoundingClientRect();
            timeBarWidth = timeBarRect.right - timeBarRect.left;

            timeMouseMove(event);
            $document.on('mousemove', timeMouseMove);
            angular.element(timeBar).on('mouseout', timeMouseOut);

            safeApply(function() {
              $scope.timePreviewOpened = true;
            });
          }
        });

        // Listen to player ready event
        $element.on('ready', function() {
          safeApply(function() {
            $scope.player.setVolume(100);
            $scope.loading = false;
          });
        });

        // Listen to player waiting event
        $element.on('waiting', function() {
          safeApply(function() {
            $scope.loading = true;
          });
        });

        // Listen to player playing event
        $element.on('playing', function() {
          safeApply(function() {
            $scope.loading = false;
            $scope.playPauseButton = 'pause';
          });
        });

        // Listen to player durationChange event
        $element.on('durationChange', function(event, duration) {
          safeApply(function() {
            playerService.setRealMediaDuration(duration);
            $scope.duration = playerService.getCutDuration();

            // Media is cut and was waiting for the real media duration
            if ($scope.isCut) {
              initTimecodes();
              initChapters();
              $scope.player.setTime(playerService.getRealTime(0));
            }
          });
        });

        // Listen to player play event
        $element.on('play', function() {
          safeApply(function() {
            $scope.loading = false;
            $scope.playPauseButton = 'pause';
          });
        });

        // Listen to player pause event
        $element.on('pause', function() {
          safeApply(function() {
            $scope.playPauseButton = 'play';
          });
        });

        // Listen to player loadProgress event
        $element.on('loadProgress', function(event, data) {
          safeApply(function() {
            $scope.loadedStart = playerService.getCutPercent(data.loadedStart);
            $scope.loadedPercent = playerService.getCutPercent(data.loadedPercent);
          });
        });

        // Listen to player playProgress event
        $element.on('playProgress', function(event, data) {
          $scope.loading = false;
          var timecode = findTimecode(data.time);

          var updateTime = function() {
            $scope.time = playerService.getCutTime(data.time);
            $scope.seenPercent = playerService.getCutPercent(data.percent);

            if ($scope.timecodesByTime[timecode])
              $scope.presentation = $scope.timecodesByTime[timecode].image.large;
          };

          // Media virtual end reached
          if (playerService.getCutTime(data.time) > playerService.getCutDuration()) {
            $scope.player.setTime(playerService.getRealTime(0));
            $scope.player.playPause();
          }
          else
            safeApply(updateTime);
        });

        // Listen to player end event
        $element.on('end', function() {
          safeApply(function() {
            $scope.time = $scope.seenPercent = 0;
            $scope.playPauseButton = 'play';

            if ($scope.timecodes.length)
              $scope.presentation = $scope.timecodes[0].image.large;

            // Media is cut
            // Return to the cut start edge
            if ($scope.isCut)
              $scope.player.setTime(playerService.getRealTime(0));
          });
        });

      }]
    };
  }

  app.directive('ovPlayer', ovPlayer);
  ovPlayer.$inject = ['$injector', '$document', '$sce', '$filter', '$timeout', 'playerService', 'i18nPlayerService'];

})(angular, angular.module('ov.player'));

'use strict';

(function(app) {

  /**
   * Defines a player service to manipulate a media in a playing context.
   * Media is not only a media file but also timecodes (slides), chapters and
   * eventually a virtual cut with a start and end edge to display present only
   * small part of the video.
   * PlayerService helps dealing with cut edges, its helps synchronize information
   * returned from the player to apply it to the cut range.
   * Term "real" is relative to the full video (wihtout cut edges).
   */
  function PlayerService() {
    var media = null;
    var cutStart = 0;
    var cutEnd = null;
    var realMediaDuration = null;
    var isCut = false;

    /**
     * Gets cut start edge in milliseconds.
     * The beginning of the media can be virtually cut, thus the start time may be
     * not 0 but a virtual start.
     * @return Number The start time in milliseconds according to the cut
     */
    function getRealCutStart() {
      if (realMediaDuration)
        return (cutStart) ? realMediaDuration * cutStart : 0;

      return 0;
    }

    /**
     * Gets cut end edge in milliseconds.
     * The media can be virtually cut, thus the end time may not be the media
     * duration but a virtual end time.
     * @return Number The end time in milliseconds according to the cut
     */
    function getRealCutEnd() {
      if (realMediaDuration)
        return (cutEnd) ? realMediaDuration * cutEnd : realMediaDuration;

      return 0;
    }

    /**
     * Gets the real time based on the time relative to the cut media.
     * @param Number time Time in milliseconds relative to the cut media
     * @return Number time Time in milliseconds relative to the full media
     */
    function getRealTime(time) {
      return time + getRealCutStart();
    }

    /**
     * Gets the cut time based on the real time (relative to the full media).
     * @param Number time Time in milliseconds relative to the full media
     * @return Number Time in milliseconds relative to the cut media
     */
    function getCutTime(time) {
      return Math.max(time - getRealCutStart(), 0);
    }

    /**
     * Sets player media.
     * @param Object newMedia The media object
     */
    function setMedia(newMedia) {
      media = newMedia;
      isCut = media.cut && media.cut.length;

      // Media is cut
      if (isCut) {

        // Retrive cut edges (start and end)
        for (var i = 0; i < media.cut.length; i++) {
          if (media.cut[i].type === 'begin')
            cutStart = Math.max(media.cut[i].value, 0);
          else if (media.cut[i].type === 'end')
            cutEnd = Math.min(media.cut[i].value, 1);
        }

        // Media duration can't be equal to 0
        if (cutStart === cutEnd) {
          cutStart = 0;
          cutEnd = null;
        }

      } else {
        cutStart = 0;
        cutEnd = null;
      }

    }

    /**
     * Gets media timecodes.
     * Only timecodes within the cut range are returned.
     * @return Array The list of media timecodes
     */
    function getMediaTimecodes() {

      // Media is cut
      if (isCut && realMediaDuration && media.timecodes) {
        var filteredTimecodes = [];
        var realCutStart = getRealCutStart();
        var realCutEnd = getRealCutEnd();

        // Filter timecodes depending on cut edges
        // Timecodes not in the range [startCut - endCut] must be removed
        for (var i = 0; i < media.timecodes.length; i++) {
          var timecode = media.timecodes[i].timecode;

          if (timecode >= realCutStart && timecode <= realCutEnd)
            filteredTimecodes.push(media.timecodes[i]);
        }

        return filteredTimecodes;
      }

      return media.timecodes;
    }

    /**
     * Gets media timecodes ordered by time.
     * Index timecodes by time to avoid parsing the whole array several times.
     * @return Object The list of media timecodes ordered by time
     */
    function getMediaTimecodesByTime() {
      var timecodesByTime = {};
      var timecodes = getMediaTimecodes();
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
    }

    /**
     * Gets the list of chapters.
     * Only chapters within the cut range are returned.
     * @return Object The media chapter
     */
    function getMediaChapters() {

      // Media is cut
      if (isCut && realMediaDuration && media.chapters) {
        var filteredChapters = [];
        var realCutStart = getRealCutStart();
        var realCutEnd = getRealCutEnd();

        // Filter chapters depending on cut edges
        // Chapters not in the range [startCut - endCut] must be removed
        for (var i = 0; i < media.chapters.length; i++) {
          var timecode = realMediaDuration * media.chapters[i].value;

          if (timecode >= realCutStart && timecode <= realCutEnd)
            filteredChapters.push(media.chapters[i]);

        }
        return filteredChapters;
      }

      return media.chapters;
    }

    /**
     * Gets media virtual duration according to cut.
     * The beginning and the end of the media can be virtually cut, thus
     * the duration is not systematically the real duration of the media but
     * can be a virtual duration.
     * @return Number The duration in milliseconds according to the cut
     */
    function getCutDuration() {
      if (realMediaDuration) {
        var end = getRealCutEnd();
        var start = getRealCutStart();
        return end - start;
      }
      return 0;
    }

    /**
     * Converts a percentage relative to the full media into a percentage relative
     * to the cut media.
     * @param Number percent The percentage of the video corresponding to
     * beginning of the loaded data (from 0 to 100).
     * @return Number The percentage of the video corresponding to
     * beginning of the loaded data (from 0 to 100).
     */
    function getCutPercent(percent) {
      if (realMediaDuration) {
        var time = realMediaDuration * (percent / 100);
        return Math.min(Math.max(((time - getRealCutStart()) / getCutDuration()) * 100, 0), 100);
      }
      return percent;
    }

    /**
     * Sets real media duration.
     * @param Number duration Real media duration in milliseconds
     */
    function setRealMediaDuration(duration) {
      realMediaDuration = duration;
    }

    return {
      setMedia: setMedia,
      setRealMediaDuration: setRealMediaDuration,
      getMediaTimecodes: getMediaTimecodes,
      getMediaTimecodesByTime: getMediaTimecodesByTime,
      getMediaChapters: getMediaChapters,
      getCutDuration: getCutDuration,
      getRealTime: getRealTime,
      getRealCutStart: getRealCutStart,
      getRealCutEnd: getRealCutEnd,
      getCutPercent: getCutPercent,
      getCutTime: getCutTime
    };

  }

  app.factory('playerService', PlayerService);
  PlayerService.$inject = [];

})(angular.module('ov.player'));

'use strict';

(function(app) {

  /**
   * Creates a new HTML element ov-tabs to be able to manage a list of
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
   */
  function ovTabs() {
    return {
      restrict: 'E',
      templateUrl: ovPlayerDirectory + 'templates/tabs.html',
      scope: {},
      transclude: true,
      controller: ['$scope', '$filter', function($scope, $filter) {
        $scope.views = [];

        // Selects the given view
        $scope.select = function(view) {
          angular.forEach($scope.views, function(view) {
            view.selected = false;
          });
          view.selected = true;
        };

        this.selectTabs = function(viewId) {
          var view = $filter('filter')($scope.views, {
            viewId: viewId
          },
          true);
          if (view.length != 0)
            $scope.select(view[0]);
        };

        // Add the scope of an ovView directive to the list of views
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
   * Creates a new HTML element ov-view to be able to group HTML elements
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
   */
  function TranslateFilter(i18nPlayerService) {

    /**
     * Translates an id into the appropriated text.
     * @param {String} id The id of the translation
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
   */
  function I18nService(i18nTranslations) {
    var currentLanguage = navigator.language || navigator.browserLanguage;

    /**
     * Tests if a language is supported.
     * @param {String} language The language code to test (e.g en-CA)
     * @return {Boolean} true if supported, false otherwise
     */
    function isLanguageSupported(language) {
      return Object.keys(i18nTranslations).indexOf(language) >= 0;
    }

    /**
     * Sets current language.
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
     * @return {String} The current language country code (e.g en-US)
     */
    function getLanguage() {
      return currentLanguage;
    }

    /**
     * Translates the given id using current language.
     * @param {String} id The id of the translation
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
   * Creates a Flow player which observes OvPlayer interface.
   * More information on the flow player
   * at https://flowplayer.org/docs/api.html.
   */
  function OvFlowPlayer(OvPlayer, $window, $document, $timeout) {

    /**
     * Handles all player media events.
     * @param Event event The received event
     */
    function handlePlayerEvents(event) {

      // Events
      switch (event.type) {

        // Ready to render the media data at the current playback position
        // for the first time
        case 'ready':
          var duration = this.player.video.duration || this.media.metadata && this.media.metadata.duration;
          this.loaded = true;
          this.playing = 0;
          this.jPlayerElement.triggerHandler('durationChange', duration * 1000);
          this.jPlayerElement.triggerHandler('ready');
          break;

        // Media is no longer paused
        case 'resume':
        case 'play':
          this.playing = 1;
          this.jPlayerElement.triggerHandler('play');
          break;

        // Media has been paused
        case 'pause':
          this.playing = 0;
          this.jPlayerElement.triggerHandler('pause');
          break;

        // Media playback has reached the end
        case 'finish':
          this.playing = 0;
          this.jPlayerElement.triggerHandler('end');
          break;

        // Media playback position has changed
        case 'progress':

          // No indication about the playback position of the loading
          // percentage, assume it to be 0
          this.jPlayerElement.triggerHandler('loadProgress', {
            loadedStart: 0,
            loadedPercent: (this.player.video.buffer / this.player.video.duration) * 100
          });
          var playedPercent = (this.player.video.time / this.player.video.duration) * 100;
          this.jPlayerElement.triggerHandler('playProgress', {
            time: this.player.video.time * 1000,
            percent: playedPercent
          });

          break;
        default:
          break;
      }
    }

    // All HTML player events
    var events = [
      'finish',
      'pause',
      'progress',
      'ready',
      'resume'
    ];

    /**
     * Creates a new FlowPlayer.
     * @param Object jPlayerElement The JQLite HTML element corresponding
     * to the element which will receive events dispatched by the player
     * @param Object media Details about the media
     *   {
     *     mediaId : "136081112", // The id of the media
     *     files : [ // The list of media files (required for "html" player)
     *       {
     *         width : 640, // Media width for this file
     *         height : 360, // Media height for this file
     *         link : "https://player.vimeo.com/external/136081112.sd.mp4" // Media url
     *       },
     *       {
     *         width : 1280, // Media width for this file
     *         height : 720, // Media height for this file
     *         link : "https://player.vimeo.com/external/136081112.hd.mp4" // Media url
     *       },
     *       ...
     *     ],
     *     thumbnail : "/1439286245225/thumbnail.jpg" // The media thumbnail (only for "html" player)
     *   }
     */
    function FlowPlayer(jPlayerElement, media) {
      OvPlayer.prototype.init.call(this, jPlayerElement, media);

      if (typeof ovFlashPlayer === 'undefined' || typeof ovFlashPlayer !== 'string')
        throw new Error('ovFlashPlayer global variable must be defined and set to the flowplayer.swf file');
    }

    FlowPlayer.prototype = new OvPlayer();
    FlowPlayer.prototype.constructor = FlowPlayer;

    /**
     * Gets media url.
     * Get the lowest media quality.
     *
     * @return String The media url
     */
    FlowPlayer.prototype.getMediaUrl = function() {
      return this.media.files[0].link;
    };

    /**
     * Gets media thumbnail.
     * Get the higher thumbnail quality.
     *
     * @return String The media thumbnail url
     */
    FlowPlayer.prototype.getMediaThumbnail = function() {
      return this.media.thumbnail;
    };

    /**
     * Inititializes the player when DOM is loaded.
     *
     * Retrieves player container HTML element and install flowplayer into it.
     * Then bind listeners to it.
     */
    FlowPlayer.prototype.initialize = function() {
      this.loaded = false;
      this.jPlayerElement.triggerHandler('waiting');
      var playerContainer = $document[0].getElementById(this.playerId);

      // Install flowplayer into selected container
      this.player = flowplayer(playerContainer, {
        swf: ovFlashPlayer,
        clip: {
          sources: [
            {
              type: 'video/mp4',
              src: this.getMediaUrl()
            }
          ]
        }
      });

      // Handle events
      this.handlePlayerEventsFn = angular.bind(this, handlePlayerEvents);

      // Set media events listeners
      for (var i = 0; i < events.length; i++)
        this.player.on(events[i], this.handlePlayerEventsFn);
    };

    /**
     * Plays or pauses the media depending on media actual state.
     */
    FlowPlayer.prototype.playPause = function() {
      if (this.playing)
        this.player.pause();
      else
        this.player.resume();
    };

    /**
     * Sets volume.
     * @param Number volume The new volume from 0 to 100.
     */
    FlowPlayer.prototype.setVolume = function(volume) {
      this.player.volume(volume / 100);
    };

    /**
     * Sets time.
     * @param Number time The time to seek to in milliseconds
     */
    FlowPlayer.prototype.setTime = function(time) {
      var self = this;
      time = parseInt(time) || 0.1;

      this.player.pause();

      // Avoid digestion phase by executing treatment on the next loop
      $timeout(function() {
        self.jPlayerElement.triggerHandler('waiting');
        self.player.seek(time / 1000, function() {
          self.player.resume();
        });
      }, 1);
    };

    /**
     * Gets player type.
     * @return String "flowplayer"
     */
    FlowPlayer.prototype.getPlayerType = function() {
      return 'flowplayer';
    };

    /**
     * Destroys the player.
     * Remove all events listeners.
     */
    FlowPlayer.prototype.destroy = function() {
      this.handlePlayerEventsFn = angular.bind(this, handlePlayerEvents);
      var jPlayer = angular.element(this.player);

      for (var i = 0; i < events.length; i++)
        jPlayer.off(events[i], this.handlePlayerEventsFn);

      this.loaded = false;
      this.playing = 0;
      this.player = null;
    };

    return FlowPlayer;
  }

  app.factory('OvFlowPlayer', OvFlowPlayer);
  OvFlowPlayer.$inject = ['OvPlayer', '$window', '$document', '$timeout'];

})(angular, angular.module('ov.player'));

'use strict';

(function(angular, app) {

  /**
   * Creates an HTML player which observes OvPlayer interface.
   * More information on HTML player
   * at http://www.w3.org/TR/html5/embedded-content-0.html.
   */
  function OvHTMLPlayer(OvPlayer, $window, $document) {

    /**
     * Handles all player media events.
     * @param Event event The received event
     */
    function handlePlayerEvents(event) {

      // Events
      switch (event.type) {

        // Fetching metadata
        case 'progress':

          // Got buffering information
          // Caution, the progress event maybe dispatched even if buffer
          // is empty
          if (this.player.buffered.length === 1) {
            var loadedStart = (this.player.buffered.start(0) / this.player.duration);
            var loadedEnd = (this.player.buffered.end(0) / this.player.duration);
            this.jPlayerElement.triggerHandler('loadProgress', {
              loadedStart: Math.max(0, Math.min(loadedStart, 1)) * 100,
              loadedPercent: Math.max(0, Math.min(loadedEnd - loadedStart, 1)) * 100
            });
          }

          break;

        // The duration attribute has just been updated
        case 'durationchange':
          var duration = this.player.duration || this.media.metadata && this.media.metadata.duration;
          this.jPlayerElement.triggerHandler('durationChange', duration * 1000);
          break;

        // Ready to render the media data at the current playback position
        // for the first time
        case 'loadeddata':
          this.loaded = true;
          this.jPlayerElement.triggerHandler('ready');
          break;

        // Media is no longer paused
        case 'play':
          this.jPlayerElement.triggerHandler('play');
          break;

        // Media has been paused
        case 'pause':
          this.jPlayerElement.triggerHandler('pause');
          break;

        // Media playback has reached the end
        case 'ended':
          this.jPlayerElement.triggerHandler('end');
          break;

        // Media playback has stopped because the next frame is not available
        case 'waiting':
          this.jPlayerElement.triggerHandler('waiting');
          break;

        // Media playback is ready to start after being paused or delayed
        // due to lack of media data
        case 'playing':
          this.jPlayerElement.triggerHandler('playing');
          break;

        // Media playback position has changed
        case 'timeupdate':
          var playedPercent = (this.player.currentTime / this.player.duration) * 100;
          this.jPlayerElement.triggerHandler('playProgress', {
            time: this.player.currentTime * 1000,
            percent: playedPercent
          });
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
      'timeupdate',
      'play',
      'pause'
    ];

    /**
     * Creates a new HTMLPlayer.
     * @param Object jPlayerElement The JQLite HTML element corresponding
     * to the element which will receive events dispatched by the player
     * @param Object media Details about the media
     *   {
     *     mediaId : "136081112", // The id of the media
     *     files : [ // The list of media files (required for "html" player)
     *       {
     *         width : 640, // Media width for this file
     *         height : 360, // Media height for this file
     *         link : "https://player.vimeo.com/external/136081112.sd.mp4" // Media url
     *       },
     *       {
     *         width : 1280, // Media width for this file
     *         height : 720, // Media height for this file
     *         link : "https://player.vimeo.com/external/136081112.hd.mp4" // Media url
     *       },
     *       ...
     *     ],
     *     thumbnail : "/1439286245225/thumbnail.jpg" // The media thumbnail (only for "html" player)
     *   }
     */
    function HTMLPlayer(jPlayerElement, media) {
      OvPlayer.prototype.init.call(this, jPlayerElement, media);
    }

    HTMLPlayer.prototype = new OvPlayer();
    HTMLPlayer.prototype.constructor = HTMLPlayer;

    /**
     * Gets media url.
     * Get the lowest media quality.
     *
     * @return String The media url
     */
    HTMLPlayer.prototype.getMediaUrl = function() {
      return this.media.files[0].link;
    };

    /**
     * Gets media thumbnail.
     * Get the higher thumbnail quality.
     *
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
     */
    HTMLPlayer.prototype.initialize = function() {
      this.loaded = false;
      this.player = $document[0].getElementById(this.playerId);

      // Handle events
      this.handlePlayerEventsFn = angular.bind(this, handlePlayerEvents);
      var jPlayer = angular.element(this.player);

      // Set media events listeners
      for (var i = 0; i < events.length; i++)
        jPlayer.on(events[i], this.handlePlayerEventsFn);

      // Start loading media
      this.player.load();
    };

    /**
     * Plays or pauses the media depending on media actual state.
     */
    HTMLPlayer.prototype.playPause = function() {
      if (this.player.paused || this.player.ended)
        this.player.play();
      else
        this.player.pause();
    };

    /**
     * Sets volume.
     * @param Number volume The new volume from 0 to 100.
     */
    HTMLPlayer.prototype.setVolume = function(volume) {
      this.player.volume = volume / 100;
    };

    /**
     * Sets time.
     * @param Number time The time to seek to in milliseconds
     */
    HTMLPlayer.prototype.setTime = function(time) {
      time = parseInt(time) || 0.1;
      this.player.currentTime = time / 1000;
    };

    /**
     * Gets player type.
     * @return String "html"
     */
    HTMLPlayer.prototype.getPlayerType = function() {
      return 'html';
    };

    /**
     * Destroys the player.
     * Remove all events listeners.
     */
    HTMLPlayer.prototype.destroy = function() {
      this.handlePlayerEventsFn = angular.bind(this, handlePlayerEvents);
      var jPlayer = angular.element(this.player);

      for (var i = 0; i < events.length; i++)
        jPlayer.off(events[i], this.handlePlayerEventsFn);

      this.loaded = false;
      this.player = null;
    };

    return HTMLPlayer;
  }

  app.factory('OvHTMLPlayer', OvHTMLPlayer);
  OvHTMLPlayer.$inject = ['OvPlayer', '$window', '$document'];

})(angular, angular.module('ov.player'));

'use strict';

(function(angular, app) {

  /**
   * Creates a Vimeo player which observes OvPlayer interface.
   * More information on Vimeo player can be found
   * at https://developer.vimeo.com/player.
   * The Vimeo embeded player exposes a JavaSript API to interact with
   * (https://developer.vimeo.com/player/js-api).
   */
  function OvVimeoPlayer(OvPlayer, $window, $document) {

    /**
     * Sends a post message to the player with the action and the value.
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
      this.postMessageTargetOrigin = 'https:' + this.getMediaUrl().split('?')[0];
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
     * @param MessageEvent/Event event The post message
     * @param Object data If post messages are not implemented, a simple
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
            this.jPlayerElement.triggerHandler('ready');
            break;

            // Media is loading
          case 'loadProgress':

            // No indication about the playback position of the loading
            // percentage, assume it to be 0
            this.jPlayerElement.triggerHandler('loadProgress', {
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
              this.jPlayerElement.triggerHandler('playProgress', {
                time: data.data.seconds * 1000,
                percent: data.data.percent * 100
              });

            break;

            // Media begins to play
          case 'play':
            this.playing = 1;
            this.jPlayerElement.triggerHandler('play');
            break;

            // Media pauses
          case 'pause':
            this.playing = 0;
            this.jPlayerElement.triggerHandler('pause');
            break;

            // Media playback reaches the end
          case 'finish':
            this.playing = 0;
            this.jPlayerElement.triggerHandler('end');
            break;

          default:
            break;
        }

        // Actions
        switch (data.method) {
          case 'getDuration':
            this.duration = data.value || this.media.metadata && this.media.metadata.duration;
            this.jPlayerElement.triggerHandler('durationChange', this.duration * 1000);
            break;

          default:
            return;
        }
      }

    }

    /**
     * Inititializes the player.
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
     * @param Object jPlayerElement The JQLite HTML element corresponding
     * to the element which will receive events dispatched by the player
     * @param Object media Details of the media
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
     * @return String The media url
     */
    VimeoPlayer.prototype.getMediaUrl = function() {
      return '//player.vimeo.com/video/' + this.media.mediaId + '?api=1&player_id=' + this.playerId;
    };

    /**
     * Gets media thumbnail.
     * No need to manage the thumbnail it is already done by the Vimeo player.
     *
     * @return null
     */
    VimeoPlayer.prototype.getMediaThumbnail = function() {
      return null;
    };

    /**
     * Intitializes the player.
     * Nothing to do, the player is already initialized.
     */
    VimeoPlayer.prototype.initialize = function() {
    };

    /**
     * Plays or pauses the media depending on media actual state.
     */
    VimeoPlayer.prototype.playPause = function() {
      postActionToPlayer.call(this, this.playing ? 'pause' : 'play');
    };

    /**
     * Sets volume.
     * @param Number volume The new volume from 0 to 100.
     */
    VimeoPlayer.prototype.setVolume = function(volume) {
      postActionToPlayer.call(this, 'setVolume', volume / 100);
    };

    /**
     * Sets time.
     * @param Number time The time to seek to in milliseconds
     */
    VimeoPlayer.prototype.setTime = function(time) {
      time = parseInt(time) || 0.1;
      postActionToPlayer.call(this, 'seekTo', time / 1000);

      // Send a playProgress event because the Vimeo flash player (old
      // browsers) does not trigger the playProgress event while in pause
      // as the HTML5 player does
      if (!this.playing)
        this.jPlayerElement.triggerHandler('playProgress', {
          time: time,
          percent: (time / this.duration) * 100
        });
    };

    /**
     * Gets player type.
     * @return String "vimeo"
     */
    VimeoPlayer.prototype.getPlayerType = function() {
      return 'vimeo';
    };

    /**
     * Destroys the player.
     * Remove all events listeners.
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
  OvVimeoPlayer.$inject = ['OvPlayer', '$window', '$document'];

})(angular, angular.module('ov.player'));
