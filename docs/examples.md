# Player HTML example

## index.html

```html
<!DOCTYPE html>
<html ng-app="test.player" ng-controller="TestController" ng-strict-di>
  <head>
    <link rel="stylesheet" type="text/css" href="lib/openveo-player/dist/openveo-player.css">

    <!--[if lt IE 9]>
      <script src="lib/html5shiv.min.js"></script>
    <![endif]-->
    <script>

      // Set ovPlayerDirectory to openveo-player root path
      // This is used by openveo-player to get partials
      // Do not forget the trailing slash !
      var ovPlayerDirectory = 'lib/openveo-player/';
    </script>

  </head>

  <body>

    <ov-player
      ov-player-type="html"
      ov-data="data"
      ng-show="ready"
    ></ov-player>

    <script type="text/javascript" src="lib/angular/angular.min.js"></script>
    <script type="text/javascript" src="lib/openveo-player/dist/openveo-player.min.js"></script>
    <script type="text/javascript" src="app.js"></script>
  </body>

</html>
```

## app.js

```javascript
(function(angular){

  'use strict';

  var app = angular.module('test.player', ['ov.player']);

  app.controller('TestController', TestController);
  TestController.$inject = ['$scope', '$window', '$location'];

  /**
   * Defines the test controller.
   */
  function TestController($scope, $window, $location){
    $scope.ready = true;
    $scope.data =
      {
        mediaId : '136081112', // The id of the video
        timecodes : { // Timecodes
          0 : { // Timecode in milliseconds (0 ms)
            image : { // Image to display at 0 ms
              small : 'slide_00000.jpe', // Small version of the image
              large : 'slide_00000_large.jpeg'// Large version of the image
            }
          },
          1200 : { // Timecode in milliseconds (1200 ms)
            image : { // Image to display at 1200 ms
              small : 'slide_00001.jpeg', // Small version of the image
              large : 'slide_00001_large.jpeg' // Large version of the image
            }
         }
         ...
       },
       files : [ // The list of video files (only for "html" player)
         {
           width : 640, // Video width for this file
           height : 360, // Video height for this file
           link : 'http://pathToSDMP4.mp4' // Video url
         },
         {
           width : 1280, // Video width for this file
           height : 720, // Video height for this file
           link : 'http://pathToHDMP4.mp4' // Video url
         }
         ...
       ],
       thumbnail : "/1439286245225/thumbnail.jpg", // The media thumbnail (only for "html" player)
       chapters : [ // Chapters
         {
           name : 'Chapter 1', // Chapter name
           description : 'Chapter 1 description', // Chapter description
           value : 0.04 // Chapter timecode in percent (percentage of the video)
         },
         {
           name : 'Chapter 2', // Chapter name
           description : 'Chapter 2 description', // Chapter description
           value : 0.3 // Chapter timecode in percent (percentage of the video)
         }
         ...
       ],
       cut : [ // Cut information (begin and end)
         {
           type : 'begin', // Cut type
           value : 0 // Begin timecode (percentage of the media)
         },
         {
           type : 'end', // Cut type
           value : 0.9 // End timecode (percentage of the media)
         }
       ]
     };
  }

})(angular);
```

# Player Vimeo example

## index.html

```html
<!DOCTYPE html>
<html ng-app="test.player" ng-controller="TestController" ng-strict-di>
  <head>
    <link rel="stylesheet" type="text/css" href="lib/openveo-player/dist/openveo-player.css">

    <!--[if lt IE 9]>
      <script src="lib/html5shiv.min.js"></script>
    <![endif]-->
    <script>

      // Set ovPlayerDirectory to openveo-player root path
      // This is used by openveo-player to get partials
      // Do not forget the trailing slash !
      var ovPlayerDirectory = "lib/openveo-player/";
    </script>

  </head>

  <body>

    <ov-player
      ov-player-type="vimeo"
      ov-data="data"
      ng-show="ready"
    ></ov-player>

    <script type="text/javascript" src="lib/angular/angular.min.js"></script>
    <script type="text/javascript" src="lib/openveo-player/dist/openveo-player.min.js"></script>
    <script type="text/javascript" src="app.js"></script>
  </body>

</html>
```

