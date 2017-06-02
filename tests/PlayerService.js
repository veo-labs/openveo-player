'use strict';

window.assert = chai.assert;

// PlayerService.js
describe('PlayerService', function() {

  var playerService,
    media;

  // Load player application
  beforeEach(module('ov.player'));

  // Dependencies injections
  beforeEach(inject(function(_ovPlayerService_) {
    playerService = new _ovPlayerService_();
  }));

  // Prepare tests
  beforeEach(function() {
    media = {
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
      ],
      chapters: [
        {
          value: 0.04
        },
        {
          value: 0.31
        },
        {
          value: 0.35
        },
        {
          value: 0.9
        }
      ],
      tags: [
        {
          value: 0.04
        },
        {
          value: 0.31
        },
        {
          value: 0.35
        },
        {
          value: 0.9
        }
      ],
      cut: [
        {
          type: 'begin',
          value: 0
        },
        {
          type: 'end',
          value: 1
        }
      ]
    };
    playerService.setMedia(media);
    playerService.setRealMediaDuration(6000);
  });

  it('Should be able to get only timecodes according to the cut edges', function() {

    // Cut 0 - 1
    media.cut[0].value = 0;
    media.cut[1].value = 1;
    playerService.setMedia(media);
    var timecodes = playerService.getMediaTimecodes();
    assert.isArray(timecodes);
    assert.equal(timecodes.length, 2);

    // Cut 0.5 - 1
    media.cut[0].value = 0.5;
    media.cut[1].value = 1;
    playerService.setMedia(media);
    timecodes = playerService.getMediaTimecodes();
    assert.isArray(timecodes);
    assert.equal(timecodes.length, 1);

    // No cut
    media.cut = null;
    playerService.setMedia(media);
    timecodes = playerService.getMediaTimecodes();
    assert.isArray(timecodes);
    assert.equal(timecodes.length, 3);

  });

  it('Should be able to order timecodes by time', function() {
    var timecodes = playerService.getMediaTimecodesByTime();
    var times = Object.keys(timecodes);

    assert.isObject(timecodes);
    assert.equal(times.length, 2);
  });

  it('Should be able to get only chapters according to the cut edges', function() {

    // Cut 0 - 1
    media.cut[0].value = 0;
    media.cut[1].value = 1;
    playerService.setMedia(media);
    var chapters = playerService.getMediaPointsOfInterest('chapters');
    assert.isArray(chapters);
    assert.equal(chapters.length, 4);

    // Cut 0.5 - 1
    media.cut[0].value = 0.5;
    media.cut[1].value = 1;
    playerService.setMedia(media);
    chapters = playerService.getMediaPointsOfInterest('chapters');
    assert.isArray(chapters);
    assert.equal(chapters.length, 1);

    // No cut
    media.cut = null;
    playerService.setMedia(media);
    chapters = playerService.getMediaPointsOfInterest('chapters');
    assert.isArray(chapters);
    assert.equal(chapters.length, 4);
  });

  it('Should be able to get only tags according to the cut edges', function() {

    // Cut 0 - 1
    media.cut[0].value = 0;
    media.cut[1].value = 1;
    playerService.setMedia(media);
    var chapters = playerService.getMediaPointsOfInterest('tags');
    assert.isArray(chapters);
    assert.equal(chapters.length, 4);

    // Cut 0.5 - 1
    media.cut[0].value = 0.5;
    media.cut[1].value = 1;
    playerService.setMedia(media);
    chapters = playerService.getMediaPointsOfInterest('tags');
    assert.isArray(chapters);
    assert.equal(chapters.length, 1);

    // No cut
    media.cut = null;
    playerService.setMedia(media);
    chapters = playerService.getMediaPointsOfInterest('tags');
    assert.isArray(chapters);
    assert.equal(chapters.length, 4);
  });

  it('Should be able to get media duration according to cut edges', function() {

    // Cut 0 - 1
    var duration = playerService.getCutDuration();
    assert.equal(duration, 6000);

    // Cut 0.5 - 1
    media.cut[0].value = 0.5;
    media.cut[1].value = 1;
    playerService.setMedia(media);
    duration = playerService.getCutDuration();
    assert.equal(duration, 3000);

    // Cut 0.2 - 0.4
    media.cut[0].value = 0.2;
    media.cut[1].value = 0.4;
    playerService.setMedia(media);
    duration = playerService.getCutDuration();
    assert.equal(duration, 1200);

    // No cut
    media.cut = null;
    playerService.setMedia(media);
    duration = playerService.getCutDuration();
    assert.equal(duration, 6000);

  });

  it('Should be able to transform a percentage relative to the full media to a percentage relative to the cut media',
    function() {

      // Cut 0.2 - 0.4
      media.cut[0].value = 0.2;
      media.cut[1].value = 0.4;
      playerService.setMedia(media);

      assert.equal(playerService.getCutPercent(50), 100);
      assert.equal(playerService.getCutPercent(35), 75);
      assert.equal(playerService.getCutPercent(20), 0);

    });

  it('Should be able to get the cut edges relative to the full media', function() {

    // Cut 0.2 - 0.4
    media.cut[0].value = 0.2;
    media.cut[1].value = 0.4;
    playerService.setMedia(media);

    assert.equal(playerService.getRealCutStart(), 1200);
    assert.equal(playerService.getRealCutEnd(), 2400);

  });

  it('Should be able to transform a time relative to the cut media to a time relative to the full media', function() {

    // Cut 0.2 - 0.4
    media.cut[0].value = 0.2;
    media.cut[1].value = 0.4;
    playerService.setMedia(media);

    assert.equal(playerService.getRealTime(0), 1200);
    assert.equal(playerService.getRealTime(5000), 6200);

  });

  it('Should be able to transform a time relative to the full media to a time relative to the cut media', function() {

    // Cut 0.2 - 0.4
    media.cut[0].value = 0.2;
    media.cut[1].value = 0.4;
    playerService.setMedia(media);

    assert.equal(playerService.getCutTime(1200), 0);
    assert.equal(playerService.getCutTime(6200), 5000);

  });

});
