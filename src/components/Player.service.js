'use strict';

/**
 * @module ov.player
 */

(function(app) {

  /**
   * Defines a player service factory to manipulate a media in a playing context.
   *
   * Media can have reach media elements like points of interest (timecodes, chapters, tags) and virtual cuts at the
   * beginning and at the end of the media.
   * oplPlayerService helps manipulate the media without having to worry about cuts.
   * Term "real" is relative to the full video length (without cuts).
   *
   * @class oplPlayerService
   * @constructor
   */
  function oplPlayerService() {
    this.media = null;
    this.cutStart = 0;
    this.cutEnd = null;
    this.realDuration = null;
    this.cutsActivated = false;
  }

  /**
   * Sorts a list of points of interest.
   *
   * @param {Array} poi The list of points of interest to sort
   * @param {String} property The property to use to compare points of interest
   */
  function sortPointsOfInterest(poi, property) {
    poi.sort(function(a, b) {
      return a[property] - b[property];
    });
  }

  /**
   * Sets player media.
   *
   * @method setMedia
   * @param {Object} newMedia The media object
   * @param {Array} [newMedia.cut] Begin and end cuts
   * @param {Array} [newMedia.timecodes] Media timecodes
   * @param {Array} [newMedia.chapters] Media chapters
   * @param {Array} [newMedia.tags] Media tags
   */
  oplPlayerService.prototype.setMedia = function(newMedia) {
    this.media = newMedia;
    this.cutsActivated = false;
    this.cutStart = 0;
    this.cutEnd = null;

    // Media has cuts
    if (this.hasCuts()) {
      this.cutsActivated = true;

      // Retrieve cut edges (start and end)
      for (var i = 0; i < this.media.cut.length; i++) {
        if (this.media.cut[i].type === 'begin')
          this.cutStart = this.media.cut[i].value;
        else if (this.media.cut[i].type === 'end')
          this.cutEnd = this.media.cut[i].value;
      }

      if (this.cutStart < 0)
        this.cutStart = 0;

      // Media duration can't be equal to 0 or negative
      if (this.cutEnd !== null && this.cutStart >= this.cutEnd) {
        this.cutStart = 0;
        this.cutEnd = null;
      }

    }

    // Sort points of interest
    if (this.media.timecodes) sortPointsOfInterest(this.media.timecodes, 'timecode');
    if (this.media.chapters) sortPointsOfInterest(this.media.chapters, 'value');
    if (this.media.tags) sortPointsOfInterest(this.media.tags, 'value');

  };

  /**
   * Gets media timecodes ordered by time.
   *
   * Only timecodes within the cut range are returned if cuts are activated.
   *
   * @method getMediaTimecodesByTime
   * @return {Object} The list of media timecodes ordered by time
   */
  oplPlayerService.prototype.getMediaTimecodesByTime = function() {
    var timecodesByTime = {};
    var timecodes = this.getMediaPointsOfInterest('timecodes');
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
   * Gets the list of points of interest.
   *
   * Only points of interest within the cut range are returned if cuts are activated.
   *
   * @method getMediaPointsOfInterest
   * @param {String} property The type of points of interest, either "timecodes", "chapters" or "tags"
   * @return {Array} The media points of interest
   */
  oplPlayerService.prototype.getMediaPointsOfInterest = function(property) {
    var timeMarkerProperty = property === 'timecodes' ? 'timecode' : 'value';
    if (!this.media[property]) return [];

    // Media cut activated
    if (this.cutsActivated && this.getRealDuration()) {
      var filteredPointsOfInterest = [];
      var realCutStart = this.getCutStart();
      var realCutEnd = this.getCutEnd();
      var firstPointOfInterest;

      // Filter points of interest depending on cut edges
      // Points of interest not in the range [startCut - endCut] are excluded
      for (var i = 0; i < this.media[property].length; i++) {
        var timeMarker = this.media[property][i][timeMarkerProperty];
        var pointOfInterest = angular.copy(this.media[property][i]);
        pointOfInterest[timeMarkerProperty] = pointOfInterest[timeMarkerProperty] - this.cutStart;

        if (timeMarker < realCutStart) {
          firstPointOfInterest = pointOfInterest;
          continue;
        }

        if (timeMarker > realCutEnd) break;

        filteredPointsOfInterest.push(pointOfInterest);
      }

      // Add the point of interest before the cutted start at the beginning
      // of the filtered points of interest
      if (firstPointOfInterest !== undefined &&
          (filteredPointsOfInterest.length === 0 || filteredPointsOfInterest[0][timeMarkerProperty] != 0)) {
        firstPointOfInterest[timeMarkerProperty] = 0;
        filteredPointsOfInterest.unshift(firstPointOfInterest);
      }

      return filteredPointsOfInterest;
    }

    // Media isn't cut
    return angular.copy(this.media[property]);
  };

  /**
   * Gets cut start edge in milliseconds.
   *
   * The beginning of the media can be virtually cut, thus the start time may not be 0 but a virtual start.
   *
   * @method getCutStart
   * @return {Number} The start time in milliseconds according to the cut
   */
  oplPlayerService.prototype.getCutStart = function() {
    if (this.cutsActivated) return (this.cutStart) ? this.cutStart : 0;
    return 0;
  };

  /**
   * Gets cut end edge in milliseconds.
   *
   * The media can be virtually cut, thus the end time may not be the media duration but a virtual end time.
   *
   * @method getCutEnd
   * @return {Number} The end time in milliseconds according to the cut
   */
  oplPlayerService.prototype.getCutEnd = function() {
    if (this.cutsActivated) return (this.cutEnd) ? this.cutEnd : this.getRealDuration();
    return 0;
  };

  /**
   * Gets the real time.
   *
   * @method getRealTime
   * @param {Number} time Time in milliseconds relative to the cut media
   * @return {Number} time Time in milliseconds relative to the full media
   */
  oplPlayerService.prototype.getRealTime = function(time) {
    return time + this.getCutStart();
  };

  /**
   * Gets the cut time relative to the full media.
   *
   * @method getCutTime
   * @param {Number} time Time in milliseconds relative to the full media
   * @return {Number} Time in milliseconds relative to the cut media
   */
  oplPlayerService.prototype.getCutTime = function(time) {
    return Math.max(time - this.getCutStart(), 0);
  };

  /**
   * Gets media virtual duration according to cut.
   *
   * The beginning and the end of the media can be virtually cut, thus the duration is not systematically the real
   * duration of the media but can be a virtual duration.
   *
   * @method getCutDuration
   * @return {Number} The duration in milliseconds according to the cuts
   */
  oplPlayerService.prototype.getCutDuration = function() {
    if (this.getRealDuration()) {
      var end = this.getCutEnd();
      var start = this.getCutStart();
      return end - start;
    }
    return 0;
  };

  /**
   * Converts a time percentage relative to the full media into a percentage relative to the cut media.
   *
   * @method getCutPercent
   * @param {Number} percent The percentage relative to the full media
   * @return {Number} The percentage relative to the cut media
   */
  oplPlayerService.prototype.getCutPercent = function(percent) {
    if (this.getRealDuration()) {
      var time = this.getRealDuration() * (percent / 100);
      return Math.min(
        Math.max(
          ((time - this.getCutStart()) / this.getCutDuration()) * 100,
          0
        ),
        100
      );
    }
    return percent;
  };

  /**
   * Converts a duration percentage relative to the full media into a percentage relative to the cut media.
   *
   * @method getCutDurationPercent
   * @param {Number} percent The duration percentage of the full media
   * @return {Number} The duration percentage of the cut media
   */
  oplPlayerService.prototype.getCutDurationPercent = function(percent) {
    if (this.getRealDuration()) {
      var duration = this.getRealDuration() * (percent / 100);
      return Math.min((duration / this.getCutDuration()) * 100, 100);
    }
    return percent;
  };

  /**
   * Sets real media duration.
   *
   * @method setRealDuration
   * @param {Number} duration Real media duration in milliseconds
   */
  oplPlayerService.prototype.setRealDuration = function(duration) {
    if (this.cutStart >= duration || this.cutEnd > duration) {
      this.cutStart = 0;
      this.cutEnd = null;
    }
    this.realDuration = duration;
  };

  /**
   * Gets real media duration.
   *
   * @method getRealDuration
   * @return {Number} The duration relative to the full media
   */
  oplPlayerService.prototype.getRealDuration = function() {
    return this.realDuration;
  };

  /**
   * Gets media duration.
   *
   * Real media duration is returned if cuts are deactivated and cut duration is returned if cuts are activated
   *
   * @method getRealDuration
   * @return {Number} The duration relative to the cut media if cuts are enables or the duration relative to the
   * full media if cuts are disabled
   */
  oplPlayerService.prototype.getDuration = function() {
    return this.cutsActivated ? this.getCutDuration() : this.getRealDuration();
  };

  /**
   * Gets the time.
   *
   * Either the time relative to the full media if cuts are disabled or relative to the cut media if cuts are enabled.
   *
   * @method getTime
   * @param {Number} time Time in milliseconds relative to the full media
   * @return {Number} Time in milliseconds relative to the cut media if cuts are activated or relative to the full
   * media if cuts are deactivated
   */
  oplPlayerService.prototype.getTime = function(time) {
    return this.cutsActivated ? this.getCutTime(time) : time;
  };

  /**
   * Activates / deactivates cuts.
   *
   * @method setCutsStatus
   * @param {Boolean} activated true to activate, false to deactivate
   */
  oplPlayerService.prototype.setCutsStatus = function(activated) {
    this.cutsActivated = activated;
  };

  /**
   * Indicates if media has cuts.
   *
   * @method hasCuts
   * @return {Boolean} true if media has cuts, false otherwise
   */
  oplPlayerService.prototype.hasCuts = function() {
    return this.media && this.media.cut && this.media.cut.length;
  };

  /**
   * Gets time percentage.
   *
   * Percentage is relative to the full media if cuts are disabled or relative to the cut media if cuts are enabled.
   *
   * @method getPercent
   * @param {Number} time Time in milliseconds relative to the full media
   * @return {Number} The percentage of the media corresponding to the time relative to the cut media or full media
   */
  oplPlayerService.prototype.getPercent = function(time) {
    var percent = ((time / this.getRealDuration()) * 100);
    return this.cutsActivated ? this.getCutPercent(percent) : percent;
  };

  /**
   * Gets time from percentage.
   *
   * Percentage is relative to the full media if cuts are disabled or relative to the cut media if cuts are enabled.
   *
   * @method getTimeFromPercent
   * @param {Number} percent Percentage relative to the cut media (from 0 to 100)
   * @return {Number} The time of the media corresponding to the time relative to the cut media or full media
   */
  oplPlayerService.prototype.getTimeFromPercent = function(percent) {
    return this.getDuration() * (percent / 100);
  };

  /**
   * Gets a duration percentage.
   *
   * If cuts are enabled the percentage will be relative to the cut media, otherwise it will be relative to the full
   * media.
   *
   * @method getDurationPercent
   * @param {Number} percent The duration percentage relative to the full media
   * @return {Number} The duration percentage relative to the cut media or full media
   */
  oplPlayerService.prototype.getDurationPercent = function(percent) {
    if (this.cutsActivated) return this.getCutDurationPercent(percent);
    return percent;
  };

  /**
   * Gets closest point of interest to the given time.
   *
   * @param {String} property The type of points of interest, either "timecodes", "chapters" or "tags"
   * @param {Number} time The relative time to look for in milliseconds
   * @return {Object} The actual point of interest for the given time
   */
  oplPlayerService.prototype.findPointOfInterest = function(property, time) {
    var pointsOfInterest = this.getMediaPointsOfInterest(property);
    var timeMarkerProperty = property === 'timecodes' ? 'timecode' : 'value';
    if (!pointsOfInterest.length) return null;

    if (time < pointsOfInterest[0][timeMarkerProperty]) return null;

    for (var i = 0; i < pointsOfInterest.length; i++) {
      if (
        time >= pointsOfInterest[i][timeMarkerProperty] &&
        (pointsOfInterest[i + 1] && time < pointsOfInterest[i + 1][timeMarkerProperty])
      ) {
        return pointsOfInterest[i];
      }
    }

    return pointsOfInterest[pointsOfInterest.length - 1];
  };

  app.value('oplPlayerService', oplPlayerService);

})(angular.module('ov.player'));
