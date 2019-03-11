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

  describe('setMedia', function() {

    it('should sort points of interest', function() {
      media = {
        timecodes: [
          {
            timecode: 5000,
            image: {
              small: 'small2',
              large: 'large2'
            }
          },
          {
            timecode: 10,
            image: {
              small: 'small',
              large: 'large'
            }
          }
        ],
        chapters: [
          {
            value: 1860
          },
          {
            value: 240
          }
        ],
        tags: [
          {
            value: 1860
          },
          {
            value: 240
          }
        ]
      };
      playerService.setMedia(media);
      var i = 0;

      for (i = 0; i < media.timecodes.length; i++) {
        if (i > 0) {
          assert.isAtLeast(
            media.timecodes[i].timecode,
            media.timecodes[i - 1].timecode,
            'Expected timecodes to be sorted'
          );
        }
      }

      for (i = 0; i < media.chapters.length; i++) {
        if (i > 0) {
          assert.isAtLeast(
            media.chapters[i].value,
            media.chapters[i - 1].value,
            'Expected chapters to be sorted'
          );
        }
      }

      for (i = 0; i < media.tags.length; i++) {
        if (i > 0) {
          assert.isAtLeast(
            media.tags[i].value,
            media.tags[i - 1].value,
            'Expected tags to be sorted'
          );
        }
      }
    });

    it('should deactivate cuts if not cuts defined', function() {
      media = {};
      playerService.setMedia(media);
      assert.notOk(playerService.cutsActivated, 'Expected cuts to be deactivated');
      assert.equal(playerService.cutStart, 0, 'Unexpected start cut');
      assert.isNull(playerService.cutEnd, 'Unexpected end cut');
    });

    it('should activate cuts if cuts defined', function() {
      var expectedStartCut = 42000;
      var expectedEndCut = 43000;
      media = {
        cut: [
          {
            type: 'begin',
            value: expectedStartCut
          },
          {
            type: 'end',
            value: expectedEndCut
          }
        ]
      };
      playerService.setMedia(media);
      assert.ok(playerService.cutsActivated, 'Expected cuts to be activated');
      assert.equal(playerService.cutStart, expectedStartCut, 'Wrong start cut');
      assert.equal(playerService.cutEnd, expectedEndCut, 'Wrong end cut');
    });

    it('should be able to find begin and end cuts if not ordered', function() {
      var expectedStartCut = 42000;
      var expectedEndCut = 43000;
      media = {
        cut: [
          {
            type: 'end',
            value: expectedEndCut
          },
          {
            type: 'begin',
            value: expectedStartCut
          }
        ]
      };
      playerService.setMedia(media);
      assert.ok(playerService.cutsActivated, 'Expected cuts to be activated');
      assert.equal(playerService.cutStart, expectedStartCut, 'Wrong start cut');
      assert.equal(playerService.cutEnd, expectedEndCut, 'Wrong end cut');
    });

    it('should set start cut to 0 if defined as negative', function() {
      media = {
        cut: [
          {
            type: 'begin',
            value: -1
          }
        ]
      };
      playerService.setMedia(media);
      assert.ok(playerService.cutsActivated, 'Expected cuts to be activated');
      assert.equal(playerService.cutStart, 0, 'Wrong start cut');
    });

    it('should remove cuts if defined cut start if greater than cut end', function() {
      media = {
        cut: [
          {
            type: 'begin',
            value: 43000
          },
          {
            type: 'end',
            value: 42000
          }
        ]
      };
      playerService.setMedia(media);
      assert.ok(playerService.cutsActivated, 'Expected cuts to be activated');
      assert.equal(playerService.cutStart, 0, 'Wrong start cut');
      assert.isNull(playerService.cutEnd, 'Unexpected end cut');
    });

    it('should throw an Exception if media is not specified', function() {
      assert.throws(function() {
        playerService.setMedia();
      });
    });

  });

  describe('getMediaTimecodesByTime', function() {

    it('should be able to order timecodes by time', function() {
      var values = [42000, 43000];
      media = {
        timecodes: []
      };
      values.forEach(function(value) {
        media.timecodes.push({
          timecode: value,
          image: {
            small: 'small' + value,
            large: 'large' + value
          }
        });
      });

      playerService.setMedia(media);
      var timecodes = playerService.getMediaTimecodesByTime();

      values.forEach(function(value) {
        assert.equal(
          timecodes[value].image.small,
          'small' + value,
          'Wrong timecode small image URL for value ' + value
        );
        assert.equal(
          timecodes[value].image.large,
          'large' + value,
          'Wrong timecode large image URL for value ' + value
        );
      });
    });

    it('should exclude timecodes outside the cut range', function() {
      media = {
        timecodes: [
          {
            timecode: 44000,
            image: {
              small: 'smallOutside',
              large: 'largeOutside'
            }
          }
        ],
        cut: [
          {
            type: 'begin',
            value: 42000
          },
          {
            type: 'end',
            value: 43000
          }
        ]
      };

      playerService.setMedia(media);
      playerService.setRealDuration(60000);

      var timecodes = playerService.getMediaTimecodesByTime();
      var keys = Object.keys(timecodes);

      assert.lengthOf(keys, 0, 'Unexpected timecodes');
    });

    it('should keep timecode right before the cut start and set its value to 0', function() {
      media = {
        timecodes: [
          {
            timecode: 40000,
            image: {
              small: 'smallOutside1',
              large: 'largeOutside1'
            }
          },
          {
            timecode: 41000,
            image: {
              small: 'smallOutside2',
              large: 'largeOutside2'
            }
          }
        ],
        cut: [
          {
            type: 'begin',
            value: 42000
          },
          {
            type: 'end',
            value: 43000
          }
        ]
      };

      playerService.setMedia(media);
      playerService.setRealDuration(60000);

      var timecodes = playerService.getMediaTimecodesByTime();

      assert.equal(Object.keys(timecodes)[0], 0, 'Wrong value');
      assert.equal(media.timecodes[1].image.small, timecodes[0].image.small, 'Wrong small image URL');
      assert.equal(media.timecodes[1].image.large, timecodes[0].image.large, 'Wrong large image URL');
    });

    it('should return an empty object if no timecodes', function() {
      media = {
        timecodes: []
      };

      playerService.setMedia(media);
      var timecodes = playerService.getMediaTimecodesByTime();

      assert.lengthOf(Object.keys(timecodes), 0, 'Unexpected timecodes');
    });

  });

  describe('getMediaPointsOfInterest', function() {

    it('should return all points of interest if cuts are defined but deactivated', function() {
      media = {
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
          }
        ],
        chapters: [
          {
            value: 10
          },
          {
            value: 5000
          }
        ],
        tags: [
          {
            value: 10
          },
          {
            value: 5000
          }
        ],
        cut: [
          {
            type: 'begin',
            value: 0
          },
          {
            type: 'end',
            value: 20
          }
        ]
      };
      playerService.setRealDuration(10000);
      playerService.setMedia(media);
      playerService.setCutsStatus(false);

      var timecodes = playerService.getMediaPointsOfInterest('timecodes');
      var chapters = playerService.getMediaPointsOfInterest('chapters');
      var tags = playerService.getMediaPointsOfInterest('tags');

      assert.lengthOf(timecodes, media.timecodes.length, 'Wrong timecodes');
      assert.notStrictEqual(timecodes, media.timecodes, 'Expected timecodes to be a copy');
      assert.lengthOf(chapters, media.chapters.length, 'Wrong chapters');
      assert.notStrictEqual(chapters, media.chapters, 'Expected chapters to be a copy');
      assert.lengthOf(tags, media.tags.length, 'Wrong tags');
      assert.notStrictEqual(tags, media.tags, 'Expected tags to be a copy');
    });

    it('should return all points of interest if duration is not set', function() {
      media = {
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
          }
        ],
        chapters: [
          {
            value: 10
          },
          {
            value: 5000
          }
        ],
        tags: [
          {
            value: 10
          },
          {
            value: 5000
          }
        ],
        cut: [
          {
            type: 'begin',
            value: 0
          },
          {
            type: 'end',
            value: 20
          }
        ]
      };
      playerService.setRealDuration(0);
      playerService.setMedia(media);

      var timecodes = playerService.getMediaPointsOfInterest('timecodes');
      var chapters = playerService.getMediaPointsOfInterest('chapters');
      var tags = playerService.getMediaPointsOfInterest('tags');

      assert.lengthOf(timecodes, media.timecodes.length, 'Wrong timecodes');
      assert.lengthOf(chapters, media.chapters.length, 'Wrong chapters');
      assert.lengthOf(tags, media.tags.length, 'Wrong tags');
    });

    it('should return an empty array if no points of interest', function() {
      media = {
        cut: [
          {
            type: 'begin',
            value: 0
          },
          {
            type: 'end',
            value: 20
          }
        ]
      };
      playerService.setRealDuration(10000);
      playerService.setMedia(media);

      var timecodes = playerService.getMediaPointsOfInterest('timecodes');
      var chapters = playerService.getMediaPointsOfInterest('chapters');
      var tags = playerService.getMediaPointsOfInterest('tags');

      assert.lengthOf(timecodes, 0, 'Unexpected timecodes');
      assert.lengthOf(chapters, 0, 'Unexpected chapters');
      assert.lengthOf(tags, 0, 'Unexpected tags');
    });

    it('should return an empty array if specified property does not correspond to a valid type', function() {
      media = {
        tags: [
          {
            value: 10
          },
          {
            value: 5000
          }
        ],
        cut: [
          {
            type: 'begin',
            value: 0
          },
          {
            type: 'end',
            value: 20
          }
        ]
      };
      playerService.setRealDuration(10000);
      playerService.setMedia(media);

      var unknownPointsOfInterest = playerService.getMediaPointsOfInterest('unknown');

      assert.lengthOf(unknownPointsOfInterest, 0, 'Unexpected points of interest');
    });

    it('should set points of interest values relative to cuts', function() {
      media = {
        timecodes: [
          {
            timecode: 15,
            image: {
              small: 'small',
              large: 'large'
            }
          }
        ],
        chapters: [
          {
            value: 15
          }
        ],
        tags: [
          {
            value: 15
          }
        ],
        cut: [
          {
            type: 'begin',
            value: 10
          },
          {
            type: 'end',
            value: 20
          }
        ]
      };
      playerService.setRealDuration(10000);
      playerService.setMedia(media);

      var timecodes = playerService.getMediaPointsOfInterest('timecodes');
      var chapters = playerService.getMediaPointsOfInterest('chapters');
      var tags = playerService.getMediaPointsOfInterest('tags');

      assert.equal(timecodes[0].timecode, 5, 'Wrong timecode value');
      assert.equal(chapters[0].value, 5, 'Wrong chapter value');
      assert.equal(tags[0].value, 5, 'Wrong tag value');
    });

    it('should include the point of interest right before the cut start and set its value to 0', function() {
      media = {
        timecodes: [
          {
            timecode: 5,
            image: {
              small: 'small',
              large: 'large'
            }
          }
        ],
        chapters: [
          {
            value: 5
          }
        ],
        tags: [
          {
            value: 5
          }
        ],
        cut: [
          {
            type: 'begin',
            value: 10
          },
          {
            type: 'end',
            value: 20
          }
        ]
      };
      playerService.setRealDuration(10000);
      playerService.setMedia(media);

      var timecodes = playerService.getMediaPointsOfInterest('timecodes');
      var chapters = playerService.getMediaPointsOfInterest('chapters');
      var tags = playerService.getMediaPointsOfInterest('tags');

      assert.equal(timecodes[0].timecode, 0, 'Wrong timecode value');
      assert.equal(chapters[0].value, 0, 'Wrong chapter value');
      assert.equal(tags[0].value, 0, 'Wrong tag value');
    });

    it('should exclude points of interest outside of cuts range', function() {
      media = {
        timecodes: [
          {
            timecode: 5,
            image: {
              small: 'small',
              large: 'large'
            }
          },
          {
            timecode: 9,
            image: {
              small: 'small2',
              large: 'large2'
            }
          },
          {
            timecode: 21,
            image: {
              small: 'small3',
              large: 'large3'
            }
          }
        ],
        chapters: [
          {
            value: 5
          },
          {
            value: 9
          },
          {
            value: 21
          }
        ],
        tags: [
          {
            value: 5
          },
          {
            value: 9
          },
          {
            value: 21
          }
        ],
        cut: [
          {
            type: 'begin',
            value: 10
          },
          {
            type: 'end',
            value: 20
          }
        ]
      };
      playerService.setRealDuration(10000);
      playerService.setMedia(media);

      var timecodes = playerService.getMediaPointsOfInterest('timecodes');
      var chapters = playerService.getMediaPointsOfInterest('chapters');
      var tags = playerService.getMediaPointsOfInterest('tags');

      assert.equal(timecodes[0].timecode, 0, 'Wrong timecode value');
      assert.equal(chapters[0].value, 0, 'Wrong chapter value');
      assert.equal(tags[0].value, 0, 'Wrong tag value');
    });

  });

  describe('getCutStart', function() {

    it('should return the cut start', function() {
      media = {
        cut: [
          {
            type: 'begin',
            value: 10
          }
        ]
      };
      playerService.setMedia(media);

      assert.equal(playerService.getCutStart(), media.cut[0].value, 'Wrong start cut');
    });

    it('should return 0 if cuts are deactivated', function() {
      media = {
        cut: [
          {
            type: 'begin',
            value: 10
          }
        ]
      };
      playerService.setMedia(media);
      playerService.setCutsStatus(false);

      assert.equal(playerService.getCutStart(), 0, 'Wrong start cut');
    });

    it('should return 0 if no start cut', function() {
      media = {};
      playerService.setMedia(media);

      assert.equal(playerService.getCutStart(), 0, 'Wrong start cut');
    });

  });

  describe('getCutEnd', function() {

    it('should return the cut end', function() {
      media = {
        cut: [
          {
            type: 'end',
            value: 10
          }
        ]
      };
      playerService.setMedia(media);

      assert.equal(playerService.getCutEnd(), media.cut[0].value, 'Wrong end cut');
    });

    it('should return 0 if cuts are deactivated', function() {
      media = {
        cut: [
          {
            type: 'end',
            value: 10
          }
        ]
      };
      playerService.setMedia(media);
      playerService.setCutsStatus(false);

      assert.equal(playerService.getCutEnd(), 0, 'Wrong end cut');
    });

    it('should return real duration if end cut is not defined', function() {
      media = {};
      playerService.setMedia(media);
      playerService.setRealDuration(false);

      assert.equal(playerService.getCutEnd(), 0, 'Wrong end cut');
    });

    it('should return 0 if no end cut', function() {
      media = {};
      playerService.setMedia(media);

      assert.equal(playerService.getCutEnd(), 0, 'Wrong end cut');
    });

  });

  describe('getRealTime', function() {

    it('should return the time relative to the full media', function() {
      media = {
        cut: [
          {
            type: 'begin',
            value: 10
          }
        ]
      };
      playerService.setMedia(media);

      assert.equal(playerService.getRealTime(0), 10);
      assert.equal(playerService.getRealTime(40), 50);
    });

    it('should return the given time if cuts are deactivated', function() {
      media = {
        cut: [
          {
            type: 'begin',
            value: 10
          }
        ]
      };
      playerService.setMedia(media);
      playerService.setCutsStatus(false);

      assert.equal(playerService.getRealTime(0), 0);
      assert.equal(playerService.getRealTime(40), 40);
    });

  });

  describe('getCutTime', function() {

    it('should return given time relative to the full media', function() {
      media = {
        cut: [
          {
            type: 'begin',
            value: 10
          }
        ]
      };
      playerService.setMedia(media);

      assert.equal(playerService.getCutTime(0), 0);
      assert.equal(playerService.getCutTime(10), 0);
      assert.equal(playerService.getCutTime(30), 20);
    });

    it('should return 0 if specified time is below the start cut', function() {
      media = {
        cut: [
          {
            type: 'begin',
            value: 10
          }
        ]
      };
      playerService.setMedia(media);

      assert.equal(playerService.getCutTime(8), 0);
    });

  });

  describe('getCutDuration', function() {

    it('should be able to get media duration according to cut edges', function() {
      media = {
        cut: [
          {
            type: 'begin',
            value: 10
          },
          {
            type: 'end',
            value: 40
          }
        ]
      };
      playerService.setMedia(media);
      playerService.setRealDuration(1000);

      assert.equal(playerService.getCutDuration(), 30, 'Wrong cut duration');
    });

    it('should return the media duration according to cut edges', function() {
      media = {
        cut: [
          {
            type: 'begin',
            value: 10
          },
          {
            type: 'end',
            value: 40
          }
        ]
      };
      playerService.setMedia(media);
      playerService.setRealDuration(1000);

      assert.equal(playerService.getCutDuration(), 30, 'Wrong cut duration');
    });

    it('should return 0 if real media duration is not defined', function() {
      media = {
        cut: [
          {
            type: 'begin',
            value: 10
          },
          {
            type: 'end',
            value: 40
          }
        ]
      };
      playerService.setMedia(media);
      playerService.setRealDuration(0);

      assert.equal(playerService.getCutDuration(), 0, 'Wrong cut duration');
    });

  });

  describe('getCutPercent', function() {

    it('should return the percentage relative to the cut media for the given percentage', function() {
      media = {
        cut: [
          {
            type: 'begin',
            value: 100
          },
          {
            type: 'end',
            value: 800
          }
        ]
      };
      playerService.setMedia(media);
      playerService.setRealDuration(1000);

      assert.equal(playerService.getCutPercent(50), ((500 - 100) / 700) * 100, 'Wrong percentage');
    });

    it('should return 100 if percentage exceeds 100', function() {
      media = {
        cut: [
          {
            type: 'begin',
            value: 100
          },
          {
            type: 'end',
            value: 200
          }
        ]
      };
      playerService.setMedia(media);
      playerService.setRealDuration(1000);

      assert.equal(playerService.getCutPercent(50), 100, 'Wrong percentage');
    });

    it('should return 0 if percentage is below 0', function() {
      media = {
        cut: [
          {
            type: 'begin',
            value: 100
          },
          {
            type: 'end',
            value: 200
          }
        ]
      };
      playerService.setMedia(media);
      playerService.setRealDuration(1000);

      assert.equal(playerService.getCutPercent(5), 0, 'Wrong percentage');
    });

    it('should return the given time if real duration is not defined', function() {
      media = {
        cut: [
          {
            type: 'begin',
            value: 100
          },
          {
            type: 'end',
            value: 200
          }
        ]
      };
      playerService.setMedia(media);
      playerService.setRealDuration(0);

      assert.equal(playerService.getCutPercent(50), 50, 'Wrong percentage');
    });

  });

  describe('getCutDurationPercent', function() {

    it('should return a percentage relative to the cut media', function() {
      media = {
        cut: [
          {
            type: 'begin',
            value: 100
          },
          {
            type: 'end',
            value: 400
          }
        ]
      };
      playerService.setMedia(media);
      playerService.setRealDuration(1000);

      assert.equal(playerService.getCutDurationPercent(15), 50, 'Wrong percentage');
    });

    it('should return the duration as is if real duration is not defined', function() {
      media = {
        cut: [
          {
            type: 'begin',
            value: 100
          },
          {
            type: 'end',
            value: 400
          }
        ]
      };
      playerService.setMedia(media);
      playerService.setRealDuration(0);

      assert.equal(playerService.getCutDurationPercent(15), 15, 'Wrong percentage');
    });

    it('should return 100 if percentage exceeds 100', function() {
      media = {
        cut: [
          {
            type: 'begin',
            value: 100
          },
          {
            type: 'end',
            value: 400
          }
        ]
      };
      playerService.setMedia(media);
      playerService.setRealDuration(1000);

      assert.equal(playerService.getCutDurationPercent(50), 100, 'Wrong percentage');
    });

  });

  describe('setRealDuration', function() {

    it('should reset cuts if start cut is greater or equal to the duration', function() {
      media = {
        cut: [
          {
            type: 'begin',
            value: 100
          },
          {
            type: 'end',
            value: 400
          }
        ]
      };
      playerService.setMedia(media);
      playerService.setRealDuration(20);

      assert.equal(playerService.getCutStart(), 0, 'Wrong start cut');
      assert.equal(playerService.getRealDuration(), 20, 'Wrong duration');
    });

  });

  describe('getDuration', function() {

    it('should return the cut duration', function() {
      media = {
        cut: [
          {
            type: 'begin',
            value: 100
          },
          {
            type: 'end',
            value: 300
          }
        ]
      };
      playerService.setMedia(media);
      playerService.setRealDuration(1000);

      assert.equal(playerService.getDuration(), 200, 'Wrong duration');
    });

    it('should return the real media duration if cuts are deactivated', function() {
      media = {
        cut: [
          {
            type: 'begin',
            value: 100
          },
          {
            type: 'end',
            value: 300
          }
        ]
      };
      playerService.setMedia(media);
      playerService.setRealDuration(1000);
      playerService.setCutsStatus(false);

      assert.equal(playerService.getDuration(), 1000, 'Wrong duration');
    });

  });

  describe('getTime', function() {

    it('should return the time relative to the cut media', function() {
      media = {
        cut: [
          {
            type: 'begin',
            value: 100
          },
          {
            type: 'end',
            value: 300
          }
        ]
      };
      playerService.setMedia(media);
      playerService.setRealDuration(1000);

      assert.equal(playerService.getTime(200), 100, 'Wrong time');
    });

    it('should return the given time if cuts are deactivated', function() {
      media = {
        cut: [
          {
            type: 'begin',
            value: 100
          },
          {
            type: 'end',
            value: 300
          }
        ]
      };
      playerService.setMedia(media);
      playerService.setRealDuration(1000);
      playerService.setCutsStatus(false);

      assert.equal(playerService.getTime(200), 200, 'Wrong time');
    });
  });

  describe('getPercent', function() {

    it('should return the percentage corresponding to the given time relative to cut media', function() {
      media = {
        cut: [
          {
            type: 'begin',
            value: 100
          },
          {
            type: 'end',
            value: 600
          }
        ]
      };
      playerService.setMedia(media);
      playerService.setRealDuration(1000);

      assert.equal(playerService.getPercent(500), ((500 - 100) / 500) * 100, 'Wrong percentage');
    });

    it('should return percentage of the full media if cuts are deactivated', function() {
      media = {
        cut: [
          {
            type: 'begin',
            value: 100
          },
          {
            type: 'end',
            value: 600
          }
        ]
      };
      playerService.setMedia(media);
      playerService.setRealDuration(1000);
      playerService.setCutsStatus(false);

      assert.equal(playerService.getPercent(500), 50, 'Wrong percentage');
    });

  });

  describe('getTimeFromPercent', function() {

    it('should return the time corresponding to the given percentage relative to cut media', function() {
      media = {
        cut: [
          {
            type: 'begin',
            value: 100
          },
          {
            type: 'end',
            value: 600
          }
        ]
      };
      playerService.setMedia(media);
      playerService.setRealDuration(1000);

      assert.equal(playerService.getTimeFromPercent(50), 250, 'Wrong percentage');
    });

    it('should return the time corresponding to the given percentage relative to full media if cuts are deactivated',
    function() {
      media = {
        cut: [
          {
            type: 'begin',
            value: 100
          },
          {
            type: 'end',
            value: 600
          }
        ]
      };
      playerService.setMedia(media);
      playerService.setRealDuration(1000);
      playerService.setCutsStatus(false);

      assert.equal(playerService.getTimeFromPercent(50), 500, 'Wrong percentage');
    });

  });

  describe('getDurationPercent', function() {

    it('should return the percentage relative to the cut media', function() {
      media = {
        cut: [
          {
            type: 'begin',
            value: 100
          },
          {
            type: 'end',
            value: 400
          }
        ]
      };
      playerService.setMedia(media);
      playerService.setRealDuration(1000);

      assert.equal(playerService.getDurationPercent(15), 50, 'Wrong percentage');
    });

    it('should return the given percentage if cuts are deactivated', function() {
      media = {
        cut: [
          {
            type: 'begin',
            value: 100
          },
          {
            type: 'end',
            value: 400
          }
        ]
      };
      playerService.setMedia(media);
      playerService.setRealDuration(1000);
      playerService.setCutsStatus(false);

      assert.equal(playerService.getDurationPercent(15), 15, 'Wrong percentage');
    });

  });

  describe('findPointOfInterest', function() {

    it('should return the closest point of interest to the specified time', function() {
      media = {
        timecodes: [
          {
            timecode: 5,
            image: {
              small: 'small',
              large: 'large'
            }
          },
          {
            timecode: 10,
            image: {
              small: 'small2',
              large: 'large2'
            }
          },
          {
            timecode: 15,
            image: {
              small: 'small3',
              large: 'large3'
            }
          }
        ],
        chapters: [
          {
            value: 5
          },
          {
            value: 10
          },
          {
            value: 15
          }
        ],
        tags: [
          {
            value: 5
          },
          {
            value: 10
          },
          {
            value: 15
          }
        ],
        cut: [
          {
            type: 'begin',
            value: 10
          },
          {
            type: 'end',
            value: 20
          }
        ]
      };
      playerService.setRealDuration(10000);
      playerService.setMedia(media);

      var timecode = playerService.findPointOfInterest('timecodes', 3);
      var chapter = playerService.findPointOfInterest('chapters', 3);
      var tag = playerService.findPointOfInterest('tags', 3);
      assert.equal(timecode.timecode, 0, 'Wrong timecode value');
      assert.equal(chapter.value, 0, 'Wrong chapter value');
      assert.equal(tag.value, 0, 'Wrong tag value');
    });

    it('should return null if no point of interest in the cut range', function() {
      media = {
        timecodes: [
          {
            timecode: 25,
            image: {
              small: 'small',
              large: 'large'
            }
          },
          {
            timecode: 30,
            image: {
              small: 'small2',
              large: 'large2'
            }
          }
        ],
        chapters: [
          {
            value: 25
          },
          {
            value: 30
          }
        ],
        tags: [
          {
            value: 25
          },
          {
            value: 30
          }
        ],
        cut: [
          {
            type: 'begin',
            value: 10
          },
          {
            type: 'end',
            value: 20
          }
        ]
      };
      playerService.setRealDuration(10000);
      playerService.setMedia(media);

      var timecode = playerService.findPointOfInterest('timecodes', 6);
      var chapter = playerService.findPointOfInterest('chapters', 6);
      var tag = playerService.findPointOfInterest('tags', 6);
      assert.isNull(timecode, 'Unexpected timecode');
      assert.isNull(chapter, 'Unexpected chapter');
      assert.isNull(tag, 'Unexpected tag');
    });

    it('should return null if only future point of interest', function() {
      media = {
        timecodes: [
          {
            timecode: 16,
            image: {
              small: 'small',
              large: 'large'
            }
          }
        ],
        chapters: [
          {
            value: 16
          }
        ],
        tags: [
          {
            value: 16
          }
        ],
        cut: [
          {
            type: 'begin',
            value: 10
          },
          {
            type: 'end',
            value: 20
          }
        ]
      };
      playerService.setRealDuration(10000);
      playerService.setMedia(media);

      var timecode = playerService.findPointOfInterest('timecodes', 5);
      var chapter = playerService.findPointOfInterest('chapters', 5);
      var tag = playerService.findPointOfInterest('tags', 5);
      assert.isNull(timecode, 'Unexpected timecode');
      assert.isNull(chapter, 'Unexpected chapter');
      assert.isNull(tag, 'Unexpected tag');
    });

    it('should return null if unknown point of interest type', function() {
      media = {
        timecodes: [
          {
            timecode: 16,
            image: {
              small: 'small',
              large: 'large'
            }
          }
        ],
        chapters: [
          {
            value: 16
          }
        ],
        tags: [
          {
            value: 16
          }
        ],
        cut: [
          {
            type: 'begin',
            value: 10
          },
          {
            type: 'end',
            value: 20
          }
        ]
      };
      playerService.setRealDuration(10000);
      playerService.setMedia(media);

      var unknownPointOfInterest = playerService.findPointOfInterest('unknown', 5);
      assert.isNull(unknownPointOfInterest, 'Unexpected point of interest');
    });

    it('should return last point of interest if only past points of interest', function() {
      media = {
        timecodes: [
          {
            timecode: 11,
            image: {
              small: 'small',
              large: 'large'
            }
          },
          {
            timecode: 12,
            image: {
              small: 'small2',
              large: 'large2'
            }
          }
        ],
        chapters: [
          {
            value: 11
          },
          {
            value: 12
          }
        ],
        tags: [
          {
            value: 11
          },
          {
            value: 12
          }
        ],
        cut: [
          {
            type: 'begin',
            value: 10
          },
          {
            type: 'end',
            value: 20
          }
        ]
      };
      playerService.setRealDuration(10000);
      playerService.setMedia(media);

      var timecode = playerService.findPointOfInterest('timecodes', 5);
      var chapter = playerService.findPointOfInterest('chapters', 5);
      var tag = playerService.findPointOfInterest('tags', 5);
      assert.equal(timecode.timecode, 2, 'Wrong timecode');
      assert.equal(chapter.value, 2, 'Wrong chapter');
      assert.equal(tag.value, 2, 'Wrong tag');
    });

  });

});
