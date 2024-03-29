'use strict';

/**
 * @module ov.player
 */

(function(angular, app) {

  /**
   * Creates an HTML player factory which observes OplPlayer interface.
   * More information on HTML player at http://www.w3.org/TR/html5/embedded-content-0.html.
   *
   * @class OplHtmlPlayer
   */
  function OplHtmlPlayer(OplPlayer, $window, $document, $sce, oplPlayerErrors) {

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
          // Caution, the progress event maybe dispatched even if buffer is empty
          var buffer = this.player.buffered();
          if (buffer.length >= 1) {
            var loadedStart = (this.player.currentTime() / this.player.duration()) || 0;
            this.jPlayerElement.triggerHandler('oplLoadProgress', {
              loadedStart: Math.max(0, Math.min(loadedStart, 1)) * 100,
              loadedPercent: this.player.bufferedPercent() * 100
            });
          }
          break;

        // The duration attribute has just been updated
        case 'durationchange':
          var duration = this.player.duration() || this.media.metadata && this.media.metadata.duration;
          this.jPlayerElement.triggerHandler('oplDurationChange', duration * 1000);
          break;

        // Ready to render the media data at the current playback position for the first time
        case 'loadedmetadata':
          this.loaded = true;
          this.jPlayerElement.triggerHandler('oplReady');
          break;

        // Media is no longer paused
        case 'play':
          this.jPlayerElement.triggerHandler('oplPlay');
          break;

        // Media has been paused
        case 'pause':
          this.jPlayerElement.triggerHandler('oplPause');
          break;

        // Media playback has reached the end
        case 'ended':
          this.jPlayerElement.triggerHandler('oplEnd');
          break;

        // Media playback has stopped because the next frame is not available
        case 'waiting':
          this.jPlayerElement.triggerHandler('oplWaiting');
          break;

        // Media playback is ready to start after being paused or delayed
        // due to lack of media data
        case 'playing':
          this.jPlayerElement.triggerHandler('oplPlaying');
          break;

        // Media playback position has changed
        case 'timeupdate':
          var currentTime = this.player.currentTime();
          var playedPercent = (currentTime / this.player.duration()) * 100;
          this.jPlayerElement.triggerHandler('oplPlayProgress', {
            time: currentTime * 1000,
            percent: playedPercent
          });
          break;

        // Media error
        case 'error':
          var error = this.player.error();
          var code = error && error.code;

          if (this.player.networkState() == HTMLMediaElement.NETWORK_NO_SOURCE)
            code = oplPlayerErrors.MEDIA_ERR_NO_SOURCE;

          this.jPlayerElement.triggerHandler('oplError', {code: code});
          break;

        default:
          break;
      }
    }

    /**
     * Loads current source with the given definition.
     *
     * @param {Object} definition The definition from the list of available definitions
     */
    function load() {
      var mediaSource;
      var availableDefinitions = this.media.sources[this.selectedSourceIndex].files;
      var definition = null;

      if (this.definition && availableDefinitions) {

        // Look for current definition in the list of available definition
        // We make sure that the definition is the definition from the current source and not from a previously
        // selected source
        for (var i = 0; i < availableDefinitions.length; i++) {
          if (availableDefinitions[i].height === this.definition.height) {
            definition = availableDefinitions[i];
            break;
          }
        }

      }

      definition = definition || availableDefinitions && availableDefinitions[0] || null;

      if (!definition) {

        // Adaptive streaming
        mediaSource = this.media.sources[this.selectedSourceIndex].adaptive.map(function(obj) {
          var source = {};
          source['src'] = obj.link;
          source['type'] = obj.mimeType;
          return source;
        });

      } else {

        // Files
        mediaSource = [{src: definition.link, type: 'video/mp4'}];

      }

      this.player.src(mediaSource);
      this.player.poster(this.media.thumbnail);
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
     * Creates a new HtmlPlayer.
     *
     * @constructor
     * @extends Player
     * @param {Object} jPlayerElement The JQLite HTML element corresponding to the element which will receive events
     * dispatched by the player
     * @param {Object} media Media to load
     * @param {Array} media.sources Media sources with files or adaptive streaming information
     * @param {String} id The player id to use as the "id" attribute
     */
    function HtmlPlayer(jPlayerElement, media, id) {
      OplPlayer.prototype.init.call(this, jPlayerElement, id);
      this.setMedia(media);

      Object.defineProperties(this, {

        /**
         * Definition for the current source.
         *
         * @property error
         * @type String
         */
        definition: {
          value: null,
          writable: true
        }

      });
    }

    HtmlPlayer.prototype = new OplPlayer();
    HtmlPlayer.prototype.constructor = HtmlPlayer;

    /**
     * Gets media thumbnail.
     * Get the higher thumbnail quality.
     *
     * @method getMediaThumbnail
     * @return String The media thumbnail url
     */
    HtmlPlayer.prototype.getMediaThumbnail = function() {
      return this.media.thumbnail;
    };

    /**
     * Initializes the player when DOM is loaded.
     *
     * Retrieves player HTML element and attach listeners to it to be able
     * to receive media events.
     *
     * @method initialize
     */
    HtmlPlayer.prototype.initialize = function() {
      var self = this;
      this.loaded = false;

      this.player = videojs(this.playerId,
        {
          techOrder: ['html5'],
          autoplay: false,
          preload: 'metadata',
          playsinline: true,
          html5: {
            nativeControlsForTouch: false,
            nativeAudioTracks: false,
            nativeVideoTracks: false
          }
        });

      this.handlePlayerEventsFn = angular.bind(this, handlePlayerEvents);

      // Set media events listeners
      for (var i = 0; i < events.length; i++)
        this.player.on(events[i], this.handlePlayerEventsFn);

      this.player.ready(
        function() {

          // Start loading media
          if (!this.error_)
            self.load();
        }
      );
    };

    /**
     * Loads current source.
     *
     * @method load
     */
    HtmlPlayer.prototype.load = function() {
      load.call(this);
    };

    /**
     * Gets current definition of the current source.
     *
     * @method getDefinition
     * @return {String} the definition id
     */
    HtmlPlayer.prototype.getDefinition = function() {
      if (this.definition) return String(this.definition.height);

      var files = this.media.sources[this.selectedSourceIndex].files;
      if (files && files.length) return String(files[0].height);
    };

    /**
     * Changes definition of the current source.
     *
     * @method setDefinition
     * @param {String} id The definition id
     */
    HtmlPlayer.prototype.setDefinition = function(id) {
      for (var i = 0; i < this.media.sources[this.selectedSourceIndex].files.length; i++) {
        if (String(this.media.sources[this.selectedSourceIndex].files[i].height) === id) {
          this.definition = this.media.sources[this.selectedSourceIndex].files[i];
          load.call(this);
          break;
        }
      }
    };

    /**
     * Tests if player actual state is pause.
     *
     * @method isPaused
     * @return {Boolean} true if paused, false otherwise
     */
    HtmlPlayer.prototype.isPaused = function() {
      return this.player.paused();
    };

    /**
     * Tests if player actual state is playing.
     *
     * @method isPlaying
     * @return {Boolean} true if playing, false otherwise
     */
    HtmlPlayer.prototype.isPlaying = function() {
      return !this.isPaused();
    };

    /**
     * Plays or pauses the media depending on media actual state.
     *
     * @method playPause
     */
    HtmlPlayer.prototype.playPause = function() {
      if (this.player.paused() || this.player.ended()) {
        var playPromise = this.player.play();
        if (playPromise !== undefined) playPromise.then(function() {}).catch(function() {});
      } else
        this.player.pause();
    };

    /**
     * Sets volume.
     *
     * @method setVolume
     * @param {Number} volume The new volume from 0 to 100.
     */
    HtmlPlayer.prototype.setVolume = function(volume) {
      this.player.volume(volume / 100);
    };

    /**
     * Sets time.
     *
     * @method setTime
     * @param {Number} time The time to seek to in milliseconds
     */
    HtmlPlayer.prototype.setTime = function(time) {
      time = parseInt(time) || 0.1;
      this.player.currentTime(time / 1000);
    };

    /**
     * Sets current media.
     *
     * Also order media definitions from better quality to lower quality.
     *
     * @method setMedia
     * @param {Objet} media New media
     * @param {Array} media.sources Media sources with files or adaptive streaming information
     * @param {String} media.thumbnail Media thumbnail url
     */
    HtmlPlayer.prototype.setMedia = function(media) {
      OplPlayer.prototype.setMedia.call(this, media);

      // Order media definitions from better quality to lower quality
      for (var i = 0; i < this.media.sources.length; i++) {
        if (this.media.sources[i].files)
          this.media.sources[i].files.sort(function(def1, def2) {
            if (def1.height < def2.height)
              return 1;

            return -1;
          });
      }
    };

    /**
     * Gets player type.
     *
     * @method getPlayerType
     * @return {String} "html"
     */
    HtmlPlayer.prototype.getPlayerType = function() {
      return 'html';
    };

    /**
     * Gets media definitions.
     *
     * Files definition array is returned if there is no adaptive sources.
     *
     * @method getAvailableDefinitions
     * @return {Array|Null} The list of available media definitions
     */
    HtmlPlayer.prototype.getAvailableDefinitions = function() {
      var media = this.media.sources[this.selectedSourceIndex];
      if (media.adaptive && media.adaptive.length) return null;

      var qualities = [];
      media.files.forEach(function(quality) {
        qualities.push({
          id: String(quality.height),
          label: quality.height + 'p',
          hd: quality.height >= 720
        });
      });
      return qualities;
    };

    /**
     * Indicates that the HTML player does not support overlay play / pause button.
     *
     * @method isOverlayPlayPauseSupported
     * @return {Boolean} false
     */
    HtmlPlayer.prototype.isOverlayPlayPauseSupported = function() {
      return false;
    };

    /**
     * Destroys the player.
     *
     * Remove all events listeners.
     *
     * @method destroy
     */
    HtmlPlayer.prototype.destroy = function() {
      this.handlePlayerEventsFn = angular.bind(this, handlePlayerEvents);
      var jPlayer = angular.element(this.player);

      for (var i = 0; i < events.length; i++)
        jPlayer.off(events[i], this.handlePlayerEventsFn);

      this.loaded = false;
      this.player.dispose();
      this.player = null;
    };

    return HtmlPlayer;
  }

  app.factory('OplHtmlPlayer', OplHtmlPlayer);
  OplHtmlPlayer.$inject = ['OplPlayer', '$window', '$document', '$sce', 'oplPlayerErrors'];

})(angular, angular.module('ov.player'));
