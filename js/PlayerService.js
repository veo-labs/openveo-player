'use strict';

(function(app) {

  /**
   * Defines a player service to manipulate a media in a playing context.
   * Media is not only a media file but also timecodes (slides), chapters and
   * eventually a virtual cut with a start and end edge to display present only
   * small part of the video.
   * PlayerService helps dealing with cut edges, its helps synchronize information
   * returned from the player to apply it to the cut range.
   * Term "real" is relative to the full video (wihtout cut edges).
   */
  function PlayerService() {
    var media = null;
    var cutStart = 0;
    var cutEnd = null;
    var realMediaDuration = null;
    var isCut = false;

    /**
     * Gets cut start edge in milliseconds.
     * The beginning of the media can be virtually cut, thus the start time may be
     * not 0 but a virtual start.
     * @return Number The start time in milliseconds according to the cut
     */
    function getRealCutStart() {
      if (realMediaDuration)
        return (cutStart) ? realMediaDuration * cutStart : 0;

      return 0;
    }

    /**
     * Gets cut end edge in milliseconds.
     * The media can be virtually cut, thus the end time may not be the media
     * duration but a virtual end time.
     * @return Number The end time in milliseconds according to the cut
     */
    function getRealCutEnd() {
      if (realMediaDuration)
        return (cutEnd) ? realMediaDuration * cutEnd : realMediaDuration;

      return 0;
    }

    /**
     * Gets the real time based on the time relative to the cut media.
     * @param Number time Time in milliseconds relative to the cut media
     * @return Number time Time in milliseconds relative to the full media
     */
    function getRealTime(time) {
      return time + getRealCutStart();
    }

    /**
     * Gets the cut time based on the real time (relative to the full media).
     * @param Number time Time in milliseconds relative to the full media
     * @return Number Time in milliseconds relative to the cut media
     */
    function getCutTime(time) {
      return Math.max(time - getRealCutStart(), 0);
    }

    /**
     * Sets player media.
     * @param Object newMedia The media object
     */
    function setMedia(newMedia) {
      media = newMedia;
      isCut = media.cut && media.cut.length;

      // Media is cut
      if (isCut) {

        // Retrive cut edges (start and end)
        for (var i = 0; i < media.cut.length; i++) {
          if (media.cut[i].type === 'begin')
            cutStart = Math.max(media.cut[i].value, 0);
          else if (media.cut[i].type === 'end')
            cutEnd = Math.min(media.cut[i].value, 1);
        }

        // Media duration can't be equal to 0
        if (cutStart === cutEnd) {
          cutStart = 0;
          cutEnd = null;
        }

      } else {
        cutStart = 0;
        cutEnd = null;
      }

    }

    /**
     * Gets media timecodes.
     * Only timecodes within the cut range are returned.
     * @return Array The list of media timecodes
     */
    function getMediaTimecodes() {

      // Media is cut
      if (isCut && realMediaDuration && media.timecodes) {
        var filteredTimecodes = [];
        var realCutStart = getRealCutStart();
        var realCutEnd = getRealCutEnd();

        // Filter timecodes depending on cut edges
        // Timecodes not in the range [startCut - endCut] must be removed
        for (var i = 0; i < media.timecodes.length; i++) {
          var timecode = media.timecodes[i].timecode;

          if (timecode >= realCutStart && timecode <= realCutEnd)
            filteredTimecodes.push(media.timecodes[i]);
        }

        return filteredTimecodes;
      }

      return media.timecodes;
    }

    /**
     * Gets media timecodes ordered by time.
     * Index timecodes by time to avoid parsing the whole array several times.
     * @return Object The list of media timecodes ordered by time
     */
    function getMediaTimecodesByTime() {
      var timecodesByTime = {};
      var timecodes = getMediaTimecodes();
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
    }

    /**
     * Gets the list of chapters.
     * Only chapters within the cut range are returned.
     * @return Object The media chapter
     */
    function getMediaChapters() {

      // Media is cut
      if (isCut && realMediaDuration && media.chapters) {
        var filteredChapters = [];
        var realCutStart = getRealCutStart();
        var realCutEnd = getRealCutEnd();

        // Filter chapters depending on cut edges
        // Chapters not in the range [startCut - endCut] must be removed
        for (var i = 0; i < media.chapters.length; i++) {
          var timecode = realMediaDuration * media.chapters[i].value;

          if (timecode >= realCutStart && timecode <= realCutEnd)
            filteredChapters.push(media.chapters[i]);

        }
        return filteredChapters;
      }

      return media.chapters;
    }

    /**
     * Gets media virtual duration according to cut.
     * The beginning and the end of the media can be virtually cut, thus
     * the duration is not systematically the real duration of the media but
     * can be a virtual duration.
     * @return Number The duration in milliseconds according to the cut
     */
    function getCutDuration() {
      if (realMediaDuration) {
        var end = getRealCutEnd();
        var start = getRealCutStart();
        return end - start;
      }
      return 0;
    }

    /**
     * Converts a percentage relative to the full media into a percentage relative
     * to the cut media.
     * @param Number percent The percentage of the video corresponding to
     * beginning of the loaded data (from 0 to 100).
     * @return Number The percentage of the video corresponding to
     * beginning of the loaded data (from 0 to 100).
     */
    function getCutPercent(percent) {
      if (realMediaDuration) {
        var time = realMediaDuration * (percent / 100);
        return Math.min(Math.max(((time - getRealCutStart()) / getCutDuration()) * 100, 0), 100);
      }
      return percent;
    }

    /**
     * Sets real media duration.
     * @param Number duration Real media duration in milliseconds
     */
    function setRealMediaDuration(duration) {
      realMediaDuration = duration;
    }

    return {
      setMedia: setMedia,
      setRealMediaDuration: setRealMediaDuration,
      getMediaTimecodes: getMediaTimecodes,
      getMediaTimecodesByTime: getMediaTimecodesByTime,
      getMediaChapters: getMediaChapters,
      getCutDuration: getCutDuration,
      getRealTime: getRealTime,
      getRealCutStart: getRealCutStart,
      getRealCutEnd: getRealCutEnd,
      getCutPercent: getCutPercent,
      getCutTime: getCutTime
    };

  }

  app.factory('playerService', PlayerService);
  PlayerService.$inject = [];

})(angular.module('ov.player'));
