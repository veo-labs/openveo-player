# 3.1.0 /

## NEW FEATURES

- Execute unit tests on Travis
- The highest definition is now selected by default instead of the lowest one for the HTML player
- ovPlayerDirectory global variable is no longer required, you can simply remove it from your code

## DEPENDENCIES

- **karma-phantomjs-launcher** has been removed
- **chai** has been upgraded from 3.5.0 to **4.0.2**

# 3.0.0 / 2017-06-06

## BREAKING CHANGES

- It is no longer possible to specify the type of the player using property **type** of the ov-data object. Use the **ov-player-type** attribute instead.
- Function "selectMediaSource", which was used to set the source to play, has been renamed into "setSource".

## BUG FIXES

- Fix the background color of chapters and tags to make it white no matter what. Chapters background was grey and tabs background was black in fullscreen.
- Fix the spinner of the HTML player. VideoJS spinner was not perfectly circle.
- Fix dynamic attributes update. Changing ov-player attributes values wasn't working very well. It is now possible to dynamically change the media loaded inside the player and / or other assignable attributes.
- Remove focus outline appearing on the HTML player when clicking on the video to start / stop.

## DEPENDENCIES

- **video.js** has been updated from 5.9.2 to **5.19.2**

# 2.2.1 / 2017-05-04

## BUG FIXES

- Authorize future minor versions of @openveo/api

# 2.2.0 / 2017-05-04

## NEW FEATURES

- Add a tag view to highlight important information and navigate in video to this moment. Tag Description can be HTML and can be associated with a file.
Image are displayed, audio and video are rendered in HTML5 player. Other files can be downloaded by user.
- Add html support on description metadata

## BUG FIXES

- Title tab flickering is resolved.
- Fix seek to 0 on Vimeo player

## DEPENDENCIES

- **chai** has been updated from 1.10.0 to **3.5.0**
- **grunt** has been updated from 0.4.5 to **1.0.1**
- **grunt-contrib-compass** has been updated from 1.0.3 to **1.1.1**
- **grunt-contrib-concat** has been updated from 0.5.1 to **1.0.1**
- **grunt-contrib-uglify** has been updated from 0.9.1 to **2.0.0**
- **grunt-eslint** has been updated from 18.0.0 to **19.0.0**
- **grunt-gh-pages** has been updated from 0.10.0 to **2.0.0**
- **grunt-karma** has been updated from 0.11.2 to **2.0.0**
- **grunt-mkdocs** has been updated from 0.1.0 to **0.2.0**
- **karma** has been updated from 0.12.31 to **1.3.0**
- **karma-chrome-launcher** has been updated from 0.1.7 to **2.0.0**
- **karma-firefox-launcher** has been updated from 0.1.4 to **1.0.0**
- **karma-ie-launcher** has been updated from 0.1.5 to **1.0.0**
- **karma-mocha** has been updated from 0.1.10 to **1.3.0**
- **karma-phantomjs-launcher** has been updated from 0.1.4 to **1.0.2**
- **karma-ng-html2js-preprocessor** has been updated from 0.1.2 to **1.0.0**
- **mocha** has been updated from 2.1.0 to **3.2.0**
- **pre-commit** has been updated from 1.1.1 to **1.2.2**
- **glob** has been removed
- **grunt-remove** has been removed
- **grunt-rename** has been removed
- **grunt-extend-config** has been removed
- **grunt-init** has been removed

# 2.1.3 / 2017-02-06

## BUG FIXES

- Delete forgotten logs in chapters tab

# 2.1.2 / 2017-02-06

## BUG FIXES

- Fix regression on chapters time appeared in version 2.1.0
- Delete transitions to resolve flickering issues

# 2.1.1 / 2017-02-06

## BUG FIXES

- Fix chapters time

# 2.1.0 / 2017-01-03

- Add Multi-sources video synchronization feature

# 2.0.3 / 2016-11-04

- Correct issue when installing the openveo-player using NPM
- Update documentation to add angular-cookies as a prerequisite

# 2.0.2 / 2016-09-15

- Disable fullscreen icon if Javascript Fullscreen API is not supported on device.

# 2.0.1 / 2016-07-19

- Debug dash videos player by updating videojs dependencies

# 2.0.0 / 2016-05-30

- Add Video.js dependencies to implement HTML5 video player and flash fallback
- Add Dash sources compatibility
- Add HLS sources compatibility

# 1.2.0 / 2016-02-19

- Add a feature to remember the last position of a media after a page reload, this is available through the attribute **ov-remember-position**
- Add Youtube player management
- Correct bug on view mode visibility icon, the icon wasn't displayed when using cuts
- Correct time synchronization. Chapters time and index time were wrong when using cuts
- Dispatch an error event when an error occured
- Correct display when having a long chapter's title

# 1.1.0 / 2015-11-24

- Display error message when video player fail
- User can select resolution settings to enhanced loading progress
- Video can be auto-played when resource is ready
- GUI debug on player bar and other component

# 1.0.1 / 2015-10-26

First stable version of the OpenVeo Player with ov-player directive to wrap an HTML5 or Vimeo player with images synchronization and chapters.
