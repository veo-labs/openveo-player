# 6.0.0 / 2020-05-04

## BREAKING CHANGES

- Drop support for NodeJS &lt; 12.4.0 and NPM &lt; 6.9.0

## NEW FEATURES

- Attribute "opl-start-time" has been added to the player to be able to specify a time in milliseconds to start at, this attribute has priority on attribute "opl-remember-position"

## BUG FIXES

- Fix HTML player errors which were not dispatched and couldn't be listened to
- Fix player setVolume API
- Fix HTML player selected quality, when changing source the video corresponding to the quality of the previous source was played instead of the video corresponding to the quality of the actual source
- Fix selected source when dynamically changing opl-data attribute
- Fix empty indexes / chapters / tags bar when changing opl-indexes / opl-chapters / opl-tags attributes

## DEPENDENCIES

- **chai** has been upgraded from 4.0.2 to **4.2.0**
- **grunt** has been upgraded from 1.0.1 to **1.1.0**
- **grunt-angular-templates** has been upgraded from 1.1.0 to **1.2.0**
- **grunt-contrib-compass** sub dependencies have been upgraded
- **grunt-contrib-uglify** has been upgraded from 2.0.0 to **4.0.1**
- **grunt-contrib-watch** sub dependencies have been upgraded
- **grunt-eslint** has been upgraded from 19.0.0 to **22.0.0**
- **grunt-gh-pages** has been upgraded from 2.0.0 to **3.1.0**
- **grunt-karma** has been upgraded from 2.0.0 to **3.0.2**
- **grunt-mkdocs** has been upgraded from 0.2.0 to **1.0.1**
- **grunt-replace** sub dependencies have been upgraded
- **karma** has been upgraded from 1.3.0 to **4.4.1**
- **karma-chrome-launcher** has been upgraded from 2.0.0 to **3.1.0**
- **karma-firefox-launcher** has been upgraded from 1.0.0 to **1.3.0**
- **karma-ie-launcher** has been removed as not tests are performed on Internet Explorer
- **mocha** has been upgraded from 3.2.0 to **7.1.1**
- **video.js** has been upgraded from 7.3.0 to **7.7.5**

# 5.0.1 / 2019-06-04

## BUG FIXES

- Fix "opl-cuts" attribute which wasn't working the first time it was set but was working when changed
- Fix slider cursor position when slider's size changes

# 5.0.0 / 2019-03-25

## BREAKING CHANGES

- Drop support for HTML player flash technology
- Drop support for AngularJS &lt; 1.5.11
- Drop support for VideoJS &lt; 7.3.0
- Drop support for Internet Explorer
- All player components are now prefixed by opl- instead of op-
- Player controller property "selectedMode" has been renamed into "selectedTemplate"
- Player controller property "playPauseButton" has been replaced by "playing"
- Player controller property "modeIconDisplayed" has been renamed into "templateSelectorDisplayed"
- Player controller properties "modesOpened", "modes", "volumeOpened", "volumePreview", "selectMediaOpened", "definitionOpened" have been removed
- Player controller method "selectMode" has been renamed into "selectTemplate"
- Player attribute "opl-mode" has been renamed into "opl-template"
- Player attribute "opl-mode" available values are now "split_1", "split_2", "split_50_50" and "split_25_75" instead of "media", "presentation", "both" and "both-presentation"
- Player attribute "opl-mode-icon" has been renamed into "opl-template-icon"
- Player attribute "opl-hide-chapters-tab" has been renamed into "opl-chapters" and has been inverted (replace "false" by "true" and "true" by "false")
- Player attribute "opl-hide-tags-tab" has been renamed into "opl-tags" and has been inverted (replace "false" by "true" and "true" by "false")
- Player attribute "opl-disable-cut" has been renamed into "opl-cuts" and has been inverted (replace "false" by "true" and "true" by "false")
- Sources have been added to the settings menu, consequently the attribute "opl-media-sources-icon" has been removed
- Data property "file.basePath" for tags and chapters has been renamed into "file.url"
- Data property "file.originalname" for tags and chapters has been renamed into "file.originalName"
- Files attached to tags and chapters are no longer interpreted, a simple link is displayed to download the file

## NEW FEATURES

- OpenVeo Player does not use Bower anymore, it now uses NPM for its development dependencies
- Global variable ovPlayerDirectory is not required anymore
- Remove dashjs logs
- Prevent HTML player from buffering until play is requested
- Force HTML player to play inline and try to avoid native player on mobile devices
- The control bar has been completely changed to be more user friendly and is now on the video instead of below it
- Indexes, chapters and tags are now displayed below the player and can be accessed while keeping an eye on the video
- opl-template attribute is now watched and can be changed dynamically
- Add Veo-Labs brand as a button in the control bar leading to the Veo-Labs web site. Button can be removed using "opl-veo-labs-icon" attribute
- Small images of indexes can now be expressed using an URL plus x and y coordinates. Useful if you want to use sprites for your indexes small images
- Player attribute "opl-indexes" has been added to show / hide indexes

## BUG FIXES

- Fix "grunt remove:doc" which hasn't worked since version 2.2.0
- Fix translation of the error message when no source
- Fix changing player attributes dynamically. Changing "ov-auto-play", "ov-remember-position", "ov-full-viewport" and so on wasn't always working

## DEPENDENCIES

- **video.js** has been upgraded from 5.19.2 to **7.3.0**
- **angular** has been upgraded from 1.4.1 to **1.5.11**
- **angular-animate** has been upgraded from 1.4.1 to **1.5.11"**
- **angular-cookies** has been upgraded from 1.4.1 to **1.5.11"**
- **angular-mocks** has been upgraded from 1.4.1 to **1.5.11"**
- **angular-route** has been upgraded from 1.4.1 to **1.5.11"**
- **@openveo/api** has been upgraded from 5.1.0 to **6.2.0"**

# 4.0.0 / 2018-05-04

## BREAKING CHANGES

- The player is now expecting points of interest in milliseconds instead of percents.
- Drop support for NodeJS &lt; 8.9.4 and NPM &lt; 5.6.0

## NEW FEATURES

- The highest definition is now selected by default instead of the lowest one for the HTML player
- Add NPM package-lock.json file

## BUG FIXES

- Fix the removed first slide when video's beginning is offsetted

## DEPENDENCIES

- **karma-phantomjs-launcher** has been removed
- **chai** has been upgraded from 3.5.0 to **4.0.2**
- **@openveo/api** has been upgraded from 4.\* to **5.\***

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
