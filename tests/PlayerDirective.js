'use strict';

window.assert = chai.assert;

// PlayerDirective.js
describe('PlayerDirective', function() {
  var $compile,
    $rootScope,
    $injector,
    scope,
    $timeout;

  // Load modules player and templates (to mock templates)
  beforeEach(function() {
    module('ov.player');
    module('templates');
  });

  // Dependencies injections
  beforeEach(inject(function(_$compile_, _$rootScope_, _$injector_, _$timeout_) {
    $rootScope = _$rootScope_;
    $compile = _$compile_;
    $injector = _$injector_;
    $timeout = _$timeout_;
  }));

  // Initializes tests
  beforeEach(function() {
    scope = $rootScope.$new();
  });

  it('Should define attributes ov-fullscreen-icon, ov-time, ov-volume-icon, ov-mode-icon, ' +
     'ov-fullscreen, ov-data, ov-player-type',
  function() {
    $rootScope.fullViewport = false;
    $rootScope.displayTime = true;
    $rootScope.displayVolumeIcon = true;
    $rootScope.displayModeIcon = true;
    $rootScope.playerType = 'vimeo';
    $rootScope.data = {
      type: 'vimeo',
      mediaId: '1',
      timecodes: [
        {
          timecode: 10,
          image: {
            small: '',
            large: ''
          }
        }
      ]
    };

    var element = angular.element(
      '<ov-player ov-fullscreen-icon="true" ov-full-viewport="fullViewport" ov-time="displayTime" ' +
      'ov-volume-icon="displayVolumeIcon" ov-mode-icon="displayModeIcon" ov-data="data" ' +
      'ov-player-type="{{playerType}}"></ov-player>');
    element = $compile(element)(scope);
    scope.$digest();

    var isolateScope = element.isolateScope();
    assert.isDefined(isolateScope.data.timecodes);
    assert.isArray(isolateScope.data.timecodes);
    assert.isDefined(isolateScope.ovFullscreenIcon);
    assert.isDefined(isolateScope.ovVolumeIcon);
    assert.isDefined(isolateScope.ovModeIcon);
    assert.isDefined(isolateScope.ovTime);
    assert.isDefined(isolateScope.ovFullViewport);
    assert.isDefined(isolateScope.ovPlayerType);
  });

  it('Should display all icons and time if not specified', function() {
    $rootScope.data = {
      type: 'vimeo',
      mediaId: '1',
      timecodes: [
        {
          timecode: 20,
          image: {
            small: '',
            large: ''
          }
        }
      ]
    };
    var element = angular.element('<ov-player ov-data="data"></ov-player>');
    element = $compile(element)(scope);
    scope.$digest();
    var isolateScope = element.isolateScope();
    assert.ok(isolateScope.ovFullscreenIcon);
    assert.ok(isolateScope.ovTime);
    assert.ok(isolateScope.ovModeIcon);
  });

  it('Should not display modes icon if no timecodes', function() {
    $rootScope.data = {};
    $rootScope.displayModeIcon = true;
    var element = angular.element('<ov-player ov-mode-icon="displayModeIcon" ov-data="data"></ov-player>');
    element = $compile(element)(scope);
    scope.$digest();

    var isolateScope = element.isolateScope();
    assert.notOk(isolateScope.displayModeButton);
  });

  it('Should not display index tab if no timecodes', function() {
    $rootScope.data = {};
    var element = angular.element('<ov-player ov-data="data"></ov-player>');
    element = $compile(element)(scope);
    scope.$digest();

    var isolateScope = element.isolateScope();
    assert.notOk(isolateScope.displayIndexTab);
  });

  it('Should select the media display mode if no timecodes', function() {
    $rootScope.data = {
      type: 'vimeo',
      mediaId: '1',
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
      mediaId: '1',
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
      mediaId: '1',
      files: [{}]
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

  it('Should create a Flow player if player type is flowplayer', function() {
    $rootScope.data = {
      mediaId: '1',
      files: [{}]
    };
    $rootScope.playerType = 'flowplayer';
    var element = angular.element('<ov-player ov-data="data" ov-player-type="{{playerType}}"></ov-player>');
    element = $compile(element)(scope);
    scope.$digest();

    var isolateScope = element.isolateScope();
    var OvFlowPlayer = $injector.get('OvFlowPlayer');
    assert.isNotNull(isolateScope.player);
    assert.ok(isolateScope.player instanceof OvFlowPlayer);
  });

  it('Should create an HTML player if no media type is specified', function() {
    $rootScope.data = {
      mediaId: '1',
      files: [{}]
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
      mediaId: '1',
      timecodes: [
        {
          timecode: 10,
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
    assert.equal(isolateScope.timePreview, 'large');
    assert.equal(isolateScope.presentation, 'large');
  });

  it('Should be able to open/close the list of display modes', function() {
    $rootScope.data = {};
    var element = angular.element('<ov-player ov-data="data"></ov-player>');
    element = $compile(element)(scope);
    scope.$digest();

    var isolateScope = element.isolateScope();
    isolateScope.toggleModes();
    assert.ok(isolateScope.modesOpened);
  });

  it('Should be able to open/close the volume', function() {
    $rootScope.data = {};
    var element = angular.element('<ov-player ov-data="data"></ov-player>');
    element = $compile(element)(scope);
    scope.$digest();

    var isolateScope = element.isolateScope();
    isolateScope.toggleVolume();
    assert.ok(isolateScope.volumeOpened);
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

  it('Should handle player waiting event and set player as "loading"', function() {
    $rootScope.data = {
      type: 'vimeo',
      mediaId: '1',
      timecodes: []
    };
    var element = angular.element('<ov-player ov-data="data"></ov-player>');
    element = $compile(element)(scope);
    scope.$digest();

    var isolateScope = element.isolateScope();
    isolateScope.loading = false;
    element.triggerHandler('waiting');
    $timeout.flush();

    assert.ok(isolateScope.loading);
  });

  it('Should handle player playing event and set player as "not loading" and pause button', function() {
    $rootScope.data = {
      type: 'vimeo',
      mediaId: '1',
      timecodes: []
    };
    var element = angular.element('<ov-player ov-data="data"></ov-player>');
    element = $compile(element)(scope);
    scope.$digest();

    var isolateScope = element.isolateScope();
    isolateScope.loading = true;
    element.triggerHandler('playing');
    $timeout.flush();

    assert.notOk(isolateScope.loading);
    assert.equal(isolateScope.playPauseButton, 'pause');
  });

  it('Should handle player durationChange event and set media duration', function() {
    $rootScope.data = {
      type: 'vimeo',
      mediaId: '1',
      timecodes: []
    };
    var element = angular.element('<ov-player ov-data="data"></ov-player>');
    element = $compile(element)(scope);
    scope.$digest();

    var isolateScope = element.isolateScope();
    element.triggerHandler('durationChange', 50000);
    $timeout.flush();

    assert.equal(isolateScope.duration, 50000);
  });

  it('Should handle player play event and set play/pause button to pause', function() {
    $rootScope.data = {
      type: 'vimeo',
      mediaId: '1',
      timecodes: []
    };
    var element = angular.element('<ov-player ov-data="data"></ov-player>');
    element = $compile(element)(scope);
    scope.$digest();

    var isolateScope = element.isolateScope();
    element.triggerHandler('play');
    $timeout.flush();

    assert.equal(isolateScope.playPauseButton, 'pause');
  });

  it('Should handle player pause event and set play/pause button to play', function() {
    $rootScope.data = {
      type: 'vimeo',
      mediaId: '1',
      timecodes: []
    };
    var element = angular.element('<ov-player ov-data="data"></ov-player>');
    element = $compile(element)(scope);
    scope.$digest();

    var isolateScope = element.isolateScope();
    element.triggerHandler('pause');
    $timeout.flush();

    assert.equal(isolateScope.playPauseButton, 'play');
  });

  it('Should handle player loadProgress event and set loading percentage', function() {
    $rootScope.data = {
      type: 'vimeo',
      mediaId: '1',
      timecodes: []
    };
    var element = angular.element('<ov-player ov-data="data"></ov-player>');
    element = $compile(element)(scope);
    scope.$digest();

    var isolateScope = element.isolateScope();
    element.triggerHandler('loadProgress', {
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
      mediaId: '1',
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
    element.triggerHandler('durationChange', 10000);
    $timeout.flush();
    element.triggerHandler('playProgress', {
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
      mediaId: '1',
      timecodes: []
    };
    var element = angular.element('<ov-player ov-data="data"></ov-player>');
    element = $compile(element)(scope);
    scope.$digest();

    var isolateScope = element.isolateScope();
    isolateScope.time = 5000;
    isolateScope.seenPercent = 50;
    element.triggerHandler('end');
    $timeout.flush();

    assert.equal(isolateScope.time, 0);
    assert.equal(isolateScope.seenPercent, 0);
  });

  it('Should expose an API with selectMode, playPause, setVolume, setTime', function() {
    $rootScope.data = {};
    var element = angular.element('<ov-player ov-data="data"></ov-player>');
    element = $compile(element)(scope);
    scope.$digest();

    var controller = element.controller('ovPlayer');
    assert.isDefined(controller.selectMode);
    assert.isDefined(controller.playPause);
    assert.isDefined(controller.setVolume);
    assert.isDefined(controller.setTime);
  });

});
