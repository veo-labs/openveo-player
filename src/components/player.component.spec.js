'use strict';

window.assert = chai.assert;

describe('OplPlayer', function() {
  var $compile;
  var $rootScope;
  var $timeout;
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

  // Load modules
  beforeEach(function() {
    expectedDefinitions = [];
    expectedPlayerId = '42';
    expectedSourceUrl = '';
    expectedSourceIndex = 0;

    Player = function(element) {
      this.element = element;
    };
    Player.prototype.getId = chai.spy(function() {
      return expectedPlayerId;
    });
    Player.prototype.getAvailableDefinitions = chai.spy(function() {
      return expectedDefinitions[expectedSourceIndex].files;
    });
    Player.prototype.getSourceUrl = chai.spy(function() {
      return expectedSourceUrl;
    });
    Player.prototype.initialize = chai.spy(function() {});
    Player.prototype.setTime = chai.spy(function() {});
    Player.prototype.setVolume = chai.spy(function() {});
    Player.prototype.setDefinition = chai.spy(function() {});
    Player.prototype.destroy = chai.spy(function() {});
    Player.prototype.isPaused = chai.spy(function() {
      return false;
    });
    Player.prototype.playPause = chai.spy(function() {
      this.element.triggerHandler('oplPlay');
      $timeout.flush();
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

    module('templates');
  });

  // Dependencies injections
  beforeEach(inject(function(_$compile_, _$rootScope_, _$timeout_) {
    $rootScope = _$rootScope_;
    $compile = _$compile_;
    $timeout = _$timeout_;
  }));

  // Initializes tests
  beforeEach(function() {
    scope = $rootScope.$new();
  });

  it('should display all icons, time, indexes, chapters and tags by default', function() {
    expectedDefinitions = [
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
      }
    ];
    $rootScope.data = {
      mediaId: ['1', '2'],
      timecodes: [
        {
          timecode: 20,
          image: {
            small: 'small',
            large: 'large'
          }
        }
      ],
      chapters: [
        {
          name: 'Chapter 1',
          description: 'Chapter 1 description',
          value: 10000
        }
      ],
      tags: [
        {
          name: 'Simple tag',
          description: 'Simple tag description',
          value: 20000
        }
      ],
      sources: expectedDefinitions
    };

    var element = angular.element('<opl-player opl-data="data"></opl-player>');
    element = $compile(element)(scope);
    scope.$digest();
    ctrl = element.controller('oplPlayer');

    element.triggerHandler('oplDurationChange', 10000);
    $timeout.flush();

    assert.ok(ctrl.timeDisplayed, 'Expected time to be displayed');
    assert.ok(ctrl.modeIconDisplayed, 'Expected mode icon to be displayed');
    assert.ok(ctrl.volumeIconDisplayed, 'Expected volume icon to be displayed');
    assert.ok(ctrl.settingsIconDisplayed, 'Expected settings icon to be displayed');
    assert.ok(ctrl.mediaSourcesIconDisplayed, 'Expected media sources icon to be displayed');
    assert.ok(ctrl.fullscreenIconDisplayed, 'Expected fullscreen icon to be displayed');
    assert.ok(ctrl.indexesTabDisplayed, 'Expected indexes to be displayed');
    assert.lengthOf(element[0].querySelectorAll('opl-indexes ul li'), $rootScope.data.timecodes.length);
    assert.ok(ctrl.chaptersTabDisplayed, 'Expected chapters to be displayed');
    assert.lengthOf(element[0].querySelectorAll('opl-chapters ul li'), $rootScope.data.chapters.length);
    assert.ok(ctrl.tagsTabDisplayed, 'Expected tags to be displayed');
    assert.lengthOf(element[0].querySelectorAll('opl-tags ul li'), $rootScope.data.tags.length);
  });

  it('should not display modes icon nor index tab if no timecodes', function() {
    expectedDefinitions = [{}];
    $rootScope.data = {
      mediaId: ['1'],
      sources: expectedDefinitions
    };

    var element = angular.element('<opl-player opl-data="data"></opl-player>');
    element = $compile(element)(scope);
    scope.$digest();
    ctrl = element.controller('oplPlayer');

    element.triggerHandler('oplDurationChange', 10000);
    $timeout.flush();

    assert.notOk(ctrl.modeIconDisplayed, 'Unexpected mode icon');
    assert.lengthOf(element.find('opl-indexes'), 0, 'Unexpected index tab');
  });

  it('should set display mode to "media" if no timecodes', function() {
    expectedDefinitions = [{}];
    $rootScope.data = {
      mediaId: ['1'],
      sources: expectedDefinitions
    };
    var element = angular.element('<opl-player opl-data="data"></opl-player>');
    element = $compile(element)(scope);
    scope.$digest();
    ctrl = element.controller('oplPlayer');

    assert.notOk(ctrl.modeIconDisplayed, 'Unexpected mode icon');
    assert.ok(
      angular.element(element[0].querySelector('.opl-mode')).hasClass('opl-icon-media'),
      'Expected display mode "media" to be selected'
    );
  });

  it('should create a Vimeo player if player type is vimeo', function() {
    expectedDefinitions = [{}];
    $rootScope.data = {
      mediaId: ['1'],
      sources: expectedDefinitions
    };

    var element = angular.element('<opl-player opl-data="data" opl-player-type="vimeo"></opl-player>');
    element = $compile(element)(scope);
    scope.$digest();
    ctrl = element.controller('oplPlayer');

    assert.ok(ctrl.player instanceof VimeoPlayer, 'Expected a Vimeo player');
  });

  it('should create an HTML player if player type is html', function() {
    expectedDefinitions = [{}];
    $rootScope.data = {
      mediaId: ['1'],
      sources: expectedDefinitions
    };

    var element = angular.element('<opl-player opl-data="data" opl-player-type="html"></opl-player>');
    element = $compile(element)(scope);
    scope.$digest();
    ctrl = element.controller('oplPlayer');

    assert.ok(ctrl.player instanceof HtmlPlayer, 'Expected a HTML player');
  });

  it('should create an HTML player if no media type is specified', function() {
    expectedDefinitions = [{}];
    $rootScope.data = {
      mediaId: ['1'],
      sources: expectedDefinitions
    };

    var element = angular.element('<opl-player opl-data="data"></opl-player>');
    element = $compile(element)(scope);
    scope.$digest();
    ctrl = element.controller('oplPlayer');

    assert.ok(ctrl.player instanceof HtmlPlayer, 'Expected an HTML player');
  });

  it('should not create a player if no media id', function() {
    $rootScope.data = {};

    var element = angular.element('<opl-player opl-data="data"></opl-player>');
    element = $compile(element)(scope);
    scope.$digest();
    ctrl = element.controller('oplPlayer');

    assert.isNull(ctrl.player, 'Unexpected player');
  });

  it('should set time preview image and default presentation image', function() {
    expectedDefinitions = [{}];
    $rootScope.data = {
      mediaId: ['1'],
      sources: expectedDefinitions,
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

    var element = angular.element('<opl-player opl-data="data"></opl-player>');
    element = $compile(element)(scope);
    scope.$digest();

    element.triggerHandler('oplDurationChange', 10000);
    $timeout.flush();


    assert.equal(
      angular.element(element[0].querySelector('.opl-cursor img')).attr('src'),
      $rootScope.data.timecodes[0].image.large,
      'Wrong thumbnail'
    );
    assert.equal(
      angular.element(element[0].querySelector('.opl-presentation > div')).attr('style'),
      'background-image: url("' + $rootScope.data.timecodes[0].image.large + '");',
      'Wrong presentation'
    );
  });

  it('should not set time preview image and default presentation image if first timecode > time', function() {
    expectedDefinitions = [{}];
    $rootScope.data = {
      mediaId: ['1'],
      sources: expectedDefinitions,
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

    var element = angular.element('<opl-player opl-data="data"></opl-player>');
    element = $compile(element)(scope);
    scope.$digest();

    element.triggerHandler('oplDurationChange', 10000);
    $timeout.flush();

    element.triggerHandler('oplPlayProgress', {
      time: 2500,
      percent: 25
    });

    assert.isNull(element[0].querySelector('.opl-cursor img'), 'Unexpected thumbnail');
    assert.equal(
      angular.element(element[0].querySelector('.opl-presentation > div')).attr('style'),
      'background-image: none;',
      'Unexpected presentation'
    );
  });

  it('should be able to open/close the list of display modes', function() {
    expectedDefinitions = [{}];
    $rootScope.data = {
      mediaId: ['1'],
      sources: expectedDefinitions
    };

    var element = angular.element('<opl-player opl-data="data"></opl-player>');
    element = $compile(element)(scope);
    scope.$digest();
    ctrl = element.controller('oplPlayer');

    angular.element(element[0].querySelector('.opl-mode')).triggerHandler('click');

    assert.ok(ctrl.modesOpened, 'Expected modes menu to be opened');
    assert.notOk(ctrl.definitionOpened, 'Expected definitions menu to be closed');
    assert.notOk(ctrl.volumeOpened, 'Expected volume menu to be closed');
  });

  it('should be able to open/close the volume', function() {
    expectedDefinitions = [{}];
    $rootScope.data = {
      mediaId: ['1'],
      sources: expectedDefinitions
    };

    var element = angular.element('<opl-player opl-data="data"></opl-player>');
    element = $compile(element)(scope);
    scope.$digest();
    ctrl = element.controller('oplPlayer');

    angular.element(element[0].querySelector('.opl-icon-volume')).triggerHandler('click');

    assert.ok(ctrl.volumeOpened, 'Expected volume menu to be opened');
    assert.notOk(ctrl.definitionOpened, 'Expected definitions menu to be closed');
    assert.notOk(ctrl.modesOpened, 'Expected modes menu to be closed');
  });

  it('should be able to open/close the list of definitions', function() {
    expectedDefinitions = [{}];
    $rootScope.data = {
      mediaId: ['1'],
      sources: expectedDefinitions
    };

    var element = angular.element('<opl-player opl-data="data"></opl-player>');
    element = $compile(element)(scope);
    scope.$digest();
    ctrl = element.controller('oplPlayer');

    angular.element(element[0].querySelector('.opl-icon-resolution')).triggerHandler('click');

    assert.ok(ctrl.definitionOpened, 'Expected definitions menu to be opened');
    assert.notOk(ctrl.volumeOpened, 'Expected volume mneu to be closed');
    assert.notOk(ctrl.modesOpened, 'Expected modes menu to be closed');
  });

  it('should be able to select a mode', function() {
    expectedDefinitions = [{}];
    $rootScope.data = {
      mediaId: ['1'],
      sources: expectedDefinitions,
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

    var element = angular.element('<opl-player opl-data="data"></opl-player>');
    element = $compile(element)(scope);
    scope.$digest();
    ctrl = element.controller('oplPlayer');

    var modesMenuElement = element[0].querySelector('.opl-mode');
    var modeElements = modesMenuElement.querySelectorAll('li');

    angular.element(element[0].querySelector('.opl-mode')).triggerHandler('click');

    modeElements.forEach(function(modeElement) {
      modeElement = angular.element(modeElement);
      if (modeElement.hasClass('opl-icon-both-presentation'))
        modeElement.triggerHandler('click');
    });

    assert.ok(
      angular.element(modesMenuElement).hasClass('opl-icon-both-presentation'),
      'Expected "both-presentation" mode to be selected'
    );
  });

  it('should be able to play/pause the player', function(done) {
    expectedDefinitions = [{}];
    $rootScope.data = {
      mediaId: ['1'],
      sources: expectedDefinitions
    };

    var element = angular.element('<opl-player opl-data="data"></opl-player>');
    element = $compile(element)(scope);
    scope.$digest();
    ctrl = element.controller('oplPlayer');

    element.triggerHandler('oplReady');
    $timeout.flush();

    element.one('play', function() {
      done();
    });

    angular.element(element[0].querySelector('.opl-left .opl-icon-play')).triggerHandler('click');

  });

  it('should be able to change media definition', function() {
    expectedDefinitions = [
      {
        files: [
          {
            width: 640,
            height: 360,
            link: 'http://video.mp4'
          }, {
            width: 1280,
            height: 720,
            link: 'http://videoHD.mp4'
          }
        ]
      }
    ];
    $rootScope.data = {
      mediaId: ['1'],
      sources: expectedDefinitions
    };

    var element = angular.element('<opl-player opl-data="data"></opl-player>');
    element = $compile(element)(scope);
    scope.$digest();
    ctrl = element.controller('oplPlayer');

    var definitionsIconElement = angular.element(element[0].querySelector('.opl-icon-resolution'));
    var definitionElements = definitionsIconElement[0].querySelectorAll('li');

    definitionsIconElement.triggerHandler('click');
    angular.element(definitionElements[1]).triggerHandler('click');
    $timeout.flush();

    var selectedDefinitionElement = angular.element(definitionsIconElement[0].querySelector('.opl-selected'));
    Player.prototype.setDefinition.should.have.been.called.exactly(1);
    assert.equal(
      selectedDefinitionElement.text(),
      expectedDefinitions[0].files[1].height + 'p',
      'Wrong definition'
    );
    assert.ok(
      selectedDefinitionElement.hasClass('opl-hd'),
      'Expected HD definition'
    );
  });

  it('should handle player waiting event and set player as "loading"', function(done) {
    expectedDefinitions = [{}];
    $rootScope.data = {
      mediaId: ['1'],
      sources: expectedDefinitions
    };

    var element = angular.element('<opl-player opl-data="data"></opl-player>');
    element = $compile(element)(scope);
    scope.$digest();
    ctrl = element.controller('oplPlayer');

    element.one('waiting', function() {
      done();
    });

    element.triggerHandler('oplReady');
    $timeout.flush();

    assert.notOk(ctrl.loading, 'Expected player to be ready');

    element.triggerHandler('oplWaiting');
    $timeout.flush();

    assert.ok(ctrl.loading, 'Expected player to be loading');
  });

  it('should handle player playing event and set player as "not loading" and pause button', function() {
    expectedDefinitions = [{}];
    $rootScope.data = {
      mediaId: ['1'],
      sources: expectedDefinitions
    };

    var element = angular.element('<opl-player opl-data="data"></opl-player>');
    element = $compile(element)(scope);
    scope.$digest();
    ctrl = element.controller('oplPlayer');

    element.triggerHandler('oplWaiting');
    $timeout.flush();

    assert.ok(ctrl.loading, 'Expected player to be loading');

    element.triggerHandler('oplPlaying');
    $timeout.flush();

    assert.notOk(ctrl.loading, 'Expected player to be ready');
    assert.isDefined(element[0].querySelector('opl-icon-pause'), 'Expected pause button');
  });

  it('should handle player durationChange event and set media duration', function() {
    expectedDefinitions = [{}];
    $rootScope.data = {
      mediaId: ['1'],
      sources: expectedDefinitions
    };

    var element = angular.element('<opl-player opl-data="data"></opl-player>');
    element = $compile(element)(scope);
    scope.$digest();
    ctrl = element.controller('oplPlayer');

    element.triggerHandler('oplDurationChange', 50000);
    $timeout.flush();

    assert.equal(
      angular.element(element[0].querySelector('.opl-time')).text(),
      '00:00 - 00:50',
      'Wrong time'
    );
  });

  it('should handle player play event and set play/pause button to pause', function() {
    expectedDefinitions = [{}];
    $rootScope.data = {
      mediaId: ['1'],
      sources: expectedDefinitions
    };

    var element = angular.element('<opl-player opl-data="data"></opl-player>');
    element = $compile(element)(scope);
    scope.$digest();
    ctrl = element.controller('oplPlayer');

    element.triggerHandler('OplPlay');
    $timeout.flush();

    assert.isDefined(element[0].querySelector('opl-icon-pause'), 'Expected pause button');
  });

  it('should handle player pause event and set play/pause button to play', function() {
    expectedDefinitions = [{}];
    $rootScope.data = {
      mediaId: ['1'],
      sources: expectedDefinitions
    };

    var element = angular.element('<opl-player opl-data="data"></opl-player>');
    element = $compile(element)(scope);
    scope.$digest();
    ctrl = element.controller('oplPlayer');

    element.triggerHandler('oplPause');
    $timeout.flush();

    assert.isDefined(element[0].querySelector('opl-icon-play'), 'Expected play button');
  });

  it('should handle player loadProgress event and set loading percentage', function() {
    expectedDefinitions = [{}];
    $rootScope.data = {
      mediaId: ['1'],
      sources: expectedDefinitions
    };

    var element = angular.element('<opl-player opl-data="data"></opl-player>');
    element = $compile(element)(scope);
    scope.$digest();
    ctrl = element.controller('oplPlayer');

    element.triggerHandler('oplLoadProgress', {
      loadedStart: 2,
      loadedPercent: 98
    });
    $timeout.flush();

    assert.equal(
      angular.element(element[0].querySelector('.opl-loaded')).attr('style'),
      'left: 2%; width: 98%;',
      'Wrong loading informations'
    );
  });

  it('should handle player playProgress event and update time, seen percent of the media and find ' +
     'corresponding presentation image',
  function() {
    expectedDefinitions = [{}];
    $rootScope.data = {
      mediaId: ['1'],
      sources: expectedDefinitions,
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

    var element = angular.element('<opl-player opl-data="data"></opl-player>');
    element = $compile(element)(scope);
    scope.$digest();
    ctrl = element.controller('oplPlayer');

    element.triggerHandler('oplReady');
    $timeout.flush();

    element.triggerHandler('oplDurationChange', 10000);
    $timeout.flush();

    element.triggerHandler('oplPlayProgress', {
      time: 7000,
      percent: 75
    });
    $timeout.flush();

    assert.equal(
      angular.element(element[0].querySelector('.opl-time')).text(),
      '00:07 - 00:10',
      'Wrong time'
    );
    assert.equal(
      angular.element(element[0].querySelector('.opl-seen')).attr('style'),
      'width: 75%;',
      'Wrong progression'
    );

    assert.equal(
      angular.element(element[0].querySelector('.opl-presentation > div')).attr('style'),
      'background-image: url("' + $rootScope.data.timecodes[1].image.large + '");',
      'Wrong presentation'
    );
  });

  it('should handle player end event and reset time', function() {
    expectedDefinitions = [{}];
    $rootScope.data = {
      mediaId: ['1'],
      sources: expectedDefinitions
    };

    var element = angular.element('<opl-player opl-data="data"></opl-player>');
    element = $compile(element)(scope);
    scope.$digest();
    ctrl = element.controller('oplPlayer');

    element.triggerHandler('oplReady');
    $timeout.flush();

    element.triggerHandler('oplDurationChange', 10000);
    $timeout.flush();

    element.triggerHandler('oplPlayProgress', {
      time: 7000,
      percent: 75
    });
    $timeout.flush();

    element.triggerHandler('oplEnd');
    $timeout.flush();

    assert.equal(
      angular.element(element[0].querySelector('.opl-time')).text(),
      '00:00 - 00:10',
      'Wrong time'
    );
    assert.equal(
      angular.element(element[0].querySelector('.opl-seen')).attr('style'),
      'width: 0%;',
      'Wrong progression'
    );
  });

  it('should expose an API', function() {
    expectedDefinitions = [{}];
    $rootScope.data = {
      mediaId: ['1'],
      sources: expectedDefinitions
    };
    var element = angular.element('<opl-player opl-data="data"></opl-player>');
    element = $compile(element)(scope);
    scope.$digest();

    var ctrl = element.controller('oplPlayer');

    assert.isFunction(ctrl.selectMode);
    assert.isFunction(ctrl.playPause);
    assert.isFunction(ctrl.setVolume);
    assert.isFunction(ctrl.setTime);
    assert.isFunction(ctrl.setDefinition);
    assert.isFunction(ctrl.setSource);
  });

});
