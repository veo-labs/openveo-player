
'use strict';

window.assert = chai.assert;

describe('OplPlayer', function() {
  var $compile;
  var $rootScope;
  var $timeout;
  var $document;
  var $httpBackend;
  var $filter;
  var oplI18nService;
  var oplPlayerErrors;
  var oplEventsFactory;
  var scope;
  var ctrl;
  var Player;
  var HtmlPlayer;
  var VimeoPlayer;
  var YoutubePlayer;
  var expectedDefinitions;
  var expectedPlayerId;
  var expectedSourceUrl;
  var expectedSourceIndex;
  var expectedQualityIndex;
  var originalRequestAnimationFrame;

  /**
   * Adds opl-player element to the DOM and wait for it to be initialized.
   *
   * @param {Object} element The opl-player element as a JQLite object
   * @param {Number} duration The expected media duration
   */
  function createComponent(element, duration) {
    $document[0].body.appendChild(element[0]);
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

    element.triggerHandler('oplReady');
    element.triggerHandler('oplDurationChange', duration);
    $timeout.flush();
    scope.$digest();

    ctrl = element.controller('oplPlayer');
  }

  // Load modules
  beforeEach(function() {
    expectedDefinitions = [];
    expectedPlayerId = '42';
    expectedSourceUrl = '';
    expectedSourceIndex = 0;
    expectedQualityIndex = 0;

    Player = function(element) {
      this.element = element;
    };
    Player.prototype.getId = chai.spy(function() {
      return expectedPlayerId;
    });
    Player.prototype.getAvailableDefinitions = chai.spy(function() {
      var qualities = [];
      expectedDefinitions[expectedSourceIndex].files.forEach(function(quality) {
        qualities.push({
          id: String(quality.height),
          label: quality.height + 'p',
          hd: quality.height >= 720
        });
      });
      return qualities;
    });
    Player.prototype.getSourceUrl = chai.spy(function() {
      return expectedSourceUrl;
    });
    Player.prototype.getSourceIndex = chai.spy(function() {
      return Math.max(expectedSourceIndex - 1, 0);
    });
    Player.prototype.initialize = chai.spy(function() {});
    Player.prototype.setTime = chai.spy(function() {});
    Player.prototype.setVolume = chai.spy(function() {});
    Player.prototype.setDefinition = chai.spy(function() {});
    Player.prototype.destroy = chai.spy(function() {});
    Player.prototype.setMedia = chai.spy(function() {});
    Player.prototype.setMediaSource = chai.spy(function() {});
    Player.prototype.load = chai.spy(function() {});
    Player.prototype.getDefinition = chai.spy(function() {
      return String(expectedDefinitions[expectedSourceIndex].files[expectedQualityIndex].height);
    });
    Player.prototype.isPlaying = chai.spy(function() {
      return false;
    });
    Player.prototype.isPaused = chai.spy(function() {
      return false;
    });
    Player.prototype.playPause = chai.spy(function() {
      this.element.triggerHandler('oplPlay');
    });
    Player.prototype.isOverlayPlayPauseSupported = chai.spy(function() {
      return false;
    });

    HtmlPlayer = function(element) {
      Player.call(this, element);
    };
    HtmlPlayer.prototype = new Player();
    HtmlPlayer.prototype.constructor = HtmlPlayer;

    VimeoPlayer = function(element) {
      Player.call(this, element);
    };
    VimeoPlayer.prototype = new Player();
    VimeoPlayer.prototype.constructor = VimeoPlayer;

    YoutubePlayer = function(element) {
      Player.call(this, element);
    };
    YoutubePlayer.prototype = new Player();
    YoutubePlayer.prototype.constructor = YoutubePlayer;

    module('ov.player', function($controllerProvider, $provide) {

      // Mock players
      $provide.factory('OplHtmlPlayer', function() {
        return HtmlPlayer;
      });
      $provide.factory('OplVimeoPlayer', function() {
        return VimeoPlayer;
      });
      $provide.factory('OplYoutubePlayer', function() {
        return YoutubePlayer;
      });

    });

    // Mock requestAnimationFrame
    originalRequestAnimationFrame = window.requestAnimationFrame;
    window.requestAnimationFrame = function(callback) {
      callback();
    };

    module('templates');
  });

  // Dependencies injections
  beforeEach(
    inject(
      function(_$compile_, _$rootScope_, _$timeout_, _$document_, _$filter_, _$httpBackend_, _oplI18nService_,
                _oplPlayerErrors_, _oplEventsFactory_) {
        $rootScope = _$rootScope_;
        $compile = _$compile_;
        $timeout = _$timeout_;
        $document = _$document_;
        $filter = _$filter_;
        $httpBackend = _$httpBackend_;
        oplI18nService = _oplI18nService_;
        oplPlayerErrors = _oplPlayerErrors_;
        oplEventsFactory = _oplEventsFactory_;
      }
    )
  );

  beforeEach(function() {
    var style = 'body {width: 1000px; height: 1000px;}' +
      'opl-player,.opl-player {width: 100%; height: 500px;}';

    var styleElement = $document[0].createElement('style');
    styleElement.setAttribute('id', 'opl-player-test-style');
    styleElement.appendChild($document[0].createTextNode(style));
    $document[0].head.appendChild(styleElement);
  });

  // Initializes tests
  beforeEach(function() {
    expectedDefinitions = [
      {
        files: [
          {
            width: 640,
            height: 360,
            link: 'https://host.local/video.mp4'
          }
        ]
      }
    ];
    scope = $rootScope.$new();
    scope.data = {
      mediaId: ['1'],
      sources: expectedDefinitions
    };
  });

  afterEach(function() {
    var componentElement = $document[0].body.querySelector('#opl-player-test');
    $document[0].head.removeChild($document[0].head.querySelector('#opl-player-test-style'));
    if (componentElement) $document[0].body.removeChild(componentElement);
    delete $document[0].fullScreenElement;
    delete $document[0].msFullscreenElement;
    delete $document[0].mozFullScreen;
    delete $document[0].webkitFullscreenElement;
    window.requestAnimationFrame = originalRequestAnimationFrame;
  });

  it('should display a player, the actual index large image and points of interest', function() {
    var expectedDuration = 10000;
    var element = angular.element('<opl-player ' +
                                              'id="opl-player-test" ' +
                                              'opl-data="data" ' +
                                  '></opl-player>');
    createComponent(element, expectedDuration);

    var playerElement = angular.element(element[0].querySelector('.opl-player'));
    var mediaWrapperElement = angular.element(element[0].querySelector('.opl-media-wrapper'));
    var overlayPlayPauseButtonElement =
        angular.element(element[0].querySelector('.opl-overlay-play-button opl-toggle-icon-button'));
    var errorElement = angular.element(element[0].querySelector('.opl-error'));
    var videoElement = angular.element(element[0].querySelector('.opl-media video'));
    var loaderElement = angular.element(element[0].querySelector('.opl-loader'));
    var area2Element = angular.element(element[0].querySelector('.opl-area-2 > div'));
    var controlsElement = angular.element(element[0].querySelector('.opl-controls'));
    var indexPreviewElement = angular.element(element[0].querySelector('.opl-index-preview'));
    var timeBarElement = angular.element(element[0].querySelector('.opl-controls .opl-time-bar opl-slider'));
    var playPauseButtonElement =
        angular.element(element[0].querySelector('.opl-left-controls opl-toggle-icon-button'));
    var volumeElement = angular.element(element[0].querySelector('.opl-left-controls opl-volume'));
    var timeElement = angular.element(element[0].querySelector('.opl-left-controls .opl-current-time'));
    var templateSelectorElement = angular.element(element[0].querySelector('opl-template-selector'));
    var settingsElement = angular.element(element[0].querySelector('opl-settings'));
    var fullScreenElement = angular.element(element[0].querySelector('.opl-right-controls opl-toggle-icon-button'));
    var lightPlayPauseButtonElement =
        angular.element(element[0].querySelector('.opl-light-controls opl-toggle-icon-button'));
    var lightVolumeElement = angular.element(element[0].querySelector('.opl-light-controls opl-volume'));
    var lightTimeElement = angular.element(element[0].querySelector('.opl-light-controls .opl-current-time'));
    var lightTimeBarElement =
        angular.element(element[0].querySelector('.opl-light-controls .opl-time-bar opl-slider'));
    var tabsElement = angular.element(element[0].querySelector('opl-tabs'));

    assert.ok(playerElement.hasClass('opl-no-poi'), 'Unexpected points of interest');

    assert.ok(mediaWrapperElement.hasClass('opl-template-split_1'), 'Wrong template');

    assert.ok(loaderElement.hasClass('ng-hide'), 'Unexpected loader');
    assert.isDefined(videoElement.attr('id'), 'Expected a player id');
    assert.isUndefined(errorElement[0], 'Unexpected error');
    assert.isUndefined(
      overlayPlayPauseButtonElement.attr('opl-off-icon'),
      'Unexpected "off" icon for the overlay button'
    );
    assert.isUndefined(
      overlayPlayPauseButtonElement.attr('opl-on-icon'),
      'Unexpected "on" icon for the overlay button'
    );

    assert.notOk(controlsElement.hasClass('opl-hidden'), 'Expected controls to be displayed');
    assert.ok(indexPreviewElement.hasClass('ng-hide'), 'Expected index preview to be hidden');
    assert.equal(
      timeBarElement.attr('opl-label'),
      $filter('oplTranslate')('CONTROLS_TIME_BAR_ARIA_LABEL'),
      'Wrong time bar label'
    );
    assert.equal(
      timeBarElement.attr('opl-value-text'),
      $filter('oplTranslate')('CONTROLS_TIME_BAR_ARIA_VALUE_TEXT'),
      'Wrong time bar value text'
    );
    assert.equal(playPauseButtonElement.attr('opl-off-icon'), 'play_arrow', 'Wrong play / pause "off" icon');
    assert.equal(playPauseButtonElement.attr('opl-on-icon'), 'pause', 'Wrong play / pause "on" icon');
    assert.equal(
      playPauseButtonElement.attr('opl-off-label'),
      $filter('oplTranslate')('CONTROLS_PLAY_ARIA_LABEL'),
      'Wrong play / pause "off" label'
    );
    assert.equal(
      playPauseButtonElement.attr('opl-on-label'),
      $filter('oplTranslate')('CONTROLS_PAUSE_ARIA_LABEL'),
      'Wrong play / pause "on" label'
    );
    assert.notOk(volumeElement.attr('ng-hide'), 'Expected volume to be displayed');
    assert.notOk(timeElement.attr('ng-hide'), 'Expected time and duration to be displayed');
    assert.equal(
      timeElement.find('span').html(),
      $filter('oplMillisecondsToTime')(0) + ' / ' + $filter('oplMillisecondsToTime')(expectedDuration),
      'Wrong time and duration'
    );
    assert.ok(templateSelectorElement.hasClass('ng-hide'), 'Expected template selector to be hidden');
    assert.notOk(settingsElement.hasClass('ng-hide'), 'Expected settings button to be displayed');
    assert.notOk(fullScreenElement.hasClass('ng-hide'), 'Expected fullscreen button to be displayed');
    assert.equal(fullScreenElement.attr('opl-off-icon'), 'fullscreen', 'Wrong fullscreen "off" icon');
    assert.equal(fullScreenElement.attr('opl-on-icon'), 'fullscreen_exit', 'Wrong fullscreen "on" icon');
    assert.equal(
      fullScreenElement.attr('opl-off-label'),
      $filter('oplTranslate')('CONTROLS_FULLSCREEN_ARIA_LABEL'),
      'Wrong fullscreen "off" label'
    );
    assert.equal(
      fullScreenElement.attr('opl-on-label'),
      $filter('oplTranslate')('CONTROLS_FULLSCREEN_EXIT_ARIA_LABEL'),
      'Wrong fullscreen "on" label'
    );

    assert.equal(lightPlayPauseButtonElement.attr('opl-on-icon'), 'pause', 'Wrong light play / pause "on" icon');
    assert.equal(
      lightPlayPauseButtonElement.attr('opl-off-icon'),
      'play_arrow',
      'Wrong light play / pause "off" icon'
    );
    assert.equal(
      lightPlayPauseButtonElement.attr('opl-off-label'),
      $filter('oplTranslate')('CONTROLS_PLAY_ARIA_LABEL'),
      'Wrong light play / pause "off" label'
    );
    assert.equal(
      lightPlayPauseButtonElement.attr('opl-on-label'),
      $filter('oplTranslate')('CONTROLS_PAUSE_ARIA_LABEL'),
      'Wrong light play / pause "on" label'
    );
    assert.notOk(lightVolumeElement.attr('ng-hide'), 'Expected light volume to be displayed');
    assert.notOk(lightTimeElement.attr('ng-hide'), 'Expected light time to be displayed');
    assert.equal(
      lightTimeElement.find('span').html(),
      $filter('oplMillisecondsToTime')(0),
      'Wrong light time'
    );
    assert.equal(
      lightTimeBarElement.attr('opl-label'),
      $filter('oplTranslate')('CONTROLS_TIME_BAR_ARIA_LABEL'),
      'Wrong light time bar label'
    );
    assert.equal(
      lightTimeBarElement.attr('opl-value-text'),
      $filter('oplTranslate')('CONTROLS_TIME_BAR_ARIA_VALUE_TEXT'),
      'Wrong light time bar value text'
    );

    assert.equal(tabsElement.attr('opl-no-tabs'), 'true', 'Unexpected tabs');

    assert.match(area2Element.attr('style'), /background-image: ?none/, 'Unexpected image in area 2');

    assert.equal(ctrl.volume, 100, 'Expected volume to be at 100% by default');

    assert.equal(ctrl.sourceUrl, expectedSourceUrl, 'Wrong source URL');

    for (var i = 0; i < scope.data.mediaId.length; i++) {
      assert.equal(ctrl.mediaSources[i].id, scope.data.mediaId[i], 'Wrong id for media source ' + i);
      assert.equal(
        ctrl.mediaSources[i].label,
        $filter('oplTranslate')('CONTROLS_SETTINGS_SOURCE_LABEL', {'%source%': i}),
        'Wrong label for media source ' + i
      );
    }
  });

  it('should add "opl-overlay-supported" class if player supports overlay controls', function() {
    Player.prototype.isOverlayPlayPauseSupported = function() {
      return true;
    };

    var element = angular.element('<opl-player ' +
                                              'id="opl-player-test" ' +
                                              'opl-data="data" ' +
                                  '></opl-player>');
    createComponent(element, 10000);

    var overlayButtonElement = angular.element(element[0].querySelector('.opl-overlay-play-button'));

    assert.ok(overlayButtonElement.hasClass('opl-overlay-supported'), 'Expected class "opl-overlay-supported"');
  });

  it('should be able to display a list of indexes', function() {
    var i;
    var index;
    var totalIndexes = 50;
    scope.data.timecodes = [];

    for (i = 0; i < totalIndexes; i++) {
      if (i % 2) {
        index = {
          timecode: i * 1000,
          image: {
            small: 'https://host.local/image' + i + '.jpg',
            large: 'https://host.local/image' + i + '_large.jpg'
          }
        };
        $httpBackend.whenGET(index.image.small).respond(200);
      } else {
        index = {
          timecode: i * 1000,
          image: {
            small: {
              url: 'https://host.local/image' + i + '.jpg',
              x: i,
              y: i + 1
            },
            large: 'https://host.local/image' + i + '_large.jpg'
          }
        };
        $httpBackend.whenGET(index.image.small.url).respond(200);
      }
      scope.data.timecodes.push(index);
      $httpBackend.whenGET(index.image.large).respond(200);
    }

    var element = angular.element('<opl-player ' +
                                              'id="opl-player-test" ' +
                                              'opl-data="data" ' +
                                  '></opl-player>');
    createComponent(element, 10000);

    var playerElement = angular.element(element[0].querySelector('.opl-player'));
    var tabsElement = angular.element(element[0].querySelector('opl-tabs'));
    var chaptersViewElement = angular.element(element[0].querySelector('opl-view[opl-class="opl-chapters-view"]'));
    var tagsViewElement = angular.element(element[0].querySelector('opl-view[opl-class="opl-tags-view"]'));
    var indexesViewElement = angular.element(element[0].querySelector('opl-view[opl-class="opl-timecodes-view"]'));
    var indexesElement = angular.element(indexesViewElement[0].querySelector('opl-tiles'));

    assert.isUndefined(chaptersViewElement[0], 'Unexpected chapters');
    assert.isUndefined(tagsViewElement[0], 'Unexpected tags');
    assert.notOk(playerElement.hasClass('opl-no-poi'), 'Expected points of interest');
    assert.equal(ctrl.selectedTemplate, 'split_50_50', 'Wrong template');
    assert.equal(tabsElement.attr('opl-no-tabs'), 'true', 'Expected tabs');
    assert.equal(indexesElement.attr('opl-data'), '$ctrl.timecodes', 'Wrong "opl-data" attribute value');
    assert.equal(indexesElement.attr('opl-time'), '$ctrl.time', 'Wrong "opl-time" attribute value');

    assert.equal(
      indexesViewElement.attr('opl-label'),
      $filter('oplTranslate')('TABS_TIMECODES_ARIA_LABEL'),
      'Wrong view label'
    );
    assert.equal(indexesViewElement.attr('opl-icon'), 'image', 'Wrong view icon');

    assert.equal(ctrl.time, 0, 'Wrong time');

    for (i = 0; i < scope.data.timecodes.length; i++) {
      var originalIndex = scope.data.timecodes[i];
      index = ctrl.timecodes[i];

      assert.equal(index.id, i, 'Wrong id for index ' + i);
      assert.equal(index.type, 'image', 'Wrong type for index ' + i);
      assert.isUndefined(index.title, 'Unexpected title for index ' + i);
      assert.isUndefined(index.description, 'Unexpected description for index ' + i);
      assert.equal(index.time, originalIndex.timecode, 'Wrong value for index ' + i);
      assert.equal(
        index.image.small.url,
        originalIndex.image.small.url || originalIndex.image.small,
        'Wrong small image URL for index ' + i
      );
      assert.equal(
        index.image.small.x,
        originalIndex.image.small.x || 0,
        'Wrong small image x coordinate for index ' + i
      );
      assert.equal(
        index.image.small.y,
        originalIndex.image.small.y || 0,
        'Wrong small image y coordinate for index ' + i
      );
      assert.equal(index.image.large, originalIndex.image.large, 'Wrong large image for index ' + i);
      assert.isUndefined(index.file, originalIndex.file, 'Unexpected attachment file for index ' + i);
      assert.ok(index.abstract, 'Expected abstract representation for index ' + i);
    }
  });

  it('should be able to display a list of chapters', function() {
    var i;
    var chapter;
    var totalChapters = 50;
    scope.data.chapters = [];

    for (i = 0; i < totalChapters; i++) {
      chapter = {
        value: i * 1000,
        name: 'Chapter ' + i,
        description: 'Description of chapter ' + i,
        file: {
          url: 'https://host/local/file' + i + '.ext',
          originalName: 'original-name'
        }
      };
      scope.data.chapters.push(chapter);
    }

    var element = angular.element('<opl-player ' +
                                              'id="opl-player-test" ' +
                                              'opl-data="data" ' +
                                  '></opl-player>');
    createComponent(element, 10000);

    var playerElement = angular.element(element[0].querySelector('.opl-player'));
    var tabsElement = angular.element(element[0].querySelector('opl-tabs'));
    var chaptersViewElement = angular.element(element[0].querySelector('opl-view[opl-class="opl-chapters-view"]'));
    var tagsViewElement = angular.element(element[0].querySelector('opl-view[opl-class="opl-tags-view"]'));
    var indexesViewElement = angular.element(element[0].querySelector('opl-view[opl-class="opl-timecodes-view"]'));
    var chaptersElement = angular.element(chaptersViewElement[0].querySelector('opl-tiles'));

    assert.isUndefined(indexesViewElement[0], 'Unexpected indexes');
    assert.isUndefined(tagsViewElement[0], 'Unexpected tags');
    assert.notOk(playerElement.hasClass('opl-no-poi'), 'Expected points of interest');
    assert.equal(ctrl.selectedTemplate, 'split_1', 'Wrong template');
    assert.equal(tabsElement.attr('opl-no-tabs'), 'true', 'Unexpected tabs');
    assert.equal(chaptersElement.attr('opl-data'), '$ctrl.chapters', 'Wrong "opl-data" attribute value');
    assert.equal(chaptersElement.attr('opl-time'), '$ctrl.time', 'Wrong "opl-time" attribute value');

    assert.equal(
      chaptersViewElement.attr('opl-label'),
      $filter('oplTranslate')('TABS_CHAPTERS_ARIA_LABEL'),
      'Wrong view label'
    );
    assert.equal(chaptersViewElement.attr('opl-icon'), 'book', 'Wrong view icon');

    assert.equal(ctrl.time, 0, 'Wrong time');

    for (i = 0; i < scope.data.chapters.length; i++) {
      var originalChapter = scope.data.chapters[i];
      chapter = ctrl.chapters[i];

      assert.equal(chapter.id, i, 'Wrong id for chapter ' + i);
      assert.equal(chapter.type, 'text', 'Wrong type for chapter ' + i);
      assert.equal(chapter.title, originalChapter.name, 'Wrong title for chapter ' + i);
      assert.equal(chapter.description, originalChapter.description, 'Wrong description for chapter ' + i);
      assert.equal(chapter.time, originalChapter.value, 'Wrong value for chapter ' + i);
      assert.equal(chapter.file.url, originalChapter.file.url, 'Wrong attachment file for chapter ' + i);
      assert.isUndefined(chapter.image, 'Unexpected image for chapter ' + i);
      assert.ok(chapter.abstract, 'Expected abstract representation for chapter ' + i);
    }
  });

  it('should be able to display a list of tags', function() {
    var tag;
    var i;
    var totalTags = 50;
    scope.data.tags = [];

    for (i = 0; i < totalTags; i++) {
      tag = {
        value: i * 1000,
        name: 'Tag ' + i,
        description: 'Description of tag ' + i,
        file: {
          url: 'https://host/local/file' + i + '.ext',
          originalName: 'original-name'
        }
      };
      scope.data.tags.push(tag);
    }

    var element = angular.element('<opl-player ' +
                                              'id="opl-player-test" ' +
                                              'opl-data="data" ' +
                                  '></opl-player>');
    createComponent(element, 10000);

    var playerElement = angular.element(element[0].querySelector('.opl-player'));
    var tabsElement = angular.element(element[0].querySelector('opl-tabs'));
    var chaptersViewElement = angular.element(element[0].querySelector('opl-view[opl-class="opl-chapters-view"]'));
    var tagsViewElement = angular.element(element[0].querySelector('opl-view[opl-class="opl-tags-view"]'));
    var indexesViewElement = angular.element(element[0].querySelector('opl-view[opl-class="opl-timecodes-view"]'));
    var tagsElement = angular.element(tagsViewElement[0].querySelector('opl-tiles'));

    assert.isUndefined(indexesViewElement[0], 'Unexpected indexes');
    assert.isUndefined(chaptersViewElement[0], 'Unexpected chapters');
    assert.notOk(playerElement.hasClass('opl-no-poi'), 'Expected points of interest');
    assert.equal(ctrl.selectedTemplate, 'split_1', 'Wrong template');
    assert.equal(tabsElement.attr('opl-no-tabs'), 'true', 'Unexpected tabs');
    assert.equal(tagsElement.attr('opl-data'), '$ctrl.tags', 'Wrong "opl-data" attribute value');
    assert.equal(tagsElement.attr('opl-time'), '$ctrl.time', 'Wrong "opl-time" attribute value');

    assert.equal(
      tagsViewElement.attr('opl-label'),
      $filter('oplTranslate')('TABS_TAGS_ARIA_LABEL'),
      'Wrong view label'
    );
    assert.equal(tagsViewElement.attr('opl-icon'), 'note', 'Wrong view icon');

    assert.equal(ctrl.time, 0, 'Wrong time');

    for (i = 0; i < scope.data.tags.length; i++) {
      var originalTag = scope.data.tags[i];
      tag = ctrl.tags[i];

      assert.equal(tag.id, i, 'Wrong id for tag ' + i);
      assert.equal(tag.type, 'text', 'Wrong type for tag ' + i);
      assert.equal(tag.title, originalTag.name, 'Wrong title for tag ' + i);
      assert.equal(tag.description, originalTag.description, 'Wrong description for tag ' + i);
      assert.equal(tag.time, originalTag.value, 'Wrong value for tag ' + i);
      assert.equal(tag.file.url, originalTag.file.url, 'Wrong attachment file URL for tag ' + i);
      assert.equal(
        tag.file.originalName,
        originalTag.file.originalName,
        'Wrong attachment file original name for tag ' + i
      );
      assert.isUndefined(tag.image, 'Unexpected image for tag ' + i);
      assert.ok(tag.abstract, 'Expected abstract representation for tag ' + i);
    }
  });

  it('should be able to hide chapters using attribute "opl-chapters"', function() {
    scope.data.chapters = [
      {
        value: 1000,
        name: 'Chapter'
      }
    ];

    var element = angular.element('<opl-player ' +
                                              'id="opl-player-test" ' +
                                              'opl-data="data" ' +
                                              'opl-chapters="false" ' +
                                  '></opl-player>');
    createComponent(element, 10000);

    var playerElement = angular.element(element[0].querySelector('.opl-player'));
    var tabsElement = angular.element(element[0].querySelector('opl-tabs'));
    var chaptersViewElement = angular.element(element[0].querySelector('opl-view[opl-class="opl-chapters-view"]'));
    var tagsViewElement = angular.element(element[0].querySelector('opl-view[opl-class="opl-tags-view"]'));
    var indexesViewElement = angular.element(element[0].querySelector('opl-view[opl-class="opl-timecodes-view"]'));

    assert.isUndefined(indexesViewElement[0], 'Unexpected indexes');
    assert.isUndefined(tagsViewElement[0], 'Unexpected tags');
    assert.isUndefined(chaptersViewElement[0], 'Unexpected chapters');
    assert.ok(playerElement.hasClass('opl-no-poi'), 'Unexpected points of interest');
    assert.equal(tabsElement.attr('opl-no-tabs'), 'true', 'Unexpected tabs');
  });

  it('should be able to hide indexes using attribute "opl-indexes"', function() {
    scope.data.timecodes = [
      {
        timecode: 1000,
        name: 'Timecode'
      }
    ];

    var element = angular.element('<opl-player ' +
                                              'id="opl-player-test" ' +
                                              'opl-data="data" ' +
                                              'opl-indexes="false" ' +
                                  '></opl-player>');
    createComponent(element, 10000);

    var playerElement = angular.element(element[0].querySelector('.opl-player'));
    var tabsElement = angular.element(element[0].querySelector('opl-tabs'));
    var chaptersViewElement = angular.element(element[0].querySelector('opl-view[opl-class="opl-chapters-view"]'));
    var tagsViewElement = angular.element(element[0].querySelector('opl-view[opl-class="opl-tags-view"]'));
    var indexesViewElement = angular.element(element[0].querySelector('opl-view[opl-class="opl-timecodes-view"]'));

    assert.isUndefined(indexesViewElement[0], 'Unexpected indexes');
    assert.isUndefined(tagsViewElement[0], 'Unexpected tags');
    assert.isUndefined(chaptersViewElement[0], 'Unexpected chapters');
    assert.ok(playerElement.hasClass('opl-no-poi'), 'Unexpected points of interest');
    assert.equal(tabsElement.attr('opl-no-tabs'), 'true', 'Unexpected tabs');
  });

  it('should be able to hide tags using attribute "opl-tags"', function() {
    scope.data.tags = [
      {
        value: 1000,
        name: 'Tag'
      }
    ];

    var element = angular.element('<opl-player ' +
                                              'id="opl-player-test" ' +
                                              'opl-data="data" ' +
                                              'opl-tags="false" ' +
                                  '></opl-player>');
    createComponent(element, 10000);

    var playerElement = angular.element(element[0].querySelector('.opl-player'));
    var tabsElement = angular.element(element[0].querySelector('opl-tabs'));
    var chaptersViewElement = angular.element(element[0].querySelector('opl-view[opl-class="opl-chapters-view"]'));
    var tagsViewElement = angular.element(element[0].querySelector('opl-view[opl-class="opl-tags-view"]'));
    var indexesViewElement = angular.element(element[0].querySelector('opl-view[opl-class="opl-timecodes-view"]'));

    assert.isUndefined(indexesViewElement[0], 'Unexpected indexes');
    assert.isUndefined(tagsViewElement[0], 'Unexpected tags');
    assert.isUndefined(chaptersViewElement[0], 'Unexpected chapters');
    assert.ok(playerElement.hasClass('opl-no-poi'), 'Unexpected points of interest');
    assert.equal(tabsElement.attr('opl-no-tabs'), 'true', 'Unexpected tabs');
  });

  it('should be able to hide controls individually using attributes', function() {
    var element = angular.element('<opl-player ' +
                                              'id="opl-player-test" ' +
                                              'opl-data="data" ' +
                                              'opl-fullscreen-icon="false" ' +
                                              'opl-volume-icon="false" ' +
                                              'opl-template-icon="false" ' +
                                              'opl-settings-icon="false" ' +
                                              'opl-time="false" ' +
                                  '></opl-player>');
    createComponent(element, 10000);

    var fullscreenButtonElement =
        angular.element(element[0].querySelector('.opl-right-controls opl-toggle-icon-button'));
    var volumeElement = angular.element(element[0].querySelector('.opl-left-controls opl-volume'));
    var lightVolumeElement = angular.element(element[0].querySelector('.opl-light-controls opl-volume'));
    var templateSelectorElement = angular.element(element[0].querySelector('opl-template-selector'));
    var settingsElement = angular.element(element[0].querySelector('opl-settings'));
    var timeElement = angular.element(element[0].querySelector('.opl-left-controls .opl-current-time'));
    var lightTimeElement = angular.element(element[0].querySelector('.opl-light-controls .opl-current-time'));

    assert.ok(timeElement.hasClass('ng-hide'), 'Unexpected time and duration');
    assert.ok(lightTimeElement.hasClass('ng-hide'), 'Unexpected time');
    assert.ok(fullscreenButtonElement.hasClass('ng-hide'), 'Unexpected fullscreen button');
    assert.ok(volumeElement.hasClass('ng-hide'), 'Unexpected volume controller');
    assert.ok(lightVolumeElement.hasClass('ng-hide'), 'Unexpected light volume controller');
    assert.ok(templateSelectorElement.hasClass('ng-hide'), 'Unexpected template selector');
    assert.ok(settingsElement.hasClass('ng-hide'), 'Unexpected settings button');
  });

  it('should be able to change the template using attribute "opl-template"', function() {
    scope.data.timecodes = [
      {
        timecode: 1000,
        image: {
          small: 'https://host.local/image.jpg',
          large: 'https://host.local/image_large.jpg'
        }
      }
    ];
    $httpBackend.whenGET(scope.data.timecodes[0].image.small).respond(200);
    $httpBackend.whenGET(scope.data.timecodes[0].image.large).respond(200);

    scope.template = 'split_1';
    var element = angular.element('<opl-player ' +
                                              'id="opl-player-test" ' +
                                              'opl-data="data" ' +
                                              'opl-template="{{template}}" ' +
                                  '></opl-player>');
    createComponent(element, 10000);

    var mediaWrapperElement = angular.element(element[0].querySelector('.opl-media-wrapper'));

    assert.ok(mediaWrapperElement.hasClass('opl-template-' + scope.template), 'Wrong template');

    scope.template = 'split_50_50';
    scope.$digest();

    assert.ok(mediaWrapperElement.hasClass('opl-template-' + scope.template), 'Wrong template');
  });

  it('should be able to activate / deactivate full viewport', function() {
    scope.fullViewPort = true;
    var element = angular.element('<opl-player ' +
                                              'id="opl-player-test" ' +
                                              'opl-data="data" ' +
                                              'opl-full-viewport="{{fullViewPort}}" ' +
                                  '></opl-player>');
    createComponent(element, 10000);

    assert.isDefined(angular.element(element[0].querySelector('.opl-fullscreen'))[0], 'Expected full view port');

    scope.fullViewPort = false;
    scope.$digest();

    assert.isUndefined(angular.element(element[0].querySelector('.opl-fullscreen'))[0], 'Unexpected full view port');
  });

  it('should be able to change player language', function() {
    scope.language = 'en';
    var element = angular.element('<opl-player ' +
                                              'id="opl-player-test" ' +
                                              'opl-data="data" ' +
                                              'opl-language="{{language}}" ' +
                                  '></opl-player>');
    createComponent(element, 10000);

    assert.equal(oplI18nService.getLanguage(), scope.language, 'Wrong language');

    scope.language = 'fr';
    scope.$digest();

    assert.equal(oplI18nService.getLanguage(), scope.language, 'Wrong language');
  });

  it('should be able to create a Vimeo player', function() {
    var element = angular.element('<opl-player ' +
                                              'id="opl-player-test" ' +
                                              'opl-data="data" ' +
                                              'opl-player-type="vimeo" ' +
                                  '></opl-player>');
    createComponent(element, 10000);

    assert.instanceOf(ctrl.player, VimeoPlayer, 'Wrong player type');
  });

  it('should be able to create a Youtube player', function() {
    var element = angular.element('<opl-player ' +
                                              'id="opl-player-test" ' +
                                              'opl-data="data" ' +
                                              'opl-player-type="youtube" ' +
                                  '></opl-player>');
    createComponent(element, 10000);

    assert.instanceOf(ctrl.player, YoutubePlayer, 'Wrong player type');
  });

  it('should be able to start playing automatically', function() {
    var element = angular.element('<opl-player ' +
                                              'id="opl-player-test" ' +
                                              'opl-data="data" ' +
                                              'opl-auto-play="true" ' +
                                  '></opl-player>');
    createComponent(element, 10000);

    Player.prototype.playPause.should.have.been.called.exactly(1);
  });

  it('should be able to remember last position and continue playing from this position next time', function() {
    var expectedDuration = 10000;
    var expectedTime = expectedDuration / 2;
    var playerHtml = '<opl-player ' +
                                'id="opl-player-test" ' +
                                'opl-data="data" ' +
                                'opl-remember-position="true" ' +
                    '></opl-player>';
    var element = angular.element(playerHtml);
    scope = $rootScope.$new();
    scope.data = {
      mediaId: ['1'],
      sources: expectedDefinitions
    };
    createComponent(element, expectedDuration);

    element.triggerHandler('oplPlayProgress', {
      time: expectedTime,
      percent: (expectedTime / expectedDuration) * 100
    });
    $timeout.flush();
    scope.$digest();

    // Destroy and recreate player
    scope.$destroy();
    $document[0].body.removeChild($document[0].body.querySelector('#opl-player-test'));
    scope = $rootScope.$new();
    scope.data = {
      mediaId: ['1'],
      sources: expectedDefinitions
    };
    element = angular.element(playerHtml);
    createComponent(element, expectedDuration);

    var timeElement = angular.element(element[0].querySelector('.opl-left-controls .opl-current-time'));
    var lightTimeElement = angular.element(element[0].querySelector('.opl-light-controls .opl-current-time'));

    assert.equal(
      timeElement.find('span').html(),
      $filter('oplMillisecondsToTime')(expectedTime) + ' / ' + $filter('oplMillisecondsToTime')(expectedDuration),
      'Wrong time and duration'
    );
    assert.equal(
      lightTimeElement.find('span').html(),
      $filter('oplMillisecondsToTime')(expectedTime),
      'Wrong light time'
    );
    assert.equal(ctrl.seenPercent, (expectedTime / expectedDuration) * 100, 'Wrong seen percentage');
  });

  it('should be able to virtually cut the media and deactivate / activate cuts', function() {
    var totalPointsOfInterest = 50;
    var beginCut = 5000;
    var endCut = 9000;
    var expectedDuration = totalPointsOfInterest * 1000;
    var expectedTime = (beginCut + endCut) / 2;
    scope.enableCuts = true;
    scope.data = {
      mediaId: ['1'],
      sources: expectedDefinitions,
      timecodes: [],
      chapters: [],
      tags: [],
      cut: [
        {
          type: 'begin',
          value: beginCut
        },
        {
          type: 'end',
          value: endCut
        }
      ]
    };

    for (var i = 0; i < totalPointsOfInterest; i++) {
      var value = i * 1000;
      var index = {
        timecode: value,
        image: {
          small: 'https://host.local/image' + i + '.jpg',
          large: 'https://host.local/image' + i + '_large.jpg'
        }
      };
      var chapter = {
        value: i * 1000,
        name: 'Chapter ' + i
      };
      var tag = {
        value: i * 1000,
        name: 'Tag ' + i
      };
      scope.data.timecodes.push(index);
      scope.data.chapters.push(chapter);
      scope.data.tags.push(tag);
      $httpBackend.whenGET(index.image.small).respond(200);
      $httpBackend.whenGET(index.image.large).respond(200);
    }
    var element = angular.element('<opl-player ' +
                                'id="opl-player-test" ' +
                                'opl-data="data" ' +
                                'opl-cuts="{{enableCuts}}" ' +
                    '></opl-player>');
    createComponent(element, expectedDuration);

    element.triggerHandler('oplPlayProgress', {
      time: expectedTime,
      percent: (expectedTime / expectedDuration) * 100
    });
    $timeout.flush();
    scope.$digest();

    var area2Element = angular.element(element[0].querySelector('.opl-area-2 > div'));
    var timeElement = angular.element(element[0].querySelector('.opl-left-controls .opl-current-time'));
    var lightTimeElement = angular.element(element[0].querySelector('.opl-light-controls .opl-current-time'));
    var expectedFakeTime = expectedTime - beginCut;
    var expectedFakeDuration = endCut - beginCut;
    var expectedTotalPointsOfInterest = (endCut / 1000) - (beginCut / 1000) + 1;

    assert.equal(ctrl.time, expectedFakeTime, 'Wrong time');
    assert.match(
      area2Element.attr('style'),
      new RegExp('background-image: ?url\\("' + scope.data.timecodes[expectedTime / 1000].image.large + '"\\)'),
      'Wrong index preview'
    );
    assert.equal(
      Math.round(ctrl.seenPercent),
      ((expectedTime - beginCut) / (endCut - beginCut)) * 100,
      'Wrong seen percentage'
    );
    assert.equal(
      timeElement.find('span').html(),
      $filter('oplMillisecondsToTime')(expectedFakeTime) + ' / ' +
      $filter('oplMillisecondsToTime')(expectedFakeDuration),
      'Wrong time and duration'
    );
    assert.equal(
      lightTimeElement.find('span').html(),
      $filter('oplMillisecondsToTime')(expectedFakeTime),
      'Wrong light time'
    );
    assert.lengthOf(ctrl.timecodes, expectedTotalPointsOfInterest, 'Wrong number of indexes');
    assert.lengthOf(ctrl.chapters, expectedTotalPointsOfInterest, 'Wrong number of chapters');
    assert.lengthOf(ctrl.tags, expectedTotalPointsOfInterest, 'Wrong number of tags');

    // Deactivate cuts
    scope.enableCuts = false;
    $timeout.flush();
    scope.$digest();

    area2Element = angular.element(element[0].querySelector('.opl-area-2 > div'));
    timeElement = angular.element(element[0].querySelector('.opl-left-controls .opl-current-time'));
    lightTimeElement = angular.element(element[0].querySelector('.opl-light-controls .opl-current-time'));

    assert.equal(ctrl.time, 0, 'Wrong time');
    assert.match(
      area2Element.attr('style'),
      new RegExp('background-image: ?url\\("' + scope.data.timecodes[0].image.large + '"\\)'),
      'Wrong index preview'
    );
    assert.equal(Math.round(ctrl.seenPercent), 0, 'Wrong seen percentage');
    assert.equal(
      timeElement.find('span').html(),
      $filter('oplMillisecondsToTime')(0) + ' / ' +
      $filter('oplMillisecondsToTime')(expectedDuration),
      'Wrong time and duration'
    );
    assert.equal(
      lightTimeElement.find('span').html(),
      $filter('oplMillisecondsToTime')(0),
      'Wrong light time'
    );
    assert.lengthOf(ctrl.timecodes, totalPointsOfInterest, 'Wrong number of indexes');
    assert.lengthOf(ctrl.chapters, totalPointsOfInterest, 'Wrong number of chapters');
    assert.lengthOf(ctrl.tags, totalPointsOfInterest, 'Wrong number of tags');
  });

  it('should not create a player if no media id', function() {
    scope.data.mediaId = [];
    var element = angular.element('<opl-player ' +
                                'id="opl-player-test" ' +
                                'opl-data="data" ' +
                    '></opl-player>');
    $document[0].body.appendChild(element[0]);
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

    ctrl = element.controller('oplPlayer');

    assert.isNull(ctrl.player, 'Unexpected player');
  });

  it('should display loader when player is loading', function() {
    var element = angular.element('<opl-player ' +
                                'id="opl-player-test" ' +
                                'opl-data="data" ' +
                    '></opl-player>');
    $document[0].body.appendChild(element[0]);
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

    assert.notOk(
      angular.element(element[0].querySelector('.opl-loader')).hasClass('ng-hide'),
      'Expected loader while player is not ready'
    );

    element.triggerHandler('oplReady');
    $timeout.flush();
    scope.$digest();

    assert.ok(
      angular.element(element[0].querySelector('.opl-loader')).hasClass('ng-hide'),
      'Unexpected loader when player is ready'
    );

    element.triggerHandler('oplWaiting');
    $timeout.flush();
    scope.$digest();

    assert.notOk(
      angular.element(element[0].querySelector('.opl-loader')).hasClass('ng-hide'),
      'Expected loader when player is waiting'
    );

    element.triggerHandler('oplPlaying');
    $timeout.flush();
    scope.$digest();

    assert.ok(
      angular.element(element[0].querySelector('.opl-loader')).hasClass('ng-hide'),
      'Unexpected loader when player is playing'
    );

    element.triggerHandler('oplWaiting');
    $timeout.flush();
    scope.$digest();
    element.triggerHandler('oplPlay');
    $timeout.flush();
    scope.$digest();

    assert.ok(
      angular.element(element[0].querySelector('.opl-loader')).hasClass('ng-hide'),
      'Unexpected loader when player play is requested'
    );

    element.triggerHandler('oplWaiting');
    $timeout.flush();
    scope.$digest();
    element.triggerHandler('oplPlayProgress', {
      time: 0,
      seenPercent: 0
    });
    $timeout.flush();
    scope.$digest();

    assert.ok(
      angular.element(element[0].querySelector('.opl-loader')).hasClass('ng-hide'),
      'Unexpected loader when player is progressing'
    );

    element.triggerHandler('oplWaiting');
    $timeout.flush();
    scope.$digest();
    element.triggerHandler('oplError');
    $timeout.flush();
    scope.$digest();

    assert.ok(
      angular.element(element[0].querySelector('.opl-loader')).hasClass('ng-hide'),
      'Unexpected loader when player is on error'
    );
  });

  it('should display controls when pointer is moving over the media element', function() {
    var element = angular.element('<opl-player ' +
                                'id="opl-player-test" ' +
                                'opl-data="data" ' +
                    '></opl-player>');
    createComponent(element, 10000);

    var mediaWrapperElement = angular.element(element[0].querySelector('.opl-media-wrapper'));

    assert.notOk(
      angular.element(element[0].querySelector('.opl-controls')).hasClass('opl-hidden'),
      'Expected controls to be displayed by default'
    );

    mediaWrapperElement.triggerHandler('mouseout');
    $timeout.flush();
    scope.$digest();

    assert.ok(
      angular.element(element[0].querySelector('.opl-controls')).hasClass('opl-hidden'),
      'Expected controls to be hidden when pointer goes out'
    );

    mediaWrapperElement.triggerHandler('mousemove');
    $timeout.flush();
    scope.$digest();

    assert.notOk(
      angular.element(element[0].querySelector('.opl-controls')).hasClass('opl-hidden'),
      'Expected controls to be displayed when pointer is moving over'
    );
  });

  it('should display controls when clicking on media element', function() {
    var element = angular.element('<opl-player ' +
                                'id="opl-player-test" ' +
                                'opl-data="data" ' +
                    '></opl-player>');
    createComponent(element, 10000);

    var mediaWrapperElement = angular.element(element[0].querySelector('.opl-media-wrapper'));

    assert.notOk(
      angular.element(element[0].querySelector('.opl-controls')).hasClass('opl-hidden'),
      'Expected controls to be displayed by default'
    );

    mediaWrapperElement.triggerHandler('mouseout');
    $timeout.flush();
    scope.$digest();

    assert.ok(
      angular.element(element[0].querySelector('.opl-controls')).hasClass('opl-hidden'),
      'Expected controls to be hidden when pointer goes out'
    );

    mediaWrapperElement.triggerHandler(oplEventsFactory.EVENTS.DOWN);
    $timeout.flush();
    scope.$digest();

    assert.notOk(
      angular.element(element[0].querySelector('.opl-controls')).hasClass('opl-hidden'),
      'Expected controls to be displayed when media element is clicked'
    );
  });

  it('should automatically hide controls after 5 seconds if pointer is not moving', function() {
    var element = angular.element('<opl-player ' +
                                'id="opl-player-test" ' +
                                'opl-data="data" ' +
                    '></opl-player>');
    createComponent(element, 10000);

    var mediaWrapperElement = angular.element(element[0].querySelector('.opl-media-wrapper'));

    mediaWrapperElement.triggerHandler('mousemove');
    $timeout.flush();
    scope.$digest();

    assert.notOk(
      angular.element(element[0].querySelector('.opl-controls')).hasClass('opl-hidden'),
      'Expected controls to be displayed when pointer is moving over the media wrapper'
    );

    $timeout.flush(5000);
    scope.$digest();

    assert.ok(
      angular.element(element[0].querySelector('.opl-controls')).hasClass('opl-hidden'),
      'Expected controls to be hidden when pointer is not moving for 5 seconds'
    );
  });

  it('should not hide controls if cursor is moving out a sub element of the media wrapper', function() {
    var element = angular.element('<opl-player ' +
                                'id="opl-player-test" ' +
                                'opl-data="data" ' +
                    '></opl-player>');
    createComponent(element, 10000);

    var mediaSubElement = angular.element(element[0].querySelector('.opl-media'));

    mediaSubElement.triggerHandler('mouseout');
    $timeout.flush();
    scope.$digest();

    assert.notOk(
      angular.element(element[0].querySelector('.opl-controls')).hasClass('opl-hidden'),
      'Expected controls to not hide when pointer is moving out a media wrapper sub element'
    );
  });

  it('should display controls when a control element receives the focus', function() {
    var element = angular.element('<opl-player ' +
                                'id="opl-player-test" ' +
                                'opl-data="data" ' +
                    '></opl-player>');
    createComponent(element, 10000);

    var mediaWrapperElement = angular.element(element[0].querySelector('.opl-media-wrapper'));

    mediaWrapperElement.triggerHandler('mouseout');
    $timeout.flush();
    scope.$digest();

    element.isolateScope().handleControlFocus();
    $timeout.flush();
    scope.$digest();

    assert.notOk(
      angular.element(element[0].querySelector('.opl-controls')).hasClass('opl-hidden'),
      'Expected controls to be displayed when a control element is focused'
    );
  });

  it('should display the preview index when pointer is over the time bar', function() {
    scope.data.timecodes = [
      {
        timecode: 0,
        image: {
          small: 'https://host.local/image.jpg',
          large: 'https://host.local/image_large.jpg'
        }
      }
    ];
    $httpBackend.whenGET(scope.data.timecodes[0].image.small).respond(200);
    $httpBackend.whenGET(scope.data.timecodes[0].image.large).respond(200);
    var element = angular.element('<opl-player ' +
                                'id="opl-player-test" ' +
                                'opl-data="data" ' +
                    '></opl-player>');
    createComponent(element, 10000);

    assert.ok(
      angular.element(element[0].querySelector('.opl-index-preview')).hasClass('ng-hide'),
      'Expected index preview to be hidden by default'
    );

    element.isolateScope().handleTimeBarOver();
    $timeout.flush();
    scope.$digest();

    assert.notOk(
      angular.element(element[0].querySelector('.opl-index-preview')).hasClass('ng-hide'),
      'Expected index preview to be displayed when pointer over the time bar'
    );

    element.isolateScope().handleTimeBarOut();
    $timeout.flush();
    scope.$digest();

    assert.ok(
      angular.element(element[0].querySelector('.opl-index-preview')).hasClass('ng-hide'),
      'Expected index preview to be hidden when pointer goes out the time bar'
    );
  });

  it('should update the preview index while pointer is moving over the time bar', function() {
    var expectedDuration = 50000;
    var totalIndexes = 50;
    var timeBarWidth = 1000;
    var expectedPercent;
    var expectedTime;
    var expectedPreviewPosition;
    scope.data.timecodes = [];

    for (var i = 0; i < totalIndexes; i++) {
      var index;
      var value = i * 1000;

      if (i % 2) {
        index = {
          timecode: value,
          image: {
            small: 'https://host.local/image' + i + '.jpg',
            large: 'https://host.local/image' + i + '_large.jpg'
          }
        };
        $httpBackend.whenGET(index.image.small).respond(200);
      } else {
        index = {
          timecode: value,
          image: {
            small: {
              url: 'https://host.local/image' + i + '.jpg',
              x: i,
              y: i + 1
            },
            large: 'https://host.local/image' + i + '_large.jpg'
          }
        };
        $httpBackend.whenGET(index.image.small.url).respond(200);
      }
      scope.data.timecodes.push(index);
      $httpBackend.whenGET(index.image.large).respond(200);
    }
    var element = angular.element('<opl-player ' +
                                'id="opl-player-test" ' +
                                'opl-data="data" ' +
                    '></opl-player>');
    createComponent(element, expectedDuration);

    var isolateScope = element.isolateScope();

    expectedPercent = 10;
    expectedTime = expectedDuration * expectedPercent / 100;
    expectedPreviewPosition = (timeBarWidth * expectedPercent / 100);
    isolateScope.handleTimeBarMove(expectedPercent, null, {
      width: timeBarWidth
    });
    $timeout.flush();
    scope.$digest();

    assert.equal(isolateScope.previewTime, expectedTime, 'Wrong preview time');
    assert.deepEqual(
      isolateScope.previewImage,
      scope.data.timecodes[expectedTime / 1000].image.small,
      'Wrong preview image'
    );
    assert.match(
      angular.element(element[0].querySelector('.opl-index-preview')).attr('style'),
      new RegExp('transform: translateX\\(' + (expectedPreviewPosition - 142 / 2) + 'px\\)'),
      'Wrong preview position'
    );

    expectedPercent = 12;
    expectedTime = expectedDuration * expectedPercent / 100;
    expectedPreviewPosition = (timeBarWidth * expectedPercent / 100);
    isolateScope.handleTimeBarMove(expectedPercent, null, {
      width: timeBarWidth
    });
    $timeout.flush();
    scope.$digest();

    assert.equal(isolateScope.previewTime, expectedTime, 'Wrong preview time');
    assert.deepEqual(
      isolateScope.previewImage,
      scope.data.timecodes[expectedTime / 1000].image.small,
      'Wrong preview image'
    );
    assert.match(
      angular.element(element[0].querySelector('.opl-index-preview')).attr('style'),
      new RegExp('transform: translateX\\(' + (expectedPreviewPosition - 142 / 2) + 'px\\)'),
      'Wrong preview position'
    );
  });

  it('should not display the preview index if no indexes', function() {
    var element = angular.element('<opl-player ' +
                                'id="opl-player-test" ' +
                                'opl-data="data" ' +
                    '></opl-player>');
    createComponent(element, 10000);

    var isolateScope = element.isolateScope();

    isolateScope.handleTimeBarOver();

    assert.ok(
      angular.element(element[0].querySelector('.opl-index-preview')).hasClass('ng-hide'),
      'Expected index preview to be hidden when no indexes'
    );

    isolateScope.handleTimeBarOut();

    assert.ok(
      angular.element(element[0].querySelector('.opl-index-preview')).hasClass('ng-hide'),
      'Expected index preview to be hidden when no indexes'
    );

    isolateScope.handleTimeBarMove(10, null, {
      width: 1000
    });

    assert.ok(
      angular.element(element[0].querySelector('.opl-index-preview')).hasClass('ng-hide'),
      'Expected index preview to be hidden when no indexes'
    );
  });

  it('should update time when time bar is updated', function() {
    var expectedDuration = 10000;
    var element = angular.element('<opl-player ' +
                                'id="opl-player-test" ' +
                                'opl-data="data" ' +
                    '></opl-player>');
    createComponent(element, expectedDuration);

    var isolateScope = element.isolateScope();

    Player.prototype.setTime = chai.spy(function(time) {
      assert.equal(time, expectedDuration * 10 / 100, 'Wrong time');
    });

    isolateScope.handleTimeBarUpdate(10);

    Player.prototype.setTime.should.have.been.called.exactly(1);
  });

  it('should list sources and qualities in settings', function() {
    var i;
    var quality;
    var expectedQuality;
    expectedSourceIndex = 0;
    expectedDefinitions = [
      {
        files: [
          {
            width: 640,
            height: 360,
            link: 'https://host.local/source1.mp4'
          },
          {
            width: 1080,
            height: 720,
            link: 'https://host.local/source1-hd.mp4'
          }
        ]
      },
      {
        files: [
          {
            width: 640,
            height: 360,
            link: 'https://host.local/source2.mp4'
          },
          {
            width: 1080,
            height: 720,
            link: 'https://host.local/source2-hd.mp4'
          }
        ]
      }
    ];
    scope.data.mediaId = ['1', '2'];
    scope.data.sources = expectedDefinitions;
    var element = angular.element('<opl-player ' +
                                'id="opl-player-test" ' +
                                'opl-data="data" ' +
                    '></opl-player>');
    createComponent(element, 10000);

    for (i = 0; i < ctrl.mediaQualities.length; i++) {
      quality = ctrl.mediaQualities[i];
      expectedQuality = expectedDefinitions[expectedSourceIndex].files[i];

      assert.equal(quality.id, String(expectedQuality.height), 'Wrong id for quality ' + i);
      assert.equal(quality.label, expectedQuality.height + 'p', 'Wrong label for quality ' + i);
      assert.equal(quality.hd, expectedQuality.height >= 720, 'Wrong hd value for quality ' + i);
    }
    assert.strictEqual(
      ctrl.selectedDefinition,
      String(expectedDefinitions[expectedSourceIndex].files[0].height),
      'Wrong definition selected'
    );
    assert.strictEqual(
      ctrl.selectedSource,
      scope.data.mediaId[expectedSourceIndex],
      'Wrong source selected'
    );

    // Change source
    expectedSourceIndex = 1;
    ctrl.setSource(expectedSourceIndex);
    $timeout.flush();
    scope.$digest();

    for (i = 0; i < ctrl.mediaQualities.length; i++) {
      quality = ctrl.mediaQualities[i];
      expectedQuality = expectedDefinitions[expectedSourceIndex].files[i];

      assert.equal(quality.id, String(expectedQuality.height), 'Wrong id for quality ' + i);
      assert.equal(quality.label, expectedQuality.height + 'p', 'Wrong label for quality ' + i);
      assert.equal(quality.hd, expectedQuality.height >= 720, 'Wrong hd value for quality ' + i);
    }
    assert.strictEqual(
      ctrl.selectedDefinition,
      String(expectedDefinitions[expectedSourceIndex].files[0].height),
      'Wrong definition selected'
    );
    assert.strictEqual(
      ctrl.selectedSource,
      scope.data.mediaId[expectedSourceIndex],
      'Wrong source selected'
    );
  });

  it('should change source if a new source is selected from settings', function() {
    expectedSourceIndex = 0;
    expectedDefinitions = [
      {
        files: [
          {
            width: 640,
            height: 360,
            link: 'https://host.local/source1.mp4'
          },
          {
            width: 1080,
            height: 720,
            link: 'https://host.local/source1-hd.mp4'
          }
        ]
      },
      {
        files: [
          {
            width: 640,
            height: 360,
            link: 'https://host.local/source2.mp4'
          },
          {
            width: 1080,
            height: 720,
            link: 'https://host.local/source2-hd.mp4'
          }
        ]
      }
    ];
    scope.data.mediaId = ['1', '2'];
    scope.data.sources = expectedDefinitions;
    var element = angular.element('<opl-player ' +
                                'id="opl-player-test" ' +
                                'opl-data="data" ' +
                    '></opl-player>');
    createComponent(element, 10000);

    var isolateScope = element.isolateScope();

    assert.strictEqual(
      ctrl.selectedSource,
      scope.data.mediaId[expectedSourceIndex],
      'Wrong source selected'
    );

    expectedSourceIndex = 1;
    isolateScope.handleSettingsUpdate(null, scope.data.mediaId[expectedSourceIndex]);
    $timeout.flush();
    scope.$digest();

    assert.strictEqual(
      ctrl.selectedSource,
      scope.data.mediaId[expectedSourceIndex],
      'Wrong source selected'
    );
  });

  it('should change quality if a new quality is selected from settings', function() {
    expectedQualityIndex = 0;
    expectedDefinitions = [
      {
        files: [
          {
            width: 640,
            height: 360,
            link: 'https://host.local/source1.mp4'
          },
          {
            width: 1080,
            height: 720,
            link: 'https://host.local/source1-hd.mp4'
          }
        ]
      }
    ];
    scope.data.mediaId = ['1'];
    scope.data.sources = expectedDefinitions;
    var element = angular.element('<opl-player ' +
                                'id="opl-player-test" ' +
                                'opl-data="data" ' +
                    '></opl-player>');
    createComponent(element, 10000);

    var isolateScope = element.isolateScope();

    assert.strictEqual(
      ctrl.selectedDefinition,
      String(expectedDefinitions[0].files[expectedQualityIndex].height),
      'Wrong quality selected'
    );

    // Change quality
    expectedQualityIndex = 1;
    isolateScope.handleSettingsUpdate(String(expectedDefinitions[0].files[expectedQualityIndex].height));
    element.triggerHandler('oplReady');
    $timeout.flush(1000);
    scope.$digest();

    assert.strictEqual(
      ctrl.selectedDefinition,
      String(expectedDefinitions[0].files[expectedQualityIndex].height),
      'Wrong quality selected'
    );
  });

  it('should be able to put the player in fullscreen', function() {
    var element = angular.element('<opl-player ' +
                                'id="opl-player-test" ' +
                                'opl-data="data" ' +
                    '></opl-player>');
    createComponent(element, 10000);

    var isolateScope = element.isolateScope();
    var rootElement = element.children()[0];

    rootElement.requestFullScreen = chai.spy(function() {});
    rootElement.exitFullscreen = chai.spy(function() {});

    assert.notOk(ctrl.fullscreenEnabled, 'Unexpected fullscreen by default');

    isolateScope.toggleFullscreen();

    assert.ok(ctrl.fullscreenEnabled, 'Expected fullscreen to be activated');

    rootElement.requestFullScreen.should.have.been.called.exactly(1);
  });

  it('should update time when a point of interest if selected', function() {
    var expectedTime = 1000;
    scope.data.chapters = [
      {
        value: expectedTime,
        name: 'Chapter'
      }
    ];

    var element = angular.element('<opl-player ' +
                                'id="opl-player-test" ' +
                                'opl-data="data" ' +
                    '></opl-player>');
    createComponent(element, 10000);

    var isolateScope = element.isolateScope();

    Player.prototype.setTime = chai.spy(function(time) {
      assert.equal(time, expectedTime, 'Wrong time');
    });
    isolateScope.handleTileSelect({
      time: expectedTime
    });

    Player.prototype.setTime.should.have.been.called.exactly(1);
  });

  it('should be able to show more information about a point of interest', function() {
    scope.data.timecodes = [
      {
        timecode: 0,
        image: {
          small: 'https://host.local/image.jpg',
          large: 'https://host.local/image_large.jpg'
        }
      }
    ];
    scope.data.chapters = [
      {
        value: 0,
        name: 'Chapter'
      }
    ];
    scope.data.tags = [
      {
        value: 0,
        name: 'Tag'
      }
    ];
    $httpBackend.whenGET(scope.data.timecodes[0].image.small).respond(200);
    $httpBackend.whenGET(scope.data.timecodes[0].image.large).respond(200);

    var element = angular.element('<opl-player ' +
                                'id="opl-player-test" ' +
                                'opl-data="data" ' +
                    '></opl-player>');
    createComponent(element, 10000);

    var isolateScope = element.isolateScope();

    isolateScope.handleTileInfo({
      id: 0
    }, 'timecodes');
    $timeout.flush(1000);

    assert.ok(
      angular.element(element[0].querySelector('.opl-media-wrapper')).hasClass('opl-masked'),
      'Expected media player to be masked'
    );

    assert.ok(
      angular.element(element[0].querySelector('.opl-light-controls')).hasClass('opl-light-controls-posted'),
      'Expected light controls to be displayed'
    );

    isolateScope.handleTileClose({
      id: 0
    }, 'timecodes');
    $timeout.flush(1000);

    assert.notOk(
      angular.element(element[0].querySelector('.opl-media-wrapper')).hasClass('opl-masked'),
      'Expected media player to be displayed'
    );

    assert.notOk(
      angular.element(element[0].querySelector('.opl-light-controls')).hasClass('opl-light-controls-posted'),
      'Expected light controls to be masked'
    );

    isolateScope.handleTileInfo({
      id: 0
    }, 'chapters');
    $timeout.flush(1000);

    assert.ok(
      angular.element(element[0].querySelector('.opl-media-wrapper')).hasClass('opl-masked'),
      'Expected media player to be masked'
    );

    assert.ok(
      angular.element(element[0].querySelector('.opl-light-controls')).hasClass('opl-light-controls-posted'),
      'Expected light controls to be displayed'
    );

    isolateScope.handleTileClose({
      id: 0
    }, 'chapters');
    $timeout.flush(1000);

    assert.notOk(
      angular.element(element[0].querySelector('.opl-media-wrapper')).hasClass('opl-masked'),
      'Expected media player to be displayed'
    );

    assert.notOk(
      angular.element(element[0].querySelector('.opl-light-controls')).hasClass('opl-light-controls-posted'),
      'Expected light controls to be masked'
    );

    isolateScope.handleTileInfo({
      id: 0
    }, 'tags');
    $timeout.flush(1000);

    assert.ok(
      angular.element(element[0].querySelector('.opl-media-wrapper')).hasClass('opl-masked'),
      'Expected media player to be masked'
    );

    assert.ok(
      angular.element(element[0].querySelector('.opl-light-controls')).hasClass('opl-light-controls-posted'),
      'Expected light controls to be displayed'
    );

    isolateScope.handleTileClose({
      id: 0
    }, 'tags');
    $timeout.flush(1000);

    assert.notOk(
      angular.element(element[0].querySelector('.opl-media-wrapper')).hasClass('opl-masked'),
      'Expected media player to be displayed'
    );

    assert.notOk(
      angular.element(element[0].querySelector('.opl-light-controls')).hasClass('opl-light-controls-posted'),
      'Expected light controls to be masked'
    );
  });

  it('should throw an error if player type is not supported', function() {
    var element = angular.element('<opl-player ' +
                                'id="opl-player-test" ' +
                                'opl-data="data" ' +
                                'opl-player-type="unknown" ' +
                    '></opl-player>');

    assert.throws(function() {
      createComponent(element, 10000);
    });
  });

  it('should be able to change data dynamically', function() {
    var expectedBeginCut = 5000;
    var expectedEndCut = 9000;
    var expectedFakeDuration = expectedEndCut - expectedBeginCut;
    expectedDefinitions = [
      {
        files: [
          {
            width: 640,
            height: 360,
            link: 'https://host.local/video.mp4'
          }
        ]
      }
    ];
    scope.data = {
      mediaId: ['1'],
      timecodes: [],
      chapters: [],
      tags: [],
      cut: [],
      sources: expectedDefinitions
    };

    var element = angular.element('<opl-player ' +
                                'id="opl-player-test" ' +
                                'opl-data="data" ' +
                                'opl-template="split_50_50" ' +
                    '></opl-player>');
    createComponent(element, 10000);

    element.triggerHandler('oplPlayProgress', {
      time: 5000,
      percent: (5000 / 10000) * 100
    });
    $timeout.flush();
    scope.$digest();

    scope.data = {
      mediaId: ['1'],
      sources: expectedDefinitions,
      timecodes: [
        {
          timecode: 0,
          image: {
            small: 'https://host.local/image.jpg',
            large: 'https://host.local/image_large.jpg'
          }
        }
      ],
      chapters: [
        {
          value: 0,
          name: 'Chapter'
        }
      ],
      tags: [
        {
          value: 0,
          name: 'Tag'
        }
      ],
      cut: [
        {
          type: 'begin',
          value: expectedBeginCut
        },
        {
          type: 'end',
          value: expectedEndCut
        }
      ]
    };
    $httpBackend.whenGET(scope.data.timecodes[0].image.small).respond(200);
    $httpBackend.whenGET(scope.data.timecodes[0].image.large).respond(200);
    element.triggerHandler('oplReady');
    element.triggerHandler('oplDurationChange', 50000);
    $timeout.flush(1000);
    scope.$digest();

    var playerElement = angular.element(element[0].querySelector('.opl-player'));
    var mediaWrapperElement = angular.element(element[0].querySelector('.opl-media-wrapper'));
    var errorElement = angular.element(element[0].querySelector('.opl-error'));
    var videoElement = angular.element(element[0].querySelector('.opl-media video'));
    var loaderElement = angular.element(element[0].querySelector('.opl-loader'));
    var area2Element = angular.element(element[0].querySelector('.opl-area-2 > div'));
    var indexPreviewElement = angular.element(element[0].querySelector('.opl-index-preview'));
    var volumeElement = angular.element(element[0].querySelector('.opl-left-controls opl-volume'));
    var timeElement = angular.element(element[0].querySelector('.opl-left-controls .opl-current-time'));
    var templateSelectorElement = angular.element(element[0].querySelector('opl-template-selector'));
    var settingsElement = angular.element(element[0].querySelector('opl-settings'));
    var fullScreenElement = angular.element(element[0].querySelector('.opl-right-controls opl-toggle-icon-button'));
    var lightVolumeElement = angular.element(element[0].querySelector('.opl-light-controls opl-volume'));
    var lightTimeElement = angular.element(element[0].querySelector('.opl-light-controls .opl-current-time'));
    var tabsElement = angular.element(element[0].querySelector('opl-tabs'));

    assert.notOk(playerElement.hasClass('opl-no-poi'), 'Expected points of interest');

    assert.ok(mediaWrapperElement.hasClass('opl-template-split_50_50'), 'Wrong template');

    assert.ok(loaderElement.hasClass('ng-hide'), 'Unexpected loader');
    assert.isDefined(videoElement.attr('id'), 'Expected a player id');
    assert.isUndefined(errorElement[0], 'Unexpected error');

    assert.ok(indexPreviewElement.hasClass('ng-hide'), 'Expected index preview to be hidden');
    assert.notOk(volumeElement.attr('ng-hide'), 'Expected volume to be displayed');
    assert.notOk(timeElement.attr('ng-hide'), 'Expected time and duration to be displayed');
    assert.equal(
      timeElement.find('span').html(),
      $filter('oplMillisecondsToTime')(0) + ' / ' + $filter('oplMillisecondsToTime')(expectedFakeDuration),
      'Wrong time and duration'
    );
    assert.notOk(templateSelectorElement.hasClass('ng-hide'), 'Expected template selector to be displayed');
    assert.notOk(settingsElement.hasClass('ng-hide'), 'Expected settings to be displayed');
    assert.notOk(fullScreenElement.hasClass('ng-hide'), 'Expected fullscreen button to be displayed');
    assert.notOk(lightVolumeElement.attr('ng-hide'), 'Expected light volume to be displayed');
    assert.notOk(lightTimeElement.attr('ng-hide'), 'Expected light time to be displayed');
    assert.equal(
      lightTimeElement.find('span').html(),
      $filter('oplMillisecondsToTime')(0),
      'Wrong light time'
    );

    assert.equal(tabsElement.attr('opl-no-tabs'), 'false', 'Expected tabs');

    assert.match(
      area2Element.attr('style'),
      new RegExp('background-image: ?url\\("' + scope.data.timecodes[0].image.large + '"\\)'),
      'Wrong index preview'
    );

    assert.lengthOf(ctrl.mediaSources, scope.data.mediaId.length, 'Wrong number of sources');
    assert.equal(ctrl.mediaSources[0].id, scope.data.mediaId[0], 'Wrong media source id');
  });

  it('should update play / pause icon when playing', function() {
    var element = angular.element('<opl-player ' +
                                'id="opl-player-test" ' +
                                'opl-data="data" ' +
                    '></opl-player>');
    createComponent(element, 10000);

    assert.notOk(ctrl.playing, 'Expected player to be stopped');

    element.triggerHandler('oplPlaying');
    $timeout.flush();
    scope.$digest();

    assert.ok(ctrl.playing, 'Expected player to be playing');
  });

  it('should emit a "ready" event when player is ready', function(done) {
    var element = angular.element('<opl-player ' +
                                'id="opl-player-test" ' +
                                'opl-data="data" ' +
                    '></opl-player>');
    element.on('ready', function() {
      done();
    });
    createComponent(element, 10000);
  });

  it('should emit a "wait" event when player is waiting', function(done) {
    var element = angular.element('<opl-player ' +
                                'id="opl-player-test" ' +
                                'opl-data="data" ' +
                    '></opl-player>');
    element.on('waiting', function() {
      done();
    });
    createComponent(element, 10000);

    element.triggerHandler('oplWaiting');
    $timeout.flush();
    scope.$digest();
  });

  it('should emit a "playing" event when player starts playing', function(done) {
    var element = angular.element('<opl-player ' +
                                'id="opl-player-test" ' +
                                'opl-data="data" ' +
                    '></opl-player>');
    element.on('playing', function() {
      done();
    });
    createComponent(element, 10000);

    element.triggerHandler('oplPlaying');
    $timeout.flush();
    scope.$digest();
  });

  it('should emit a "needPoiConversion" event if player data contains a needPointsOfInterestUnitConversion property ' +
     'set to true', function(done) {
    scope.data.needPointsOfInterestUnitConversion = true;
    var element = angular.element('<opl-player ' +
                                'id="opl-player-test" ' +
                                'opl-data="data" ' +
                    '></opl-player>');
    element.on('needPoiConversion', function() {
      done();
    });
    createComponent(element, 10000);
  });

  it('should emit a "durationChange" event when player duration is available', function(done) {
    var expectedDuration = 10000;
    var element = angular.element('<opl-player ' +
                                'id="opl-player-test" ' +
                                'opl-data="data" ' +
                    '></opl-player>');
    element.on('durationChange', function(event, duration) {
      assert.equal(duration, expectedDuration, 'Wrong duration');
      done();
    });
    createComponent(element, expectedDuration);
  });

  it('should emit a "play" event when player is resumed', function(done) {
    var element = angular.element('<opl-player ' +
                                'id="opl-player-test" ' +
                                'opl-data="data" ' +
                    '></opl-player>');
    element.on('play', function() {
      done();
    });
    createComponent(element, 10000);

    element.triggerHandler('oplPlay');
    $timeout.flush();
    scope.$digest();
  });

  it('should emit a "pause" event when player is paused', function(done) {
    var element = angular.element('<opl-player ' +
                                'id="opl-player-test" ' +
                                'opl-data="data" ' +
                    '></opl-player>');
    element.on('pause', function() {
      done();
    });
    createComponent(element, 10000);

    element.triggerHandler('oplPause');
    $timeout.flush();
    scope.$digest();
  });

  it('should emit a "loadProgress" event when player load changes', function(done) {
    var expectedDuration = 10000;
    var expectedBeginCut = 5000;
    var expectedEndCut = 9000;
    var expectedLoadedPercent = 10;
    scope.data.cut = [
      {
        type: 'begin',
        value: expectedBeginCut
      },
      {
        type: 'end',
        value: expectedEndCut
      }
    ];
    var element = angular.element('<opl-player ' +
                                'id="opl-player-test" ' +
                                'opl-data="data" ' +
                    '></opl-player>');
    element.on('loadProgress', function(event, data) {
      assert.equal(
        data.loadedStart,
        (expectedEndCut + expectedBeginCut) / 2 - expectedBeginCut,
        'Wrong loaded start'
      );
      assert.equal(
        data.loadedPercent,
        (expectedDuration * expectedLoadedPercent / 100) / (expectedEndCut - expectedBeginCut) * 100,
        'Wrong loaded percent'
      );
      done();
    });
    createComponent(element, expectedDuration);

    element.triggerHandler('oplLoadProgress', {
      loadedStart: (expectedEndCut + expectedBeginCut) / 2,
      loadedPercent: expectedLoadedPercent
    });
    $timeout.flush();
    scope.$digest();
  });

  it('should emit a "playProgress" event when player load changes', function(done) {
    var expectedDuration = 10000;
    var expectedBeginCut = 5000;
    var expectedEndCut = 9000;
    var expectedSeenPercent = 10;
    var expectedTime = (expectedEndCut + expectedBeginCut) / 2;
    scope.data.cut = [
      {
        type: 'begin',
        value: expectedBeginCut
      },
      {
        type: 'end',
        value: expectedEndCut
      }
    ];
    var element = angular.element('<opl-player ' +
                                'id="opl-player-test" ' +
                                'opl-data="data" ' +
                    '></opl-player>');
    element.on('playProgress', function(event, data) {
      assert.equal(data.time, expectedTime - expectedBeginCut, 'Wrong time');
      assert.equal(
        data.percent,
        (expectedTime - expectedBeginCut) / (expectedEndCut - expectedBeginCut) * 100,
        'Wrong percent'
      );
      done();
    });
    createComponent(element, expectedDuration);

    element.triggerHandler('oplPlayProgress', {
      time: expectedTime,
      percent: expectedSeenPercent
    });
    $timeout.flush();
    scope.$digest();
  });

  it('should emit a "end" event when cut end is reached', function(done) {
    var expectedDuration = 10000;
    var expectedBeginCut = 5000;
    var expectedEndCut = 9000;
    var expectedTime = expectedEndCut + 1000;
    scope.data.cut = [
      {
        type: 'begin',
        value: expectedBeginCut
      },
      {
        type: 'end',
        value: expectedEndCut
      }
    ];
    var element = angular.element('<opl-player ' +
                                'id="opl-player-test" ' +
                                'opl-data="data" ' +
                    '></opl-player>');
    element.on('end', function(event) {
      done();
    });
    createComponent(element, expectedDuration);

    element.triggerHandler('oplPlayProgress', {
      time: expectedTime,
      percent: expectedTime / expectedDuration * 100
    });
    $timeout.flush();
    scope.$digest();
  });

  it('should emit a "end" event media end is reached', function(done) {
    var expectedDuration = 10000;
    var element = angular.element('<opl-player ' +
                                'id="opl-player-test" ' +
                                'opl-data="data" ' +
                    '></opl-player>');
    element.on('end', function(event) {
      done();
    });
    createComponent(element, expectedDuration);

    element.triggerHandler('oplEnd');
    $timeout.flush();
    scope.$digest();
  });

  it('should emit a "error" event when media is on error', function() {
    var expectedErrorCode;
    var expectedErrorMessage;
    var validateError = chai.spy(function(event, data) {
      assert.equal(data.code, expectedErrorCode, 'Wrong error code');
      assert.equal(data.message, expectedErrorMessage, 'Wrong error message');
    });
    var element = angular.element('<opl-player ' +
                                'id="opl-player-test" ' +
                                'opl-data="data" ' +
                    '></opl-player>');
    element.on('error', validateError);
    createComponent(element, 10000);

    expectedErrorCode = oplPlayerErrors.MEDIA_ERR_NO_SOURCE;
    expectedErrorMessage = $filter('oplTranslate')('MEDIA_ERR_NO_SOURCE');
    element.triggerHandler('oplError', String(expectedErrorCode));
    $timeout.flush();
    scope.$digest();

    expectedErrorCode = oplPlayerErrors.MEDIA_ERR_NETWORK;
    expectedErrorMessage = $filter('oplTranslate')('MEDIA_ERR_NETWORK');
    element.triggerHandler('oplError', String(expectedErrorCode));
    $timeout.flush();
    scope.$digest();

    expectedErrorCode = oplPlayerErrors.MEDIA_ERR_DECODE;
    expectedErrorMessage = $filter('oplTranslate')('MEDIA_ERR_DECODE');
    element.triggerHandler('oplError', String(expectedErrorCode));
    $timeout.flush();
    scope.$digest();

    expectedErrorCode = oplPlayerErrors.MEDIA_ERR_SRC_NOT_SUPPORTED;
    expectedErrorMessage = $filter('oplTranslate')('MEDIA_ERR_SRC_NOT_SUPPORTED');
    element.triggerHandler('oplError', String(expectedErrorCode));
    $timeout.flush();
    scope.$digest();

    expectedErrorCode = oplPlayerErrors.MEDIA_ERR_PERMISSION;
    expectedErrorMessage = $filter('oplTranslate')('MEDIA_ERR_PERMISSION');
    element.triggerHandler('oplError', String(expectedErrorCode));
    $timeout.flush();
    scope.$digest();

    expectedErrorCode = 'unknown';
    expectedErrorMessage = $filter('oplTranslate')('MEDIA_ERR_DEFAULT');
    element.triggerHandler('oplError', expectedErrorCode);
    $timeout.flush();
    scope.$digest();
  });

  it('should stop player if current time exceeds the cut end', function() {
    var expectedDuration = 10000;
    var expectedBeginCut = 5000;
    var expectedEndCut = 9000;
    var expectedTime = expectedEndCut + 1000;
    scope.data.cut = [
      {
        type: 'begin',
        value: expectedBeginCut
      },
      {
        type: 'end',
        value: expectedEndCut
      }
    ];
    var element = angular.element('<opl-player ' +
                                'id="opl-player-test" ' +
                                'opl-data="data" ' +
                    '></opl-player>');
    createComponent(element, expectedDuration);

    Player.prototype.playPause = chai.spy(function() {});
    element.triggerHandler('oplPlayProgress', {
      time: expectedTime,
      percent: expectedTime / expectedDuration * 100
    });
    $timeout.flush();
    scope.$digest();

    assert.equal(ctrl.time, 0, 'Wrong time');

    Player.prototype.playPause.should.have.been.called.exactly(1);
  });

  it('should update the area 2 when media is progressing', function() {
    var totalPointsOfInterest = 50;
    var expectedDuration = 10000;
    var expectedTime = 5000;
    scope.data.timecodes = [];
    for (var i = 0; i < totalPointsOfInterest; i++) {
      var value = i * 1000;
      var index = {
        timecode: value,
        image: {
          small: 'https://host.local/image' + i + '.jpg',
          large: 'https://host.local/image' + i + '_large.jpg'
        }
      };
      scope.data.timecodes.push(index);
      $httpBackend.whenGET(index.image.small).respond(200);
      $httpBackend.whenGET(index.image.large).respond(200);
    }
    var element = angular.element('<opl-player ' +
                                'id="opl-player-test" ' +
                                'opl-data="data" ' +
                    '></opl-player>');
    createComponent(element, expectedDuration);

    assert.match(
      angular.element(element[0].querySelector('.opl-area-2 > div')).attr('style'),
      new RegExp('background-image: ?url\\("' + scope.data.timecodes[0].image.large + '"\\)'),
      'Wrong index preview'
    );

    Player.prototype.playPause = chai.spy(function() {});
    element.triggerHandler('oplPlayProgress', {
      time: expectedTime,
      percent: expectedTime / expectedDuration * 100
    });
    $timeout.flush();
    scope.$digest();

    assert.match(
      angular.element(element[0].querySelector('.opl-area-2 > div')).attr('style'),
      new RegExp('background-image: ?url\\("' + scope.data.timecodes[expectedTime / 1000].image.large + '"\\)'),
      'Wrong index preview'
    );
  });

  it('should return to cut begin time when video ends', function() {
    var totalPointsOfInterest = 50;
    var expectedDuration = 10000;
    var expectedBeginCut = 5000;
    scope.data.cut = [
      {
        type: 'begin',
        value: expectedBeginCut
      }
    ];
    scope.data.timecodes = [];
    for (var i = 0; i < totalPointsOfInterest; i++) {
      var value = i * 1000;
      var index = {
        timecode: value,
        image: {
          small: 'https://host.local/image' + i + '.jpg',
          large: 'https://host.local/image' + i + '_large.jpg'
        }
      };
      scope.data.timecodes.push(index);
      $httpBackend.whenGET(index.image.small).respond(200);
      $httpBackend.whenGET(index.image.large).respond(200);
    }
    var element = angular.element('<opl-player ' +
                                'id="opl-player-test" ' +
                                'opl-data="data" ' +
                    '></opl-player>');
    createComponent(element, expectedDuration);

    Player.prototype.setTime = chai.spy(function(time) {
      assert.equal(time, expectedBeginCut, 'Wrong time set');
    });

    element.triggerHandler('oplPlayProgress', {
      time: 2000,
      percent: 2000 / expectedDuration * 100
    });
    $timeout.flush();
    scope.$digest();

    element.triggerHandler('oplEnd');
    $timeout.flush();
    scope.$digest();

    assert.equal(ctrl.time, 0, 'Wrong time');
    assert.equal(ctrl.seenPercent, 0, 'Wrong seen percentage');
    assert.match(
      angular.element(element[0].querySelector('.opl-area-2 > div')).attr('style'),
      new RegExp('background-image: ?url\\("' + scope.data.timecodes[expectedBeginCut / 1000].image.large + '"\\)'),
      'Wrong index preview'
    );

    Player.prototype.setTime.should.have.been.called.exactly(1);
  });

  describe('selectTemplate', function() {

    it('should be able to change the template', function() {
      var expectedTemplate = 'split_50_50';
      scope.data.timecodes = [
        {
          timecode: 1000,
          image: {
            small: 'https://host.local/image.jpg',
            large: 'https://host.local/image_large.jpg'
          }
        }
      ];
      $httpBackend.whenGET(scope.data.timecodes[0].image.small).respond(200);
      $httpBackend.whenGET(scope.data.timecodes[0].image.large).respond(200);

      var element = angular.element('<opl-player ' +
                                                'id="opl-player-test" ' +
                                                'opl-data="data" ' +
                                    '></opl-player>');
      createComponent(element, 10000);

      assert.ok(
        angular.element(element[0].querySelector('.opl-media-wrapper')).hasClass('opl-template-' + expectedTemplate),
        'Wrong template'
      );

      expectedTemplate = 'split_1';
      ctrl.selectTemplate(expectedTemplate);
      $timeout.flush(1000);
      scope.$digest();

      assert.ok(
        angular.element(element[0].querySelector('.opl-media-wrapper')).hasClass('opl-template-' + expectedTemplate),
        'Wrong template'
      );

      expectedTemplate = 'split_2';
      ctrl.selectTemplate(expectedTemplate);
      $timeout.flush(1000);
      scope.$digest();

      assert.ok(
        angular.element(element[0].querySelector('.opl-media-wrapper')).hasClass('opl-template-' + expectedTemplate),
        'Wrong template'
      );

      expectedTemplate = 'split_25_75';
      ctrl.selectTemplate(expectedTemplate);
      $timeout.flush(1000);
      scope.$digest();

      assert.ok(
        angular.element(element[0].querySelector('.opl-media-wrapper')).hasClass('opl-template-' + expectedTemplate),
        'Wrong template'
      );
    });

    it('should select template "split_50_50" if specified template is unknown', function() {
      scope.data.timecodes = [
        {
          timecode: 1000,
          image: {
            small: 'https://host.local/image.jpg',
            large: 'https://host.local/image_large.jpg'
          }
        }
      ];
      $httpBackend.whenGET(scope.data.timecodes[0].image.small).respond(200);
      $httpBackend.whenGET(scope.data.timecodes[0].image.large).respond(200);

      var element = angular.element('<opl-player ' +
                                                'id="opl-player-test" ' +
                                                'opl-data="data" ' +
                                    '></opl-player>');
      createComponent(element, 10000);

      ctrl.selectTemplate('split_1');
      $timeout.flush(1000);
      scope.$digest();

      ctrl.selectTemplate('unknown');
      $timeout.flush(1000);
      scope.$digest();

      assert.ok(
        angular.element(element[0].querySelector('.opl-media-wrapper')).hasClass('opl-template-split_50_50'),
        'Wrong template'
      );
    });

  });

  describe('playPause', function() {

    it('should be able to play / resume the player', function() {
      var element = angular.element('<opl-player ' +
                                                'id="opl-player-test" ' +
                                                'opl-data="data" ' +
                                    '></opl-player>');
      createComponent(element, 10000);

      Player.prototype.playPause = chai.spy(function() {});

      ctrl.playPause();
      ctrl.playPause();

      Player.prototype.playPause.should.have.been.called.exactly(2);
    });

    it('should not be able to play / resume the player if loading', function() {
      var element = angular.element('<opl-player ' +
                                                'id="opl-player-test" ' +
                                                'opl-data="data" ' +
                                    '></opl-player>');
      createComponent(element, 10000);

      Player.prototype.playPause = chai.spy(function() {});

      element.triggerHandler('oplWaiting');
      $timeout.flush();
      scope.$digest();

      ctrl.playPause();

      Player.prototype.playPause.should.have.been.called.exactly(0);
    });

    it('should not be able to play / resume the player if on error', function() {
      var element = angular.element('<opl-player ' +
                                                'id="opl-player-test" ' +
                                                'opl-data="data" ' +
                                    '></opl-player>');
      createComponent(element, 10000);

      Player.prototype.playPause = chai.spy(function() {});

      element.triggerHandler('oplError', oplPlayerErrors.MEDIA_ERR_NO_SOURCE);
      $timeout.flush();
      scope.$digest();

      ctrl.playPause();

      Player.prototype.playPause.should.have.been.called.exactly(0);
    });
  });

  describe('setVolume', function() {

    it('should set the volume of the player', function() {
      var expectedVolume = 42;
      var element = angular.element('<opl-player ' +
                                                'id="opl-player-test" ' +
                                                'opl-data="data" ' +
                                    '></opl-player>');
      createComponent(element, 10000);

      Player.prototype.setVolume = chai.spy(function(volume) {
        assert.equal(volume, expectedVolume, 'Wrong volume');
      });

      ctrl.volume = expectedVolume;
      ctrl.setVolume(expectedVolume);

      Player.prototype.setVolume.should.have.been.called.exactly(1);
    });

  });

  describe('setTime', function() {

    it('should set player current time', function() {
      var expectedDuration = 10000;
      var expectedBeginCut = 5000;
      var expectedEndCut = 9000;
      var expectedFakeDuration = expectedEndCut - expectedBeginCut;
      var expectedTime = expectedFakeDuration / 2;
      scope.data.cut = [
        {
          type: 'begin',
          value: expectedBeginCut
        },
        {
          type: 'end',
          value: expectedEndCut
        }
      ];
      var element = angular.element('<opl-player ' +
                                                'id="opl-player-test" ' +
                                                'opl-data="data" ' +
                                    '></opl-player>');
      createComponent(element, expectedDuration);

      Player.prototype.setTime = chai.spy(function(time) {
        assert.equal(time, expectedTime + expectedBeginCut, 'Wrong time');
      });

      ctrl.setTime(expectedTime);

      Player.prototype.setTime.should.have.been.called.exactly(1);
    });

  });

  describe('setDefinition', function() {

    it('should set media quality', function() {
      var expectedDefinition;
      expectedDefinitions = [
        {
          files: [
            {
              width: 640,
              height: 360,
              link: 'https://host.local/source1.mp4'
            },
            {
              width: 1080,
              height: 720,
              link: 'https://host.local/source1-hd.mp4'
            }
          ]
        }
      ];
      scope.data.mediaId = ['1'];
      scope.data.sources = expectedDefinitions;
      var element = angular.element('<opl-player ' +
                                  'id="opl-player-test" ' +
                                  'opl-data="data" ' +
                      '></opl-player>');
      createComponent(element, 10000);

      Player.prototype.setDefinition = chai.spy(function(definition) {
        assert.equal(definition.height, expectedDefinition.height, 'Wrong definition');
      });

      assert.strictEqual(
        ctrl.selectedDefinition,
        String(expectedDefinitions[0].files[0].height),
        'Wrong quality selected'
      );

      // Change quality
      expectedDefinition = expectedDefinitions[0].files[1];
      ctrl.setDefinition(expectedDefinition);
      $timeout.flush();
      scope.$digest();

      Player.prototype.setDefinition.should.have.been.called.exactly(1);
    });

  });

  describe('setSource', function() {

    it('should set media source', function() {
      expectedSourceIndex = 0;
      expectedDefinitions = [
        {
          files: [
            {
              width: 640,
              height: 360,
              link: 'https://host.local/source1.mp4'
            },
            {
              width: 1080,
              height: 720,
              link: 'https://host.local/source1-hd.mp4'
            }
          ]
        },
        {
          files: [
            {
              width: 640,
              height: 360,
              link: 'https://host.local/source2.mp4'
            },
            {
              width: 1080,
              height: 720,
              link: 'https://host.local/source2-hd.mp4'
            }
          ]
        }
      ];
      scope.data.mediaId = ['1', '2'];
      scope.data.sources = expectedDefinitions;
      var element = angular.element('<opl-player ' +
                                  'id="opl-player-test" ' +
                                  'opl-data="data" ' +
                      '></opl-player>');
      createComponent(element, 10000);

      Player.prototype.setMediaSource = chai.spy(function(index) {
        assert.equal(index, expectedSourceIndex, 'Wrong source');
      });
      Player.prototype.load = chai.spy(function() {});

      assert.strictEqual(
        ctrl.selectedSource,
        scope.data.mediaId[expectedSourceIndex],
        'Wrong source selected'
      );

      expectedSourceIndex = 1;
      ctrl.setSource(expectedSourceIndex);
      $timeout.flush();
      scope.$digest();

      assert.strictEqual(
        ctrl.selectedSource,
        scope.data.mediaId[expectedSourceIndex],
        'Wrong source selected'
      );

      assert.strictEqual(
        ctrl.selectedDefinition,
        String(expectedDefinitions[expectedSourceIndex].files[0].height),
        'Wrong quality selected'
      );

      for (var i = 0; i < ctrl.mediaQualities.length; i++) {
        var quality = ctrl.mediaQualities[i];
        var expectedQuality = expectedDefinitions[expectedSourceIndex].files[i];

        assert.equal(quality.id, String(expectedQuality.height), 'Wrong id for quality ' + i);
        assert.equal(quality.label, expectedQuality.height + 'p', 'Wrong label for quality ' + i);
        assert.equal(quality.hd, expectedQuality.height >= 720, 'Wrong hd value for quality ' + i);
      }

      Player.prototype.setMediaSource.should.have.been.called.exactly(1);
      Player.prototype.load.should.have.been.called.exactly(1);
    });
  });
});
