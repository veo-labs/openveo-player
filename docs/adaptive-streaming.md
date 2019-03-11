# Introduction

OpenVeo Player support Adaptive Streaming DASH and HLS. It will automaticaly switch between protocols according browser capabilities.

# Prerequisites

OpenVeo Player embeds Video.js to display the HTML player. Video.js natively supports HLS but in order to support DASH, you have to install and import dependencies:

Install Dash.js:

    npm install dashjs@{DASH_JS_VERSION}

Install videojs-contrib-dash plugin:

    npm install videojs-contrib-dash@{CONTRIB_DASH_VERSION}

And import dependencies to use adaptive sources:
```html
    <script type="text/javascript" src="lib/dashjs/dist/dash.all.min.js"></script>
    <script type="text/javascript" src="lib/videojs-contrib-dash/dist/videojs-dash.min.js"></script>
```

# How to play adaptive sources
You need to define your adaptive sources by setting their mimetype and their link.
```javascript
$scope.data.sources = [
  {
    adaptive: [ // The list of video adaptive sources (only for "html" player)
          { // Dash source
           height: 720,
           mimeType: 'application/dash+xml',
           link: 'https://host.local/openveo/mp4:bunny.mp4/manifest.mpd'
          },
          { // HLS Source
           height: 720,
           mimeType: 'application/vnd.apple.mpegurl',
           link: 'https://host.local/openveo/mp4:bunny.mp4/manifest.m3u8'
          },
          { // RTMP source
            mimeType: 'rtmp/mp4',
            link: 'rtmp://host.local/openveo/&mp4:bunny.mp4'
          }
    ],
    files : [ // The list of different resolutions sources for this video (only for "html" player)
      {
        width : 640, // Video width for this file
        height : 360, // Video height for this file
        link : 'https://host.local/pathToSmallMP4.mp4' // Video url
      },
      {
        width : 1280, // Video width for this file
        height : 720, // Video height for this file
        link : 'https://host.local/pathToHDMP4.mp4' // Video url
      },
      ...
    ]
  }
]
```

And set you player type to 'html':
```html
<opl-player
  ...
  opl-data="data"
  opl-player-type="html"
></opl-player>
```

**NB**: "Adaptive" sources are always prioritized. "files" sources will be ignored if "adaptive" property is defined.
