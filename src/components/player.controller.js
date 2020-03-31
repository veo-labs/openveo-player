'use strict';

/**
 * @module ov.player
 */

(function(angular, app) {

  /**
   * Manages oplPlayer component.
   *
   * @param {Object} $injector AngularJS $injector service
   * @param {Object} $document AngularJS document JQLite element
   * @param {Object} $filter AngularJS $filter service
   * @param {Object} $timeout AngularJS $timeout service
   * @param {Object} $cookies AngularJS $cookies service
   * @param {Object} $scope The component isolated scope
   * @param {Object} $element The HTML element holding the component
   * @param {Object} $q The AngularJS $q service
   * @param {Function} OplPlayerService The PlayerService constructor to manage a media in a playing context
   * @param {Object} oplI18nService The service to manage languages
   * @param {Object} oplPlayerErrors The player errors
   * @param {Object} oplEventsFactory Helper to manipulate the DOM events
   * @class OplPlayerController
   * @constructor
   */
  function OplPlayerController(
    $injector,
    $document,
    $filter,
    $timeout,
    $cookies,
    $scope,
    $element,
    $q,
    OplPlayerService,
    oplI18nService,
    oplPlayerErrors,
    oplEventsFactory
  ) {
    var ctrl = this;
    var document = $document[0];
    var rootElement = $element.children()[0];
    var autoPlayActivated = false;
    var positionRemembered = false;
    var cutEnabled = true;
    var mediaData = null;
    var controlsHiddingTimer;
    var mediaWrapperElement;
    var lightControlsElement;
    var previewElement;
    var lastTime;
    var playerAnimationTimer;
    var lightControlsAnimationTimer;
    var fullscreenEnabled;
    var playerService;
    var playRequested;
    var timeBarController;
    var lightTimeBarController;
    var tabsController;
    var TEMPLATES;

    $scope.volumeIconDisplayed = true;
    $scope.timeDisplayed = true;
    $scope.indexesDisplayed = false;
    $scope.chaptersDisplayed = false;
    $scope.tagsDisplayed = false;
    $scope.mediaTemplate = null;
    $scope.settingsIconDisplayed = true;
    $scope.veoLabsIconDisplayed = true;
    $scope.fullViewportActivated = false;
    $scope.templateSelectorDisplayed = true;
    $scope.fullscreenIconDisplayed = true;
    $scope.overlayPlayPauseSupported = false;

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
     * Tests if a component attribute is true.
     *
     * Some attributes are strings and must be interpreted as booleans.
     *
     * @param {String} attribute The name of the attribute to test
     * @param {Boolean} defaultValue Attribute default value if undefined (true or false)
     * @return {Boolean} true if attribute is true, false otherwise
     */
    function isAttributeTrue(attribute, defaultValue) {
      if (typeof ctrl[attribute] === 'undefined') return defaultValue;
      return JSON.parse(ctrl[attribute]);
    }

    /**
     * Tests if an HTML element is part of the "opl-media-wrapper" element or not.
     *
     * @param {HTMLElement} element The element suspected to be part of the media wrapper
     * @return {Boolean} true if element is part of the media element, false otherwise
     */
    function isElementFromMedia(element) {
      if (!element) return false;

      element = angular.element(element);
      if (element.hasClass('opl-media-wrapper')) return true;

      return isElementFromMedia(element.parent()[0]);
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
     * Gets oplTiles component controller corresponding to the given view.
     *
     * @param {String} viewId The id of the view containing the oplTiles component
     * @return {Object} The oplTiles component controller
     */
    function getTilesController(viewId) {
      var oplTilesElement;

      if (viewId === 'chapters')
        oplTilesElement = $element[0].querySelector('.opl-chapters-view opl-tiles');
      else if (viewId === 'timecodes')
        oplTilesElement = $element[0].querySelector('.opl-timecodes-view opl-tiles');
      else if (viewId === 'tags')
        oplTilesElement = $element[0].querySelector('.opl-tags-view opl-tiles');

      return angular.element(oplTilesElement).controller('oplTiles');
    }

    /**
     * Animates the masking of the player.
     *
     * @return {Promise} Promise resolving when animation is finished
     */
    function animatePlayerMasking() {
      if (playerAnimationTimer) return $q.when();
      var deferred = $q.defer();

      mediaWrapperElement.addClass('opl-masking');

      // An animation is associated to the "opl-masking" class, wait for it to finish
      // Delay corresponds to the animation duration
      playerAnimationTimer = $timeout(function() {
        playerAnimationTimer = null;
        mediaWrapperElement.addClass('opl-masked');
        mediaWrapperElement.removeClass('opl-masking');
        deferred.resolve();
      }, 225);

      return deferred.promise;
    }

    /**
     * Animates the posting of the player.
     *
     * @return {Promise} Promise resolving when animation is finished
     */
    function animatePlayerPosting() {
      if (playerAnimationTimer) return $q.when();
      var deferred = $q.defer();

      mediaWrapperElement.removeClass('opl-masked');
      mediaWrapperElement.addClass('opl-posting');

      // An animation is associated to the "opl-posting" class, wait for it to finish
      // Delay corresponds to the animation duration
      playerAnimationTimer = $timeout(function() {
        playerAnimationTimer = null;
        mediaWrapperElement.removeClass('opl-posting');
        deferred.resolve();
      }, 525);

      return deferred.promise;
    }

    /**
     * Animates the masking of light controls.
     *
     * @return {Promise} Promise resolving when animation is finished
     */
    function animateLightControlsMasking() {
      if (lightControlsAnimationTimer) return $q.when();
      var deferred = $q.defer();

      lightControlsElement.removeClass('opl-light-controls-posted');
      lightControlsElement.addClass('opl-light-controls-masking');

      // An animation is associated to the "opl-light-controls-masking" class, wait for it to finish
      // Delay corresponds to the animation duration
      lightControlsAnimationTimer = $timeout(function() {
        lightControlsAnimationTimer = null;
        lightControlsElement.removeClass('opl-light-controls-masking');
        deferred.resolve();
      }, 150);

      return deferred.promise;
    }

    /**
     * Animates the posting of light controls.
     *
     * @return {Promise} Promise resolving when animation is finished
     */
    function animateLightControlsPosting() {
      if (lightControlsAnimationTimer) return $q.when();
      var deferred = $q.defer();

      lightControlsElement.addClass('opl-light-controls-posting');

      // An animation is associated to the "opl-light-controls-posting" class, wait for it to finish
      // Delay corresponds to the animation duration
      lightControlsAnimationTimer = $timeout(function() {
        lightControlsAnimationTimer = null;
        lightControlsElement.addClass('opl-light-controls-posted');
        lightControlsElement.removeClass('opl-light-controls-posting');
        deferred.resolve();
      }, 150);

      return deferred.promise;
    }

    /**
     * Hides the player.
     *
     * Player is masked with an animation.
     *
     * @return {Promise} Promise resolving when the player is masked
     */
    function maskPlayer() {
      if (mediaWrapperElement.hasClass('opl-masked')) return $q.when();
      var deferred = $q.defer();

      requestAnimationFrame(function() {
        animatePlayerMasking().then(function() {
          deferred.resolve();
        }).catch(function(reason) {
          deferred.reject(reason);
        });
      });

      return deferred.promise;
    }

    /**
     * Displays the player.
     *
     * Player is posted with an animation.
     * It is not possible to post player if masking animation is still on.
     *
     * @return {Promise} Promise resolving when the player is posted
     */
    function postPlayer() {
      if (!mediaWrapperElement.hasClass('opl-masking') && !mediaWrapperElement.hasClass('opl-masked'))
        return $q.when();

      var deferred = $q.defer();

      requestAnimationFrame(function() {
        animatePlayerPosting().then(function() {
          deferred.resolve();
        }).catch(function(reason) {
          deferred.reject(reason);
        });
      });

      return deferred.promise;
    }

    /**
     * Hides light controls.
     *
     * Light controls are masked with an animation.
     * It is not possible to mask light controls if posting animation is still on.
     *
     * @return {Promise} Promise resolving when light controls are masked
     */
    function maskLightControls() {
      if (!lightControlsElement.hasClass('opl-light-controls-posting') &&
          !lightControlsElement.hasClass('opl-light-controls-posted'))
        return $q.when();
      var deferred = $q.defer();

      requestAnimationFrame(function() {
        animateLightControlsMasking().then(function() {
          deferred.resolve();
        }).catch(function(reason) {
          deferred.reject(reason);
        });
      });

      return deferred.promise;
    }

    /**
     * Displays light controls.
     *
     * Light controls are posted with an animation.
     *
     * @return {Promise} Promise resolving when controls are posted
     */
    function postLightControls() {
      if (lightControlsElement.hasClass('opl-light-controls-posted')) return $q.when();

      var deferred = $q.defer();

      requestAnimationFrame(function() {
        animateLightControlsPosting().then(function() {
          deferred.resolve();
        }).catch(function(reason) {
          deferred.reject(reason);
        });
      });

      return deferred.promise;
    }

    /**
     * Updates tabs.
     *
     * Each tabs can be displayed or not depending on the available points of interest and component attributes.
     */
    function updateTabs() {
      $scope.indexesDisplayed = ctrl.timecodes.length && isAttributeTrue('oplIndexes', true);
      $scope.chaptersDisplayed = ctrl.chapters.length && isAttributeTrue('oplChapters', true);
      $scope.tagsDisplayed = ctrl.tags.length && isAttributeTrue('oplTags', true);

      // If only 1 kind of points of interest, then hide the tabs bar
      // If no points of interest at all, hide the points of interest bar
      var totalTypes = $scope.chaptersDisplayed + $scope.tagsDisplayed + $scope.indexesDisplayed;
      $scope.tabsHidden = (totalTypes === 1 || totalTypes === 0);
      $scope.hidePoi = (totalTypes === 0);
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
     * Prepares points of interest.
     *
     * @param {Array} pointsOfInterest The list of points of interest as defined in component opl-data attribute
     * @return {Array} The prepared list of points of interest with for each point of interest:
     *   - **id** A generated unique id
     *   - **type** The type of the point of interest, either "image" or "text"
     *   - **time** The time the point of interest is associated to (in milliseconds)
     *   - **abstract** Property used by the oplTiles and oplTile components to switch between small tiles and enlarged
     *     tiles
     *   - Only for points of interest of type "image":
     *     - **image** The small and large images with:
     *       - **small** Small image URL or a small image description object
     *         - **url** Sprite URL
     *         - **x** x coordinate of the small image in the sprite
     *         - **y** y coordinate of the small image in the sprite
     *       - **large** Large image URL
     *   - Only for points of interest of type "text":
     *     - **title** A title
     *     - **description** A description which may contain HTML tags
     *     - **file** An attached file with:
     *       - **url** The file URL
     *       - **originalName** The file original name to use when downloading
     */
    function preparePointsOfInterest(pointsOfInterest) {
      var preparedPointsOfInterest = [];

      if (pointsOfInterest) {
        for (var i = 0; i < pointsOfInterest.length; i++) {
          var pointOfInterest = pointsOfInterest[i];
          var value = pointOfInterest.value;
          if (Object.prototype.hasOwnProperty.call(pointOfInterest, 'timecode')) value = pointOfInterest.timecode;
          var preparedPointOfInterest = {
            id: i,
            type: Object.prototype.hasOwnProperty.call(pointOfInterest, 'image') ? 'image' : 'text',
            title: pointOfInterest.name,
            time: value,
            description: pointOfInterest.description,
            file: pointOfInterest.file,
            abstract: true
          };

          if (pointOfInterest.image) {
            preparedPointOfInterest.image = {
              small: {
                url: pointOfInterest.image.small.url || pointOfInterest.image.small,
                x: pointOfInterest.image.small.x || 0,
                y: pointOfInterest.image.small.y || 0
              },
              large: pointOfInterest.image.large
            };
          }

          preparedPointsOfInterest.push(preparedPointOfInterest);
        }
      }

      return preparedPointsOfInterest;
    }

    /**
     * Initializes the points of interest (e.g. indexes, chapters, tags).
     *
     * Prepares points of interest for oplTiles components and show / hide tabs.
     */
    function initPointsOfInterest() {
      if (!playerService) return;

      ctrl.chapters = preparePointsOfInterest(playerService.getMediaPointsOfInterest('chapters'));
      ctrl.tags = preparePointsOfInterest(playerService.getMediaPointsOfInterest('tags'));
      ctrl.timecodes = preparePointsOfInterest(playerService.getMediaPointsOfInterest('timecodes'));

      if (ctrl.timecodes.length) {

        // Got timecodes associated to the media
        // Use the first image of the first index as the area 2 content
        var pointOfInterest = playerService.findPointOfInterest('timecodes', ctrl.time);
        ctrl.area2ImageUrl = pointOfInterest ? pointOfInterest.image.large : null;

      }

      updateTabs();
    }

    /**
     * Creates a video player.
     *
     * Creates an instance of Player depending on the video provider (Youtube, Vimeo, HTML etc.).
     */
    function createPlayer() {
      if (mediaData.mediaId && mediaData.mediaId.length) {
        var playerType = ctrl.oplPlayerType || 'html';
        var playerId = 'player_' + new Date().getUTCMilliseconds();
        $scope.mediaTemplate = 'opl-' + playerType + '.html';
        mediaData.language = ctrl.language;

        // Get an instance of a player depending on player's type
        switch (playerType.toLowerCase()) {
          case 'youtube':
            var OplYoutubePlayer = $injector.get('OplYoutubePlayer');
            ctrl.player = new OplYoutubePlayer($element, mediaData, playerId);
            break;
          case 'vimeo':
            var OplVimeoPlayer = $injector.get('OplVimeoPlayer');
            ctrl.player = new OplVimeoPlayer($element, mediaData, playerId);
            break;
          case 'html':
            var OplHTMLPlayer = $injector.get('OplHtmlPlayer');
            ctrl.player = new OplHTMLPlayer($element, mediaData, playerId);
            break;
          default:
            throw new Error('Player ' + playerType + ' is not supported');
        }
      }
    }

    /**
     * Shows / hides icons.
     */
    function updateIcons() {
      if (!ctrl.player) return;

      // Icon to change player definition
      // If no definitions available, the icon is not displayed
      var mediaDefinitions = (ctrl.player && ctrl.player.getAvailableDefinitions()) || null;
      $scope.settingsIconDisplayed =
        mediaDefinitions || (ctrl.mediaSources && ctrl.mediaSources.length > 1) ? $scope.settingsIconDisplayed : false;

      // Media volume can't be changed on touch devices
      // Hide volume icon
      $scope.volumeIconDisplayed = $scope.volumeIconDisplayed && !isTouchDevice();

      // Template selector icon is available only if there are indexes
      $scope.templateSelectorDisplayed = isAttributeTrue('oplTemplateIcon', true) && $scope.indexesDisplayed;
    }

    /**
     * Updates the index preview.
     *
     * @param {Number} time The new time of the previewed index (in milliseconds)
     * @param {Number} xPosition The position of the time on the x-axis relative to the time bar
     */
    function updatePreview(time, xPosition) {
      if (!ctrl.timecodes.length) return;

      var index = playerService.findPointOfInterest('timecodes', time);
      $scope.previewTime = time;
      $scope.previewImage = index.image && index.image.small;

      previewElement.attr('style', 'transform: translateX(' + (xPosition - 142 / 2) + 'px);');
    }

    /**
     * Prepares the list of sources for the oplSettings component.
     *
     * @param {Array} sources The list of source ids
     * @return {Array} The list of sources with for each source its id and its label
     */
    function prepareSources(sources) {
      var preparedSources = [];

      for (var i = 0; i < sources.length; i++) {
        preparedSources.push({
          id: sources[i],
          label: $filter('oplTranslate')('CONTROLS_SETTINGS_SOURCE_LABEL', {'%source%': i + 1})
        });
      }

      return preparedSources;
    }

    /**
     * Resets the component.
     *
     * Prepares data, set media to the player service, creates a player if not already created, set player media, set
     * default values for component properties.
     */
    function reset() {
      if (!playerService) return;

      var newPlayerInstantiated = false;
      mediaData = angular.copy(ctrl.oplData) || {};
      prepareData(mediaData);
      playerService.setMedia(mediaData);
      playerService.setCutsStatus(cutEnabled);

      if (!ctrl.player) {

        // Instantiate a new player
        newPlayerInstantiated = true;
        createPlayer();

      } else {

        // Player is already instantiated
        // Just update its data
        ctrl.player.setMedia(mediaData);

      }

      if (!ctrl.player) return;

      ctrl.timecodes = [];
      ctrl.chapters = [];
      ctrl.tags = [];
      ctrl.area2ImageUrl = null;
      ctrl.playerId = ctrl.player.getId();
      ctrl.selectedTemplate = TEMPLATES.FULL_1;
      ctrl.playing = false;
      ctrl.fullscreenEnabled = false;
      ctrl.loading = true;
      ctrl.initializing = true;
      ctrl.error = null;
      ctrl.volume = 100;
      ctrl.loadedStart = 0;
      ctrl.loadedPercent = 0;
      ctrl.seenPercent = 0;
      ctrl.time = 0;
      ctrl.duration = 0;
      $scope.lightVolume = 100;
      $scope.overlayPlayPauseSupported = ctrl.player.isOverlayPlayPauseSupported();

      // Retrieve last stopped time
      if (positionRemembered) {
        var cookie = $cookies.getObject('videoStopped_' + mediaData.mediaId);
        if (cookie) {
          ctrl.seenPercent = cookie.percent;
          ctrl.time = cookie.time;
          lastTime = ctrl.time;
        }
      }

      // Real media duration is required to be able to display points of interest
      // Thus we have to wait for the media duration returned by the player

      // Get available definitions for selected source: if null, definitions are managed by the player or player does
      // not support definitions
      ctrl.mediaDefinitions = ctrl.player.getAvailableDefinitions();

      // Get source URL (only Vimeo player uses this)
      ctrl.sourceUrl = ctrl.player.getSourceUrl();

      ctrl.mediaSources = prepareSources(mediaData.mediaId);
      ctrl.mediaQualities = angular.copy(ctrl.mediaDefinitions);

      ctrl.selectedSource = ctrl.mediaSources[ctrl.player.getSourceIndex()].id;
      ctrl.selectedDefinition = ctrl.player.getDefinition();

      updateTabs();
      updateIcons();

      // Full viewport and no fullScreen API available
      // Consider the player as in fullscreen
      if ($scope.fullViewportActivated && !implementFullScreenAPI()) {
        ctrl.fullscreenEnabled = true;
        fullscreenEnabled = true;
      }

      oplI18nService.setLanguage(ctrl.language);

      if (!newPlayerInstantiated) {

        // Player existed before init
        // Load the new media with the new selected source
        lastTime = 0;
        ctrl.player.load();

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
        ctrl.selectedDefinition = ctrl.player.getDefinition();
        $element.triggerHandler('ready');

        if ((autoPlayActivated || playRequested) && !ctrl.player.isPlaying()) {
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
        ctrl.playing = true;
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
        playerService.setRealDuration(duration);
        ctrl.duration = playerService.getDuration();

        if (mediaData.needPointsOfInterestUnitConversion === true) {
          $element.triggerHandler('needPoiConversion', duration);
        } else {
          ctrl.setTime(lastTime);
          initPointsOfInterest();
          ctrl.selectTemplate(ctrl.oplTemplate);
          updateIcons();
          timeBarController.reset();
          $element.triggerHandler('durationChange', ctrl.duration);
        }
      });
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
        ctrl.selectedDefinition = ctrl.player.getDefinition();
        ctrl.mediaQualities = angular.copy(ctrl.mediaDefinitions);
        updateIcons();
        ctrl.loading = false;
        ctrl.playing = true;
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
        ctrl.playing = false;
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
        ctrl.loadedStart = playerService.getTime(data.loadedStart);
        ctrl.loadedPercent = playerService.getDurationPercent(data.loadedPercent);
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
      if (ctrl.initializing) return;

      ctrl.loading = false;

      if (ctrl.duration && playerService.getTime(data.time) >= playerService.getDuration()) {

        // Media virtual end reached

        ctrl.setTime(0);
        if (positionRemembered) $cookies.remove('videoStopped_' + mediaData.mediaId);
        lastTime = 0;
        ctrl.player.playPause();

        $element.triggerHandler('end');
      } else {

        // Media is still progressing

        safeApply(function() {
          ctrl.time = playerService.getTime(data.time);
          ctrl.seenPercent = playerService.getPercent(data.time);

          var pointOfInterest = playerService.findPointOfInterest('timecodes', ctrl.time);
          ctrl.area2ImageUrl = pointOfInterest ? pointOfInterest.image.large : null;

          var timeObject = {
            time: ctrl.time,
            percent: ctrl.seenPercent
          };
          $element.triggerHandler('playProgress', timeObject);
          var expireDate = new Date();
          expireDate.setDate(expireDate.getDate() + 1);

          if (positionRemembered)
            $cookies.putObject('videoStopped_' + mediaData.mediaId, timeObject, {expires: expireDate});
        });
      }

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
        if (positionRemembered) $cookies.remove('videoStopped_' + mediaData.mediaId);

        ctrl.time = ctrl.seenPercent = 0;
        lastTime = 0;
        ctrl.playing = false;

        var pointOfInterest = playerService.findPointOfInterest('timecodes', ctrl.time);
        ctrl.area2ImageUrl = pointOfInterest ? pointOfInterest.image.large : null;

        // Media is cut
        // Return to the cut start edge
        if (playerService.hasCuts()) ctrl.setTime(0);

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
        switch (Number(code)) {
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

    /**
     * Handles player out event.
     *
     * Hide controls.
     *
     * @param {Event} event The captured event which may defer depending on the device (mouse, touchpad, pen etc.)
     */
    function handlePlayerOut(event) {
      if (ctrl.controlsDisplayed && !isElementFromMedia(event.relatedTarget)) {
        safeApply(function() {
          ctrl.controlsDisplayed = false;
        });
      }
    }

    /**
     * Handles player move event.
     *
     * Automatically hide controls after 5 seconds if cursor is not moving.
     *
     * @param {Event} event The captured event which may defer depending on the device (mouse, touchpad, pen etc.)
     */
    function handlePlayerOn(event) {
      if (controlsHiddingTimer) {
        $timeout.cancel(controlsHiddingTimer);
      }

      if (!ctrl.controlsDisplayed) {
        safeApply(function() {
          ctrl.controlsDisplayed = true;
        });
      }

      // Automatically hide controls after 5 seconds
      controlsHiddingTimer = $timeout(function() {
        safeApply(function() {
          ctrl.controlsDisplayed = false;
        });
      }, 5000);
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
       * The list of indexes.
       *
       * It corresponds to the list of media indexes after applying cuts.
       *
       * @property timecodes
       * @type Array
       */
      timecodes: {
        value: [],
        writable: true
      },

      /**
       * The list of chapters.
       *
       * It corresponds to the list of media chapters after applying cuts.
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
       * It corresponds to the list of media tags after applying cuts.
       *
       * @property tags
       * @type Array
       */
      tags: {
        value: [],
        writable: true
      },

      /**
       * The volume level in percent.
       *
       * @property volume
       * @type Number
       */
      volume: {
        value: 100,
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
       * The virtual media duration.
       *
       * @property duration
       * @type Number
       */
      duration: {
        value: 0,
        writable: true
      },

      /**
       * The current virtual time in milliseconds.
       *
       * @property time
       * @type Number
       */
      time: {
        value: 0,
        writable: true
      },

      /**
       * The virtual percentage of the media that has been seen so far.
       *
       * @property seenPercent
       * @type Number
       */
      seenPercent: {
        value: 0,
        writable: true
      },

      /**
       * The virtual beginning of the loaded buffer in percent of the media.
       *
       * @property loadedStart
       * @type Number
       */
      loadedStart: {
        value: 0,
        writable: true
      },

      /**
       * The virtual percentage of the media which have been buffered.
       *
       * @property loadedPercent
       * @type Number
       */
      loadedPercent: {
        value: 0,
        writable: true
      },

      /**
       * The selected template.
       *
       * @property selectedTemplate
       * @type String
       */
      selectedTemplate: {
        value: 'split_50_50',
        writable: true
      },

      /**
       * The URL of the image to display in area 2.
       *
       * @property area2ImageUrl
       * @type String
       */
      area2ImageUrl: {
        value: null,
        writable: true
      },

      /**
       * Indicates if player is currently in fullscreen or not.
       *
       * @property fullscreenEnabled
       * @type Boolean
       */
      fullscreenEnabled: {
        value: false,
        writable: true
      },

      /**
       * Indicates if video is playing.
       *
       * @property playing
       * @type Boolean
       */
      playing: {
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
       * The list of media definitions.
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
       * The selected source.
       *
       * @property selectedSource
       * @type String
       */
      selectedSource: {
        value: null,
        writable: true
      },

      /**
       * The media source URL.
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
       * The list of sources for the actual media.
       *
       * @property mediaSources
       * @type Array
       */
      mediaSources: {
        value: [],
        writable: true
      },

      /**
       * The list of qualities for the actual media.
       *
       * @property mediaQualities
       * @type Array
       */
      mediaQualities: {
        value: [],
        writable: true
      },

      /**
       * Indicates if controls are displayed or not.
       *
       * @property controlsDisplayed
       * @type Boolean
       */
      controlsDisplayed: {
        value: true,
        writable: true
      },

      /**
       * Initializes controller and attributes.
       *
       * @method $onInit
       */
      $onInit: {
        value: function() {
          mediaWrapperElement = angular.element($element[0].querySelector('.opl-media-wrapper'));
          previewElement = angular.element($element[0].querySelector('.opl-index-preview'));
          lastTime = 0;
          fullscreenEnabled = false;
          $scope.previewDisplayed = false;
          $scope.touchDevice = isTouchDevice();

          // We can't rely on pointerup to close the controls because it appends each time the pen (for example) is
          // released.
          // We pointer is pressed the controls are displayed
          // We pointer is pressed and moving on the media wrapper, the controls are displayed
          mediaWrapperElement.on('mousemove ' + oplEventsFactory.EVENTS.DOWN, handlePlayerOn);
          mediaWrapperElement.on('mouseout', handlePlayerOut);

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
        }
      },

      /**
       * Initializes child components.
       *
       * @method $postLink
       */
      $postLink: {
        value: function() {
          $timeout(function() {
            playerService = new OplPlayerService();
            lightControlsElement = angular.element($element[0].querySelector('.opl-light-controls'));
            tabsController = angular.element($element[0].querySelector('.opl-tabs')).controller('oplTabs');

            var templateSelectorElement = angular.element($element[0].querySelector('.opl-template-selector'));
            var timeBarSliderElement =
                angular.element($element[0].querySelector('.opl-controls .opl-time-bar .opl-slider'));
            var lightTimeBarSliderElement =
                angular.element(lightControlsElement[0].querySelector('.opl-time-bar .opl-slider'));

            timeBarController = timeBarSliderElement.controller('oplSlider');
            lightTimeBarController = lightTimeBarSliderElement.controller('oplSlider');
            TEMPLATES = templateSelectorElement.controller('oplTemplateSelector').TEMPLATES;

            reset();
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
          if (ctrl.player) ctrl.player.destroy();

          mediaWrapperElement.off(
            oplEventsFactory.EVENTS.OUT + ' ' +
            oplEventsFactory.EVENTS.MOVE + ' ' +
            oplEventsFactory.EVENTS.DOWN
          );
          $element.off(
            'oplReady oplWaiting oplPlaying oplDurationChange oplPlay oplPause oplLoadProgress oplPlayProgress ' +
            'oplEnd oplError'
          );
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
       * @param {Object} [changedProperties.oplTemplateIcon] oplTemplateIcon old and new value
       * @param {String} [changedProperties.oplTemplateIcon.currentValue] oplTemplateIcon new value
       * @param {Object} [changedProperties.oplSettingsIcon] oplSettingsIcon old and new value
       * @param {String} [changedProperties.oplSettingsIcon.currentValue] oplSettingsIcon new value
       * @param {Object} [changedProperties.oplVeoLabsIcon] oplVeoLabsIcon old and new value
       * @param {String} [changedProperties.oplVeoLabsIcon.currentValue] oplVeoLabsIcon new value
       * @param {Object} [changedProperties.oplFullViewport] oplFullViewport old and new value
       * @param {String} [changedProperties.oplFullViewport.currentValue] oplFullViewport new value
       * @param {Object} [changedProperties.oplTime] oplTime old and new value
       * @param {String} [changedProperties.oplTime.currentValue] oplTime new value
       * @param {Object} [changedProperties.oplRememberPosition] oplRememberPosition old and new value
       * @param {String} [changedProperties.oplRememberPosition.currentValue] oplRememberPosition new value
       * @param {Object} [changedProperties.oplLanguage] oplLanguage old and new value
       * @param {String} [changedProperties.oplLanguage.currentValue] oplLanguage new value
       * @param {Object} [changedProperties.oplAutoPlay] oplAutoPlay old and new value
       * @param {String} [changedProperties.oplAutoPlay.currentValue] oplAutoPlay new value
       * @param {Object} [changedProperties.oplChapters] oplChapters old and new value
       * @param {String} [changedProperties.oplChapters.currentValue] oplChapters new value
       * @param {Object} [changedProperties.oplIndexes] oplIndexes old and new value
       * @param {String} [changedProperties.oplIndexes.currentValue] oplIndexes new value
       * @param {Object} [changedProperties.oplTags] oplTags old and new value
       * @param {String} [changedProperties.oplTags.currentValue] oplTags new value
       * @param {Object} [changedProperties.oplCuts] oplCuts old and new value
       * @param {String} [changedProperties.oplCuts.currentValue] oplCuts new value
       */
      $onChanges: {
        value: function(changedProperties) {
          var newValue;

          if ((changedProperties.oplFullscreenIcon && changedProperties.oplFullscreenIcon.currentValue) ||
              (changedProperties.oplVolumeIcon && changedProperties.oplVolumeIcon.currentValue) ||
              (changedProperties.oplTemplateIcon && changedProperties.oplTemplateIcon.currentValue) ||
              (changedProperties.oplSettingsIcon && changedProperties.oplSettingsIcon.currentValue) ||
              (changedProperties.oplVeoLabsIcon && changedProperties.oplVeoLabsIcon.currentValue) ||
              (changedProperties.oplFullViewport && changedProperties.oplFullViewport.currentValue)) {

            // oplFullscreenIcon
            if (changedProperties.oplFullscreenIcon && changedProperties.oplFullscreenIcon.currentValue) {
              $scope.fullscreenIconDisplayed = implementFullScreenAPI() && isAttributeTrue('oplFullscreenIcon', true);
            }

            // oplVolumeIcon
            if (changedProperties.oplVolumeIcon && changedProperties.oplVolumeIcon.currentValue) {
              $scope.volumeIconDisplayed = isAttributeTrue('oplVolumeIcon', true);
            }

            // oplTemplateIcon
            if (changedProperties.oplTemplateIcon && changedProperties.oplTemplateIcon.currentValue) {
              $scope.templateSelectorDisplayed = isAttributeTrue('oplTemplateIcon', true);
            }

            // oplSettingsIcon
            if (changedProperties.oplSettingsIcon && changedProperties.oplSettingsIcon.currentValue) {
              $scope.settingsIconDisplayed = isAttributeTrue('oplSettingsIcon', true);
            }

            // oplVeoLabsIcon
            if (changedProperties.oplVeoLabsIcon && changedProperties.oplVeoLabsIcon.currentValue) {
              $scope.veoLabsIconDisplayed = isAttributeTrue('oplVeoLabsIcon', true);
            }

            // oplFullViewport
            if (changedProperties.oplFullViewport && changedProperties.oplFullViewport.currentValue) {
              $scope.fullViewportActivated = isAttributeTrue('oplFullViewport', false);

              // Full viewport and no fullScreen API available
              // Consider the player as in fullscreen
              if ($scope.fullViewportActivated && !implementFullScreenAPI()) {
                ctrl.fullscreenEnabled = true;
                fullscreenEnabled = true;
              }
            }

            updateIcons();
          }

          // oplTime
          if (changedProperties.oplTime && changedProperties.oplTime.currentValue) {
            $scope.timeDisplayed = isAttributeTrue('oplTime', true);
          }

          // oplRememberPosition
          if (changedProperties.oplRememberPosition && changedProperties.oplRememberPosition.currentValue) {
            positionRemembered = isAttributeTrue('oplRememberPosition', false);
          }

          // oplLanguage
          if (changedProperties.oplLanguage && changedProperties.oplLanguage.currentValue) {
            newValue = changedProperties.oplLanguage.currentValue;
            ctrl.language = (typeof newValue === 'undefined') ? 'en' : newValue;
            oplI18nService.setLanguage(ctrl.language);
          }

          // oplAutoPlay
          if (changedProperties.oplAutoPlay && changedProperties.oplAutoPlay.currentValue) {
            autoPlayActivated = isAttributeTrue('oplAutoPlay', false);
          }

          // oplChapters / oplIndexes / oplTags
          if ((changedProperties.oplChapters && changedProperties.oplChapters.currentValue) ||
              (changedProperties.oplIndexes && changedProperties.oplIndexes.currentValue) ||
              (changedProperties.oplTags && changedProperties.oplTags.currentValue)) {
            initPointsOfInterest();
          }

          // oplTemplate
          if (changedProperties.oplTemplate && changedProperties.oplTemplate.currentValue) {
            ctrl.selectTemplate(changedProperties.oplTemplate.currentValue);
          }

          // oplCuts
          if (changedProperties.oplCuts && changedProperties.oplCuts.currentValue) {
            cutEnabled = isAttributeTrue('oplCuts', true);

            if (ctrl.duration && (!changedProperties.oplData || !changedProperties.oplData.currentValue)) {
              reset();
              ctrl.duration = playerService.getDuration();
              initPointsOfInterest();
              ctrl.selectTemplate(ctrl.oplTemplate);
              updateIcons();
              $element.triggerHandler('durationChange', ctrl.duration);
              ctrl.setTime(0);
            }
          }

          // oplData
          if (changedProperties.oplData && changedProperties.oplData.currentValue) {
            var oplData = changedProperties.oplData;
            reset();

            if (oplData.previousValue && oplData.previousValue.needPointsOfInterestUnitConversion === true &&
                !oplData.currentValue.needPointsOfInterestUnitConversion) {
              ctrl.setTime(lastTime);
              initPointsOfInterest();
              ctrl.selectTemplate(ctrl.oplTemplate);
              updateIcons();
              $element.triggerHandler('durationChange', ctrl.duration);
            }
          }
        }
      },

      /**
       * Sets the template.
       *
       * @method selectTemplate
       * @param {String} template The template to apply, available templates are defined in templateSelector component
       */
      selectTemplate: {
        value: function(template) {
          if (!TEMPLATES) return;

          if (!$scope.indexesDisplayed) {
            ctrl.selectedTemplate = TEMPLATES.FULL_1;
          } else {
            ctrl.selectedTemplate =
              template && Object.values(TEMPLATES).indexOf(template) > -1 ? template : TEMPLATES.SPLIT_50_50;
          }
        }
      },

      /**
       * Starts / Pauses the player.
       *
       * @method playPause
       * @param {Boolean} play true if play is requested, false if pause is requested
       */
      playPause: {
        value: function(play) {
          if (!ctrl.loading && !ctrl.error && ctrl.player)
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
          if (!ctrl.player || ctrl.volume !== volume) return;
          ctrl.player.setVolume(ctrl.volume);
        }
      },

      /**
       * Sets the player time.
       *
       * @method setTime
       * @param {Number} time Time in milliseconds relative to the cut media
       */
      setTime: {
        value: function(time) {
          ctrl.player.setTime(playerService.getRealTime(time));
        }
      },

      /**
       * Changes the source definition.
       *
       * @method setDefinition
       * @param {String} id The definition id
       */
      setDefinition: {
        value: function(id) {
          if (id && id !== ctrl.selectedDefinition) {
            lastTime = ctrl.time;
            playRequested = !ctrl.player.isPaused();
            ctrl.loading = true;
            ctrl.initializing = true;
            safeApply(function() {
              ctrl.player.setDefinition(id);
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
            ctrl.selectedSource = ctrl.mediaSources[sourceIndex].id;
            ctrl.mediaDefinitions = ctrl.player.getAvailableDefinitions();
            ctrl.selectedDefinition = ctrl.player.getDefinition();
            ctrl.mediaQualities = angular.copy(ctrl.mediaDefinitions);
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
     * Handles time bar update.
     *
     * Updates the player current time.
     *
     * @param {Number} value The time bar value in percent from 0 to 100
     */
    $scope.handleTimeBarUpdate = function(value) {
      ctrl.setTime(((value * ctrl.duration) / 100));
    };

    /**
     * Toggles player full screen.
     *
     * If player is in full screen, reduce player to frame, otherwise, display player in full screen.
     */
    $scope.toggleFullscreen = function() {

      // Fullscreen API is available
      if (implementFullScreenAPI()) {
        if ((document.fullScreenElement !== 'undefined' && document.fullScreenElement === null) ||
            (document.msFullscreenElement !== 'undefined' && document.msFullscreenElement === null) ||
            (document.mozFullScreen !== 'undefined' && document.mozFullScreen === false) ||
            (document.webkitFullscreenElement !== 'undefined' && document.webkitFullscreenElement === null)
        ) {
          if (rootElement.requestFullScreen)
            rootElement.requestFullScreen();
          else if (rootElement.mozRequestFullScreen)
            rootElement.mozRequestFullScreen();
          else if (rootElement.webkitRequestFullScreen)
            rootElement.webkitRequestFullScreen();
          else if (rootElement.msRequestFullscreen)
            rootElement.msRequestFullscreen();

          ctrl.fullscreenEnabled = true;
        } else {
          if (document.exitFullscreen)
            document.exitFullscreen();
          else if (document.mozCancelFullScreen)
            document.mozCancelFullScreen();
          else if (document.webkitExitFullscreen)
            document.webkitExitFullscreen();
          else if (document.msExitFullscreen)
            document.msExitFullscreen();

          ctrl.fullscreenEnabled = false;
        }

      } else {

        // Fullscreen API not available
        // Use viewport fullscreen instead
        fullscreenEnabled = $scope.fullViewportActivated = !fullscreenEnabled;
        ctrl.fullscreenEnabled = fullscreenEnabled;

      }
    };

    /**
     * Handles settings update.
     *
     * Changes the quality and / or the source.
     *
     * @param {String} quality The quality id
     * @param {String} source The source id
     */
    $scope.handleSettingsUpdate = function(quality, source) {
      var i;

      if (quality) return ctrl.setDefinition(quality);

      if (source) {
        for (i = 0; i < ctrl.mediaSources.length; i++) {
          if (ctrl.mediaSources[i].id === source)
            return ctrl.setSource(i);
        }
      }
    };

    /**
     * Handles tabs update.
     *
     * Masks light controls, displays the player and changes to the given view.
     *
     * @param {Object} view The chosen view
     * @param {String} view.oplViewId The view id
     */
    $scope.handleViewSelect = function(view) {
      var selectedView = tabsController.getSelectedView();
      if (!selectedView) return tabsController.selectViewById(view.oplViewId);

      var selectedViewId = selectedView.oplViewId;
      var tilesController = getTilesController(selectedViewId);

      tilesController.reduceTile().then(function() {
        maskLightControls();
        return postPlayer();
      }).then(function() {
        tabsController.selectViewById(view.oplViewId);
      });
    };

    /**
     * Handles view selection.
     *
     * A view has been selected.
     * Resets the oplTiles component.
     *
     * @param {String} id The view id
     */
    $scope.handleViewSelected = function(id) {
      $timeout(function() {
        var tilesController = getTilesController(id);
        tilesController.reset();
      });
    };

    /**
     * Handles control focus.
     *
     * A control component has been focused. Displays the controls.
     */
    $scope.handleControlFocus = function() {
      safeApply(function() {
        ctrl.controlsDisplayed = true;
      });
    };

    /**
     * Handles time bar over.
     *
     * Displays the index preview.
     */
    $scope.handleTimeBarOver = function() {
      if (!ctrl.timecodes.length) return;
      safeApply(function() {
        $scope.previewDisplayed = true;
      });
    };

    /**
     * Handles time bar out.
     *
     * Hides the index preview.
     */
    $scope.handleTimeBarOut = function() {
      if (!ctrl.timecodes.length) return;
      safeApply(function() {
        $scope.previewDisplayed = false;
      });
    };

    /**
     * Handles time bar move.
     *
     * Sets preview image, time and position.
     *
     * @param {Number} value The time bar value in percent
     * @param {Object} coordinates The coordinates
     * @param {Number} coordinates.x The x position of the time bar value relative to the page
     * @param {Number} coordinates.y The y position of the time bar value relative to the page
     * @param {Object} sliderBoundingRectangle Slider dimension and coordinates
     */
    $scope.handleTimeBarMove = function(value, coordinates, sliderBoundingRectangle) {
      if (!ctrl.timecodes.length) return;
      var xPosition = Math.max(sliderBoundingRectangle.width * (value / 100), 0);

      safeApply(function() {
        updatePreview(playerService.getTimeFromPercent(value), xPosition);
      });
    };

    /**
     * Handles tile selection.
     *
     * Seeks to the tile time.
     *
     * @param {Object} tile The tile being selected
     * @param {Number} tile.time The tile value
     */
    $scope.handleTileSelect = function(tile) {
      ctrl.setTime(tile.time);
    };

    /**
     * Handles "more info" action on a tile.
     *
     * Masks the player, displays light controls and enlarge tile.
     *
     * @param {Object} tile The tile being selected
     * @param {String} tile.id The tile id
     * @param {String} type The type of points of interest
     */
    $scope.handleTileInfo = function(tile, type) {
      var tilesController = getTilesController(type);

      maskPlayer().then(function() {
        postLightControls();
      });

      tilesController.enlargeTile(tile.id);
    };

    /**
     * Handles close action on a tile.
     *
     * Reduces tile, masks light controls and displays player.
     *
     * @param {Object} tile The tile being closed
     * @param {String} tile.id The tile id
     * @param {String} type The type of points of interest
     */
    $scope.handleTileClose = function(tile, type) {
      var tilesController = getTilesController(type);

      tilesController.reduceTile(tile.id);
      maskLightControls();
      postPlayer();
    };

    /**
     * Handles light volume open / close.
     *
     * When light volume controller is opened / closed, the light control time bar has to be reset as its size has
     * changed.
     */
    $scope.handleLightVolumeToggle = function() {
      lightTimeBarController.reset();
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
    '$filter',
    '$timeout',
    '$cookies',
    '$scope',
    '$element',
    '$q',
    'oplPlayerService',
    'oplI18nService',
    'oplPlayerErrors',
    'oplEventsFactory'
  ];

})(angular, angular.module('ov.player'));
