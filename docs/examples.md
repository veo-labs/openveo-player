# Player HTML example

You can use the HTML player to play a video by its url.

The HTML player expects one media Id and one url by source.

## index.html

```html
<!DOCTYPE html>
<html ng-app="test.player" ng-controller="TestController" ng-strict-di>
  <head>
    <link rel="stylesheet" type="text/css" href="lib/openveo-player/dist/openveo-player.css">
    <link rel="stylesheet" type="text/css" href="lib/video.js/dist/video-js.min.css">

    <!--[if lt IE 9]>
      <script src="lib/html5shiv.min.js"></script>
    <![endif]-->

  </head>

  <body>

    <ov-player
      ov-player-type="html"
      ov-data="data"
    ></ov-player>

    <script type="text/javascript" src="lib/angular/angular.min.js"></script>
    <script type="text/javascript" src="lib/angular-cookies/angular-cookies.min.js"></script>
    <script type="text/javascript" src="lib/video.js/dist/video.min.js"></script>
    <script type="text/javascript" src="lib/openveo-player/dist/openveo-player.min.js"></script>
    <script type="text/javascript" src="app.js"></script>

    <script>

      // Set flash fallback for video.js
      videojs.options.flash.swf = "lib/video.js/dist/video-js.swf";

    </script>
  </body>

</html>
```

## app.js

```javascript
(function(angular) {

  'use strict';

  var app = angular.module('test.player', ['ov.player']);

  app.controller('TestController', TestController);
  TestController.$inject = ['$scope', '$window', '$location'];

  /**
   * Defines the test controller.
   */
  function TestController($scope, $window, $location) {
    $scope.data =
      {
        mediaId: ['136081112'], // The id of the source
        timecodes: [ // Timecodes
          {
            timecode: 0, // Timecode in milliseconds (0 ms)
            image: { // Image to display at 0 ms
              small: 'http://mydomainname.local/image1-small.jpeg', // Small version of the image
              large: 'http://mydomainname.local/image1-large.jpeg'// Large version of the image
            }
          },
          {
            timecode: 1200, // Timecode in milliseconds (1200 ms)
            image: { // Image to display at 1200 ms
              small: 'http://mydomainname.local/image2-small.jpeg', // Small version of the image
              large: 'http://mydomainname.local/image2-large.jpeg' // Large version of the image
            }
          }
        ],
        sources: [
          {
            files: [ // The list of video files (resolutions) for the source "136081112"
              {
                width: 640, // Video width for this resolution
                height: 360, // Video height for this resolution
                link: 'http://mydomainname.local/pathToSDMP4.mp4' // Video url
              },
              {
                width: 1280, // Video width for this resolution
                height: 720, // Video height for this resolution
                link: 'http://mydomainname.local/pathToHDMP4.mp4' // Video url
              }
            ]
          }
        ],
        thumbnail: "http://mydomainname.local/thumbnail.jpg", // The media thumbnail url (only for "html" player)
        chapters: [ // Chapters
          {
            name: 'Chapter 1', // Chapter name
            description: 'Chapter 1 description', // Chapter description (can contain HTML)
            value: 0.1 // Chapter timecode in percent (percentage of the video)
          },
          {
            name: 'Chapter 2', // Chapter name
            description: 'Chapter 2 description', // Chapter description (can contain HTML)
            value: 0.2 // Chapter timecode in percent (percentage of the video)
          }
        ],
        tags: [ // Tags
          {
            name: 'Simple tag', // Tag name
            description: 'Simple tag description', // Tag description (can contain HTML)
            value: 0.1 // Tag timecode in percent (percentage of the video)
          },
          {
            name: 'Video tag', // Tag name
            description: 'Video tag description', // Tag description (can contain HTML)
            value: 0.2, // Tag timecode in percent (percentage of the video)
            file: { // Video associated to the tag
              mimetype: 'video/mp4', // Video mime type
              basePath: 'http://mydomainname.local/video.mp4' // Url of the video
            }
          },
          {
            name: 'PDF tag', // Tag name
            description: 'PDF tag description', // Tag description (can contain HTML)
            value: 0.3, // Tag timecode in percent (percentage of the video)
            file: { // PDF associated to the tag
              mimetype: 'application/pdf', // PDF mime type
              basePath: 'http://mydomainname.local/pdf.pdf', // Url of the PDF
              originalname: 'pdf-name-without-extension' // PDF file name when downloading
            }
          },
          {
            name: 'Image tag', // Tag name
            description: 'Image tag description', // Tag description (can contain HTML)
            value: 0.4, // Tag timecode in percent (percentage of the video)
            file: { // Image associated to the tag
              mimetype: 'image/jpeg', // Image mime type
              basePath: 'http://mydomainname.local/image.jpeg' // Url of the image
            }
          },
          {
            name: 'Audio tag', // Tag name
            description: 'Audio tag description', // Tag description (can contain HTML)
            value: 0.5, // Tag timecode in percent (percentage of the video)
            file: { // Audio associated to the tag
              mimetype: 'audio/mp3', // Audio mime type
              basePath: 'http://mydomainname.local/audio.mp3' // Url of the audio file
            }
          }
        ],
        cut: [ // Cut information (begin and end)
          {
            type: 'begin', // Cut type (either "begin" or "end")
            value: 0 // Begin timecode (percentage of the media)
          },
          {
            type: 'end', // Cut type (either "begin" or "end")
            value: 0.9 // End timecode (percentage of the media)
          }
        ]
      };
  }

})(angular);
```

