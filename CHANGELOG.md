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