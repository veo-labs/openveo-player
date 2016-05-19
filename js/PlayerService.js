'use strict';

(function(app) {

  /**
   * Defines a player service factory to manipulate a media in a playing context.
   *
   * Media is not only a media file but also timecodes (slides), chapters and
   * eventually a virtual cut with a start and end edge to display present only
   * small part of the video.
   * PlayerService helps dealing with cut edges, its helps synchronize information
   * returned from the player to apply it to the cut range.
   * Term "real" is relative to the full video (wihtout cut edges).
   *
   * @module ov.player
   * @class PlayerService
   */
  function PlayerService() {
    this.media = null;
    this.cutStart = 0;
    this.cutEnd = null;
    this.realMediaDuration = null;
    this.isCut = false;
  }

  /**
   * Gets cut start edge in milliseconds.
   *
   * The beginning of the media can be virtually cut, thus the start time may be
   * not 0 but a virtual start.
   *
   * @method getRealCutStart
   * @return {Number} The start time in milliseconds according to the cut
   */
  PlayerService.prototype.getRealCutStart = function() {
    if (this.realMediaDuration)
      return (this.cutStart) ? this.realMediaDuration * this.cutStart : 0;

    return 0;
  };

  /**
   * Gets cut end edge in milliseconds.
   *
   * The media can be virtually cut, thus the end time may not be the media
   * duration but a virtual end time.
   *
   * @method getRealCutEnd
   * @return {Number} The end time in milliseconds according to the cut
   */
  PlayerService.prototype.getRealCutEnd = function() {
    if (this.realMediaDuration)
      return (this.cutEnd) ? this.realMediaDuration * this.cutEnd : this.realMediaDuration;

    return 0;
  };

  /**
   * Gets the real time based on the time relative to the cut media.
   *
   * @method getRealTime
   * @param {Number} time Time in milliseconds relative to the cut media
   * @return {Number} time Time in milliseconds relative to the full media
   */
  PlayerService.prototype.getRealTime = function(time) {
    return time + this.getRealCutStart();
  };

  /**
   * Gets the cut time based on the real time (relative to the full media).
   *
   * @method getCutTime
   * @param {Number} time Time in milliseconds relative to the full media
   * @return {Number} Time in milliseconds relative to the cut media
   */
  PlayerService.prototype.getCutTime = function(time) {
    return Math.max(time - this.getRealCutStart(), 0);
  };

  /**
   * Sets player media.
   *
   * @method setMedia
   * @param {Object} newMedia The media object
   */
  PlayerService.prototype.setMedia = function(newMedia) {
    this.media = newMedia;
    this.isCut = this.media.cut && this.media.cut.length;

    // Media is cut
    if (this.isCut) {

      // Retrive cut edges (start and end)
      for (var i = 0; i < this.media.cut.length; i++) {
        if (this.media.cut[i].type === 'begin')
          this.cutStart = Math.max(this.media.cut[i].value, 0);
        else if (this.media.cut[i].type === 'end')
          this.cutEnd = Math.min(this.media.cut[i].value, 1);
      }

      // Media duration can't be equal to 0
      if (this.cutStart === this.cutEnd) {
        this.cutStart = 0;
        this.cutEnd = null;
      }

    } else {
      this.cutStart = 0;
      this.cutEnd = null;
    }

  };

  /**
   * Gets media timecodes.
   *
   * Only timecodes within the cut range are returned.
   *
   * @method getMediaTimecodes
   * @return {Array} The list of media timecodes
   */
  PlayerService.prototype.getMediaTimecodes = function() {

    // Media is cut
    if (this.isCut && this.realMediaDuration && this.media.timecodes) {
      var filteredTimecodes = [];
      var realCutStart = this.getRealCutStart();
      var realCutEnd = this.getRealCutEnd();

      // Filter timecodes depending on cut edges
      // Timecodes not in the range [startCut - endCut] must be removed
      for (var i = 0; i < this.media.timecodes.length; i++) {
        var timecode = this.media.timecodes[i].timecode;

        if (timecode >= realCutStart && timecode <= realCutEnd)
          filteredTimecodes.push(this.media.timecodes[i]);
      }

      return filteredTimecodes;
    }

    return this.media.timecodes;
  };

  /**
   * Gets media timecodes ordered by time.
   *
   * Index timecodes by time to avoid parsing the whole array several times.
   *
   * @method getMediaTimecodesByTime
   * @return {Object} The list of media timecodes ordered by time
   */
  PlayerService.prototype.getMediaTimecodesByTime = function() {
    var timecodesByTime = {};
    var timecodes = this.getMediaTimecodes();
    if (timecodes) {

      for (var i = 0; i < timecodes.length; i++) {
        var timecode = timecodes[i];
        timecodesByTime[timecode.timecode] = {
          image: {
            small: timecode.image.small,
            large: timecode.image.large
          }
        };
      }

    }
    return timecodesByTime;
  };

  /**
   * Gets the list of chapters.
   *
   * Only chapters within the cut range are returned.
   *
   * @method getMediaChapters
   * @return {Object} The media chapter
   */
  PlayerService.prototype.getMediaChapters = function() {

    // Media is cut
    if (this.isCut && this.realMediaDuration && this.media.chapters) {
      var filteredChapters = [];
      var realCutStart = this.getRealCutStart();
      var realCutEnd = this.getRealCutEnd();

      // Filter chapters depending on cut edges
      // Chapters not in the range [startCut - endCut] must be removed
      for (var i = 0; i < this.media.chapters.length; i++) {
        var timecode = this.realMediaDuration * this.media.chapters[i].value;

        if (timecode > realCutStart && timecode < realCutEnd)
          filteredChapters.push(this.media.chapters[i]);
      }
      return filteredChapters;
    }
    return this.media.chapters;
  };

  /**
   * Change a list of chapters which value is a percent in a timestamp value according to media duration
   * @param {Array} chapters chapters array to modify from percent to timestamp
   * @param {int} mediaDuration media original duration in ms
   */
  PlayerService.prototype.processChaptersTime = function(chapters) {
    for (var i = 0; i < chapters.length; i++) {
      chapters[i].value = (chapters[i].value * this.realMediaDuration) -
                          Math.floor(this.cutStart * this.realMediaDuration);
    }
  };

  /**
   * Gets media virtual duration according to cut.
   *
   * The beginning and the end of the media can be virtually cut, thus
   * the duration is not systematically the real duration of the media but
   * can be a virtual duration.
   *
   * @method getCutDuration
   * @return {Number} The duration in milliseconds according to the cut
   */
  PlayerService.prototype.getCutDuration = function() {
    if (this.realMediaDuration) {
      var end = this.getRealCutEnd();
      var start = this.getRealCutStart();
      return end - start;
    }
    return 0;
  };

  /**
   * Converts a time percentage relative to the full media into a percentage relative
   * to the cut media.
   *
   * @method getCutPercent
   * @param {Number} percent The percentage of the video corresponding to
   * beginning of the loaded data (from 0 to 100)
   * @return {Number} The percentage of the video corresponding to
   * beginning of the loaded data (from 0 to 100)
   */
  PlayerService.prototype.getCutPercent = function(percent) {
    if (this.realMediaDuration) {
      var time = this.realMediaDuration * (percent / 100);
      return Math.min(Math.max(((time - this.getRealCutStart()) / this.getCutDuration()) * 100, 0), 100);
    }
    return percent;
  };

  /**
   * Converts a duration percentage relative to the full media into a percentage relative
   * to the cut media.
   *
   * @method getCutDurationPercent
   * @param {Number} percent The duration percentage of the video (from 0 to 100)
   * @return {Number} The duration percentage of the video (from 0 to 100)
   */
  PlayerService.prototype.getCutDurationPercent = function(percent) {
    if (this.realMediaDuration) {
      var time = this.realMediaDuration * (percent / 100);
      return Math.min(Math.max((time / this.getCutDuration()) * 100, 0), 100);
    }
    return percent;
  };

  /**
   * Sets real media duration.
   *
   * @method setRealMediaDuration
   * @param {Number} duration Real media duration in milliseconds
   */
  PlayerService.prototype.setRealMediaDuration = function(duration) {
    this.realMediaDuration = duration;
  };

  app.value('PlayerService', PlayerService);

})(angular.module('ov.player'));