# Player HTML Multi-sources example

You can also use the HTML player to play several sources (different viewpoint for example).

The HTML player with several sources expects one media Id and one url by source.

## index.html

```html
<!DOCTYPE html>
<html ng-app="test.player" ng-controller="TestController" ng-strict-di>
  <head>
    <link rel="stylesheet" type="text/css" href="lib/openveo-player/dist/openveo-player.css">
    <link rel="stylesheet" type="text/css" href="lib/video.js/dist/video-js.min.css">

    <!--[if lt IE 9]>
      <script src="lib/html5shiv.min.js"></script>
    <![endif]-->

  </head>

  <body>

    <ov-player
      ov-player-type="html"
      ov-data="data"
    ></ov-player>

    <script type="text/javascript" src="lib/angular/angular.min.js"></script>
    <script type="text/javascript" src="lib/angular-cookies/angular-cookies.min.js"></script>
    <script type="text/javascript" src="lib/video.js/dist/video.min.js"></script>
    <script type="text/javascript" src="lib/openveo-player/dist/openveo-player.min.js"></script>
    <script type="text/javascript" src="app.js"></script>

    <script>

      // Set flash fallback for video.js
      videojs.options.flash.swf = "lib/video.js/dist/video-js.swf";

    </script>

  </body>

</html>
```

## app.js

```javascript
(function(angular) {

  'use strict';

  var app = angular.module('test.player', ['ov.player']);

  app.controller('TestController', TestController);
  TestController.$inject = ['$scope', '$window', '$location'];

  /**
   * Defines the test controller.
   */
  function TestController($scope, $window, $location) {
    $scope.data =
      {
        mediaId: ['136081112', '136081113'], // Ids of the sources
        sources: [
          {
            files: [ // The list of resolutions for the source "136081112"
              {
                width: 640, // Video width for this resolution
                height: 360, // Video height for this resolution
                link: 'http://mydomainname.local/pathToSDMP4.mp4' // Video url
              },
              {
                width: 1280, // Video width for this resolution
                height: 720, // Video height for this resolution
                link: 'http://mydomainname.local/pathToHDMP4.mp4' // Video url
              }
            ]
          },
          {
            files: [ // The list of resolutions for the source "136081113"
              {
                width: 640, // Video width for this resolution
                height: 360, // Video height for this resolution
                link: 'http://mydomainname.local/pathToSDMP4.mp4' // Video url
              },
              {
                width: 1280, // Video width for this resolution
                height: 720, // Video height for this resolution
                link: 'http://mydomainname.local/pathToHDMP4.mp4' // Video url
              }
            ]
          }
        ],
        [...]
      };
  }

})(angular);
```

# Player Vimeo example

You can use Vimeo player to play a video hosted on Vimeo platform using Vimeo player.

The Vimeo player expects the id of the media hosted on Vimeo. You can specify several media ids for multi sources (multi viewpoint).

## index.html

```html
<!DOCTYPE html>
<html ng-app="test.player" ng-controller="TestController" ng-strict-di>
  <head>
    <link rel="stylesheet" type="text/css" href="lib/openveo-player/dist/openveo-player.css">

    <!--[if lt IE 9]>
      <script src="lib/html5shiv.min.js"></script>
    <![endif]-->

  </head>

  <body>

    <ov-player
      ov-player-type="vimeo"
      ov-data="data"
    ></ov-player>

    <script type="text/javascript" src="lib/angular/angular.min.js"></script>
    <script type="text/javascript" src="lib/angular-cookies/angular-cookies.min.js"></script>
    <script type="text/javascript" src="lib/openveo-player/dist/openveo-player.min.js"></script>
    <script type="text/javascript" src="app.js"></script>
  </body>

</html>
```

## app.js

```javascript
(function(angular) {

  'use strict';

  var app = angular.module('test.player', ['ov.player']);

  app.controller('TestController', TestController);
  TestController.$inject = ['$scope', '$window', '$location'];

  /**
   * Defines the test controller.
   */
  function TestController($scope, $window, $location) {
    $scope.data =
      {
        mediaId: ['136081112'], // The id(s) of the source(s) on vimeo platform
        [...]
     };
  }

})(angular);
```


# Player Youtube example

You can use Youtube player to play a video hosted on Youtube platform using Youtube player.

The Youtube player expects the id of the media hosted on Youtube. You can specify several media ids for multi sources (multi viewpoint).

## index.html

