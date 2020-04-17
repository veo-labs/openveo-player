'use strict';

/**
 * @module ov.player
 */

(function(angular, app) {

  /**
   * Creates a Youtube player factory which observes OplPlayer interface.
   * More information on Youtube player can be found at https://developers.google.com/youtube/v3/docs/.
   * The Youtube embeded player exposes a JavaSript API to interact with
   * (https://developers.google.com/youtube/iframe_api_reference).
   *
   * @class OplYoutubePlayer
   */
  function OplYoutubePlayer(OplPlayer, $window, oplPlayerErrors) {

    /**
     * Handles all player post messages.
     *
     * @param {MessageEvent|Event} event The post message
     * @param {Object} data If post messages are not implemented, a simple
     * event can by used with data as second parameter instead of data
     * inside the MessageEvent object (event.data)
     */
    function handlePlayerEvents(event, data) {
      data = event.data ? JSON.parse(event.data) : data;

      // Events
      switch (data.event) {
        case 'infoDelivery':
          if (data.info.currentTime !== undefined && this.duration)
            this.jPlayerElement.triggerHandler('oplPlayProgress', {
              time: data.info.currentTime * 1000,
              percent: data.info.currentTime / this.duration * 100
            });

          if (data.info.videoLoadedFraction)
            this.jPlayerElement.triggerHandler('oplLoadProgress', {
              loadedStart: 0,
              loadedPercent: data.info.videoLoadedFraction * 100
            });
          break;

        case 'onStateChange':
          if (data.info != YT.PlayerState.PLAYING) {
            this.playing = 0;
            this.jPlayerElement.triggerHandler('oplPause');

            if (data.info == YT.PlayerState.ENDED) {
              this.jPlayerElement.triggerHandler('oplEnd');
            } else if (data.info == -1) {
              this.jPlayerElement.triggerHandler('oplReady');
            }
          } else {
            this.playing = 1;
            this.jPlayerElement.triggerHandler('oplPlay');

            if (this.requestPause) {
              this.requestPause = false;
              this.player.pauseVideo();
            }

            // As described in Youtube player API the video duration is only available when player have started
            // (https://developers.google.com/youtube/iframe_api_reference#getDuration)
            var duration = this.player.getDuration();
            if (!this.duration && duration) {
              this.duration = duration;
              this.jPlayerElement.triggerHandler('oplDurationChange', this.duration * 1000);
            }

          }
          break;

        default:
          break;
      }
    }

    // All Youtube player events
    var events = [
      'onStateChange',
      'infoDelivery',
      'infoDelivery',
      'onPlaybackQualityChange',
      'loadeddata',
      'progress',
      'playing',
      'ended',
      'timeupdate',
      'error'
    ];

    /**
     * Initializes the player.
     *
     * Youtube player uses postMessage API to be able to communicate with the player.
     * Before doing anything on the Youtube player the ready event must be handled.
     */
    function initialize() {
      if (this.ressourceLoaded && this.apiLoaded) {

        var self = this;
        this.loaded = false;

        this.player = new YT.Player(this.playerId, {
          playerVars: {
            fs: 0,
            rel: 0,
            autoplay: 0,
            html5: 1,
            theme: 'light',
            modestbranding: 1,
            color: 'white',
            iv_load_policy: 3,
            showinfo: 0,
            controls: 0,
            hl: this.media.language,
            enablejsapi: 1
          },
          events: {
            onReady: function() { // Youtube API is ready to be called

              // Handle post messages
              self.handlePlayerEventsFn = angular.bind(self, handlePlayerEvents);
              angular.element($window).on('message', self.handlePlayerEventsFn);

              // Set media events listeners
              var jPlayer = angular.element(self.player);
              for (var i = 0; i < events.length; i++)
                jPlayer.on(events[i], self.handlePlayerEventsFn);

              self.loaded = true;
              self.playing = 0;

              self.load();
            },
            onError: function(error) {
              var code;
              switch (error.data) {
                case 100:
                case 101:
                case 150:
                  code = oplPlayerErrors.MEDIA_ERR_PERMISSION;
                  break;
                default:
                  code = oplPlayerErrors.MEDIA_ERR_UNKNOWN;
                  break;
              }

              self.jPlayerElement.triggerHandler('oplError', {code: code});
            }
          },
          videoId: this.media.mediaId[this.selectedSourceIndex]
        });
      }
    }

    /**
     * Creates a new YoutubePlayer.
     *
     * @constructor
     * @extends Player
     * @param {Object} jPlayerElement The JQLite HTML element corresponding to the element which will receive events
     * dispatched by the player
     * @param {Object} media Media to load
     * @param {Array} media.mediaId The list of media sources ids (for different viewpoint)
     * @param {String} media.language The language code for the Youtube player
     * @param {String} id The player id to use as the "id" attribute
     */
    function YoutubePlayer(jPlayerElement, media, id) {
      var self = this;
      var youtubeApiScriptId = 'youtube-iframe-api';
      OplPlayer.prototype.init.call(this, jPlayerElement, id);
      this.setMedia(media);
      this.requestPause = false;

      var tag = document.createElement('script');
      tag.setAttribute('id', youtubeApiScriptId);
      tag.src = 'https://www.youtube.com/iframe_api';

      $window.onYouTubeIframeAPIReady = function() {
        self.apiLoaded = true;
        initialize.call(self);
      };

      // Add youtube API script if not already included
      if (!document.getElementById(youtubeApiScriptId)) {
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        this.apiLoaded = true;
        initialize.call(self);
      }
    }

    YoutubePlayer.prototype = new OplPlayer();
    YoutubePlayer.prototype.constructor = YoutubePlayer;

    /**
     * Gets media thumbnail.
     *
     * No need to manage the thumbnail it is already done by the Youtube player.
     *
     * @method getMediaThumbnail
     * @return {Null} null
     */
    YoutubePlayer.prototype.getMediaThumbnail = function() {
      return null;
    };

    /**
     * Intitializes the player.
     *
     * Nothing to do, the player is already initialized.
     *
     * @method initialize
     */
    YoutubePlayer.prototype.initialize = function() {
      this.ressourceLoaded = true;
      initialize.call(this);
    };

    /**
     * Plays or pauses the media depending on media actual state.
     *
     * @method playPause
     */
    YoutubePlayer.prototype.playPause = function() {
      if (this.player.getPlayerState() === YT.PlayerState.PLAYING)
        this.player.pauseVideo();
      else {
        this.requestPause = false;
        this.player.playVideo();
      }
    };

    /**
     * Sets volume.
     *
     * @method setVolume
     * @param {Number} volume The new volume from 0 to 100.
     */
    YoutubePlayer.prototype.setVolume = function(volume) {
      this.player.setVolume(volume);
    };

    /**
     * Sets time.
     *
     * @method setTime
     * @param {Number} time The time to seek to in milliseconds
     */
    YoutubePlayer.prototype.setTime = function(time) {
      var playerState = this.player.getPlayerState();
      time = parseInt(time) || 0;

      // Youtube workaround to deactivate autoplay.
      // Youtube seekTo method autoplay the video even if the video is in cued state with autoplay deactivated
      // as described in Youtube player API (https://developers.google.com/youtube/iframe_api_reference#seekTo).
      // Thus, if the video is in cued state, we have to wait for the video to start and then make a pause to have
      // the excpected behavior.
      if (!this.playing && playerState === YT.PlayerState.CUED)
        this.requestPause = true;

      this.player.seekTo(time / 1000, true);

      // Send a playProgress event because the Youtube flash player (old
      // browsers) does not trigger the playProgress event while in pause
      // as the HTML5 player does
      if (!this.playing)
        this.jPlayerElement.triggerHandler('oplPlayProgress', {
          time: time,
          percent: (time / this.duration) * 100
        });
    };

    /**
     * Gets player type.
     *
     * @method getPlayerType
     * @return {String} "youtube"
     */
    YoutubePlayer.prototype.getPlayerType = function() {
      return 'youtube';
    };

    /**
     * Tests if player actual state is pause.
     *
     * @method isPaused
     * @return {Boolean} true if paused, false otherwise
     */
    YoutubePlayer.prototype.isPaused = function() {
      return this.player.getPlayerState() === YT.PlayerState.PAUSED;
    };

    /**
     * Tests if player actual state is playing.
     *
     * @method isPlaying
     * @return {Boolean} true if playing, false otherwise
     */
    YoutubePlayer.prototype.isPlaying = function() {
      return this.player.getPlayerState() === YT.PlayerState.PLAYING;
    };

    /**
     * Loads player with selected source.
     *
     * @method load
     */
    YoutubePlayer.prototype.load = function() {
      this.player.cueVideoById(this.media.mediaId[this.selectedSourceIndex]);
    };

    /**
     * Gets media definitions.
     *
     * @method getAvailableDefinitions
     * @return {Array} The list of available definitions
     */
    YoutubePlayer.prototype.getAvailableDefinitions = function() {
      var qualities = [];
      if (!this.player) return qualities;

      var youtubeQualities = this.player.getAvailableQualityLevels();

      youtubeQualities.forEach(function(quality) {
        qualities.push({
          id: quality,
          label: quality,
          hd: (quality === 'hd720' || quality === 'hd1080' || quality === 'highres')
        });
      });

      return qualities;
    };

    /**
     * Sets current media.
     *
     * Also reset duration.
     *
     * @method setMedia
     * @param {Objet} media New media
     * @param {Array} media.mediaId The list of media sources ids (for different viewpoint)
     * @param {String} media.language The language code for the Youtube player
     */
    YoutubePlayer.prototype.setMedia = function(media) {
      OplPlayer.prototype.setMedia.call(this, media);

      // New media, duration has to be retrieved again
      this.duration = null;
    };

    /**
     * Gets current definition of the current source.
     *
     * @method getDefinition
     * @return {String} The definition id
     */
    YoutubePlayer.prototype.getDefinition = function() {
      if (!this.player) return null;
      return this.player.getPlaybackQuality();
    };

    /**
     * Changes definition of the current source.
     *
     * @method setDefinition
     * @param {String} id The definition id
     */
    YoutubePlayer.prototype.setDefinition = function(id) {
      this.player.setPlaybackQuality(id);
      this.jPlayerElement.triggerHandler('oplReady');
    };

    /**
     * Indicates that the Youtube player supports overlay play / pause button.
     *
     * @method isOverlayPlayPauseSupported
     * @return {Boolean} true
     */
    YoutubePlayer.prototype.isOverlayPlayPauseSupported = function() {
      return true;
    };

    /**
     * Destroys the player.
     *
     * Remove all events listeners.
     *
     * @method destroy
     */
    YoutubePlayer.prototype.destroy = function() {
      angular.element($window).off('message', this.handlePlayerEventsFn);
      this.player.destroy();
      this.loaded = false;
      this.playing = 0;
      this.player = null;
      this.duration = null;
    };

    return YoutubePlayer;
  }

  app.factory('OplYoutubePlayer', OplYoutubePlayer);
  OplYoutubePlayer.$inject = ['OplPlayer', '$window', 'oplPlayerErrors'];

})(angular, angular.module('ov.player'));
