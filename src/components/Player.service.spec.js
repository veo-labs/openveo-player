'use strict';

window.assert = chai.assert;

describe('PlayerService', function() {
  var playerService;
  var media;

  // Load player module
  beforeEach(module('ov.player'));

  // Dependencies injections
  beforeEach(inject(function(_oplPlayerService_) {
    playerService = new _oplPlayerService_();
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
          value: 240
        },
        {
          value: 1860
        },
        {
          value: 2100
        },
        {
          value: 5400
        }
      ],
      tags: [
        {
          value: 240
        },
        {
          value: 1860
        },
        {
          value: 2100
        },
        {
          value: 5400
        }
      ],
      cut: [
        {
          type: 'begin',
          value: 0
        },
        {
          type: 'end',
          value: 6000
        }
      ]
    };
    playerService.setMedia(media);
    playerService.setRealMediaDuration(6000);
  });

  it('should be able to get only timecodes according to the cut edges', function() {

    // Cut start - end
    media.cut[0].value = 0;
    media.cut[1].value = 6000;
    playerService.setMedia(media);
    var timecodes = playerService.getMediaTimecodes();
    assert.lengthOf(
      timecodes,
      2,
      'Wrong number of timecodes for "' + media.cut[0].value + '" - ' + media.cut[1].value
    );

    // Cut half - end
    media.cut[0].value = 3000;
    media.cut[1].value = 6000;
    playerService.setMedia(media);
    timecodes = playerService.getMediaTimecodes();
    assert.lengthOf(
      timecodes,
      2,
      'Wrong number of timecodes for "' + media.cut[0].value + '" - ' + media.cut[1].value
    );

    // Cut from the second slide to the end
    media.cut[0].value = 5000;
    media.cut[1].value = 6000;
    playerService.setMedia(media);
    timecodes = playerService.getMediaTimecodes();
    assert.lengthOf(
      timecodes,
      1,
      'Wrong number of timecodes for "' + media.cut[0].value + '" - ' + media.cut[1].value
    );

    // Cut after the second slide to the end
    media.cut[0].value = 5500;
    media.cut[1].value = 6000;
    playerService.setMedia(media);
    timecodes = playerService.getMediaTimecodes();
    assert.lengthOf(
      timecodes,
      1,
      'Wrong number of timecodes for "' + media.cut[0].value + '" - ' + media.cut[1].value
    );

    // No cut
    media.cut = [];
    playerService.setMedia(media);
    timecodes = playerService.getMediaTimecodes();
    assert.lengthOf(timecodes, 3, 'Wrong number of timecodes without cut');

  });

  it('should be able to order timecodes by time', function() {
    var timecodes = playerService.getMediaTimecodesByTime();
    var times = Object.keys(timecodes);

    assert.isObject(timecodes, 'Expected timecodes to be ordered by time');
    assert.lengthOf(times, 2, 'Wrong number of timecodes');
  });

  it('should be able to get only chapters according to the cut edges', function() {

    // Cut start - end
    media.cut[0].value = 0;
    media.cut[1].value = 6000;
    playerService.setMedia(media);
    var chapters = playerService.getMediaPointsOfInterest('chapters');
    assert.lengthOf(
      chapters,
      4,
      'Wrong number of chapters for "' + media.cut[0].value + ' - ' + media.cut[1].value + '"'
    );

    // Cut half - end
    media.cut[0].value = 3000;
    media.cut[1].value = 6000;
    playerService.setMedia(media);
    chapters = playerService.getMediaPointsOfInterest('chapters');
    assert.lengthOf(
      chapters,
      1,
      'Wrong number of chapters for "' + media.cut[0].value + ' - ' + media.cut[1].value + '"'
    );

    // No cut
    media.cut = [];
    playerService.setMedia(media);
    chapters = playerService.getMediaPointsOfInterest('chapters');
    assert.lengthOf(
      chapters,
      4,
      'Wrong number of chapters without cut'
    );
  });

  it('should be able to get only tags according to the cut edges', function() {

    // Cut start - end
    media.cut[0].value = 0;
    media.cut[1].value = 6000;
    playerService.setMedia(media);
    var tags = playerService.getMediaPointsOfInterest('tags');
    assert.lengthOf(
      tags,
      4,
      'Wrong number of tags for "' + media.cut[0].value + ' - ' + media.cut[1].value + '"'
    );

    // Cut half - end
    media.cut[0].value = 3000;
    media.cut[1].value = 6000;
    playerService.setMedia(media);
    tags = playerService.getMediaPointsOfInterest('tags');
    assert.lengthOf(
      tags,
      1,
      'Wrong number of chaptertags for "' + media.cut[0].value + ' - ' + media.cut[1].value + '"'
    );

    // No cut
    media.cut = [];
    playerService.setMedia(media);
    tags = playerService.getMediaPointsOfInterest('tags');
    assert.lengthOf(tags, 4, 'Wrong number of tags without cut');
  });

  it('should be able to get media duration according to cut edges', function() {

    // Cut start - end
    var duration = playerService.getCutDuration();
    assert.equal(duration, 6000);

    // Cut half - end
    media.cut[0].value = 3000;
    media.cut[1].value = 6000;
    playerService.setMedia(media);
    duration = playerService.getCutDuration();
    assert.equal(duration, 3000);

    // Cut 1.2s - 2.4s
    media.cut[0].value = 1200;
    media.cut[1].value = 2400;
    playerService.setMedia(media);
    duration = playerService.getCutDuration();
    assert.equal(duration, 1200);

    // No cut
    media.cut = [];
    playerService.setMedia(media);
    duration = playerService.getCutDuration();
    assert.equal(duration, 6000);

  });

  it('should be able to transform a percentage relative to the full media to a percentage relative to the cut media',
    function() {

      // Cut 1.2s - 2.4s
      media.cut[0].value = 1200;
      media.cut[1].value = 2400;
      playerService.setMedia(media);

      assert.equal(playerService.getCutPercent(50), 100);
      assert.equal(playerService.getCutPercent(35), 75);
      assert.equal(playerService.getCutPercent(20), 0);

    });

  it('should be able to transform a time relative to the cut media to a time relative to the full media', function() {

    // Cut 1.2s - 2.4s
    media.cut[0].value = 1200;
    media.cut[1].value = 2400;
    playerService.setMedia(media);

    assert.equal(playerService.getRealTime(0), 1200);
    assert.equal(playerService.getRealTime(5000), 6200);

  });

  it('should be able to transform a time relative to the full media to a time relative to the cut media', function() {

    // Cut 1.2s - 2.4s
    media.cut[0].value = 1200;
    media.cut[1].value = 2400;
    playerService.setMedia(media);

    assert.equal(playerService.getCutTime(1200), 0);
    assert.equal(playerService.getCutTime(6200), 5000);

  });

});
