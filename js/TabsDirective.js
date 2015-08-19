(function(app){

  "use strict"

  /**
   * Creates a new HTML element ov-tabs to be able to manage a list of 
   * views (ov-view elements) and switch between them using tabs.
   * ov-tabs element does not have any attributes.
   * It requires ovPlayerDirectory global variable to be defined and have
   * a value corresponding to the path of the openVeo Player 
   * root directory.
   *
   * e.g.
   * <ov-tabs>
   *  <ov-view title="Tab 1 title">
   *    Content of the first view
   *  </ov-view>
   *  <ov-view title="Tab 2 title">
   *    Content of the second view
   *  </ov-view>
   * </ov-tabs>
   */ 
  app.directive("ovTabs", ovTabs);
  
  function ovTabs(){
    return{
      restrict : "E",
      templateUrl : ovPlayerDirectory + "/templates/tabs.html",
      scope : {},
      transclude : true,
      controller : ["$scope", function($scope){
        $scope.views = [];

        // Selects the given view
        $scope.select = function(view){
          angular.forEach($scope.views, function(view){
            view.selected = false;
          });
          view.selected = true;
        };

        // Add the scope of an ovView directive to the list of views
        this.addView = function(view){
          if(!$scope.views.length)
            $scope.select(view);
          
          $scope.views.push(view);
        };

      }]
    };
  };
  
})(angular.module("ov.player"));