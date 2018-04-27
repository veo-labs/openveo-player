# Introduction

OpenVeo Player support Adaptive Streaming DASH and HLS. It will automaticaly switch between protocols according browser capabilities.
A Flash video player is used as a fallback player if none of sources protocol is supported by browser.

# Prerequisites

As OpenVeo Player embed video.js to display HTML player, in order to support DASH and HLS, you have to install and import dependencies:

Install Dash.js:

    bower install dashjs#{DASH_JS_VERSION}

Install videojs-contrib-dash plugin:

    bower install https://github.com/videojs/videojs-contrib-dash/releases/download/{CONTRIB_DASH_VERSION}/videojs-dash.min.js

Install videojs-contrib-hls plugin:

    bower install https://github.com/videojs/videojs-contrib-hls/releases/download/{CONTRIB_HLS_VERSION}/videojs.hls.min.js

And import dependencies to use adaptive sources:
```html
    <script type="text/javascript" src="lib/dashjs/dist/dash.all.min.js"></script>
    <script type="text/javascript" src="lib/videojs-contrib-dash/index.js"></script>
    <script type="text/javascript" src="lib/videojs-contrib-hls/index.js"></script>
```

# How to play adaptive sources
You need to define your adaptive sources by setting their mimetype and their link.
```javascript
$scope.data.sources = [
  {
    adaptive: [ // The list of video adaptive sources (only for "html" player)
          { // RTMP source
            mimeType: 'rtmp/mp4',
            link: 'rtmp://mydomainname.local/openveo/&mp4:bunny.mp4'
          },
          { // Flash source for sources that do not support natively adaptive streaming
           height: 720,
           mimeType: 'application/f4m+xml',
           link: 'https://mydomainname.local/openveo/mp4:bunny.mp4/manifest.f4m'
          },
          { // Dash source
           height: 720,
           mimeType: 'application/dash+xml',
           link: 'https://mydomainname.local/openveo/mp4:bunny.mp4/manifest.mpd'
          },
          { //HLS Source
           height: 720,
           mimeType: 'application/vnd.apple.mpegurl',
           link: 'https://mydomainname.local/openveo/mp4:bunny.mp4/manifest.m3u8'
        }
    ],
    files : [ // The list of different resolutions sources for this video (only for "html" player)
      {
        width : 640, // Video width for this file
        height : 360, // Video height for this file
        link : 'http://mydomainname.local/pathToSmallMP4.mp4' // Video url
      },
      {
        width : 1280, // Video width for this file
        height : 720, // Video height for this file
        link : 'http://mydomainname.local/pathToHDMP4.mp4' // Video url
      },
      ...
    ]
  }
]
```

And set you player type to 'html':
```html
<ov-player
  ...
  ov-data="data"
  ov-player-type="html"
></ov-player>
```

**NB**: 'Adaptive' sources are always prioritized. 'files' sources will be ignored if 'adaptive' property is defined.
