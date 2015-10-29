# Introduction

OpenVeo Player defines an AngularJS directive **ov-player** :

```html
<ov-player
  ov-data="data"
  ov-full-viewport="isFullViewport"
  ov-time="isTimeDisplayed"
  ov-fullscreen-icon="isFullscreenIconDisplayed"
  ov-volume-icon="isVolumeIconDisplayed"
  ov-mode-icon="isModeIconDisplayed"
  ov-language="playerLanguage"
  ov-player-type="html"
></ov-player>
```

This directive creates a video player with images synchronization and chapters.

![Player](images/screenshots/player.gif)

# Include player CSS

```html
<link rel="stylesheet" type="text/css" href="lib/openveo-player/dist/openveo-player.css">
```

# Set player root

OpenVeo player needs to be aware of its root path to load AngularJS partials.

```html
<script>
  // Set ovPlayerDirectory to openveo-player root path
  // This is used by openveo-player to get partials
  // Do not forget the trailing slash !
  var ovPlayerDirectory = "lib/openveo-player/";
</script>
```

**Nb :** **ovPlayerDirectory** must be defined before including the OpenVeo Player script.

# Include scripts

```html
<link rel="stylesheet" type="text/css" href="lib/angular/angular.min.js">
<link rel="stylesheet" type="text/css" href="lib/openveo-player/dist/openveo-player.min.js">
```

# Attributes

**ov-player** directive attributes helps you customize the player.

## ov-data

Sets player data, synchronize images, chapters and cut.

```javascript
{
  mediaId : '34532ezr54sdf87', // The id of the video
  timecodes : { // Timecodes
    0 : { // Timecode in milliseconds (0 ms)
      'image' : { // Image to display at 0 ms
        'small' : 'slide_00000.jpeg', // Small version of the image
        'large' : 'slide_00000_large.jpeg' // Large version of the image
      }
    },
    1200 : { // Timecode in milliseconds (1200 ms)
      'image' : { // Image to display at 1200 ms
        'small' : 'slide_00001.jpeg', // Small version of the image
        'large' : 'slide_00001_large.jpeg' // Large version of the image
      }
    }
    ...
  },
  files : [ // The list of video files (only for "html" player)
    {
      width : 640, // Video width for this file
      height : 360, // Video height for this file
      link : 'http://pathToSmallMP4.mp4' // Video url
    },
    {
      width : 1280, // Video width for this file
      height : 720, // Video height for this file
      link : 'http://pathToHDMP4.mp4' // Video url
    },
    ...
  ],
  thumbnail : '/1439286245225/thumbnail.jpg', // The media thumbnail (only for "html" player)
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
}
```

## ov-full-viewport (optional)

Indicates if player must take the full viewport or not. **This must be an assignable variable evaluated as a boolean.** (Default to false)

```javascript
var isFullViewport = false;
```

## ov-time (optional)

Indicates if video time / duration must be displayed or not. **This must be an assignable variable evaluated as a boolean.** (Default to true)

```javascript
var isTimeDisplayed = true;
```

## ov-fullscreen-icon (optional)

Indicates if fullscreen icon must be displayed or not. **This must be an assignable variable evaluated as a boolean.** (Default to true)

```javascript
var isFullscreenIconDisplayed = true;
```

## ov-volume-icon (optional)

Indicates if volume icon must be displayed or not. **This must be an assignable variable evaluated as a boolean.** (Default to true)

```javascript
var isVolumeIconDisplayed = true;
```

## ov-mode-icon (optional)

Indicates if mode icon must be displayed or not. **This must be an assignable variable evaluated as a boolean.** (Default to true)

```javascript
var isModeIconDisplayed = true;
```

## ov-language (optional)

Indicates player language. **This must be an assignable variable evaluated as a boolean.** (Default to **en**)

Supported values are :

- fr
- en

```javascript
var playerLanguage = 'en';
```

## ov-player-type (optional)

Indicates player type. (Default to **html**)

Supported values are :

- vimeo
- html

```javascript
var playerLanguage = 'html';
```