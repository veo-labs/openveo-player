'use strict';

window.assert = chai.assert;

// PlayerDirective.js
describe('PlayerDirective', function() {
  var $compile,
    $rootScope,
    $injector,
    scope,
    $timeout,
    $document;

  // Load modules player and templates (to mock templates)
  beforeEach(function() {
    module('ov.player');
    module('templates');
  });

  // Dependencies injections
  beforeEach(inject(function(_$compile_, _$rootScope_, _$injector_, _$timeout_, _$document_) {
    $rootScope = _$rootScope_;
    $compile = _$compile_;
    $injector = _$injector_;
    $timeout = _$timeout_;
    $document = _$document_;
  }));

  // Initializes tests
  beforeEach(function() {
    scope = $rootScope.$new();
  });

  it('Should define attributes ov-fullscreen-icon, ov-time, ov-volume-icon, ov-mode-icon, ' +
     'ov-full-viewport, ov-data, ov-player-type, ov-settings-icon, ov-language, ov-auto-play, ov-remember-position',
  function() {
    $rootScope.fullViewport = false;
    $rootScope.displayTime = true;
    $rootScope.displayVolumeIcon = true;
    $rootScope.displayModeIcon = true;
    $rootScope.displaySettingsIcon = true;
    $rootScope.data = {
      type: 'vimeo',
      mediaId: ['1'],
      timecodes: [
        {
          timecode: 10,
          image: {
            small: '',
            large: ''
          }
        }
      ],
      sources: {
        files: [{
          width: 640,
          height: 360,
          link: 'http://video.mp4'
        }, {
          width: 1280,
          height: 720,
          link: 'http://video.mp4'
        }]
      }
    };

    var element = angular.element(
      '<ov-player ov-fullscreen-icon="true" ov-full-viewport="fullViewport" ov-time="displayTime" ' +
      'ov-volume-icon="displayVolumeIcon" ov-mode-icon="displayModeIcon" ov-data="data" ' +
      'ov-player-type="html" ov-settings-icon="displaySettingsIcon" ov-language="en" ' +
      'ov-auto-play="true" ov-remember-position="true"></ov-player>');
    element = $compile(element)(scope);
    scope.$digest();

    var isolateScope = element.isolateScope();
    assert.isDefined(isolateScope.data.timecodes);
    assert.isArray(isolateScope.data.timecodes);
    assert.isDefined(isolateScope.ovFullscreenIcon);
    assert.isDefined(isolateScope.ovVolumeIcon);
    assert.isDefined(isolateScope.ovModeIcon);
    assert.isDefined(isolateScope.ovSettingsIcon);
    assert.isDefined(isolateScope.ovTime);
    assert.isDefined(isolateScope.ovFullViewport);
    assert.isDefined(isolateScope.ovPlayerType);
    assert.isDefined(isolateScope.ovLanguage);
    assert.isDefined(isolateScope.ovAutoPlay);
    assert.isDefined(isolateScope.ovRememberPosition);
  });

  it('Should display all icons and time if not specified', function() {
    $rootScope.data = {
      type: 'html',
      mediaId: ['1', '2'],
      timecodes: [
        {
          timecode: 20,
          image: {
            small: '',
            large: ''
          }
        }
      ],
      sources: [
        {
          files: [{
            width: 640,
            height: 360,
            link: 'http://video.mp4'
          }, {
            width: 1280,
            height: 720,
            link: 'http://video.mp4'
          }]
        }, {
          files: [{
            width: 640,
            height: 360,
            link: 'http://video.mp4'
          }, {
            width: 1280,
            height: 720,
            link: 'http://video.mp4'
          }]
        }
      ]
    };

    var element = angular.element('<ov-player ov-data="data"></ov-player>');
    element = $compile(element)(scope);
    $document[0].body.appendChild(element[0]);
    scope.$digest();

    var isolateScope = element.isolateScope();
    assert.ok(isolateScope.ovSettingsIcon, 'ovSettingsIcon');
    assert.ok(isolateScope.ovTime, 'ovTime');

    element.triggerHandler('ovDurationChange', 10000);
    $timeout.flush();
    assert.ok(isolateScope.ovModeIcon, 'ovModeIcon');

    $document[0].body.removeChild(element[0]);
  });

  it('Should not display modes icon if no timecodes', function() {
    $rootScope.data = { };
    $rootScope.displayModeIcon = true;
    var element = angular.element('<ov-player ov-mode-icon="displayModeIcon" ov-data="data"></ov-player>');
    element = $compile(element)(scope);
    scope.$digest();

    var isolateScope = element.isolateScope();
    assert.notOk(isolateScope.displayModeButton);
  });

  it('Should not display index tab if no timecodes', function() {
    $rootScope.data = { };
    var element = angular.element('<ov-player ov-data="data"></ov-player>');
    element = $compile(element)(scope);
    scope.$digest();

    var isolateScope = element.isolateScope();
    assert.notOk(isolateScope.displayIndexTab);
  });

  it('Should select the media display mode if no timecodes', function() {
    $rootScope.data = {
      type: 'vimeo',
      mediaId: ['1'],
      timecodes: []
    };
    var element = angular.element('<ov-player ov-data="data"></ov-player>');
    element = $compile(element)(scope);
    scope.$digest();

    var isolateScope = element.isolateScope();
    assert.isArray(isolateScope.modes);
    assert.equal(isolateScope.selectedMode, 'media');
  });

  it('Should create a Vimeo player if player type is vimeo', function() {
    $rootScope.data = {
      mediaId: ['1'],
      type: 'vimeo'
    };
    $rootScope.playerType = 'vimeo';
    var element = angular.element('<ov-player ov-data="data"></ov-player>');
    element = $compile(element)(scope);
    scope.$digest();

    var isolateScope = element.isolateScope();
    var OvVimeoPlayer = $injector.get('OvVimeoPlayer');
    assert.isNotNull(isolateScope.player);
    assert.ok(isolateScope.player instanceof OvVimeoPlayer);
  });

  it('Should create an HTML player if player type is html', function() {
    $rootScope.data = {
      mediaId: ['1'],
      sources: {
        files: [{}]
      }
    };
    $rootScope.playerType = 'html';
    var element = angular.element('<ov-player ov-data="data" ov-player-type="{{playerType}}"></ov-player>');
    element = $compile(element)(scope);
    scope.$digest();

    var isolateScope = element.isolateScope();
    var OvHTMLPlayer = $injector.get('OvHTMLPlayer');
    assert.isNotNull(isolateScope.player);
    assert.ok(isolateScope.player instanceof OvHTMLPlayer);
  });

  it('Should create an HTML player if no media type is specified', function() {
    $rootScope.data = {
      mediaId: ['1'],
      sources: {
        files: [{}]
      }
    };
    var element = angular.element('<ov-player ov-data="data"></ov-player>');
    element = $compile(element)(scope);
    scope.$digest();

    var OvHTMLPlayer = $injector.get('OvHTMLPlayer');
    var isolateScope = element.isolateScope();
    assert.ok(isolateScope.player instanceof OvHTMLPlayer);
  });

  it('Should not create a player if no media id', function() {
    $rootScope.data = {
      type: 'vimeo'
    };
    var element = angular.element('<ov-player ov-data="data"></ov-player>');
    element = $compile(element)(scope);
    scope.$digest();

    var isolateScope = element.isolateScope();
    assert.isNull(isolateScope.player);
  });

  it('Should set time preview image and default presentation image', function() {
    $rootScope.data = {
      type: 'vimeo',
      mediaId: ['1'],
      timecodes: [
        {
          timecode: 0,
          image: {
            small: 'small',
            large: 'large'
          }
        }
      ]
    };
    var element = angular.element('<ov-player ov-data="data"></ov-player>');
    element = $compile(element)(scope);
    scope.$digest();

    var isolateScope = element.isolateScope();
    element.triggerHandler('ovDurationChange', 10000);
    $timeout.flush();

    assert.equal(isolateScope.timePreview, 'large');
    assert.equal(isolateScope.presentation, 'large');
  });

  it('Should not set time preview image and default presentation image if first timecode > time', function() {
    $rootScope.data = {
      type: 'vimeo',
      mediaId: ['1'],
      timecodes: [
        {
          timecode: 5000,
          image: {
            small: 'small',
            large: 'large'
          }
        }
      ]
    };
    var element = angular.element('<ov-player ov-data="data"></ov-player>');
    element = $compile(element)(scope);
    scope.$digest();

    var isolateScope = element.isolateScope();
    isolateScope.initializing = false;
    element.triggerHandler('ovDurationChange', 10000);
    $timeout.flush();
    element.triggerHandler('ovPlayProgress', {
      time: 2500,
      percent: 25
    });
    $timeout.flush();

    assert.equal(isolateScope.timePreview, null);
    assert.equal(isolateScope.presentation, null);
  });

  it('Should be able to open/close the list of display modes', function() {
    $rootScope.data = {};
    var element = angular.element('<ov-player ov-data="data"></ov-player>');
    element = $compile(element)(scope);
    scope.$digest();

    var isolateScope = element.isolateScope();
    isolateScope.toggleModes();
    assert.ok(isolateScope.modesOpened);
    assert.notOk(isolateScope.definitionOpened);
    assert.notOk(isolateScope.volumeOpened);
  });

  it('Should be able to open/close the volume', function() {
    $rootScope.data = {};
    var element = angular.element('<ov-player ov-data="data"></ov-player>');
    element = $compile(element)(scope);
    scope.$digest();

    var isolateScope = element.isolateScope();
    isolateScope.toggleVolume();
    assert.ok(isolateScope.volumeOpened);
    assert.notOk(isolateScope.definitionOpened);
    assert.notOk(isolateScope.modesOpened);
  });

  it('Should be able to open/close the list of definitions', function() {
    $rootScope.data = {};
    var element = angular.element('<ov-player ov-data="data"></ov-player>');
    element = $compile(element)(scope);
    scope.$digest();

    var isolateScope = element.isolateScope();
    isolateScope.toggleDefinition();
    assert.ok(isolateScope.definitionOpened);
    assert.notOk(isolateScope.volumeOpened);
    assert.notOk(isolateScope.modesOpened);
  });

  it('Should be able to select a mode', function() {
    $rootScope.data = {};
    var element = angular.element('<ov-player ov-data="data"></ov-player>');
    element = $compile(element)(scope);
    scope.$digest();

    var isolateScope = element.isolateScope();
    isolateScope.selectMode('both-presentation');
    assert.equal(isolateScope.selectedMode, 'both-presentation');
  });


  it('Should be able to play/pause the player', function(done) {
    $rootScope.data = {};
    var element = angular.element('<ov-player ov-data="data"></ov-player>');
    element = $compile(element)(scope);
    scope.$digest();

    var isolateScope = element.isolateScope();

    isolateScope.player = {
      playPause: function() {
        done();
      }
    };

    isolateScope.playPause();
  });

  it('Should be able to change media definition', function(done) {
    $rootScope.data = {
      type: 'html',
      mediaId: ['1'],
      timecodes: {},
      sources: {
        files: [{
          width: 640,
          height: 360,
          link: 'http://video.mp4'
        }, {
          width: 1280,
          height: 720,
          link: 'http://videoHD.mp4'
        }]
      },
      thumbnail: '/1439286245225/thumbnail.jpg'
    };

    var element = angular.element('<ov-player ov-data="data"></ov-player>');
    element = $compile(element)(scope);
    scope.$digest();

    var isolateScope = element.isolateScope();

    isolateScope.player = {
      load: function() {
        assert.notOk(isolateScope.autoPlay, false);
        assert.equal(isolateScope.mediaSources.link, 'http://videoHD.mp4');
        assert.equal(isolateScope.mediaSources.mimeType, 'video/mp4');
        assert.ok(isolateScope.loading);
        assert.ok(isolateScope.initializing);
        done();
      },
      isPaused: function() {
        return true;
      },
      initialize: function() {
      },
      getMediaSources: function(def) {
        return {link: def.link, mimeType: 'video/mp4'};
      }
    };

    isolateScope.setDefinition({
      width: 1280,
      height: 720,
      link: 'http://videoHD.mp4'
    });

    $timeout.flush();
  });

  it('Should handle player waiting event and set player as "loading"', function() {
    $rootScope.data = {
      type: 'vimeo',
      mediaId: ['1'],
      timecodes: []
    };
    var element = angular.element('<ov-player ov-data="data"></ov-player>');
    element = $compile(element)(scope);
    scope.$digest();

    var isolateScope = element.isolateScope();
    isolateScope.loading = false;
    element.triggerHandler('ovWaiting');
    $timeout.flush();

    assert.ok(isolateScope.loading);
  });

  it('Should handle player playing event and set player as "not loading" and pause button', function() {
    $rootScope.data = {
      type: 'vimeo',
      mediaId: ['1'],
      timecodes: []
    };
    var element = angular.element('<ov-player ov-data="data"></ov-player>');
    element = $compile(element)(scope);
    scope.$digest();

    var isolateScope = element.isolateScope();
    isolateScope.loading = true;
    element.triggerHandler('ovPlaying');
    $timeout.flush();

    assert.notOk(isolateScope.loading);
    assert.equal(isolateScope.playPauseButton, 'pause');
  });

  it('Should handle player durationChange event and set media duration', function() {
    $rootScope.data = {
      type: 'vimeo',
      mediaId: ['1'],
      timecodes: []
    };
    var element = angular.element('<ov-player ov-data="data"></ov-player>');
    element = $compile(element)(scope);
    scope.$digest();

    var isolateScope = element.isolateScope();
    element.triggerHandler('ovDurationChange', 50000);
    $timeout.flush();

    assert.equal(isolateScope.duration, 50000);
  });

  it('Should handle player play event and set play/pause button to pause', function() {
    $rootScope.data = {
      type: 'vimeo',
      mediaId: ['1'],
      timecodes: []
    };
    var element = angular.element('<ov-player ov-data="data"></ov-player>');
    element = $compile(element)(scope);
    scope.$digest();

    var isolateScope = element.isolateScope();
    element.triggerHandler('ovPlay');
    $timeout.flush();

    assert.equal(isolateScope.playPauseButton, 'pause');
  });

  it('Should handle player pause event and set play/pause button to play', function() {
    $rootScope.data = {
      type: 'vimeo',
      mediaId: ['1'],
      timecodes: []
    };
    var element = angular.element('<ov-player ov-data="data"></ov-player>');
    element = $compile(element)(scope);
    scope.$digest();

    var isolateScope = element.isolateScope();
    element.triggerHandler('ovPause');
    $timeout.flush();

    assert.equal(isolateScope.playPauseButton, 'play');
  });

  it('Should handle player loadProgress event and set loading percentage', function() {
    $rootScope.data = {
      type: 'vimeo',
      mediaId: ['1'],
      timecodes: []
    };
    var element = angular.element('<ov-player ov-data="data"></ov-player>');
    element = $compile(element)(scope);
    scope.$digest();

    var isolateScope = element.isolateScope();
    element.triggerHandler('ovLoadProgress', {
      loadedStart: 2,
      loadedPercent: 98
    });
    $timeout.flush();

    assert.equal(isolateScope.loadedStart, 2);
    assert.equal(isolateScope.loadedPercent, 98);
  });

  it('Should handle player playProgress event and update time, seen percent of the media and find ' +
     'corresponding the presentation image',
  function() {
    $rootScope.data = {
      type: 'vimeo',
      mediaId: ['1'],
      timecodes: [
        {
          timecode: 10,
          image: {
            small: 'small',
            large: 'large'
          }
        },
        {
          timecode: 5000,
          image: {
            small: 'small2',
            large: 'large2'
          }
        },
        {
          timecode: 10000,
          image: {
            small: 'small3',
            large: 'large3'
          }
        }
      ]
    };
    var element = angular.element('<ov-player ov-data="data"></ov-player>');
    element = $compile(element)(scope);
    scope.$digest();

    var isolateScope = element.isolateScope();
    isolateScope.initializing = false;
    element.triggerHandler('ovDurationChange', 10000);
    $timeout.flush();
    element.triggerHandler('ovPlayProgress', {
      time: 7000,
      percent: 75
    });
    $timeout.flush();

    assert.equal(isolateScope.time, 7000);
    assert.equal(isolateScope.seenPercent, 75);
    assert.equal(isolateScope.presentation, 'large2');
  });

  it('Should handle player end event and reset time', function() {
    $rootScope.data = {
      type: 'vimeo',
      mediaId: ['1'],
      timecodes: []
    };
    var element = angular.element('<ov-player ov-data="data"></ov-player>');
    element = $compile(element)(scope);
    scope.$digest();

    var isolateScope = element.isolateScope();
    isolateScope.time = 5000;
    isolateScope.seenPercent = 50;
    element.triggerHandler('ovEnd');
    $timeout.flush();

    assert.equal(isolateScope.time, 0);
    assert.equal(isolateScope.seenPercent, 0);
  });

  it('Should expose an API with selectMode, playPause, setVolume, setTime and setDefinition', function() {
    $rootScope.data = {};
    var element = angular.element('<ov-player ov-data="data"></ov-player>');
    element = $compile(element)(scope);
    scope.$digest();

    var controller = element.controller('ovPlayer');
    assert.isDefined(controller.selectMode);
    assert.isDefined(controller.playPause);
    assert.isDefined(controller.setVolume);
    assert.isDefined(controller.setTime);
    assert.isDefined(controller.setDefinition);

    assert.isFunction(controller.selectMode);
    assert.isFunction(controller.playPause);
    assert.isFunction(controller.setVolume);
    assert.isFunction(controller.setTime);
    assert.isFunction(controller.setDefinition);
  });

});
