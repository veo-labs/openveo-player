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
            var loadedStart = (this.player.currentTime() / this.player.duration()) || 0;
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

        // Ready to render the media data at the current playback position for the first time
        case 'loadedmetadata':
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
          var currentTime = this.player.currentTime();
          var playedPercent = (currentTime / this.player.duration()) * 100;
          this.jPlayerElement.triggerHandler('ovPlayProgress', {
            time: currentTime * 1000,
            percent: playedPercent
          });
          break;

        // Media error
        case 'error':
          if (this.player.networkState() == this.player.NETWORK_NO_SOURCE) {
            event.target.error = {code: 'NO_SOURCE', MEDIA_NO_SOURCE: 'NO_SOURCE'};
          }
          this.jPlayerElement.triggerHandler('error', event.target.error && event.target.error.code);
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
    function load(definition) {
      var mediaSource;
      var availableDefinitions = this.getAvailableDefinitions();
      var sourceDefinition = definition ||
          availableDefinitions && availableDefinitions[0] ||
          null;

      if (!sourceDefinition) {

        // Adaptive streaming
        mediaSource = this.media.sources[this.selectedSourceIndex].adaptive.map(function(obj) {
          var source = {};
          source['src'] = obj.link;
          source['type'] = obj.mimeType;
          return source;
        });

      } else {

        // Files
        mediaSource = [{src: sourceDefinition.link, type: 'video/mp4'}];

      }

      this.player.src(mediaSource);
      this.player.poster(this.media.thumbnail);
      this.player.load();
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
     * @param {Object} jPlayerElement The JQLite HTML element corresponding
     * to the element which will receive events dispatched by the player
     * @param {Object} media Media to load
     * @param {Array} media.sources Media sources with files or adaptive streaming information
     * @param {String} id The player id to use as the "id" attribute
     */
    function HTMLPlayer(jPlayerElement, media, id) {
      OvPlayer.prototype.init.call(this, jPlayerElement, id);
      this.setMedia(media);
    }

    HTMLPlayer.prototype = new OvPlayer();
    HTMLPlayer.prototype.constructor = HTMLPlayer;

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
     * Initializes the player when DOM is loaded.
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
    HTMLPlayer.prototype.load = function() {
      load.call(this);
    };

    /**
     * Changes definition of the current source.
     *
     * @method setDefinition
     * @param {Object} definition Definition from the list of available definitions
     */
    HTMLPlayer.prototype.setDefinition = function(definition) {
      load.call(this, definition);
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
     * Tests if player actual state is playing.
     *
     * @method isPlaying
     * @return {Boolean} true if playing, false otherwise
     */
    HTMLPlayer.prototype.isPlaying = function() {
      return !this.isPaused();
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
     * @param {Number} volume The new volume from 0 to 100.
     */
    HTMLPlayer.prototype.setVolume = function(volume) {
      this.player.volume(volume / 100);
    };

    /**
     * Sets time.
     *
     * @method setTime
     * @param {Number} time The time to seek to in milliseconds
     */
    HTMLPlayer.prototype.setTime = function(time) {
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
    HTMLPlayer.prototype.setMedia = function(media) {
      OvPlayer.prototype.setMedia.call(this, media);

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
    HTMLPlayer.prototype.getPlayerType = function() {
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
    HTMLPlayer.prototype.getAvailableDefinitions = function() {
      var media = this.media.sources[this.selectedSourceIndex];
      return (!media.adaptive || media.adaptive.length == 0) ? media.files : null;
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

  app.factory('OvPlayerHTML', OvHTMLPlayer);
  OvHTMLPlayer.$inject = ['OvPlayer', '$window', '$document', '$sce'];

})(angular, angular.module('ov.player'));
