# Player HTML example

You can use the HTML player to play a video by its url.

The HTML player expects one media id with one source.

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

    <opl-player
      opl-player-type="html"
      opl-data="data"
    ></opl-player>

    <script type="text/javascript" src="lib/angular/angular.min.js"></script>
    <script type="text/javascript" src="lib/angular-cookies/angular-cookies.min.js"></script>
    <script type="text/javascript" src="lib/video.js/dist/video.min.js"></script>
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
  TestController.$inject = ['$scope'];

  /**
   * Defines the test controller.
   */
  function TestController($scope) {
    $scope.data =
      {
        mediaId: ['136081112'], // The list of media ids, one id by source. For the "html" player, the first media id corresponds to the first source, the second media id to the second source and so on
        timecodes: [ // A list of indexes
          {
            timecode: 0, // The position of the index relative to the media duration (in milliseconds)
            image: { // The small and large version of the image representing the index
              small: 'https://host.local/image1-small.jpeg', // URL of the small image representing the index. Displayed in the list of indexes and when pointer is over the timebar. Expected small image size is 148x80
              large: 'https://host.local/image1-large.jpeg' // URL of the large image representing the index. Displayed in the area 2 when playing time corresponds to the index time, and when an index of the list of indexes is enlarged
            }
          },
          {
            timecode: 1200, // The position of the index relative to the media duration (in milliseconds)
            image: { // The small and large version of the image representing the index
              small: 'https://host.local/image2-small.jpeg', // URL of the small image representing the index. Displayed in the list of indexes and when pointer is over the timebar. Expected small image size is 148x80
              large: 'https://host.local/image2-large.jpeg' // URL of the large image representing the index. Displayed in the area 2 when playing time corresponds to the index time, and when an index of the list of indexes is enlarged
            }
          }
        ],
        sources: [ // The list of sources, one source by media id (only for the "html" player)
          {
            files: [ // A list of MP4 files (qualities)
              {
                width: 640, // The video width in pixels
                height: 360, // The video height in pixels
                link: 'https://host.local/pathToSDMP4.mp4' // The URL of the MP4 file
              },
              {
                width: 1280, // The video width in pixels
                height: 720, // The video height in pixels
                link: 'https://host.local/pathToHDMP4.mp4' // The URL of the MP4 file
              }
            ]
          }
        ],
        thumbnail: "https://host.local/thumbnail.jpg", // The URL of the image to display before the video starts (only for the "html" player)
        chapters: [ // A list of chapters
          {
            name: 'Simple chapter', // The chapter name displayed in the list of chapters and when a chapter is enlarged
            description: 'Chapter 1 description', // The chapter description. The description is displayed when chapter is enlarged. Description may contain HTML tags
            value: 1000 // The position of the chapter relative to the media duration (in milliseconds)
          },
          {
            name: 'Chapter with attached file', // // The chapter name displayed in the list of chapters and when a chapter is enlarged
            description: 'Chapter with attached file description', // The chapter description. The description is displayed when chapter is enlarged. Description may contain HTML tags
            value: 2000, // The position of the chapter relative to the media duration (in milliseconds)
            file: { // A file attached to the chapter
              url: 'https://host.local/video.mp4', // File URL. The displayed file name is retrieved for the URL when enlarging the chapter
              originalName: 'download-file-name' // The name presented to the user when downloading the file (should not contain the extension)
            }
          }
        ],
        tags: [ // A list of tags
          {
            name: 'Simple tag', // The tag name displayed in the list of tags and when a tag is enlarged
            description: 'Simple tag description', // The tag description. The description is displayed when tag is enlarged. Description may contain HTML tags
            value: 1000 // The position of the tag relative to the media duration (in milliseconds)
          },
          {
            name: 'Tag with attached file', // The tag name displayed in the list of tags and when a tag is enlarged
            description: 'Tag with attached file description', // The tag description. The description is displayed when tag is enlarged. Description may contain HTML tags
            value: 2000, // The position of the tag relative to the media duration (in milliseconds)
            file: { // A file attached to the tag
              url: 'https://host.local/video.mp4', // File URL. The displayed file name is retrieved for the URL when enlarging the tag
              originalName: 'download-file-name' // The name presented to the user when downloading the file (should not contain the extension)
            }
          }
        ],
        cut: [ // The list of cuts to apply to the media, for now only start and end cuts are available
          {
            type: 'begin', // The cut type (either "begin" or "end")
            value: 0 // The position of the cut relative to the media duration (in milliseconds)
          },
          {
            type: 'end', // The cut type (either "begin" or "end")
            value: 10000 // The position of the cut relative to the media duration (in milliseconds)
          }
        ]
      };
  }

})(angular);
```

# Player HTML Multi-sources example

You can also use the HTML player to play several sources (different viewpoint for example).

The HTML player expects one or several media ids with one or several sources. The first media id corresponds to the first source, the second media id corresponds to the second source and so on.

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

    <opl-player
      opl-player-type="html"
      opl-data="data"
    ></opl-player>

    <script type="text/javascript" src="lib/angular/angular.min.js"></script>
    <script type="text/javascript" src="lib/angular-cookies/angular-cookies.min.js"></script>
    <script type="text/javascript" src="lib/video.js/dist/video.min.js"></script>
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
  TestController.$inject = ['$scope'];

  /**
   * Defines the test controller.
   */
  function TestController($scope) {
    $scope.data =
      {
        mediaId: ['136081112', '136081113'], // The list of media ids, one id by source. For the "html" player, the first media id corresponds to the first source, the second media id to the second source and so on
        sources: [ // The list of sources, one source by media id (only for the "html" player)
          {
            files: [ // A list of MP4 files (qualities)
              {
                width: 640, // The video width in pixels
                height: 360, // The video height in pixels
                link: 'https://host.local/pathToSDMP4-136081112.mp4' // The URL of the MP4 file
              },
              {
                width: 1280, // The video width in pixels
                height: 720, // The video height in pixels
                link: 'https://host.local/pathToHDMP4-136081113.mp4' // The URL of the MP4 file
              },
              ...
            ]
          },
          {
            files: [ // A list of MP4 files (qualities)
              {
                width: 640, // The video width in pixels
                height: 360, // The video height in pixels
                link: 'https://host.local/pathToSDMP4-136081113.mp4' // The URL of the MP4 file
              },
              {
                width: 1280, // The video width in pixels
                height: 720, // The video height in pixels
                link: 'https://host.local/pathToHDMP4-136081113.mp4' // The URL of the MP4 file
              },
              ...
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

    <opl-player
      opl-player-type="vimeo"
      opl-data="data"
    ></opl-player>

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
  TestController.$inject = ['$scope'];

  /**
   * Defines the test controller.
   */
  function TestController($scope) {
    $scope.data =
      {
        mediaId: ['136081112'], // The id(s) of the source(s) on Vimeo platform
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

    <opl-player
      opl-player-type="youtube"
      opl-data="data"
    ></opl-player>

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
  TestController.$inject = ['$scope'];

  /**
   * Defines the test controller.
   */
  function TestController($scope) {
    $scope.data =
      {
        mediaId : ['136081112'], // The id(s) of the source(s) on Youtube platform
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

    <opl-player
      opl-player-type="html"
      opl-data="data"
      ng-show="ready"
      id="myPlayer"
    ></opl-player>

    <script type="text/javascript" src="lib/angular/angular.min.js"></script>
    <script type="text/javascript" src="lib/angular-cookies/angular-cookies.min.js"></script>
    <script type="text/javascript" src="lib/video.js/dist/video.min.js"></script>
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
  TestController.$inject = ['$scope'];

  /**
   * Defines the test controller.
   */
  function TestController($scope) {
    $scope.data = {
      mediaId: ['136081112'], // The list of media ids, one id by source. For the "html" player, the first media id corresponds to the first source, the second media id to the second source and so on
      sources: [ // The list of sources, one source by media id (only for the "html" player)
        {
          files: [ // A list of MP4 files (qualities)
            {
              width: 640, // The video width in pixels
              height: 360, // The video height in pixels
              link: 'https://host.local/pathToSDMP4-136081112.mp4' // The URL of the MP4 file
            },
            {
              width: 1280, // The video width in pixels
              height: 720, // The video height in pixels
              link: 'https://host.local/pathToHDMP4-136081112.mp4' // The URL of the MP4 file
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

      var playerController = angular.element(myPlayer).controller('oplPlayer');

      // Selects a new display template ('split_2')
      playerController.selectTemplate('split_2');

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