## app.js

```javascript
(function(angular){

  'use strict';

  var app = angular.module('test.player', ['ov.player']);

  app.controller('TestController', TestController);
  TestController.$inject = ['$scope', '$window', '$location'];

  /**
   * Defines the test controller.
   */
  function TestController($scope, $window, $location){
    $scope.ready = true;
    $scope.data =
      {
        mediaId : '136081112', // The id of the video on vimeo platform
        timecodes : { // Timecodes
          0 : { // Timecode in milliseconds (0 ms)
            image : { // Image to display at 0 ms
              small : 'slide_00000.jpeg', // Small version of the image
              large : 'slide_00000_large.jpeg' // Large version of the image
            }
          },
          1200 : { // Timecode in milliseconds (1200 ms)
            image : { // Image to display at 1200 ms
              small : 'slide_00001.jpeg', // Small version of the image
              large : 'slide_00001_large.jpeg' // Large version of the image
            }
         }
         ...
       },
       chapters : [ // Chapters
         {
           name : 'Chapter 1', // Chapter name
           description : 'Chapter 1 description', // Chapter description
           value : 0.04 // Chapter timecode in percent (percentage of the video)
         },
         {
           name : 'Chapter 2', // Chapter name
           description : 'Chapter 2 description', // Chapter description
           value : 0.3 // Chapter timecode in percent (percentage of the video)
         }
         ...
       ],
       cut : [ // Cut information (begin and end)
         {
           type : 'begin', // Cut type
           value : 0 // Begin timecode (percentage of the media)
         },
         {
           type : 'end', // Cut type
           value : 0.9 // End timecode (percentage of the media)
         }
       ]
     };
  }

})(angular);
```


# Player Youtube example

## index.html

```html
<!DOCTYPE html>
<html ng-app="test.player" ng-controller="TestController" ng-strict-di>
  <head>
    <link rel="stylesheet" type="text/css" href="lib/openveo-player/dist/openveo-player.css">

    <!--[if lt IE 9]>
      <script src="lib/html5shiv.min.js"></script>
    <![endif]-->
    <script>

      // Set ovPlayerDirectory to openveo-player root path
      // This is used by openveo-player to get partials
      // Do not forget the trailing slash !
      var ovPlayerDirectory = "lib/openveo-player/";
    </script>

  </head>

  <body>

    <ov-player
      ov-player-type="youtube"
      ov-data="data"
      ng-show="ready"
    ></ov-player>

    <script type="text/javascript" src="lib/angular/angular.min.js"></script>
    <script type="text/javascript" src="lib/openveo-player/dist/openveo-player.min.js"></script>
    <script type="text/javascript" src="app.js"></script>
  </body>

</html>
```

## app.js

```javascript
(function(angular){

  'use strict';

  var app = angular.module('test.player', ['ov.player']);

  app.controller('TestController', TestController);
  TestController.$inject = ['$scope', '$window', '$location'];

  /**
   * Defines the test controller.
   */
  function TestController($scope, $window, $location){
    $scope.ready = true;
    $scope.data =
      {
        mediaId : '136081112', // The id of the video on youtube platform
        timecodes : { // Timecodes
          0 : { // Timecode in milliseconds (0 ms)
            image : { // Image to display at 0 ms
              small : 'slide_00000.jpeg', // Small version of the image
              large : 'slide_00000_large.jpeg' // Large version of the image
            }
          },
          1200 : { // Timecode in milliseconds (1200 ms)
            image : { // Image to display at 1200 ms
              small : 'slide_00001.jpeg', // Small version of the image
              large : 'slide_00001_large.jpeg' // Large version of the image
            }
         }
         ...
       },
       chapters : [ // Chapters
         {
           name : 'Chapter 1', // Chapter name
           description : 'Chapter 1 description', // Chapter description
           value : 0.04 // Chapter timecode in percent (percentage of the video)
         },
         {
           name : 'Chapter 2', // Chapter name
           description : 'Chapter 2 description', // Chapter description
           value : 0.3 // Chapter timecode in percent (percentage of the video)
         }
         ...
       ],
       cut : [ // Cut information (begin and end)
         {
           type : 'begin', // Cut type
           value : 0 // Begin timecode (percentage of the media)
         },
         {
           type : 'end', // Cut type
           value : 0.9 // End timecode (percentage of the media)
         }
       ]
     };
  }

})(angular);
```

