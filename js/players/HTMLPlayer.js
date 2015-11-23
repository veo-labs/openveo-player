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
            this.jPlayerElement.triggerHandler('ovLoadProgress', {
              loadedStart: Math.max(0, Math.min(loadedStart, 1)) * 100,
              loadedPercent: Math.max(0, Math.min(loadedEnd - loadedStart, 1)) * 100
            });
          }

          break;

        // The duration attribute has just been updated
        case 'durationchange':
          var duration = this.player.duration || this.media.metadata && this.media.metadata.duration;
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
          var playedPercent = (this.player.currentTime / this.player.duration) * 100;
          this.jPlayerElement.triggerHandler('ovPlayProgress', {
            time: this.player.currentTime * 1000,
            percent: playedPercent
          });
          break;

        // Media error
        case 'error':
          this.jPlayerElement.triggerHandler('error', event);
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
      'pause',
      'error'
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

      // Order media definitions from better quality to lower quality
      this.media.files.sort(function(def1, def2) {
        if (def1.height < def2.height)
          return 1;

        return -1;
      });
    }

    HTMLPlayer.prototype = new OvPlayer();
    HTMLPlayer.prototype.constructor = HTMLPlayer;

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
      var self = this;
      this.loaded = false;
      this.player = $document[0].getElementById(this.playerId);

      // Handle events
      this.handlePlayerEventsFn = angular.bind(this, handlePlayerEvents);
      var jPlayer = angular.element(this.player);

      // Set media events listeners
      for (var i = 0; i < events.length; i++)
        jPlayer.on(events[i], this.handlePlayerEventsFn);

      // Set error event listener on last source (called only if no source are available)
      var lastSources = this.player.getElementsByTagName('source');
      var jPlayerLastSource = angular.element(lastSources[lastSources.length - 1]);
      jPlayerLastSource.on('error', function(e) {
        if (self.player.networkState == self.player.NETWORK_NO_SOURCE) {
          e.target.error = {code: 'NO_SOURCE', MEDIA_NO_SOURCE: 'NO_SOURCE'};
        }
        self.handlePlayerEventsFn(e);
      });

      // Start loading media
      this.load();
    };

    /**
     * Starts loading current media.
     */
    HTMLPlayer.prototype.load = function() {
      this.player.load();
    };

    /**
     * Tests if player actual state is pause.
     * @param Boolean true if paused, false otherwise
     */
    HTMLPlayer.prototype.isPaused = function() {
      return this.player.paused;
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
     * Gets media definitions.
     * @return Array The list of available media definitions
     */
    HTMLPlayer.prototype.getAvailableDefinitions = function() {
      return this.media.files;
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
