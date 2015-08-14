(function(angular, app){

  "use strict"

  /**
   * Creates a new HTML element ov-player to create an openVeo player.
   * It requires ovPlayerDirectory global variable to be defined and have
   * a value corresponding to the path of the openVeo Player 
   * root directory.
   * For more information on the ov-player element, have a look at the 
   * PlayerApp.js file.
   */
  app.directive("ovPlayer", ovPlayer);
  ovPlayer.$inject = ["$injector", "$document", "$sce", "$filter"];

  // Available display modes
  // Display mode tells how presentation and video are structured
  //  - "video" mode : Only the video is displayed
  //  - "both" mode : Both video and presentation are displayed (50/50)
  //  - "both-presentation" mode : Both video and presentation 
  //    are displayed with more interest on the presentation (25/75)
  //  - "presentation" mode : Only the presentation is displayed 
  var modes = ["video", "both", "both-presentation", "presentation"];

  function ovPlayer($injector, $document, $sce, $filter){
    return{
      restrict : "E",
      templateUrl : ovPlayerDirectory + "/templates/player.html",
      scope : {
        ovData : "=",
        ovFullscreenIcon : "=?",
        ovVolumeIcon : "=?",
        ovModeIcon : "=?",
        ovTime : "=?",
        ovFullViewport : "=?"
      },
      controller : ["$scope", "$element", "$attrs", function($scope, $element, $attrs){
        var self = this;
        var volumeBarRect, volumeBarHeight;
        var fullscreen = false;
        var document = $document[0];
        var element = $element[0];
        var rootElement = $element.children()[0];
        var timeBar = element.getElementsByClassName("ov-time-ghost")[0];
        var volumeBar = element.getElementsByClassName("ov-volume-ghost")[0];
        var volumeBarRect = volumeBar.getBoundingClientRect();
        var volumeBarHeight = volumeBarRect.bottom - volumeBarRect.top;
        var timeBarRect = timeBar.getBoundingClientRect();
        var timeBarWidth = timeBarRect.right - timeBarRect.left;        
        this.player = null;

        // Set default value for attributes
        $scope.ovFullscreenIcon = (typeof $scope.ovFullscreenIcon === "undefined") ? true : $scope.ovFullscreenIcon;
        $scope.ovVolumeIcon = (typeof $scope.ovVolumeIcon === "undefined") ? true : $scope.ovVolumeIcon;
        $scope.ovModeIcon = (typeof $scope.ovModeIcon === "undefined") ? true : $scope.ovModeIcon;
        $scope.ovTime = (typeof $scope.ovTime === "undefined") ? true : $scope.ovTime;
        $scope.ovFullViewport = (typeof $scope.ovFullViewport === "undefined") ? false : $scope.ovFullViewport;

        /**
         * Initializes isolated scope properties.
         */
        function init(){

          // Set scope default values
          $scope.data = angular.copy($scope.ovData) || {};
          $scope.timecodes = $scope.data.timecodes || {};
          $scope.presentation = null;
          $scope.playerId = "player_" + $scope.data.videoId;
          $scope.timePreviewOpened = false;
          $scope.volumeOpened = false;
          $scope.modesOpened = false;
          $scope.modes = angular.copy(modes);
          $scope.selectedMode = modes[1];
          $scope.playPauseButton = "play";
          $scope.fullscreenButton = "enlarge";
          $scope.volumePreview = 0;
          $scope.volume = 25;
          $scope.loadingPercent = 0;
          $scope.seenPercent = 0;
          $scope.time = 0;
          $scope.duration = 0;
          $scope.timePreviewPosition = 0;
          $scope.displayIndexTab = true;
          $scope.sortedTimecodes = $filter("orderTimeCodes")($scope.timecodes);

          // Full viewport and no FullScreen API available
          // Consider the player as in fullscreen
          if($scope.ovFullViewport && !implementFullScreenAPI()){
            $scope.fullscreenButton = "reduce";
            fullscreen = true;
          }

          // Video volume can't be changed on touch devices
          if(isTouchDevice())
            $scope.ovVolumeIcon = false;

          // Got timecodes associated to the video
          // Use the first image of the first timecode as
          // the current presentation image
          if($scope.sortedTimecodes.length){
            $scope.timePreview = $scope.presentation = $scope.sortedTimecodes[0].image.large;
          }

          // No timecodes
          // Without timecodes, the index can't be built
          // It also means that the video has no associated presentation
          else{
            $scope.displayIndexTab = false;
            $scope.selectedMode = modes[0];
            $scope.modes = [modes[0]];
            $scope.ovModeIcon = false;
          }
        };

        /**
         * Initializes the player.
         */
        function initPlayer(){
          
          if($scope.data.type && $scope.data.videoId){
            $scope.videoTemplate = ovPlayerDirectory + "/templates/" +  $scope.data.type + ".html";

            // Get an instance of a player depending on player's type
            switch($scope.data.type){
              case "vimeo" :
                var OvVimeoPlayer = $injector.get("OvVimeoPlayer");
                self.player = new OvVimeoPlayer($element, $scope.playerId, $scope.data.videoId);
              break;
            }

            // Initialize player
            self.player.initialize();

            // Set video url
            $scope.videoUrl = $sce.trustAsResourceUrl(self.player.getPlayerUrl());
          }
        }
        
        init();
        initPlayer();

        /**
         * Toggles display mode selection list.
         * If the list of display modes is opened, close it, open it
         * otherwise.
         */
        this.toggleModes = $scope.toggleModes = function(){
          $scope.modesOpened = !$scope.modesOpened;
        };

        /**
         * Toggles the volume.
         * If the volume selector is opened, close it, open it 
         * otherwise.
         */
        this.toggleVolume = $scope.toggleVolume = function(){
          $scope.volumeOpened = !$scope.volumeOpened;
        };

        /**
         * Toggles player full screen.
         * If player is in full screen, reduce player to frame,
         * otherwise, display player in full screen.
         */
        this.toggleFullscreen = $scope.toggleFullscreen = function(){

          // Fullscreen API is available
          if(rootElement.requestFullScreen 
             || rootElement.mozRequestFullScreen
             || rootElement.webkitRequestFullScreen
             || rootElement.msRequestFullscreen)
          {
            
            if((document.fullScreenElement !== "undefined" && document.fullScreenElement === null) || (document.msFullscreenElement !== "undefined" && document.msFullscreenElement === null) || (document.mozFullScreen !== "undefined" && document.mozFullScreen === false) || (document.webkitFullscreenElement !== "undefined" && document.webkitFullscreenElement === null)){
              if(rootElement.requestFullScreen)
                rootElement.requestFullScreen();
              else if(rootElement.mozRequestFullScreen)
                rootElement.mozRequestFullScreen();
              else if(rootElement.webkitRequestFullScreen)
                rootElement.webkitRequestFullScreen();
              else if(rootElement.msRequestFullscreen)
                rootElement.msRequestFullscreen();

              $scope.fullscreenButton = "reduce";
            }
            else{
              if(document.exitFullscreen)
                document.exitFullscreen();
              else if(document.mozCancelFullScreen)
                document.mozCancelFullScreen();
              else if(document.webkitExitFullscreen)
                document.webkitExitFullscreen();
              else if(document.msExitFullscreen)
                document.msExitFullscreen();

              $scope.fullscreenButton = "enlarge";
            }

          }
          
          // Fullscreen API not available
          // Use viewport fullscreen instead
          else{
            fullscreen = $scope.ovFullViewport = !fullscreen;
            $scope.fullscreenButton = fullscreen ? "reduce" : "enlarge";
          }
        };

        /**
         * Sets the display mode.
         * @param String mode The display mode to activate, available
         * display modes are available just before ovPlayer definition
         */
        this.selectMode = $scope.selectMode = function(mode){
          $scope.selectedMode = mode;
        };

        // Watch for ov-data attribute changes
        $scope.$watch("ovData", function(){
          $scope.data = angular.copy($scope.ovData) || {};

          // Video id has changed
          if($scope.data.videoId && (!self.player || $scope.data.videoId != self.player.getVideoId())){

            if(self.player){

              // Destroy previous player
              self.player.destroy();

            }

            // Reset all scope properties
            init();

            // Initialize a new player
            initPlayer();

          }

        });

        // Watch for ov-mode-icon attribute changes
        $scope.$watch("ovModeIcon", function(){

          // Do not display mode icon if no timecodes are available
          if(!$scope.sortedTimecodes.length && $scope.ovModeIcon)
            $scope.ovModeIcon = false;

        });

        // Watch for ov-volume-icon attribute changes
        $scope.$watch("ovVolumeIcon", function(){

          // Video volume can't be changed on touch devices
          if(isTouchDevice())
            $scope.ovVolumeIcon = false;

        });

        /**
         * Starts / Pauses the player.
         */
        $scope.playPause = function(){
          self.player.playPause();
        };

        /**
         * Sets the player volume.
         * Volume is retrieved from the position of the cursor on the 
         * volume selector area.
         * @param MouseEvent event The dispatched event when cliking
         * on the volume selector. 
         */
        $scope.setVolume = function(event){
          $scope.volume = Math.min(Math.round(((volumeBarRect.bottom - event.pageY) / volumeBarHeight) * 100), 100);
          self.player.setVolume($scope.volume);
        };

        /**
         * Sets the player time.
         * Time is retrieved from the position of the cursor on the 
         * time bar area.
         * @param MouseEvent event The dispatched event when cliking
         * on the volume selector. 
         */
        $scope.setTime = function(event){
          self.player.setTime(((event.pageX - timeBarRect.left) / timeBarWidth) * $scope.duration);
        };
        
        /**
         * Tests if browser implements the fullscreen API or not.
         * @return true if fullscreen API is implemented, false otherwise
         */
        function implementFullScreenAPI(){
          return (rootElement.requestFullScreen
             || rootElement.mozRequestFullScreen
             || rootElement.webkitRequestFullScreen
             || rootElement.msRequestFullscreen);
        };

        /**
         * Tests if device is a touch device.
         * @return Boolean true if the device is a touch one, false
         * otherwise
         */
        function isTouchDevice(){
          return true == ("ontouchstart" in window || window.DocumentTouch && document instanceof DocumentTouch);
        };

        /**
         * Gets closest timecode, from the list of timecodes, to
         * the given time.
         * @param Number time The time to look for in milliseconds
         * @return Number The actual timecode for the given time
         */
        function findTimecode(time){

          if($scope.sortedTimecodes.length){
            for(var i = 0 ; i < $scope.sortedTimecodes.length ; i++){
              if(time > $scope.sortedTimecodes[i].timecode && ($scope.sortedTimecodes[i + 1] && time < $scope.sortedTimecodes[i + 1].timecode))
                return $scope.sortedTimecodes[i].timecode;
            }

            return $scope.sortedTimecodes[$scope.sortedTimecodes.length - 1].timecode;
          }
          
          return 0;
        };

        /**
         * Handles mouse move events on volume bar area to update the 
         * volume preview accordingly.
         * @param MouseEvent event The dispatched event
         */
        function volumeMouseMove(event){
          $scope.$apply(function(){
            $scope.volumePreview = Math.round(((volumeBarRect.bottom - event.pageY) / volumeBarHeight) * 100);
          });
        };

        /**
         * Handles mouse out events on volume bar area to reset volume
         * preview and clear event listeners.
         */
        function volumeMouseOut(){
          $document.off("mousemove", volumeMouseMove);
          angular.element(volumeBar).off("mouseout", volumeMouseOut);

          $scope.$apply(function(){
            $scope.volumePreview = 0;
          });
        };

        /**
         * Handles mouse move events on time bar area to update the 
         * time / presentation preview accordingly.
         * @param MouseEvent event The dispatched event
         */
        function timeMouseMove(event){
          var timecode = findTimecode(((event.pageX - timeBarRect.left) / timeBarWidth) * $scope.duration);

          $scope.$apply(function(){
            if($scope.timecodes[timecode])
              $scope.timePreview = $scope.timecodes[timecode].image.large;

            $scope.timePreviewPosition = ((event.pageX - timeBarRect.left) / timeBarWidth) * 100;
          });
        };

        /**
         * Handles mouse out events on time bar area to reset the 
         * time preview and clear the event listeners.
         */
        function timeMouseOut(event){
          $document.off("mousemove", timeMouseMove);
          angular.element(timeBar).off("mouseout", timeMouseOut);

          $scope.$apply(function(){
            $scope.timePreviewPosition = 0;
            $scope.timePreviewOpened = false;
          });
        };

        /**
         * Handles mouse over events on volume bar area to be able to 
         * display a preview of the future volume level.
         * @param MouseEvent event The dispatched event
         */
        angular.element(volumeBar).on("mouseover", function(event){
          volumeBarRect = volumeBar.getBoundingClientRect();
          volumeBarHeight = volumeBarRect.bottom - volumeBarRect.top;
          $document.on("mousemove", volumeMouseMove);
          angular.element(volumeBar).on("mouseout", volumeMouseOut);
        });

        /**
         * Handles mouse over events on time bar area to be able to 
         * display a time /presentation preview.
         * @param MouseEvent event The dispatched event
         */
        angular.element(timeBar).on("mouseover", function(event){
          if($scope.sortedTimecodes.length){
            timeBarRect = timeBar.getBoundingClientRect();
            timeBarWidth = timeBarRect.right - timeBarRect.left;

            timeMouseMove(event);
            $document.on("mousemove", timeMouseMove);
            angular.element(timeBar).on("mouseout", timeMouseOut);

            $scope.$apply(function(){
              $scope.timePreviewOpened = true;
            });
          }
        });

        // Listen to player ready event
        $element.on("ready", function(event, duration){
          $scope.$apply(function(){
            $scope.duration = duration;
          });
        });

        // Listen to player play event
        $element.on("play", function(event){
          $scope.$apply(function(){
            $scope.playPauseButton = "pause";
          });
        });

        // Listen to player pause event
        $element.on("pause", function(event){
          $scope.$apply(function(){
            $scope.playPauseButton = "play";
          });
        });

        // Listen to player loadProgress event
        $element.on("loadProgress", function(event, loadPercent){
          $scope.$apply(function(){
            $scope.loadingPercent = Math.min(loadPercent, 100);
          });
        });

        // Listen to player playProgress event
        $element.on("playProgress", function(event, data){
          var timecode = findTimecode(data.time);

          function updateTime(){
            $scope.time = data.time;
            $scope.seenPercent = data.percent;

            if($scope.timecodes[timecode])
              $scope.presentation = $scope.timecodes[timecode].image.large;
          }

          // Make sure we're not on a digestion cycle
          var phase = $scope.$root.$$phase;
          if(phase === "$apply" || phase === "$digest")
            updateTime();
          else
            $scope.$apply(updateTime);

        });

        // Listen to player end event
        $element.on("end", function(event){
          $scope.$apply(function(){
            $scope.time = $scope.seenPercent = 0;
            $scope.playPauseButton = "play";

            if($scope.sortedTimecodes.length)
              $scope.presentation = $scope.timecodes[$scope.sortedTimecodes[0].timecode].image.large;
          });
        });

      }]
    };
  };
  
})(angular, angular.module("ov.player"));