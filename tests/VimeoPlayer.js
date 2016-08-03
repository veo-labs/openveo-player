'use strict';

window.assert = chai.assert;

// VimeoPlayer.js
describe('VimeoPlayer', function() {
  var player,
    playerElement,
    videoElement,
    $document,
    $injector,
    jWindowElement,
    $window;

  // Load module player
  beforeEach(module('ov.player'));

  // Dependencies injections
  beforeEach(inject(function(_$injector_, _$document_, _$window_) {
    $window = _$window_;
    $injector = _$injector_;
    $document = _$document_;
  }));

  // Initializes tests
  beforeEach(function() {
    jWindowElement = angular.element($window);
    playerElement = $document[0].createElement('div');
    videoElement = $document[0].createElement('div');
    videoElement.setAttribute('id', 'player_1');
    $document[0].body.appendChild(videoElement);

    videoElement.contentWindow = {
      postMessage: function() {
      }
    };

    var OvVimeoPlayer = $injector.get('OvVimeoPlayer');
    player = new OvVimeoPlayer(angular.element(playerElement), {
      type: 'vimeo',
      mediaId: ['1'],
      timecodes: {}
    });
    player.initialize();
  });

  // Destroy player after each test
  afterEach(function() {
    $document[0].body.removeChild(videoElement);
    videoElement = null;
    player.destroy();
  });

  it('Should be able to build Vimeo player url', function() {
    assert.equal(player.getMediaSources(), '//player.vimeo.com/video/1?api=1&player_id=player_1');
  });

  it('Should register to Vimeo player events', function(done) {
    var events = [];
    var message = {};

    // Simulate Vimeo player
    videoElement.contentWindow.postMessage = function() {
      events.push({});
      if (events.length === 6)
        done();
    };

    message['event'] = 'ready';
    message['player_id'] = 'player_1';

    jWindowElement.triggerHandler('message', message);
  });

  it('Should be able to play the media', function(done) {
    var message = {};
    player.playing = 0;

    angular.element(playerElement).on('ovPlay', function() {
      done();
    });

    // Simulate Vimeo player
    videoElement.contentWindow.postMessage = function(data) {
      var message = {};
      data = JSON.parse(data);

      if (data.value === 'play') {
        message['event'] = 'play';
        message['player_id'] = 'player_1';
        jWindowElement.triggerHandler('message', message);
      }
    };

    message['event'] = 'ready';
    message['player_id'] = 'player_1';
    jWindowElement.triggerHandler('message', message);
    player.playPause();
  });

  it('Should be able to pause the media', function(done) {
    var message = {};
    player.playing = 1;

    angular.element(playerElement).on('ovPause', function() {
      done();
    });

    // Simulate Vimeo player
    videoElement.contentWindow.postMessage = function(data) {
      var message = {};
      data = JSON.parse(data);

      if (data.value === 'pause') {
        message['event'] = 'pause';
        message['player_id'] = 'player_1';
        jWindowElement.triggerHandler('message', message);
      }
    };

    message['event'] = 'ready';
    message['player_id'] = 'player_1';
    jWindowElement.triggerHandler('message', message);
    player.playPause();
  });

  it('Should be able to change media volume', function(done) {
    var message = {};

    // Simulate Vimeo player
    videoElement.contentWindow.postMessage = function(data) {
      data = JSON.parse(data);

      if (data.method === 'setVolume' && data.value !== 1) {
        assert.equal(data.value, 0.5);
        done();
      }
    };

    message['event'] = 'ready';
    message['player_id'] = 'player_1';
    jWindowElement.triggerHandler('message', message);
    player.setVolume(50);
  });

  it('Should be able to seek to media specific time', function(done) {
    var message = {};

    // Simulate Vimeo player
    videoElement.contentWindow.postMessage = function(data) {
      data = JSON.parse(data);
      if (data.method === 'seekTo') {
        assert.equal(data.value, 50);
        done();
      }
    };

    message['event'] = 'ready';
    message['player_id'] = 'player_1';
    jWindowElement.triggerHandler('message', message);
    player.setTime(50000);
  });

});
