'use strict';

(function(angular, app) {

  /**
   * Creates a Vimeo player factory which observes OvPlayer interface.
   * More information on Vimeo player can be found
   * at https://developer.vimeo.com/player.
   * The Vimeo embeded player exposes a JavaSript API to interact with
   * (https://developer.vimeo.com/player/js-api).
   *
   * @module ov.player
   * @class OvVimeoPlayer
   */
  function OvVimeoPlayer(OvPlayer, $window, $document, $sce) {

    /**
     * Sends a post message to the player with the action and the value.
     *
     * @param String action The action to perform (see
     * https://developer.vimeo.com/player/js-api)
     * @param String The value associated to the action
     */
    function postActionToPlayer(action, value) {
      if (this.loaded) {
        var data = {
          method: action
        };

        if (value)
          data.value = value;

        return this.player.contentWindow.postMessage(JSON.stringify(data), this.postMessageTargetOrigin);
      }

      return null;
    }

    /**
     * Handles ready event to fully initialize the player.
     * Register event listeners to the player and retrieve the vimeo
     * iframe corresponding to the player.
     */
    function handleReady() {
      this.postMessageTargetOrigin = 'https://player.vimeo.com/video/' + this.media.mediaId[this.selectedMediaIndex];
      this.player = $document[0].getElementById(this.playerId);
      this.loaded = true;
      this.playing = 0;

      // Register event listeners
      postActionToPlayer.call(this, 'addEventListener', 'loadProgress');
      postActionToPlayer.call(this, 'addEventListener', 'playProgress');
      postActionToPlayer.call(this, 'addEventListener', 'play');
      postActionToPlayer.call(this, 'addEventListener', 'pause');
      postActionToPlayer.call(this, 'addEventListener', 'finish');
    }

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

      // Do not handle other player events
      if (data.player_id === this.playerId) {

        // Events
        switch (data.event) {

          // Player is ready to accept commands
          case 'ready':
            handleReady.call(this);
            postActionToPlayer.call(this, 'getDuration');
            this.jPlayerElement.triggerHandler('ovReady');
            break;

            // Media is loading
          case 'loadProgress':

            // No indication about the playback position of the loading
            // percentage, assume it to be 0
            this.jPlayerElement.triggerHandler('ovLoadProgress', {
              loadedStart: 0,
              loadedPercent: data.data.percent * 100
            });

            break;

            // Media is playing
          case 'playProgress':

            // In Internet Explorer 11 an extra "playProgress" event
            // is emitted with a percent greater than 1, after the "end"
            // event
            if (data.data.percent <= 1)
              this.jPlayerElement.triggerHandler('ovPlayProgress', {
                time: data.data.seconds * 1000,
                percent: data.data.percent * 100
              });

            break;

            // Media begins to play
          case 'play':
            this.playing = 1;
            this.jPlayerElement.triggerHandler('ovPlay');
            break;

            // Media pauses
          case 'pause':
            this.playing = 0;
            this.jPlayerElement.triggerHandler('ovPause');
            break;

            // Media playback reaches the end
          case 'finish':
            this.playing = 0;
            this.jPlayerElement.triggerHandler('ovEnd');
            break;

          default:
            break;
        }

        // Actions
        switch (data.method) {
          case 'getDuration':
            this.duration = data.value;
            this.jPlayerElement.triggerHandler('ovDurationChange', this.duration * 1000);
            break;

          default:
            return;
        }
      }

    }

    /**
     * Inititializes the player.
     *
     * Vimeo player uses postMessage API to be able to communicate with
     * the player.
     * Before doing anything on the Vimeo player the ready event
     * must be handled.
     */
    function initialize() {
      this.loaded = false;

      // Handle post messages
      this.handlePlayerEventsFn = angular.bind(this, handlePlayerEvents);
      angular.element($window).on('message', this.handlePlayerEventsFn);
    }

    /**
     * Creates a new VimeoPlayer.
     *
     * @constructor
     * @extends Player
     * @param {Object} jPlayerElement The JQLite HTML element corresponding
     * to the element which will receive events dispatched by the player
     * @param {Object} media Details of the media
     *   {
     *     mediaId : "136081112" // The id of the media
     *   }
     */
    function VimeoPlayer(jPlayerElement, media) {
      OvPlayer.prototype.init.call(this, jPlayerElement, media);
      initialize.call(this);
    }

    VimeoPlayer.prototype = new OvPlayer();
    VimeoPlayer.prototype.constructor = VimeoPlayer;

    /**
     * Gets media url.
     *
     * @method getMediaSources
     * @param {Object} definition Media definition object
     * @return {String} The media sources
     */
    VimeoPlayer.prototype.getMediaSources = function(definition) {
      if (definition && definition.link)
        return $sce.trustAsResourceUrl(definition.link);
      else
        return $sce.trustAsResourceUrl('//player.vimeo.com/video/' +
          this.media.mediaId[this.selectedMediaIndex] + '?api=1&player_id=' + this.playerId);
    };

    /**
     * Gets media thumbnail.
     *
     * No need to manage the thumbnail it is already done by the Vimeo player.
     *
     * @method getMediaThumbnail
     * @return {Null} null
     */
    VimeoPlayer.prototype.getMediaThumbnail = function() {
      return null;
    };

    /**
     * Intitializes the player.
     *
     * Nothing to do, the player is already initialized.
     *
     * @method initialize
     */
    VimeoPlayer.prototype.initialize = function() {
    };

    /**
     * Loads player on selected source
     *
     * Nothing to do, the player reload itself on source change.
     *
     * @method load
     */
    VimeoPlayer.prototype.load = function() {
    };

    /**
     * Tests if player actual state is pause.
     *
     * @method isPaused
     * @return {Boolean} true if paused, false otherwise
     */
    VimeoPlayer.prototype.isPaused = function() {
      return !this.playing;
    };

    /**
     * Plays or pauses the media depending on media actual state.
     *
     * @method playPause
     */
    VimeoPlayer.prototype.playPause = function() {
      postActionToPlayer.call(this, this.playing ? 'pause' : 'play');
    };

    /**
     * Sets volume.
     *
     * @method setVolume
     * @param {Number} volume The new volume from 0 to 100.
     */
    VimeoPlayer.prototype.setVolume = function(volume) {
      postActionToPlayer.call(this, 'setVolume', volume / 100);
    };

    /**
     * Sets time.
     *
     * @method setTime
     * @param {Number} time The time to seek to in milliseconds
     */
    VimeoPlayer.prototype.setTime = function(time) {
      time = parseInt(time) || 0;
      postActionToPlayer.call(this, 'seekTo', time / 1000);

      // Send a playProgress event because the Vimeo flash player (old
      // browsers) does not trigger the playProgress event while in pause
      // as the HTML5 player does
      if (!this.playing)
        this.jPlayerElement.triggerHandler('ovPlayProgress', {
          time: time,
          percent: (time / this.duration) * 100
        });
    };

    /**
     * Gets player type.
     *
     * @method getPlayerType
     * @return {String} "vimeo"
     */
    VimeoPlayer.prototype.getPlayerType = function() {
      return 'vimeo';
    };

    /**
     * Gets media definitions.
     *
     * No definitions available for vimeo player, adaptive streaming is managed by vimeo player.
     *
     * @method getAvailableDefinitions
     * @return {Null} null
     */
    VimeoPlayer.prototype.getAvailableDefinitions = function() {
      return null;
    };

    /**
     * Destroys the player.
     *
     * Remove all events listeners.
     *
     * @method destroy
     */
    VimeoPlayer.prototype.destroy = function() {
      angular.element($window).off('message', this.handlePlayerEventsFn);
      this.loaded = false;
      this.playing = 0;
      this.player = null;
    };

    return VimeoPlayer;
  }

  app.factory('OvVimeoPlayer', OvVimeoPlayer);
  OvVimeoPlayer.$inject = ['OvPlayer', '$window', '$document', '$sce'];

})(angular, angular.module('ov.player'));