```html
<!DOCTYPE html>
<html ng-app="test.player" ng-controller="TestController" ng-strict-di>
  <head>
    <link rel="stylesheet" type="text/css" href="lib/openveo-player/dist/openveo-player.css">

    <!--[if lt IE 9]>
      <script src="lib/html5shiv.min.js"></script>
    <![endif]-->

  </head>

  <body>

    <ov-player
      ov-player-type="youtube"
      ov-data="data"
    ></ov-player>

    <script type="text/javascript" src="lib/angular/angular.min.js"></script>
    <script type="text/javascript" src="lib/angular-cookies/angular-cookies.min.js"></script>
    <script type="text/javascript" src="lib/openveo-player/dist/openveo-player.min.js"></script>
    <script type="text/javascript" src="app.js"></script>
  </body>

</html>
```

## app.js

```javascript
(function(angular) {

  'use strict';

  var app = angular.module('test.player', ['ov.player']);

  app.controller('TestController', TestController);
  TestController.$inject = ['$scope', '$window', '$location'];

  /**
   * Defines the test controller.
   */
  function TestController($scope, $window, $location) {
    $scope.data =
      {
        mediaId : ['136081112'], // The id(s) of the source(s) on youtube platform
        [...]
     };
  }

})(angular);
```

# [Player API](api.md) example

You can interact with the player using the API.

## index.html

```html
<!DOCTYPE html>
<html ng-app="test.player" ng-controller="TestController" ng-strict-di>
  <head>
    <link rel="stylesheet" type="text/css" href="lib/openveo-player/dist/openveo-player.css">
    <link rel="stylesheet" type="text/css" href="lib/video.js/dist/video-js.min.css">

    <!--[if lt IE 9]>
      <script src="lib/html5shiv.min.js"></script>
    <![endif]-->

  </head>

  <body>

    <ov-player
      ov-player-type="html"
      ov-data="data"
      ng-show="ready"
      id="myPlayer"
    ></ov-player>

    <script type="text/javascript" src="lib/angular/angular.min.js"></script>
    <script type="text/javascript" src="lib/angular-cookies/angular-cookies.min.js"></script>
    <script type="text/javascript" src="lib/video.js/dist/video.min.js"></script>

    <script>

      // Set flash fallback for video.js
      videojs.options.flash.swf = "lib/video.js/dist/video-js.swf";

    </script>

    <script type="text/javascript" src="lib/openveo-player/dist/openveo-player.min.js"></script>
    <script type="text/javascript" src="app.js"></script>
  </body>

</html>
```

## app.js

```javascript
(function(angular) {

  'use strict';

  var app = angular.module('test.player', ['ov.player']);

  app.controller('TestController', TestController);
  TestController.$inject = ['$scope', '$window', '$location'];

  /**
   * Defines the test controller.
   */
  function TestController($scope, $window, $location) {
    $scope.data = {
      mediaId: ['136081112'], // The id(s) of the source(s) on vimeo platform
      sources: [
        {
          files: [ // The list of resolutions for the source "136081112" (only for "html" player)
            {
              width: 640, // Video width for this resolution
              height: 360, // Video height for this resolution
              link: 'http://mydomainname.local/pathToSDMP4.mp4' // Video url
            },
            {
              width: 1280, // Video width for this resolution
              height: 720, // Video height for this resolution
              link: 'http://mydomainname.local/pathToHDMP4.mp4' // Video url
            }
          ]
        }
      ]
    };

    var myPlayer = document.getElementById('myPlayer');

    // Listen to ready event
    angular.element(myPlayer).on('ready', function(event) {
      console.log('ready');
      $scope.ready = true;

      var playerController = angular.element(myPlayer).controller('ovPlayer');

      // Selects a new display mode ('media')
      playerController.selectMode('media');

      // Starts / Pauses the player
      playerController.playPause();

      // Sets volume to 10%
      playerController.setVolume(10);

      // Seeks media to time 20s
      playerController.setTime(20000);

      // Changes media source
      playerController.setSource(1);

    });

    angular.element(myPlayer).on('waiting', function(event) {
      console.log('waiting');
    });

    angular.element(myPlayer).on('playing', function(event) {
      console.log('playing');
    });

    angular.element(myPlayer).on('durationChange', function(event, duration) {
      console.log('durationChange with new duration = ' + duration + 'ms');
    });

    angular.element(myPlayer).on('play', function(event) {
      console.log('play');
    });

    angular.element(myPlayer).on('pause', function(event) {
      console.log('pause');
    });

    angular.element(myPlayer).on('loadProgress', function(event, percents) {
      console.log('loadProgress');
      console.log('Buffering start = ' + percents.loadedStart);
      console.log('Buffering end = ' + percents.loadedPercent);
    });

    angular.element(myPlayer).on('playProgress', function(event, data) {
      console.log('playProgress');
      console.log('Current time = ' + data.time + 'ms');
      console.log('Played percent = ' + data.percent);
    });

    angular.element(myPlayer).on('end', function(event) {
      console.log('end');
    });

    angular.element(myPlayer).on('error', function(event, error) {
      console.log(error.message);
      console.log(error.code);
    });

  }

})(angular);
```
