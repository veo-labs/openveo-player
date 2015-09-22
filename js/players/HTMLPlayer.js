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
          return;
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
     *     pictures : [ // The list of media thumbnails (required for "html" player)
     *       {
     *         width : 960,
     *         height : 540,
     *         link : "https://i.vimeocdn.com/video/530445364_960x540.jpg"
     *       },
     *       {
     *         width : 1280,
     *         height : 720,
     *         link : "https://i.vimeocdn.com/video/530445364_1280x720.jpg"
     *       }
     *     ]
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
      return this.media.pictures &&
        this.media.pictures.length &&
        this.media.pictures[this.media.pictures.length - 1].link;
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