# [Player API](api) example

## index.html

```html
<!DOCTYPE html>
<html ng-app="test.player" ng-controller="TestController" ng-strict-di>
  <head>
    <link rel="stylesheet" type="text/css" href="lib/openveo-player/dist/openveo-player.css">

    <!--[if lt IE 9]>
      <script src="lib/html5shiv.min.js"></script>
    <![endif]-->
    <script>

      // Set ovPlayerDirectory to openveo-player root path
      // This is used by openveo-player to get partials
      // Do not forget the trailing slash !
      var ovPlayerDirectory = "lib/openveo-player/";
    </script>

  </head>

  <body>

    <ov-player
      ov-player-type="html"
      ov-data="data"
      ng-show="ready"
      id="myPlayer"
    ></ov-player>

    <script type="text/javascript" src="lib/angular/angular.min.js"></script>
    <script type="text/javascript" src="lib/openveo-player/dist/openveo-player.min.js"></script>
    <script type="text/javascript" src="app.js"></script>
  </body>

</html>
```

## app.js

```javascript
(function(angular){

  'use strict';

  var app = angular.module('test.player', ['ov.player']);

  app.controller('TestController', TestController);
  TestController.$inject = ['$scope', '$window', '$location'];

  /**
   * Defines the test controller.
   */
  function TestController($scope, $window, $location){
    $scope.ready = true;
    $scope.data =
      {
        mediaId : '136081112', // The id of the video on vimeo platform
        timecodes : { // Timecodes
          0 : { // Timecode in milliseconds (0 ms)
            image : { // Image to display at 0 ms
              small : 'slide_00000.jpeg', // Small version of the image
              large : 'slide_00000_large.jpeg' // Large version of the image
            }
          },
          1200 : { // Timecode in milliseconds (1200 ms)
            image : { // Image to display at 1200 ms
              small : 'slide_00001.jpeg', // Small version of the image
              large : 'slide_00001_large.jpeg' // Large version of the image
            }
         }
       },
       files : [ // The list of video files (only for "html" player)
         {
           width : 640, // Video width for this file
           height : 360, // Video height for this file
           link : 'http://pathToSDMP4.mp4' // Video url
         },
         {
           width : 1280, // Video width for this file
           height : 720, // Video height for this file
           link : 'http://pathToHDMP4.mp4' // Video url
         }
         ...
       ]
     };

     var myPlayer = document.getElementById('myPlayer');

     // Listen to ready event
     angular.element(myPlayer).on('ready', function(event){
       console.log('ready');

       var playerController = angular.element(myPlayer).controller('ovPlayer');

       // Selects a new display mode ('media')
       playerController.selectMode('media');

       // Starts / Pauses the player
       playerController.playPause();

       // Sets volume to 10%
       playerController.setVolume(10);

       // Seeks media to time 20s
       playerController.setTime(20000);

     });

     angular.element(myPlayer).on('waiting', function(event){
       console.log('waiting');
     });

     angular.element(myPlayer).on('playing', function(event){
       console.log('playing');
     });

     angular.element(myPlayer).on('durationChange', function(event, duration){
       console.log('durationChange with new duration = ' + duration + 'ms');
     });

     angular.element(myPlayer).on('play', function(event){
       console.log('play');
     });

     angular.element(myPlayer).on('pause', function(event){
       console.log('pause');
     });

     angular.element(myPlayer).on('loadProgress', function(event, percents){
       console.log('loadProgress');
       console.log('Buffering start = ' + percents.loadedStart);
       console.log('Buffering end = ' + percents.loadedPercent);
     });

     angular.element(myPlayer).on('playProgress', function(event, data){
       console.log('playProgress');
       console.log('Current time = ' + data.time + 'ms');
       console.log('Played percent = ' + data.percent);
     });

     angular.element(myPlayer).on('end', function(event){
       console.log('end');
     });

     angular.element(myPlayer).on('error', function(event, error){
       console.log(error.message);
       console.log(error.code);
     });

  }

})(angular);
```