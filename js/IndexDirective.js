(function(app){

  "use strict"

  /**
   * Creates a new HTML element ov-index to create an openVeo player 
   * index, with a list of presentation slides.
   * It requires ovPlayerDirectory global variable to be defined and have
   * a value corresponding to the path of the openVeo Player 
   * root directory.
   *
   * e.g.
   * <ov-index></ov-index>
   */
  app.directive("ovIndex", ovIndex);
  ovIndex.$inject = ["ovIndexLink"];  

  function ovIndex(ovIndexLink){
    return {
      require : "^ovPlayer",
      restrict : "E",
      templateUrl : ovPlayerDirectory + "templates/index.html",
      scope : true,
      link : ovIndexLink
    }
  }

  app.factory("ovIndexLink", function(){
    return function(scope, element, attrs, playerCtrl){
        
      if(Object.keys(scope.data.timecodes).length){
        scope.imagePreview = scope.data.timecodes[Object.keys(scope.data.timecodes)[0]].image.large;
      }

      /**
       * Sets presentation preview corresponding to the given timecode.
       * @param Number timecode The timecode (in milliseconds)
       */
      scope.setImagePreview = function(timecode){
        scope.imagePreview = scope.data.timecodes[timecode].image.large;
      };

      /**
       * Seeks media to the given timecode.
       * @param Number timecode The timecode to seek to
       */
      scope.goToTimecode = function(timecode){
        if(timecode <= scope.duration)
          playerCtrl.player.setTime(timecode);
      };
      
    };
  });  

})(angular.module("ov.player"));