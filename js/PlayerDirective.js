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
