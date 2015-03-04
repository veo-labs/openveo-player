(function(angular){

  "use strict"

  /**
   * Creates the ov.player module.
   * ov.player offers a directive to easily create a player with 
   * associated presentation images. All you have to do is use the 
   * directive ovPlayer.
   *
   * The ov-player HTML element needs partials. To be able to locate the 
   * directory of the partials, a global variable "ovPlayerDirectory"
   * must be set to the root directory of the player. 
   *
   * e.g.
   * var ovPlayerDirectory = "/js/player";
   *
   * Available attributes are :
   *  - Object ov-data A data object as :
   *   {
   *     "type" : "vimeo", // The player type
   *     "id" : "34532ezr54sdf87", // The id of the video
   *     "timecodes" : { // Timecodes
   *       0 : { // Timecode in milliseconds (0 ms)
   *         "image" : { // Image to display at 0 ms
   *           "small" : "slide_00000.jpeg", // Small version of the image
   *           "large" : "slide_00000_large.jpeg" // Large version of the image
   *         }
   *       },
   *       1200 : { // Timecode in milliseconds (1200 ms)
   *         "image" : { // Image to display at 1200 ms
   *           "small" : "slide_00001.jpeg", // Small version of the image
   *           "large" : "slide_00001_large.jpeg" // Large version of the image
   *         }
   *       }
   *       ...
   *     }
   *   }
   *   Note that small images must be at least 200 pixels width.
   *  - Boolean ov-fullscreen-icon true to display the 
   *    enlarge/reduce icon
   *  - Boolean ov-volume-icon true to display the volume icon
   *  - Boolean ov-mode-icon true to display the display mode icon
   *  - Boolean ov-time-icon true to display the actual time and duration
   *  - Boolean ov-fullscreen true to display the player in full screen 
   *    after loading
   *
   * e.g.
   * 
   * // Define the data object as input for the ov-player 
   * $scope.data = 
   *  {
   *    "type" : "vimeo",
   *    "id" : "118502922",
   *    "timecodes" : {
   *      50000 : {
   *        "image" : {
   *          "small" : "./slides/slide_00000.jpeg",
   *          "large" : "./slides/slide_00000_large.jpeg"
   *        }
   *      }
   *    }
   *  }
   *
   * <ov-player ov-data="data" ov-fullscreen-icon="true" ov-volume="true" ov-mode="true" ov-time="true" ov-fullscreen="false"></ov-player>
   *
   * // The whole object can also be changed dynamically
   * $scope.data = 
   *  {
   *    "type" : "vimeo",
   *    "id" : "118502919",
   *    "timecodes" : {
   *      0 : {
   *        "image" : {
   *          "small" : "./slides/slide_00000.jpeg",
   *          "large" : "./slides/slide_00000_large.jpeg"
   *        }
   *      },
   *      20000 : {
   *        "image" : {
   *          "small" : "./slides/slide_00001.jpeg",
   *          "large" : "./slides/slide_00001_large.jpeg"
   *        }
   *      }   
   *    }
   *  }
   *
   * CAUTION : To update the data of the player the whole object 
   * must be changed.
   */
  var app = angular.module("ov.player", []);
  
  if(typeof ovPlayerDirectory === "undefined" || typeof ovPlayerDirectory !== "string")
    throw new Error("ovPlayerDirectory global variable must be defined and set to the root path of the openVeo player");
  
})(angular);