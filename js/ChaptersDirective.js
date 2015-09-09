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
  app.directive("ovChapters", ovChapters);
  ovChapters.$inject = ["ovChaptersLink"];  

  function ovChapters(ovChaptersLink){
    return {
      require : "^ovPlayer",
      restrict : "E",
      templateUrl : ovPlayerDirectory + "templates/chapters.html",
      scope : true,
      link : ovChaptersLink
    }
  }

  app.factory("ovChaptersLink", function(){
    return function(scope, element, attrs, playerCtrl){
      scope.chapters = scope.data.chapter;
     
      scope.open = function(chapter){
        if(!chapter.isOpen)
          angular.forEach(scope.chapters, function (value, key) {
            value.isOpen = false;
          });
        chapter.isOpen = !chapter.isOpen;
      }
      /**
       * Seeks media to the given timecode.
       * @param Number timecode The timecode to seek to
       */
      scope.goToTimecode = function(time){
        if(time <= 1)
          playerCtrl.setTime(time * scope.duration);
      };
      
    };
  });  

})(angular.module("ov.player"));