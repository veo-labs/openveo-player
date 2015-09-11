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
   *     timecodes : [ // Timecodes
   *       {
   *         timecode : 0, // Timecode in milliseconds (0 ms)
   *         image : { // Image to display at 0 ms
   *           small : "slide_00000.jpeg", // Small version of the image
   *           large : "slide_00000_large.jpeg" // Large version of the image
   *         }
   *       },
   *       {
   *         timecode : 1200, // Timecode in milliseconds (1200 ms)
   *         image : { // Image to display at 1200 ms
   *           small : "slide_00001.jpeg", // Small version of the image
   *           large : "slide_00001_large.jpeg" // Large version of the image
   *         }
   *       }
   *       ...
   *     ],
   *     chapters : [ // Chapters
   *       {
   *         name : "Chapter 1", // Chapter name
   *         description : "Chapter 1", // Chapter description
   *         value : 0.04666666666666667 // Chapter timecode in percent
   *       },
   *       {
   *         name : "Chapter 2", // Chapter name
   *         description : "Chapter 2", // Chapter description
   *         value : 0.31666666666666665 // Chapter timecode in percent
   *       }
   *       ...
   *     ],
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
   *    "mediaId" : "118502922",
   *    "timecodes" : [
   *      {
   *        "timecode" : 50000,
   *        "image" : {
   *          "small" : "./slides/slide_00000.jpeg",
   *          "large" : "./slides/slide_00000_large.jpeg"
   *        }
   *      }
   *    ]
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
   *    "mediaId" : "118502919",
   *    "timecodes" : {
   *      {
   *        "timecode" : 0,
   *        "image" : {
   *          "small" : "./slides/slide_00000.jpeg",
   *          "large" : "./slides/slide_00000_large.jpeg"
   *        }
   *      },
   *      {
   *        "timecode" : 20000,
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
   *
   * Listening to events :
   * You can listen to player events using ov-player HTMLElement.
   * Dispatched events are :
   *  - ready The player is ready to receive actions
   *  - waiting Media playback has stopped because the next frame is not available
   *  - playing Media playback is ready to start after being paused or
   *    delayed due to lack of media data
   *  - durationChange The duration attribute has just been updated
   *  - play Media is no longer paused
   *  - pause Media has been paused
   *  - loadProgress Got buffering information
   *  - playProgress Media playback position has changed
   *  - end Media playback has reached the end
   *
   * e.g.
   * <ov-player ... id="myPlayer"></ov-player>
   *
   * var myPlayer = document.getElementById("myPlayer");
   * angular.element(myPlayer).on("ready", function(event){
   *   console.log("ready");
   * });
   *
   * angular.element(test).on("waiting", function(event){
   *   console.log("waiting");
   * });
   *
   * angular.element(test).on("playing", function(event){
   *   console.log("playing");
   * });
   *
   * angular.element(test).on("durationChange", function(event, duration){
   *   console.log("durationChange with new duration = " + duration);
   * });
   *
   * angular.element(test).on("play", function(event){
   *   console.log("play");
   * });
   *
   * angular.element(test).on("pause", function(event){
   *   console.log("pause");
   * });
   *
   * angular.element(test).on("loadProgress", function(event, percents){
   *   console.log("loadProgress");
   *   console.log("Buffering start = " + percents.loadedStart);
   *   console.log("Buffering end = " + percents.loadedPercent);
   * });
   *
   * angular.element(test).on("playProgress", function(event, data){
   *   console.log("playProgress");
   *   console.log("Current time = " + data.time + "ms");
   *   console.log("Played percent = " + data.percent);
   * });
   *
   * angular.element(test).on("end", function(event){
   *   console.log("end");
   * });
   *
   * Controlling the player :
   * You can control the player with some basic actions
   * - selectMode To select the display mode (can be "media", "both",
   *   "both-presentation" or "presentation")
   * - playPause To start / stop the media
   * - setVolume To change player's volume
   * - setTime To seek media to a specific time
   *
   * e.g.
   * <ov-player ... id="myPlayer"></ov-player>
   * var myPlayer = document.getElementById("myPlayer");
   *
   * angular.element(myPlayer).on("ready", function(event){
   *  console.log("ready");
   *  var playerController = angular.element(myPlayer).controller("ovPlayer");
   *
   *  // Selects a new display mode ("media")
   *  playerController.selectMode("media");
   *
   *  // Starts / Pauses the player
   *  playerController.playPause();
   *
   *  // Sets volume to 10%
   *  playerController.setVolume(10);
   *
   *  // Seeks media to time 20s
   *  playerController.setTime(20000);
   * 
   * });
   *
   */
  var app = angular.module("ov.player", []);
  
  if(typeof ovPlayerDirectory === "undefined" || typeof ovPlayerDirectory !== "string")
    throw new Error("ovPlayerDirectory global variable must be defined and set to the root path of the openVeo player");
  
})(angular);