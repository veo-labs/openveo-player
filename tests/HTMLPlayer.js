'use strict';

window.assert = chai.assert;

// HTMLPlayer.js
describe('HTMLPlayer', function() {
  var player,
    videoElement,
    $document,
    $injector;

  // Load module player
  beforeEach(module('ov.player'));

  // Dependencies injections
  beforeEach(inject(function(_$injector_, _$document_) {
    $injector = _$injector_;
    $document = _$document_;
  }));

  // Initializes tests
  beforeEach(function() {
    videoElement = $document[0].createElement('video');
    videoElement.setAttribute('id', 'player_1');
    videoElement.load = function() {
    };
    videoElement.play = function() {
    };
    $document[0].body.appendChild(videoElement);

    var OvHTMLPlayer = $injector.get('OvHTMLPlayer');
    player = new OvHTMLPlayer(angular.element(videoElement), {
      type: 'html',
      mediaId: ['1'],
      timecodes: {},
      sources: [{
        files: [{
          width: 640,
          height: 360,
          link: 'http://video.mp4'
        }, {
          width: 1280,
          height: 720,
          link: 'http://video.mp4'
        }]
      }],
      thumbnail: '/1439286245225/thumbnail.jpg'
    });
    player.initialize();
  });

  // Destroy player after each test
  afterEach(function() {
    player.destroy();
    videoElement = null;
  });

  it('Should be able to get media thumbnail', function() {
    assert.equal(player.getMediaThumbnail(), '/1439286245225/thumbnail.jpg');
  });

  it('Should be able to play the media if paused', function(done) {
    player.player.paused = function() {
      return true;
    };

    player.player.play = function() {
      done();
    };

    player.playPause();
  });

  it('Should be able to play the media if ended', function(done) {
    player.player.paused = function() {
      return false;
    };
    player.player.ended = function() {
      return true;
    };

    player.player.play = function() {
      done();
    };

    player.playPause();
  });

  it('Should be able to pause the media if playing', function(done) {
    player.player.paused = function() {
      return false;
    };

    player.player.pause = function() {
      done();
    };

    player.playPause();
  });

  it('Should be able to set player\'s volume in percent', function() {
    player.player.volume = function(volume) {
      if (volume) this.var = volume;
      else return this.var;
    };
    player.player.volume(0);
    player.setVolume(90);
    assert.equal(player.player.volume(), 0.9);
  });

  it('Should be able to set player\'s current time in milliseconds', function() {
    player.player.currentTime = function(currentTime) {
      if (currentTime) this.var = currentTime;
      else return this.var;
    };
    player.player.currentTime(0);
    player.setTime(1000);
    assert.equal(player.player.currentTime(), 1);
  });

  it('Should order the list of media definitions', function() {
    var definitions = player.getAvailableDefinitions();
    assert.isDefined(definitions);
    assert.equal(definitions[0].width, 1280);
    assert.equal(definitions[1].width, 640);
  });

  it('Should order the list of media sources if adaptive sources are defined', function() {
    player.media.sources[player.getSelectedMediaIndex()].adaptive = [
      {
        link: 'http://manifest.mpd',
        mimeType: 'application/dash+xml'
      },
      {
        link: 'http://playlist.m3u8',
        mimeType: 'application/x-mpegURL'
      }
    ];
    var definitions = player.getAvailableDefinitions();
    assert.isNull(definitions);
  });

});
