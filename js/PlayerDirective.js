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
        ovMediaSourcesIcon: '=?',
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
        var playRequested = false;
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

        var apiEnable = implementFullScreenAPI();

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
         * Hides chapters.
         *
         * Hide the chapters tab.
         */
        function hideTags() {
          $scope.displayTagsTab = false;
        }

        /**
         * Displays chapters.
         *
         * Display the chapters tab.
         */
        function displayTags() {
          $scope.displayTagsTab = true;
        }

        /**
         * Prepares data.
         *
         * Some validations and corrections have to be performed on the datas before giving it to the player.
         * Old versions of the player were using "mediaId" property as a String, to be compliant with thoses versions
         * the "mediaId" property is transformed into an Array of Strings as now the player can handle multi sources.
         *
         * @param {Object} data OpenVeo Player data
         * @param {String|Array} [data.mediaId] The media sources
         * @param {Object|Array} [data.sources] The media sources definitions
         */
        function prepareData(data) {
          if (!data) return;

          // Makes sure "mediaId" and "sources" properties are arrays
          if (data.mediaId && !Array.isArray(data.mediaId)) data.mediaId = [data.mediaId];
          if (data.sources && !Array.isArray(data.sources)) data.sources = [data.sources];
        }

        /**
         * Initializes the points of interest (e.g. chapters, tags).
         */
        function initPointsOfInterest() {
          $scope.chapters = playerService.getMediaPointsOfInterest('chapters') || [];
          $scope.tags = playerService.getMediaPointsOfInterest('tags') || [];
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

          if ($scope.data.mediaId && $scope.data.mediaId.length) {
            var playerType = $scope.ovPlayerType || 'html';
            var playerId = 'player_' + new Date().getUTCMilliseconds();
            $scope.mediaTemplate = ovPlayerDirectory + 'templates/' + playerType + '.html';
            $scope.data.language = $scope.ovLanguage;

            // Get an instance of a player depending on player's type
            switch (playerType.toLowerCase()) {
              case 'youtube':
                var OvYoutubePlayer = $injector.get('OvPlayerYoutube');
                $scope.player = new OvYoutubePlayer($element, $scope.data, playerId);
                break;
              case 'vimeo':
                var OvVimeoPlayer = $injector.get('OvPlayerVimeo');
                $scope.player = new OvVimeoPlayer($element, $scope.data, playerId);
                break;
              case 'html':
                var OvHTMLPlayer = $injector.get('OvPlayerHTML');
                $scope.player = new OvHTMLPlayer($element, $scope.data, playerId);
                break;
              default:
                throw new Error('Player ' + playerType + ' is not supported');
            }
          }
        }

        /**
         * Updates player attributes.
         *
         * Some attributes may change regarding on actual player data.
         */
        function updateAttributes() {
          if (!$scope.player)
            return;

          // Icon to change player definition
          // If no definitions available, the icon is not displayed
          $scope.settingsIcon = ($scope.player.getAvailableDefinitions()) ? $scope.ovSettingsIcon : false;

          // Media volume can't be changed on touch devices
          // Hide volume icon
          if (isTouchDevice())
            $scope.ovVolumeIcon = false;

          // Full viewport and no FullScreen API available
          // Consider the player as in fullscreen
          if ($scope.fullViewport && !implementFullScreenAPI()) {
            $scope.fullscreenButton = 'reduce';
            fullscreen = true;
          }

          // Full viewport is requested and no fullscreen API is available
          // It should not be possible to reduce / enlarge player
          // Hide fullscreen icon
          if ($scope.ovFullViewport && !implementFullScreenAPI())
            $scope.fullscreenIcon = false;

          // Mode icon is available only if there are timecodes
          $scope.modeIcon = $scope.displayIndexTab && $scope.ovModeIcon;

          // Set player language
          i18nPlayerService.setLanguage($scope.ovLanguage);
        }

        /**
         * Initializes isolated scope properties and player.
         *
         * @param {Boolean} isNew true if this is the first player initialization, false otherwise
         */
        function init(isNew) {
          $scope.data = angular.copy($scope.ovData) || {};
          prepareData($scope.data);
          playerService.setMedia($scope.data);

          // Retrieve last stopped time
          if ($scope.ovRememberPosition) {
            var cookie = $cookies.getObject('videoStopped_' + $scope.data.mediaId);
            if (cookie) {
              $scope.seenPercent = cookie.percent;
              $scope.time = cookie.time;
              lastTime = $scope.time;
            }
          }

          if (isNew) {

            // Player has never been initialized yet
            // Create it
            initPlayer();

          } else if ($scope.player) {

            // Player is already initialized
            // Just update its data
            $scope.player.setMedia($scope.data);

          }

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
          $scope.selectMediaOpened = false;

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
          $scope.displayIndexTab = false;
          $scope.displayChapterTab = false;
          $scope.displayTagsTab = false;
          $scope.mediaThumbnail = $scope.player.getMediaThumbnail();

          // Get available definitions for selected source: if null, definitions are managed by the player or
          // player does not support definitions
          $scope.mediaDefinitions = $scope.player.getAvailableDefinitions();
          $scope.selectedDefinition = $scope.mediaDefinitions &&
            $scope.mediaDefinitions[$scope.mediaDefinitions.length - 1] || null;

          // Get source url (only Vimeo player uses this)
          $scope.sourceUrl = $scope.player.getSourceUrl();
          $scope.loading = true;
          $scope.initializing = true;
          $scope.error = null;

          // Real media duration is required to be able to display either the
          // list of chapters or the list of timecodes
          // Thus we wait for the duration to handle timecodes, chapters and tags
          hideTimecodes();
          hideChapters();
          hideTags();
          updateAttributes();

          if (!isNew) {

            // Player existed before init
            // Load the new media with the new selected source
            lastTime = 0;
            $scope.player.load();

          }
        }

        /**
         * Hides all opened settings menu with a timeout.
         */
        function hideSettingsWithTimeout() {
          if (hideSettingsTimeoutPromise)
            $timeout.cancel(hideSettingsTimeoutPromise);

          if ($scope.modesOpened || $scope.definitionOpened || $scope.volumeOpened || $scope.selectMediaOpened)
            hideSettingsTimeoutPromise = $timeout(function() {
              $scope.modesOpened = $scope.definitionOpened = $scope.volumeOpened = $scope.selectMediaOpened = false;
            }, 3000);
        }

        /**
         * Toggles display mode selection list.
         *
         * If the list of display modes is opened, close it, open it
         * otherwise. Close volume, definition and media sourcesif opened.
         * Automatically close display modes after 3 seconds.
         */
        $scope.toggleModes = function() {
          $scope.volumeOpened = false;
          $scope.definitionOpened = false;
          $scope.selectMediaOpened = false;
          $scope.modesOpened = !$scope.modesOpened;
          hideSettingsWithTimeout();
        };

        /**
         * Toggles the volume.
         *
         * If the volume selector is opened, close it, open it
         * otherwise. Close definition, media sources and display modes if opened.
         * Automatically close volume after 3 seconds.
         */
        $scope.toggleVolume = function() {
          $scope.modesOpened = false;
          $scope.definitionOpened = false;
          $scope.selectMediaOpened = false;
          $scope.volumeOpened = !$scope.volumeOpened;
          hideSettingsWithTimeout();
        };

        /**
         * Toggles definition selector.
         *
         * If definition selector is already opened, close it, open it otherwise.
         * Close media sources, volume and modes if opened.
         * Automatically close definition selector after 3 seconds.
         */
        $scope.toggleDefinition = function() {
          $scope.volumeOpened = false;
          $scope.modesOpened = false;
          $scope.selectMediaOpened = false;
          $scope.definitionOpened = !$scope.definitionOpened;
          hideSettingsWithTimeout();
        };

        /**
         * Toggles media selector.
         *
         * If media sources selector is already opened, close it, open it otherwise.
         * Close definition, volume and modes if opened.
         * Automatically close definition selector after 3 seconds.
         */
        $scope.toggleMedia = function() {
          $scope.volumeOpened = false;
          $scope.modesOpened = false;
          $scope.definitionOpened = false;
          $scope.selectMediaOpened = !$scope.selectMediaOpened;
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
            fullscreen = $scope.fullViewport = !fullscreen;
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
          if ($scope.player)
            $scope.player.destroy();
        });

        // Watch for ov-data attribute changes
        $scope.$watch('ovData', function(newData, oldData) {
          if (newData) init(!oldData || newData === oldData);
        });

        // Watch for ov-fullscreen-icon attribute changes
        $scope.$watch('ovFullscreenIcon', function(newValue, oldValue) {
          $scope.ovFullscreenIcon = $scope.fullscreenIcon = apiEnable &&
            ((typeof newValue === 'undefined') ? true : newValue);
          updateAttributes();
        });

        // Watch for ov-volume-icon attribute changes
        $scope.$watch('ovVolumeIcon', function(newValue, oldValue) {
          $scope.ovVolumeIcon = (typeof newValue === 'undefined') ? true : newValue;
          updateAttributes();
        });

        // Watch for ov-mode-icon attribute changes
        $scope.$watch('ovModeIcon', function(newValue, oldValue) {
          $scope.ovModeIcon = $scope.modeIcon = (typeof newValue === 'undefined') ? true : newValue;
          updateAttributes();
        });

        // Watch for ov-settings-icon attribute changes
        $scope.$watch('ovSettingsIcon', function(newValue, oldValue) {
          $scope.ovSettingsIcon = $scope.settingsIcon = (typeof newValue === 'undefined') ? true : newValue;
          updateAttributes();
        });

        // Watch for ov-full-viewport attribute changes
        $scope.$watch('ovFullViewport', function(newValue, oldValue) {
          $scope.ovFullViewport = $scope.fullViewport = (typeof newValue === 'undefined') ? false : newValue;
          updateAttributes();
        });

        // Watch for ov-time attribute changes
        $scope.$watch('ovTime', function(newValue, oldValue) {
          $scope.ovTime = (typeof newValue === 'undefined') ? true : newValue;
        });

        // Watch for ov-media-sources-icon attribute changes
        $scope.$watch('ovMediaSourcesIcon', function(newValue, oldValue) {
          $scope.ovMediaSourcesIcon = (typeof newValue === 'undefined') ? false : newValue;
        });

        // Watch for ov-remember-position attribute changes
        $scope.$watch('ovRememberPosition', function(newValue, oldValue) {
          $scope.ovRememberPosition = (typeof newValue === 'undefined') ? false : JSON.parse(newValue);
        });

        // Watch for ov-language attribute changes
        $scope.$watch('ovLanguage', function(newValue, oldValue) {
          $scope.ovLanguage = (typeof newValue === 'undefined') ? 'en' : newValue;
        });

        // Watch for ov-auto-play attribute changes
        $scope.$watch('ovAutoPlay', function(newValue, oldValue) {
          $scope.ovAutoPlay = (typeof newValue === 'undefined') ? false : JSON.parse(newValue);
        });

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
         * Changes the source definition.
         *
         * @method setDefinition
         * @param {Object} definition The new definition from the list of available definitions
         */
        this.setDefinition = $scope.setDefinition = function(definition) {
          if (definition && definition !== $scope.selectedDefinition) {
            lastTime = $scope.time;
            playRequested = !$scope.player.isPaused();
            $scope.selectedDefinition = definition;
            $scope.loading = true;
            $scope.initializing = true;
            safeApply(function() {
              $scope.player.setDefinition($scope.selectedDefinition);
            });
          }
        };

        /**
         * Selects the media source.
         *
         * @method setSource
         * @param {Number} sourceIndex index of the media source in the list of sources
         */
        this.setSource = $scope.setSource = function(sourceIndex) {
          if (sourceIndex != $scope.player.getSourceIndex()) {
            lastTime = $scope.time;
            playRequested = !$scope.player.isPaused();
            $scope.player.setMediaSource(sourceIndex);
            $scope.mediaDefinitions = $scope.player.getAvailableDefinitions();
            $scope.selectedDefinition = $scope.mediaDefinitions &&
            $scope.mediaDefinitions[$scope.mediaDefinitions.length - 1] || null;
            $scope.loading = true;
            $scope.initializing = true;
            safeApply(function() {
              $scope.sourceUrl = $scope.player.getSourceUrl();
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
            $scope.player.setVolume($scope.volume);
            $scope.error = null;
            $scope.loading = false;
            $scope.initializing = false;
            self.setTime(lastTime);
            $element.triggerHandler('ready');

            if (($scope.ovAutoPlay || playRequested) && !$scope.player.isPlaying()) {
              playRequested = false;
              self.playPause();
            }
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

            // Init Timecode and POI with the real duration
            initTimecodes();
            initPointsOfInterest();
            self.setTime(lastTime);

            // Change value of chapter to get timestamp once video duration is known
            playerService.processPointsOfInterestTime($scope.chapters);
            playerService.processPointsOfInterestTime($scope.tags);
            if ($scope.chapters.length)
              displayChapters();
            else
              hideChapters();

            if ($scope.tags.length)
              displayTags();
            else
              hideTags();

            updateAttributes();

            $element.triggerHandler('durationChange', $scope.duration);
          });
          return false;
        });

        // Listen to player play event
        $element.on('ovPlay', function(event) {
          event.stopImmediatePropagation();

          safeApply(function() {
            $scope.mediaDefinitions = $scope.player.getAvailableDefinitions();
            $scope.selectedDefinition = $scope.selectedDefinition ||
                    ($scope.mediaDefinitions && $scope.mediaDefinitions[$scope.mediaDefinitions.length - 1]) ||
                    null;
            updateAttributes();
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

            if ($scope.ovRememberPosition)
              $cookies.putObject('videoStopped_' + $scope.data.mediaId, timeObject, {expires: expireDate});
          };

          // Media virtual end reached
          if ($scope.duration && playerService.getCutTime(data.time) > playerService.getCutDuration()) {
            $scope.player.setTime(playerService.getRealTime(0));
            if ($scope.ovRememberPosition)
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
            if ($scope.ovRememberPosition)
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
                $scope.error = $filter('ovPlayerTranslate')('MEDIA_NO_SOURCE');
                break;
              case ovPlayerErrors.MEDIA_ERR_NETWORK:
                $scope.error = $filter('ovPlayerTranslate')('MEDIA_ERR_NETWORK');
                break;
              case ovPlayerErrors.MEDIA_ERR_DECODE:
                $scope.error = $filter('ovPlayerTranslate')('MEDIA_ERR_DECODE');
                break;
              case ovPlayerErrors.MEDIA_ERR_SRC_NOT_SUPPORTED:
                $scope.error = $filter('ovPlayerTranslate')('MEDIA_ERR_SRC_NOT_SUPPORTED');
                break;
              case ovPlayerErrors.MEDIA_ERR_PERMISSION:
                $scope.error = $filter('ovPlayerTranslate')('MEDIA_ERR_PERMISSION');
                break;
              default:
                $scope.error = $filter('ovPlayerTranslate')('MEDIA_ERR_DEFAULT');
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
    'ovPlayerService',
    'ovPlayerI18nService',
    '$cookies',
    'ovPlayerErrors'
  ];

})(angular, angular.module('ov.player'));
