'use strict';

window.assert = chai.assert;

describe('oplMillisecondsToTimeFilter', function() {
  var millisecondsToTimeFilter;
  var $filter;

  // Load module player
  beforeEach(module('ov.player'));

  // Dependencies injections
  beforeEach(inject(function(_$filter_) {
    $filter = _$filter_;
  }));

  // Initializes tests
  beforeEach(function() {
    millisecondsToTimeFilter = $filter('oplMillisecondsToTime');
  });

  it('should return an empty String if time < 0', function() {
    var emptyTime = millisecondsToTimeFilter(-1);
    assert.notOk(emptyTime, 'Expected time to be empty');
    assert.isString(emptyTime, 'Expected time to be String');
  });

  it('should return an empty String if time is undefined', function() {
    var emptyTime = millisecondsToTimeFilter(undefined);
    assert.notOk(emptyTime, 'Expected time to be empty');
    assert.isString(emptyTime, 'Expected time to be String');
  });

  it('should be able to convert milliseconds to hh:mm:ss', function() {
    var time = millisecondsToTimeFilter(8804555);
    assert.equal(time, '02:26:44', 'Wrong time');
  });

  it('should be able to convert milliseconds to mm:ss while no hours', function() {
    var time = millisecondsToTimeFilter(884555);
    assert.equal(time, '14:44', 'Wrong time');
  });

  it('should be able to convert milliseconds to 00:ss while no hours and no minutes', function() {
    var time = millisecondsToTimeFilter(5500);
    assert.equal(time, '00:05', 'Wrong time');
  });

});
