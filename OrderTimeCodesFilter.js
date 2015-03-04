(function(angular, app){

  "use strict"

  /**
   * Defines a filter to format and order a list of timecodes.
   *
   * e.g.
   * // Input
   * var timecodes = {
   *  20 : { id : 20},
   *  5 : { id : 5},
   *  0 : { id : 0},
   *  200 : { id : 200},
   *  6 : { id : 6}
   * };
   *
   * // Output 
   * [
   *   { id : 0, timecode : 0}
   *   { id : 5, timecode : 5}
   *   { id : 6, timecode : 6}
   *   { id : 20, timecode : 20}
   *   { id : 200, timecode : 200}
   * ]
   */
  app.filter("orderTimeCodes", OrderTimeCodes);

  function OrderTimeCodes(){
    return function(items){
      var timecodes = [];
      var orderedTimecodes = [];

      // Extract only timecodes
      for(var i in items)
        timecodes.push(parseInt(i));

      // Sort timecodes
      timecodes.sort(function(a, b){
        return a - b;
      });

      angular.forEach(timecodes, function(timecode){
        var timecodeObject = items[timecode];
        timecodeObject["timecode"] = timecode;

        orderedTimecodes.push(timecodeObject);
      });

      return orderedTimecodes;

    }
  };

})(angular, angular.module("ov.player"));