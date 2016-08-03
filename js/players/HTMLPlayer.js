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
      for (var i = 0; i < this.media.sources.length; i++) {
        if (this.media.sources[i].files)
          this.media.sources[i].files.sort(function(def1, def2) {
            if (def1.height < def2.height)
              return 1;

            return -1;
          });
      }
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
        return this.media.sources[this.selectedMediaIndex].adaptive.map(
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
      var media = this.media.sources[this.selectedMediaIndex];
      return !media.adaptive || media.adaptive.length == 0 ? media.files : null;
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
