'use strict';

window.assert = chai.assert;

describe('VimeoPlayer', function() {
  var player;
  var playerElement;
  var videoElement;
  var $document;
  var $injector;
  var jWindowElement;
  var $window;
  var mediaId;
  var playerId;

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
    mediaId = '42';
    playerId = 'player_id_42';
    jWindowElement = angular.element($window);
    playerElement = $document[0].createElement('div');
    videoElement = $document[0].createElement('div');
    videoElement.setAttribute('id', playerId);
    $document[0].body.appendChild(videoElement);

    videoElement.contentWindow = {
      postMessage: function() {
      }
    };

    var OvVimeoPlayer = $injector.get('OplVimeoPlayer');
    player = new OvVimeoPlayer(angular.element(playerElement), {
      type: 'vimeo',
      mediaId: [mediaId],
      timecodes: {}
    }, playerId);
    player.initialize();
  });

  // Destroy player after each test
  afterEach(function() {
    $document[0].body.removeChild(videoElement);
    videoElement = null;
    player.destroy();
  });

  it('should be able to build Vimeo player url', function() {
    assert.equal(
      player.getSourceUrl().valueOf(),
      '//player.vimeo.com/video/' + mediaId + '?api=1&player_id=' + playerId
    );
  });

  it('should register to Vimeo player events', function(done) {
    var events = [];
    var message = {};

    // Simulate Vimeo player
    videoElement.contentWindow.postMessage = function() {
      events.push({});
      if (events.length === 6)
        done();
    };

    message['event'] = 'ready';
    message['player_id'] = playerId;

    jWindowElement.triggerHandler('message', message);
  });

  it('should be able to play the media', function(done) {
    var message = {};
    player.playing = 0;

    angular.element(playerElement).on('oplPlay', function() {
      done();
    });

    // Simulate Vimeo player
    videoElement.contentWindow.postMessage = function(data) {
      var message = {};
      data = JSON.parse(data);

      if (data.value === 'play') {
        message['event'] = 'play';
        message['player_id'] = playerId;
        jWindowElement.triggerHandler('message', message);
      }
    };

    message['event'] = 'ready';
    message['player_id'] = playerId;
    jWindowElement.triggerHandler('message', message);
    player.playPause();
  });

  it('should be able to pause the media', function(done) {
    var message = {};
    player.playing = 1;

    angular.element(playerElement).on('oplPause', function() {
      done();
    });

    // Simulate Vimeo player
    videoElement.contentWindow.postMessage = function(data) {
      var message = {};
      data = JSON.parse(data);

      if (data.value === 'pause') {
        message['event'] = 'pause';
        message['player_id'] = playerId;
        jWindowElement.triggerHandler('message', message);
      }
    };

    message['event'] = 'ready';
    message['player_id'] = playerId;
    jWindowElement.triggerHandler('message', message);
    player.playPause();
  });

  it('should be able to change media volume', function(done) {
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
    message['player_id'] = playerId;
    jWindowElement.triggerHandler('message', message);
    player.setVolume(50);
  });

  it('should be able to seek to media specific time', function(done) {
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
    message['player_id'] = playerId;
    jWindowElement.triggerHandler('message', message);
    player.setTime(50000);
  });

});
