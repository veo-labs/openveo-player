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
   * var ovPlayerDirectory = "/js/player/";
   *
   * Available attributes are :
   *  - Object ov-data A data object as :
   *   {
   *     mediaId : "136081112", // The id of the media
   *     timecodes : { // Timecodes
   *       0 : { // Timecode in milliseconds (0 ms)
   *         image : { // Image to display at 0 ms
   *           small : "slide_00000.jpeg", // Small version of the image
   *           large : "slide_00000_large.jpeg" // Large version of the image
   *         }
   *       },
   *       1200 : { // Timecode in milliseconds (1200 ms)
   *         image : { // Image to display at 1200 ms
   *           small : "slide_00001.jpeg", // Small version of the image
   *           large : "slide_00001_large.jpeg" // Large version of the image
   *         }
   *       }
   *       ...
   *     },
   *     files : [ // The list of media files (only for "html" player)
   *       {
   *         width : 640, // Media width for this file
   *         height : 360, // Media height for this file
   *         link : "https://player.vimeo.com/external/136081112.sd.mp4" // Media url
   *       },
   *       {
   *         width : 1280, // Media width for this file
   *         height : 720, // Media height for this file
   *         link : "https://player.vimeo.com/external/136081112.hd.mp4" // Media url
   *       },
   *       ...
   *     ],
   *     pictures : [ // The list of media thumbnails (only for "html" player)
   *       {
   *         width : 960,
   *         height : 540,
   *         link : "https://i.vimeocdn.com/video/530445364_960x540.jpg"
   *       },
   *       {
   *         width : 1280,
   *         height : 720,
   *         link : "https://i.vimeocdn.com/video/530445364_1280x720.jpg"
   *       }
   *     ]
   *   }
   *   nb : Note that small images must be at least 200 pixels width.
   *  - String ov-player-type The type of player to use to play the media. It
   *    can be either :
   *      - html : To play the media using HTML player
   *    If no player type is provided, ov-player will figure out which player
   *    to use depending on the media type.
   *  - Boolean ov-fullscreen-icon true to display the 
   *    enlarge/reduce icon (CAUTION : It must be an assignable variable)
   *  - Boolean ov-volume-icon true to display the volume icon
   *    (CAUTION : It must be an assignable variable)
   *  - Boolean ov-mode-icon true to display the display mode icon
   *    (CAUTION : It must be an assignable variable)
   *  - Boolean ov-time true to display the actual time and duration
   *    (CAUTION : It must be an assignable variable)
   *  - Boolean ov-full-viewport true to display the player in
   *    full viewport (CAUTION : It must be an assignable variable)
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
   * <ov-player 
   *   ov-data="data"
   *   ov-fullscreen-icon="displayFullscreenIcon"
   *   ov-volume="displayVolumeIcon"
   *   ov-mode="displayModeIcon"
   *   ov-time="displayTime"
   *   ov-full-viewport="fullViewport"
   *   ov-player-type="html"
   * ></ov-player>
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
   * must be changed. There aren't any two way bindings on the data
   * object properties.
   */
  var app = angular.module("ov.player", []);
  
  if(typeof ovPlayerDirectory === "undefined" || typeof ovPlayerDirectory !== "string")
    throw new Error("ovPlayerDirectory global variable must be defined and set to the root path of the openVeo player");
  
})(angular);