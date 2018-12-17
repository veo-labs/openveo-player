'use strict';

/**
 * @module ov.player
 */

(function(angular, app) {

  // Available display modes
  // Display mode tells how presentation and media are structured
  //  - "media" mode: Only the media is displayed
  //  - "both" mode: Both media and presentation are displayed (50/50)
  //  - "both-presentation" mode: Both media and presentation
  //    are displayed with more interest on the presentation (25/75)
  //  - "presentation" mode: Only the presentation is displayed
  var modes = ['media', 'both', 'both-presentation', 'presentation'];

  /**
   * Manages oplPlayer component.
   *
   * @param {Object} $injector AngularJS $injector service
   * @param {Object} $document AngularJS document JQLite element
   * @param {Object} $sce AngularJS $sce service
   * @param {Object} $filter AngularJS $filter service
   * @param {Object} $timeout AngularJS $timeout service
   * @param {Object} $cookies AngularJS $cookies service
   * @param {Object} $scope The component isolated scope
   * @param {Object} $element The HTML element holding the component
   * @param {Function} OplPlayerService The PlayerService constructor to manage a media in a playing context
   * @param {Object} oplI18nService The service to manage languages
   * @param {Object} oplPlayerErrors The player errors
   * @class OplPlayerController
   * @constructor
   */
  function OplPlayerController($injector, $document, $sce, $filter, $timeout, $cookies, $scope, $element,
                                OplPlayerService, oplI18nService, oplPlayerErrors) {
    var ctrl = this;
    var document = $document[0];
    var element = $element[0];
    var rootElement = $element.children()[0];
    var lastTime;
    var fullscreen;
    var hideSettingsTimeoutPromise;
    var timeBar;
    var volumeBar;
    var volumeBarRect;
    var volumeBarHeight;
    var timeBarRect;
    var timeBarWidth;
    var playerService;
    var playRequested;
    var oplTabsController;

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
     * @param {Function} functionToExecute The function to execute as part of the angular digest process.
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
     * Gets closest timecode, from the list of timecodes, to the given time.
     *
     * @param {Number} time The time to look for in milliseconds
     * @return {Number} The actual timecode for the given time
     */
    function findTimecode(time) {
      if (ctrl.timecodes.length) {
        if (time < ctrl.timecodes[0].timecode) return null;

        for (var i = 0; i < ctrl.timecodes.length; i++) {
          if (time >= ctrl.timecodes[i].timecode &&
              (ctrl.timecodes[i + 1] &&
               time < ctrl.timecodes[i + 1].timecode))
            return ctrl.timecodes[i].timecode;
        }

        return ctrl.timecodes[ctrl.timecodes.length - 1].timecode;
      }

      return 0;
    }

    /**
     * Handles mouse move events on volume bar area to update the volume preview accordingly.
     *
     * @param {MouseEvent} event The dispatched event
     */
    function volumeMouseMove(event) {
      safeApply(function() {
        ctrl.volumePreview = Math.round(((volumeBarRect.bottom - event.pageY) / volumeBarHeight) * 100);
      });
    }

    /**
     * Handles mouse out events on volume bar area to reset volume preview and clear event listeners.
     */
    function volumeMouseOut() {
      $document.off('mousemove', volumeMouseMove);
      angular.element(volumeBar).off('mouseout', volumeMouseOut);

      safeApply(function() {
        ctrl.volumePreview = 0;
      });
    }

    /**
     * Handles mouse move events on time bar area to update the time / presentation preview accordingly.
     *
     * @param {MouseEvent} event The dispatched event
     */
    function timeMouseMove(event) {
      var timecode = findTimecode(
        ((event.pageX - timeBarRect.left) / timeBarWidth) * ctrl.duration + playerService.getRealCutStart()
      );

      safeApply(function() {
        if (timecode !== null && ctrl.timecodesByTime[timecode])
          ctrl.timePreview = ctrl.timecodesByTime[timecode].image.large;
        else ctrl.timePreview = null;

        ctrl.timePreviewPosition = ((event.pageX - timeBarRect.left) / timeBarWidth) * 100;
      });
    }

    /**
     * Handles mouse out events on time bar area to reset the time preview and clear the event listeners.
     */
    function timeMouseOut() {
      $document.off('mousemove', timeMouseMove);
      angular.element(timeBar).off('mouseout', timeMouseOut);

      safeApply(function() {
        ctrl.timePreviewPosition = 0;
        ctrl.timePreviewOpened = false;
      });
    }

    /**
     * Hides timecodes.
     *
     * Hide the index tab, the display mode selector and set display mode to "media" (only player is visible).
     */
    function hideTimecodes() {
      ctrl.indexesTabDisplayed = false;
      ctrl.selectedMode = modes[0];
    }

    /**
     * Displays timecodes.
     *
     * Display the index tab, the display mode selector and set display mode to "both" (both player and presentation)
     */
    function displayTimecodes() {
      ctrl.indexesTabDisplayed = true;
      ctrl.selectedMode = ctrl.oplMode && modes.indexOf(ctrl.oplMode) > -1 ? ctrl.oplMode : modes[1];
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
    function initPointsOfInterest(disableCut) {
      if (disableCut === true) {
        ctrl.chapters = ctrl.data.chapters || [];
        ctrl.tags = ctrl.data.tags || [];
      } else {
        ctrl.chapters = playerService.getMediaPointsOfInterest('chapters') || [];
        ctrl.tags = playerService.getMediaPointsOfInterest('tags') || [];
      }
    }

    /**
     * Initializes the list of timecodes.
     *
     * Display the index tab only if there is at least one timecode.
     * Also prepare a copy of the list of timecodes ordered by time to avoid parsing it systematically.
     */
    function initTimecodes(disableCut) {
      var timecode;

      if (disableCut === true) {
        ctrl.timecodes = ctrl.data.timecodes || [];
        ctrl.timecodesByTime = {};

        for (var i = 0; i < ctrl.timecodes.length; i++) {
          timecode = ctrl.timecodes[i];
          ctrl.timecodesByTime[timecode.timecode] = {image: timecode.image};
        }
      } else {
        ctrl.timecodes = playerService.getMediaTimecodes() || [];
        ctrl.timecodesByTime = playerService.getMediaTimecodesByTime() || {};
      }

      // Got timecodes associated to the media
      if (ctrl.timecodes.length) {

        // Use the first image of the first timecode as the current presentation image
        timecode = findTimecode(ctrl.time);
        ctrl.timePreview = timecode !== null ? ctrl.timecodesByTime[timecode].image.large : null;
        ctrl.presentation = timecode !== null ? ctrl.timecodesByTime[timecode].image.large : null;

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
      if (ctrl.data.mediaId && ctrl.data.mediaId.length) {
        var playerType = ctrl.oplPlayerType || 'html';
        var playerId = 'player_' + new Date().getUTCMilliseconds();
        ctrl.mediaTemplate = 'opl-' + playerType + '.html';
        ctrl.data.language = ctrl.language;

        // Get an instance of a player depending on player's type
        switch (playerType.toLowerCase()) {
          case 'youtube':
            var OplYoutubePlayer = $injector.get('OplYoutubePlayer');
            ctrl.player = new OplYoutubePlayer($element, ctrl.data, playerId);
            break;
          case 'vimeo':
            var OplVimeoPlayer = $injector.get('OplVimeoPlayer');
            ctrl.player = new OplVimeoPlayer($element, ctrl.data, playerId);
            break;
          case 'html':
            var OplHTMLPlayer = $injector.get('OplHtmlPlayer');
            ctrl.player = new OplHTMLPlayer($element, ctrl.data, playerId);
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
      if (!ctrl.player)
        return;

      // Icon to change player definition
      // If no definitions available, the icon is not displayed
      ctrl.settingsIconDisplayed = (ctrl.player.getAvailableDefinitions()) ? ctrl.settingsIconDisplayed : false;

      // Media volume can't be changed on touch devices
      // Hide volume icon
      if (isTouchDevice())
        ctrl.volumeIconDisplayed = false;

      // Full viewport and no fullScreen API available
      // Consider the player as in fullscreen
      if (ctrl.fullViewportActivated && !implementFullScreenAPI()) {
        ctrl.fullscreenButton = 'reduce';
        fullscreen = true;
      }

      // Full viewport is requested and no fullscreen API is available
      // It should not be possible to reduce / enlarge player
      // Hide fullscreen icon
      if (ctrl.fullViewportActivated && !implementFullScreenAPI())
        ctrl.fullscreenIconDisplayed = false;

      // Mode icon is available only if there are timecodes
      var modeIconDisplayed = (typeof ctrl.oplModeIcon === 'undefined') ? true : JSON.parse(ctrl.oplModeIcon);
      ctrl.modeIconDisplayed =
        (ctrl.indexesTabDisplayed && typeof ctrl.oplModeIcon === 'undefined') ||
        (ctrl.indexesTabDisplayed && modeIconDisplayed);

      // Set player language
      oplI18nService.setLanguage(ctrl.oplLanguage);
    }

    /**
     * Initializes isolated scope properties and player.
     *
     * @param {Boolean} isNew true if this is the first player initialization, false otherwise
     */
    function init(isNew) {
      if (!playerService) return;

      ctrl.data = angular.copy(ctrl.oplData) || {};
      prepareData(ctrl.data);
      playerService.setMedia(ctrl.data);

      // Retrieve last stopped time
      if (ctrl.positionRemembered) {
        var cookie = $cookies.getObject('videoStopped_' + ctrl.data.mediaId);
        if (cookie) {
          ctrl.seenPercent = cookie.percent;
          ctrl.time = cookie.time;
          lastTime = ctrl.time;
        }
      }

      if (isNew) {

        // Player has never been initialized yet
        // Create it
        initPlayer();

      } else if (ctrl.player) {

        // Player is already initialized
        // Just update its data
        ctrl.player.setMedia(ctrl.data);

      }

      if (!ctrl.player)
        return;

      ctrl.isCut = ctrl.data.cut && ctrl.data.cut.length;
      ctrl.timecodes = [];
      ctrl.timecodesByTime = {};
      ctrl.chapters = [];
      ctrl.presentation = null;
      ctrl.playerId = ctrl.player.getId();
      ctrl.timePreviewOpened = false;
      ctrl.volumeOpened = false;
      ctrl.modesOpened = false;
      ctrl.definitionOpened = false;
      ctrl.selectMediaOpened = false;

      ctrl.modes = angular.copy(modes);
      ctrl.selectedMode = modes[1];
      ctrl.playPauseButton = 'play';
      ctrl.fullscreenButton = 'enlarge';
      ctrl.volumePreview = 0;
      ctrl.volume = 100;
      ctrl.loadedStart = 0;
      ctrl.loadedPercent = 0;
      ctrl.seenPercent = 0;
      ctrl.time = 0;

      ctrl.duration = 0;
      ctrl.timePreviewPosition = 0;
      ctrl.indexesTabDisplayed = false;
      ctrl.chaptersTabDisplayed = false;
      ctrl.tagsTabDisplayed = false;

      // Get available definitions for selected source: if null, definitions are managed by the player or player does
      // not support definitions
      ctrl.mediaDefinitions = ctrl.player.getAvailableDefinitions();
      ctrl.selectedDefinition = ctrl.mediaDefinitions &&
        ctrl.mediaDefinitions[0] || null;

      // Get source url (only Vimeo player uses this)
      ctrl.sourceUrl = ctrl.player.getSourceUrl();
      ctrl.loading = true;
      ctrl.initializing = true;
      ctrl.error = null;

      // Real media duration is required to be able to display either the list of chapters or the list of timecodes
      // Thus we wait for the duration to handle timecodes, chapters and tags
      hideTimecodes();
      ctrl.chaptersTabDisplayed = false;
      ctrl.tagsTabDisplayed = false;
      updateAttributes();

      if (!isNew) {

        // Player existed before init
        // Load the new media with the new selected source
        lastTime = 0;
        ctrl.player.load();

      }
    }

    /**
     * Hides all opened settings menu with a timeout.
     */
    function hideSettingsWithTimeout() {
      if (hideSettingsTimeoutPromise)
        $timeout.cancel(hideSettingsTimeoutPromise);

      if (ctrl.modesOpened || ctrl.definitionOpened || ctrl.volumeOpened || ctrl.selectMediaOpened)
        hideSettingsTimeoutPromise = $timeout(function() {
          ctrl.modesOpened = ctrl.definitionOpened = ctrl.volumeOpened = ctrl.selectMediaOpened = false;
        }, 3000);
    }

    /**
     * Processes points of interest (depending of the cut) after their values have being converted from percents to
     * milliseconds
     *
     * @param {Number} duration The duration of video
     */
    function processMediaTabs(duration) {
      safeApply(function() {
        var disableCut = ctrl.cutDisabled === true;

        ctrl.startCutTime = disableCut ? 0 : playerService.getRealCutStart();
        ctrl.duration = disableCut ? duration : playerService.getCutDuration();

        // Init Timecode and POI with the real duration
        initTimecodes(disableCut);
        initPointsOfInterest(disableCut);
        ctrl.setTime(lastTime);

        // Change value of points of interest depending on the start offset
        if (!disableCut) {
          playerService.processPointsOfInterestTime(ctrl.chapters);
          playerService.processPointsOfInterestTime(ctrl.tags);
        }

        if (
            ctrl.chapters.length &&
            (typeof ctrl.oplHideChaptersTab === 'undefined' || JSON.parse(ctrl.oplHideChaptersTab) === false)
        ) {
          ctrl.chaptersTabDisplayed = true;
        } else
          ctrl.chaptersTabDisplayed = false;

        if (
          ctrl.tags.length &&
          (typeof ctrl.oplHideTagsTab === 'undefined' || JSON.parse(ctrl.oplHideTagsTab) === false)
          ) {
          ctrl.tagsTabDisplayed = true;
        } else
          ctrl.tagsTabDisplayed = false;

        updateAttributes();

        $element.triggerHandler('durationChange', ctrl.duration);
      });

      return false;
    }

    /**
     * Handles mouse over events on volume bar area to be able to display a preview of the future volume level.
     *
     * @param {MouseEvent} event The dispatched event
     */
    function handleVolumeBarOver(event) {
      volumeBarRect = volumeBar.getBoundingClientRect();
      volumeBarHeight = volumeBarRect.bottom - volumeBarRect.top;
      $document.on('mousemove', volumeMouseMove);
      angular.element(volumeBar).on('mouseout', volumeMouseOut);
    }

    /**
     * Handles mouse over events on time bar area to be able to display a time /presentation preview.
     *
     * @param {MouseEvent} event The dispatched event
     */
    function handleTimeBarOver(event) {
      timeBarRect = timeBar.getBoundingClientRect();
      timeBarWidth = timeBarRect.right - timeBarRect.left;

      if (ctrl.timecodes && ctrl.timecodes.length) {
        timeMouseMove(event);
        $document.on('mousemove', timeMouseMove);
        angular.element(timeBar).on('mouseout', timeMouseOut);

        safeApply(function() {
          ctrl.timePreviewOpened = true;
        });
      }
    }

    /**
     * Handles player ready event.
     *
     * @param {Event} event The dispatched event
     */
    function handlePlayerReady(event) {
      event.stopImmediatePropagation();

      safeApply(function() {
        ctrl.player.setVolume(ctrl.volume);
        ctrl.error = null;
        ctrl.loading = false;
        ctrl.initializing = false;
        ctrl.setTime(lastTime);
        $element.triggerHandler('ready');

        if ((ctrl.autoPlayActivated || playRequested) && !ctrl.player.isPlaying()) {
          playRequested = false;
          ctrl.playPause();
        }
      });
      return false;
    }

    /**
     * Handles player waiting event.
     *
     * @param {Event} event The dispatched event
     */
    function handlePlayerWaiting(event) {
      event.stopImmediatePropagation();

      safeApply(function() {
        ctrl.loading = true;
        $element.triggerHandler('waiting');
      });
      return false;
    }

    /**
     * Handles player playing event.
     *
     * @param {Event} event The dispatched event
     */
    function handlePlayerPlaying(event) {
      event.stopImmediatePropagation();

      safeApply(function() {
        ctrl.loading = false;
        ctrl.playPauseButton = 'pause';
        $element.triggerHandler('playing');
      });
      return false;
    }

    /**
     * Handles player duration change event.
     *
     * @param {Event} event The dispatched event
     * @param {Number} duration The new duration
     */
    function handlePlayerDurationChange(event, duration) {
      event.stopImmediatePropagation();

      safeApply(function() {
        playerService.setRealMediaDuration(duration);
      });

      if (ctrl.data.needPointsOfInterestUnitConversion === true) {
        $element.triggerHandler('needPoiConversion', duration);
      } else {
        processMediaTabs(duration);
      }
    }

    /**
     * Handles player play event.
     *
     * @param {Event} event The dispatched event
     */
    function handlePlayerPlay(event) {
      event.stopImmediatePropagation();

      safeApply(function() {
        ctrl.mediaDefinitions = ctrl.player.getAvailableDefinitions();
        ctrl.selectedDefinition = ctrl.selectedDefinition ||
                (ctrl.mediaDefinitions && ctrl.mediaDefinitions[0]) ||
                null;
        updateAttributes();
        ctrl.loading = false;
        ctrl.playPauseButton = 'pause';
        $element.triggerHandler('play');
      });
      return false;
    }

    /**
     * Handles player pause event.
     *
     * @param {Event} event The dispatched event
     */
    function handlePlayerPause(event) {
      event.stopImmediatePropagation();

      safeApply(function() {
        ctrl.playPauseButton = 'play';
        $element.triggerHandler('pause');
      });
      return false;
    }

    /**
     * Handles player load progress event.
     *
     * @param {Event} event The dispatched event
     * @param {Object} data Loaded information
     * @param {Number} data.loadedStart The loaded start time
     * @param {Number} data.loadedPercent The loaded quantity
     */
    function handlePlayerLoadProgress(event, data) {
      event.stopImmediatePropagation();

      safeApply(function() {
        ctrl.loadedStart = playerService.getCutPercent(data.loadedStart);
        ctrl.loadedPercent = playerService.getCutDurationPercent(data.loadedPercent);
        $element.triggerHandler('loadProgress', {
          loadedStart: ctrl.loadedStart,
          loadedPercent: ctrl.loadedPercent
        });
      });
      return false;
    }

    /**
     * Handles player play progress event.
     *
     * @param {Event} event The dispatched event
     * @param {Object} data Played information
     * @param {Number} data.time The current time
     * @param {Number} data.percent The seen percentage of the video
     */
    function handlePlayerPlayProgress(event, data) {
      event.stopImmediatePropagation();

      // Unnecessary playProgress events are sometimes dispatched when initializing the media
      if (ctrl.initializing)
        return;

      ctrl.loading = false;
      var timecode = findTimecode(data.time);

      var updateTime = function() {
        ctrl.time = (ctrl.cutDisabled === true) ? data.time : playerService.getCutTime(data.time);
        ctrl.seenPercent = (ctrl.cutDisabled === true) ?
                               ctrl.time / ctrl.duration * 100 :
                               playerService.getCutPercent(data.percent);

        ctrl.presentation = timecode !== null &&
                ctrl.timecodesByTime[timecode] ? ctrl.timecodesByTime[timecode].image.large : null;

        var timeObject = {
          time: ctrl.time,
          percent: ctrl.seenPercent
        };
        $element.triggerHandler('playProgress', timeObject);
        var expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + 1);

        if (ctrl.positionRemembered)
          $cookies.putObject('videoStopped_' + ctrl.data.mediaId, timeObject, {expires: expireDate});
      };

      // Media virtual end reached
      if (ctrl.cutDisabled !== true &&
          ctrl.duration &&
          playerService.getCutTime(data.time) > playerService.getCutDuration()) {
        ctrl.player.setTime(playerService.getRealTime(0));
        if (ctrl.positionRemembered)
          $cookies.remove('videoStopped_' + ctrl.data.mediaId);
        lastTime = 0;
        ctrl.player.playPause();
      } else
        safeApply(updateTime);

      return false;
    }

    /**
     * Handles player end event.
     *
     * @param {Event} event The dispatched event
     */
    function handlePlayerEnd(event) {
      event.stopImmediatePropagation();

      safeApply(function() {
        if (ctrl.positionRemembered)
          $cookies.remove('videoStopped_' + ctrl.data.mediaId);
        ctrl.time = ctrl.seenPercent = 0;
        lastTime = 0;
        ctrl.playPauseButton = 'play';

        var timecode = findTimecode(ctrl.time);
        if (timecode !== null && ctrl.timecodes.length)
          ctrl.presentation = ctrl.timecodesByTime[timecode] ? ctrl.timecodesByTime[timecode].image.large : null;

        // Media is cut
        // Return to the cut start edge
        if (ctrl.isCut)
          ctrl.player.setTime(playerService.getRealTime(0));

        $element.triggerHandler('end');
      });

      return false;
    }

    /**
     * Handles player error event.
     *
     * @param {Event} event The dispatched event
     * @param {Number} code The error code
     */
    function handlePlayerError(event, code) {
      safeApply(function() {
        ctrl.loading = false;
        ctrl.initializing = false;

        switch (code) {
          case oplPlayerErrors.MEDIA_ERR_NO_SOURCE:
            ctrl.error = $filter('oplTranslate')('MEDIA_ERR_NO_SOURCE');
            break;
          case oplPlayerErrors.MEDIA_ERR_NETWORK:
            ctrl.error = $filter('oplTranslate')('MEDIA_ERR_NETWORK');
            break;
          case oplPlayerErrors.MEDIA_ERR_DECODE:
            ctrl.error = $filter('oplTranslate')('MEDIA_ERR_DECODE');
            break;
          case oplPlayerErrors.MEDIA_ERR_SRC_NOT_SUPPORTED:
            ctrl.error = $filter('oplTranslate')('MEDIA_ERR_SRC_NOT_SUPPORTED');
            break;
          case oplPlayerErrors.MEDIA_ERR_PERMISSION:
            ctrl.error = $filter('oplTranslate')('MEDIA_ERR_PERMISSION');
            break;
          default:
            ctrl.error = $filter('oplTranslate')('MEDIA_ERR_DEFAULT');
            break;
        }

        $element.triggerHandler('error', {code: code, message: ctrl.error});
      });
    }

    Object.defineProperties(ctrl, {

      /**
       * The player language code.
       *
       * @property language
       * @type String
       */
      language: {
        value: null,
        writable: true
      },

      /**
       * Indicates if volume icon is displayed or not.
       *
       * @property volumeIconDisplayed
       * @type Boolean
       */
      volumeIconDisplayed: {
        value: true,
        writable: true
      },

      /**
       * Indicates if position is remembered.
       *
       * @property positionRemembered
       * @type Boolean
       */
      positionRemembered: {
        value: false,
        writable: true
      },

      /**
       * Indicates if time is displayed or not.
       *
       * @property timeDisplayed
       * @type Boolean
       */
      timeDisplayed: {
        value: true,
        writable: true
      },

      /**
       * Indicates if media sources icon is displayed or not.
       *
       * @property mediaSourcesIconDisplayed
       * @type Boolean
       */
      mediaSourcesIconDisplayed: {
        value: true,
        writable: true
      },

      /**
       * Indicates if player automatically plays the video or not.
       *
       * @property autoPlayActivated
       * @type Boolean
       */
      autoPlayActivated: {
        value: false,
        writable: true
      },

      /**
       * The video data.
       *
       * @property data
       * @type Object
       */
      data: {
        value: null,
        writable: true
      },

      /**
       * The filtered list of indexes of the video.
       *
       * It corresponds to the list of video indexes after applying cuts.
       *
       * @property timecodes
       * @type Array
       */
      timecodes: {
        value: [],
        writable: true
      },

      /**
       * The filtered list of chapters.
       *
       * It corresponds to the list of video chapters after applying cuts.
       *
       * @property chapters
       * @type Array
       */
      chapters: {
        value: [],
        writable: true
      },

      /**
       * The filtered list of tags.
       *
       * It corresponds to the list of video tags after applying cuts.
       *
       * @property tags
       * @type Array
       */
      tags: {
        value: [],
        writable: true
      },

      /**
       * The filtered list of indexes of the video indexed by time.
       *
       * It corresponds to the list of video indexes after applying cuts.
       *
       * @property timecodesByTime
       * @type Object
       */
      timecodesByTime: {
        value: null,
        writable: true
      },

      /**
       * The volume preview level in percent.
       *
       * @property volumePreview
       * @type Number
       */
      volumePreview: {
        value: 0,
        writable: true
      },

      /**
       * The volume level in percent.
       *
       * @property volume
       * @type Number
       */
      volume: {
        value: 0,
        writable: true
      },

      /**
       * The image URL of the current index to display as preview.
       *
       * @property timePreview
       * @type String
       */
      timePreview: {
        value: null,
        writable: true
      },

      /**
       * The left position of the preview image in percent.
       *
       * @property timePreviewPosition
       * @type Number
       */
      timePreviewPosition: {
        value: 0,
        writable: true
      },

      /**
       * Indicates if index preview must be displayed or not.
       *
       * @property timePreviewOpened
       * @type Boolean
       */
      timePreviewOpened: {
        value: false,
        writable: true
      },

      /**
       * Indicates if volume controller is opened or not.
       *
       * @property volumeOpened
       * @type Boolean
       */
      volumeOpened: {
        value: false,
        writable: true
      },

      /**
       * Indicates if modes controller is opened or not.
       *
       * @property modesOpened
       * @type Boolean
       */
      modesOpened: {
        value: false,
        writable: true
      },

      /**
       * Indicates if the list of definition is opened or not.
       *
       * @property definitionOpened
       * @type Boolean
       */
      definitionOpened: {
        value: false,
        writable: true
      },

      /**
       * Indicates if the list of sources is opened or not.
       *
       * @property selectMediaOpened
       * @type Boolean
       */
      selectMediaOpened: {
        value: false,
        writable: true
      },

      /**
       * The player instance.
       *
       * @property player
       * @type Player
       */
      player: {
        value: null,
        writable: true
      },

      /**
       * The video duration.
       *
       * @property duration
       * @type Number
       */
      duration: {
        value: 0,
        writable: true
      },

      /**
       * The current time in milliseconds.
       *
       * @property time
       * @type Number
       */
      time: {
        value: 0,
        writable: true
      },

      /**
       * The percent of the video that has been seen so far.
       *
       * @property seenPercent
       * @type Number
       */
      seenPercent: {
        value: 0,
        writable: true
      },

      /**
       * The beginning of the loaded buffer in percent of the video.
       *
       * @property loadedStart
       * @type Number
       */
      loadedStart: {
        value: 0,
        writable: true
      },

      /**
       * The percentage of the video which have been buffered.
       *
       * @property loadedPercent
       * @type Number
       */
      loadedPercent: {
        value: 0,
        writable: true
      },

      /**
       * The start time after applying cuts in milliseconds.
       *
       * @property startCutTime
       * @type Number
       */
      startCutTime: {
        value: 0,
        writable: true
      },

      /**
       * Indicates if index tab is displayed or not.
       *
       * @property indexesTabDisplayed
       * @type Boolean
       */
      indexesTabDisplayed: {
        value: false,
        writable: true
      },

      /**
       * Indicates if chapter tab is displayed or not.
       *
       * @property chaptersTabDisplayed
       * @type Boolean
       */
      chaptersTabDisplayed: {
        value: false,
        writable: true
      },

      /**
       * Indicates if tags tab is displayed or not.
       *
       * @property tagsTabDisplayed
       * @type Boolean
       */
      tagsTabDisplayed: {
        value: false,
        writable: true
      },

      /**
       * The selected mode.
       *
       * @property selectedMode
       * @type String
       */
      selectedMode: {
        value: null,
        writable: true
      },

      /**
       * The URL of the current index image.
       *
       * @property presentation
       * @type String
       */
      presentation: {
        value: null,
        writable: true
      },

      /**
       * The name of the player template.
       *
       * @property mediaTemplate
       * @type String
       */
      mediaTemplate: {
        value: null,
        writable: true
      },

      /**
       * Indicates if settings icon is displayed or not.
       *
       * @property settingsIconDisplayed
       * @type Boolean
       */
      settingsIconDisplayed: {
        value: true,
        writable: true
      },

      /**
       * Indicates if player should take the whole viewport.
       *
       * @property fullViewportActivated
       * @type Boolean
       */
      fullViewportActivated: {
        value: false,
        writable: true
      },

      /**
       * The fullscreen button state, either "reduce" or "enlarge".
       *
       * @property fullscreenButton
       * @type String
       */
      fullscreenButton: {
        value: null,
        writable: true
      },

      /**
       * The play / pause button state, either "play" or "pause".
       *
       * @property playPauseButton
       * @type String
       */
      playPauseButton: {
        value: null,
        writable: true
      },

      /**
       * Indicates if mode icon is displayed or not.
       *
       * @property modeIconDisplayed
       * @type Boolean
       */
      modeIconDisplayed: {
        value: true,
        writable: true
      },

      /**
       * Indicates if fullscreen icon is displayed or not.
       *
       * @property fullscreenIconDisplayed
       * @type Boolean
       */
      fullscreenIconDisplayed: {
        value: true,
        writable: true
      },

      /**
       * Indicates if video has been cut.
       *
       * @property isCut
       * @type Boolean
       */
      isCut: {
        value: false,
        writable: true
      },

      /**
       * The player id.
       *
       * @property playerId
       * @type String
       */
      playerId: {
        value: null,
        writable: true
      },

      /**
       * The list of modes.
       *
       * @property modes
       * @type Array
       */
      modes: {
        value: [],
        writable: true
      },

      /**
       * The list of video definitions.
       *
       * @property mediaDefinitions
       * @type Array
       */
      mediaDefinitions: {
        value: [],
        writable: true
      },

      /**
       * The selected definition.
       *
       * @property selectedDefinition
       * @type Object
       */
      selectedDefinition: {
        value: null,
        writable: true
      },

      /**
       * The video source URL.
       *
       * @property sourceUrl
       * @type String
       */
      sourceUrl: {
        value: null,
        writable: true
      },

      /**
       * Indicates if player is currently loading.
       *
       * @property loading
       * @type Boolean
       */
      loading: {
        value: false,
        writable: true
      },

      /**
       * Indicates if player is initializing.
       *
       * @property initializing
       * @type Boolean
       */
      initializing: {
        value: false,
        writable: true
      },

      /**
       * The error message if any.
       *
       * @property error
       * @type String
       */
      error: {
        value: null,
        writable: true
      },

      /**
       * Indicates if cut are disabled or not.
       *
       * @property cutDisabled
       * @type Boolean
       */
      cutDisabled: {
        value: false,
        writable: true
      },

      /**
       * Initializes controller and attributes.
       *
       * @method $onInit
       */
      $onInit: {
        value: function() {
          playerService = new OplPlayerService();
          lastTime = 0;
          fullscreen = false;
          timeBar = element.getElementsByClassName('opl-time-ghost')[0];
          volumeBar = element.getElementsByClassName('opl-volume-ghost')[0];
          ctrl.player = null;

          angular.element(volumeBar).on('mouseover', handleVolumeBarOver);
          angular.element(timeBar).on('mouseover', handleTimeBarOver);
          $element.on('oplReady', handlePlayerReady);
          $element.on('oplWaiting', handlePlayerWaiting);
          $element.on('oplPlaying', handlePlayerPlaying);
          $element.on('oplDurationChange', handlePlayerDurationChange);
          $element.on('oplPlay', handlePlayerPlay);
          $element.on('oplPause', handlePlayerPause);
          $element.on('oplLoadProgress', handlePlayerLoadProgress);
          $element.on('oplPlayProgress', handlePlayerPlayProgress);
          $element.on('oplEnd', handlePlayerEnd);
          $element.on('oplError', handlePlayerError);

          init(true);
          updateAttributes();
        }
      },

      /**
       * Initializes child components.
       *
       * @method $postLink
       */
      $postLink: {
        value: function() {
          volumeBarRect = volumeBar.getBoundingClientRect();
          volumeBarHeight = volumeBarRect.bottom - volumeBarRect.top;
          timeBarRect = timeBar.getBoundingClientRect();
          timeBarWidth = timeBarRect.right - timeBarRect.left;

          // Wait for oplTabs component
          $timeout(function() {
            oplTabsController = angular.element(document.querySelector('opl-tabs > nav')).controller('oplTabs');
          });
        }
      },

      /**
       * Removes event listeners.
       *
       * @method $onDestroy
       */
      $onDestroy: {
        value: function() {
          if (ctrl.player)
            ctrl.player.destroy();
        }
      },

      /**
       * Handles one-way binding properties changes.
       *
       * @method $onChanges
       * @param {Object} changedProperties Properties which have changed since last digest loop
       * @param {Object} [changedProperties.oplData] oplData old and new value
       * @param {String} [changedProperties.oplData.previousValue] oplData old value
       * @param {String} [changedProperties.oplData.currentValue] oplData new value
       * @param {Object} [changedProperties.oplFullscreenIcon] oplFullscreenIcon old and new value
       * @param {String} [changedProperties.oplFullscreenIcon.currentValue] oplFullscreenIcon new value
       * @param {Object} [changedProperties.oplVolumeIcon] oplVolumeIcon old and new value
       * @param {String} [changedProperties.oplVolumeIcon.currentValue] oplVolumeIcon new value
       * @param {Object} [changedProperties.oplModeIcon] oplModeIcon old and new value
       * @param {String} [changedProperties.oplModeIcon.currentValue] oplModeIcon new value
       * @param {Object} [changedProperties.oplSettingsIcon] oplSettingsIcon old and new value
       * @param {String} [changedProperties.oplSettingsIcon.currentValue] oplSettingsIcon new value
       * @param {Object} [changedProperties.oplFullViewport] oplFullViewport old and new value
       * @param {String} [changedProperties.oplFullViewport.currentValue] oplFullViewport new value
       * @param {Object} [changedProperties.oplTime] oplTime old and new value
       * @param {String} [changedProperties.oplTime.currentValue] oplTime new value
       * @param {Object} [changedProperties.oplMediaSourcesIcon] oplMediaSourcesIcon old and new value
       * @param {String} [changedProperties.oplMediaSourcesIcon.currentValue] oplMediaSourcesIcon new value
       * @param {Object} [changedProperties.oplRememberPosition] oplRememberPosition old and new value
       * @param {String} [changedProperties.oplRememberPosition.currentValue] oplRememberPosition new value
       * @param {Object} [changedProperties.oplLanguage] oplLanguage old and new value
       * @param {String} [changedProperties.oplLanguage.currentValue] oplLanguage new value
       * @param {Object} [changedProperties.oplAutoPlay] oplAutoPlay old and new value
       * @param {String} [changedProperties.oplAutoPlay.currentValue] oplAutoPlay new value
       * @param {Object} [changedProperties.oplHideChaptersTab] oplHideChaptersTab old and new value
       * @param {String} [changedProperties.oplHideChaptersTab.currentValue] oplHideChaptersTab new value
       * @param {Object} [changedProperties.oplHideTagsTab] oplHideTagsTab old and new value
       * @param {String} [changedProperties.oplHideTagsTab.currentValue] oplHideTagsTab new value
       * @param {Object} [changedProperties.oplDisableCut] oplDisableCut old and new value
       * @param {String} [changedProperties.oplDisableCut.currentValue] oplDisableCut new value
       */
      $onChanges: {
        value: function(changedProperties) {
          var newValue;

          // oplData
          if (changedProperties.oplData && changedProperties.oplData.currentValue) {
            var oplData = changedProperties.oplData;
            init(!oplData.previousValue || oplData.currentValue === oplData.previousValue);

            if (oplData.previousValue && oplData.previousValue.needPointsOfInterestUnitConversion === true &&
                !oplData.currentValue.needPointsOfInterestUnitConversion) {
              prepareData(ctrl.data);
              playerService.setMedia(ctrl.data);
              processMediaTabs(ctrl.duration);
            }
          }

          // oplDisableCut
          if (changedProperties.oplDisableCut && changedProperties.oplDisableCut.currentValue) {
            newValue = changedProperties.oplDisableCut.currentValue;
            ctrl.cutDisabled = (typeof newValue === 'undefined') ? true : JSON.parse(newValue);

            if (ctrl.duration) {
              init(false);
              processMediaTabs(playerService.getRealDuration());
              ctrl.setTime(0);
            }
          }

          // oplFullscreenIcon
          if (changedProperties.oplFullscreenIcon && changedProperties.oplFullscreenIcon.currentValue) {
            newValue = changedProperties.oplFullscreenIcon.currentValue;
            ctrl.fullscreenIconDisplayed =
              implementFullScreenAPI() && ((typeof newValue === 'undefined') ? true : JSON.parse(newValue));
            updateAttributes();
          }

          // oplVolumeIcon
          if (changedProperties.oplVolumeIcon && changedProperties.oplVolumeIcon.currentValue) {
            newValue = changedProperties.oplVolumeIcon.currentValue;
            ctrl.volumeIconDisplayed = (typeof newValue === 'undefined') ? true : JSON.parse(newValue);
            updateAttributes();
          }

          // oplModeIcon
          if (changedProperties.oplModeIcon && changedProperties.oplModeIcon.currentValue) {
            newValue = changedProperties.oplModeIcon.currentValue;
            ctrl.modeIconDisplayed = (typeof newValue === 'undefined') ? true : JSON.parse(newValue);
            updateAttributes();
          }

          // oplSettingsIcon
          if (changedProperties.oplSettingsIcon && changedProperties.oplSettingsIcon.currentValue) {
            newValue = changedProperties.oplSettingsIcon.currentValue;
            ctrl.settingsIconDisplayed = (typeof newValue === 'undefined') ? true : JSON.parse(newValue);
            updateAttributes();
          }

          // oplFullViewport
          if (changedProperties.oplFullViewport && changedProperties.oplFullViewport.currentValue) {
            newValue = changedProperties.oplFullViewport.currentValue;
            ctrl.fullViewportActivated = (typeof newValue === 'undefined') ? false : JSON.parse(newValue);
            updateAttributes();
          }

          // oplTime
          if (changedProperties.oplTime && changedProperties.oplTime.currentValue) {
            newValue = changedProperties.oplTime.currentValue;
            ctrl.timeDisplayed = (typeof newValue === 'undefined') ? true : JSON.parse(newValue);
          }

          // oplMediaSourcesIcon
          if (changedProperties.oplMediaSourcesIcon && changedProperties.oplMediaSourcesIcon.currentValue) {
            newValue = changedProperties.oplMediaSourcesIcon.currentValue;
            ctrl.mediaSourcesIconDisplayed = (typeof newValue === 'undefined') ? false : JSON.parse(newValue);
          }

          // oplRememberPosition
          if (changedProperties.oplRememberPosition && changedProperties.oplRememberPosition.currentValue) {
            newValue = changedProperties.oplRememberPosition.currentValue;
            ctrl.positionRemembered = (typeof newValue === 'undefined') ? false : JSON.parse(newValue);
          }

          // oplLanguage
          if (changedProperties.oplLanguage && changedProperties.oplLanguage.currentValue) {
            newValue = changedProperties.oplLanguage.currentValue;
            ctrl.language = (typeof newValue === 'undefined') ? 'en' : newValue;
          }

          // oplAutoPlay
          if (changedProperties.oplAutoPlay && changedProperties.oplAutoPlay.currentValue) {
            newValue = changedProperties.oplAutoPlay.currentValue;
            ctrl.autoPlayActivated = (typeof newValue === 'undefined') ? false : JSON.parse(newValue);
          }

          // oplHideChaptersTab
          if (changedProperties.oplHideChaptersTab && changedProperties.oplHideChaptersTab.currentValue) {
            newValue = changedProperties.oplHideChaptersTab.currentValue;
            if (!ctrl.chapters.length || (typeof newValue !== 'undefined' && JSON.parse(newValue) === true))
              ctrl.chaptersTabDisplayed = false;
            else
              ctrl.chaptersTabDisplayed = true;
          }

          // oplHideTagsTab
          if (changedProperties.oplHideTagsTab && changedProperties.oplHideTagsTab.currentValue) {
            newValue = changedProperties.oplHideTagsTab.currentValue;
            if (!ctrl.tags.length || (typeof newValue !== 'undefined' && JSON.parse(newValue) === true))
              ctrl.tagsTabDisplayed = false;
            else
              ctrl.tagsTabDisplayed = true;
          }

        }
      },

      /**
       * Sets the display mode.
       *
       * @method selectMode
       * @param {String} mode The display mode to activate, available display modes are set just before oplPlayer
       * definition
       */
      selectMode: {
        value: function(mode) {
          ctrl.selectedMode = mode;
        }
      },

      /**
       * Starts / Pauses the player.
       *
       * @method playPause
       */
      playPause: {
        value: function() {
          if (!ctrl.loading && !ctrl.error)
            ctrl.player.playPause();
        }
      },

      /**
       * Sets the player volume.
       *
       * @method setVolume
       * @param {Number} volume The volume to set from 0 to 100
       */
      setVolume: {
        value: function(volume) {
          ctrl.volume = volume;
          ctrl.player.setVolume(ctrl.volume);
        }
      },

      /**
       * Sets the player time.
       *
       * @method setTime
       * @param {Number} time The time to set in milliseconds
       */
      setTime: {
        value: function(time) {
          if (ctrl.cutDisabled !== true) {
            time = playerService.getRealTime(time);
          }

          ctrl.player.setTime(time);
        }
      },

      /**
       * Changes the source definition.
       *
       * @method setDefinition
       * @param {Object} definition The new definition from the list of available definitions
       */
      setDefinition: {
        value: function(definition) {
          if (definition && definition !== ctrl.selectedDefinition) {
            lastTime = ctrl.time;
            playRequested = !ctrl.player.isPaused();
            ctrl.selectedDefinition = definition;
            ctrl.loading = true;
            ctrl.initializing = true;
            safeApply(function() {
              ctrl.player.setDefinition(ctrl.selectedDefinition);
            });
          }
        }
      },

      /**
       * Selects the media source.
       *
       * @method setSource
       * @param {Number} sourceIndex index of the media source in the list of sources
       */
      setSource: {
        value: function(sourceIndex) {
          if (sourceIndex != ctrl.player.getSourceIndex()) {
            lastTime = ctrl.time;
            playRequested = !ctrl.player.isPaused();
            ctrl.player.setMediaSource(sourceIndex);
            ctrl.mediaDefinitions = ctrl.player.getAvailableDefinitions();
            ctrl.selectedDefinition = ctrl.mediaDefinitions && ctrl.mediaDefinitions[0] || null;
            ctrl.loading = true;
            ctrl.initializing = true;
            safeApply(function() {
              ctrl.sourceUrl = ctrl.player.getSourceUrl();
              ctrl.player.load();
            });
          }
        }
      }

    });

    /**
     * Sets the player volume.
     *
     * Volume is retrieved from the position of the cursor on the volume selector area.
     *
     * @param {MouseEvent} event The dispatched event when clicking on the volume selector.
     */
    $scope.setVolume = function(event) {
      var volume = Math.min(Math.round(((volumeBarRect.bottom - event.pageY) / volumeBarHeight) * 100), 100);
      ctrl.setVolume(volume);
    };

    /**
     * Sets the player time.
     *
     * Time is retrieved from the position of the cursor on the time bar area.
     *
     * @param {MouseEvent} event The dispatched event when clicking on the progress bar.
     */
    $scope.setTime = function(event) {
      timeBarRect = timeBar.getBoundingClientRect();
      timeBarWidth = timeBarRect.right - timeBarRect.left;
      ctrl.setTime(((event.pageX - timeBarRect.left) / timeBarWidth) * ctrl.duration);
    };

    /**
     * Toggles the volume.
     *
     * If the volume selector is opened, close it, open it otherwise.
     * Close definition, media sources and display modes if opened.
     * Automatically close volume after 3 seconds.
     */
    $scope.toggleVolume = function() {
      ctrl.modesOpened = false;
      ctrl.definitionOpened = false;
      ctrl.selectMediaOpened = false;
      ctrl.volumeOpened = !ctrl.volumeOpened;
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
      ctrl.volumeOpened = false;
      ctrl.modesOpened = false;
      ctrl.selectMediaOpened = false;
      ctrl.definitionOpened = !ctrl.definitionOpened;
      hideSettingsWithTimeout();
    };

    /**
     * Toggles display mode selection list.
     *
     * If the list of display modes is opened, close it, open it otherwise.
     * Close volume, definition and media sourcesif opened.
     * Automatically close display modes after 3 seconds.
     */
    $scope.toggleModes = function() {
      ctrl.volumeOpened = false;
      ctrl.definitionOpened = false;
      ctrl.selectMediaOpened = false;
      ctrl.modesOpened = !ctrl.modesOpened;
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
      ctrl.volumeOpened = false;
      ctrl.modesOpened = false;
      ctrl.definitionOpened = false;
      ctrl.selectMediaOpened = !ctrl.selectMediaOpened;
      hideSettingsWithTimeout();
    };

    /**
     * Toggles player full screen.
     *
     * If player is in full screen, reduce player to frame, otherwise, display player in full screen.
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

          ctrl.fullscreenButton = 'reduce';
        } else {
          if (document.exitFullscreen)
            document.exitFullscreen();
          else if (document.mozCancelFullScreen)
            document.mozCancelFullScreen();
          else if (document.webkitExitFullscreen)
            document.webkitExitFullscreen();
          else if (document.msExitFullscreen)
            document.msExitFullscreen();

          ctrl.fullscreenButton = 'enlarge';
        }

      } else {

        // Fullscreen API not available
        // Use viewport fullscreen instead
        fullscreen = ctrl.fullViewportActivated = !fullscreen;
        ctrl.fullscreenButton = fullscreen ? 'reduce' : 'enlarge';

      }
    };

    /**
     * Seeks to a chapter.
     *
     * Selects the media tab and seek to the chapter timecode.
     *
     * @param {Object} chapter The selected chapter
     * @param {Object} chapter.value The chapter timecode
     */
    $scope.seekToChapter = function(chapter) {
      ctrl.player.setTime(chapter.value);
      oplTabsController.selectViewById('media');
    };

    /**
     * Seeks to an index.
     *
     * Selects the media tab and seek to the index timecode.
     *
     * @param {Object} index The selected index
     * @param {Object} index.timecode The index timecode
     */
    $scope.seekToIndex = function(index) {
      ctrl.player.setTime(index.timecode);
      oplTabsController.selectViewById('media');
    };

    /**
     * Seeks to a tag.
     *
     * Selects the media tab and seek to the tag timecode.
     *
     * @param {Object} tag The selected tag
     * @param {Object} tag.value The chapter timecode
     */
    $scope.seekToTag = function(tag) {
      ctrl.player.setTime(tag.value);
      oplTabsController.selectViewById('media');
    };

    // Listen to player template loaded event
    $scope.$on('$includeContentLoaded', function() {
      $timeout(function() {

        // Initialize player
        ctrl.player.initialize();

      }, 1);
    });

  }

  app.controller('OplPlayerController', OplPlayerController);
  OplPlayerController.$inject = [
    '$injector',
    '$document',
    '$sce',
    '$filter',
    '$timeout',
    '$cookies',
    '$scope',
    '$element',
    'oplPlayerService',
    'oplI18nService',
    'oplPlayerErrors'
  ];

})(angular, angular.module('ov.player'));
