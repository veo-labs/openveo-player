'use strict';

window.assert = chai.assert;

describe('OplSettings', function() {
  var $compile;
  var $rootScope;
  var $timeout;
  var $filter;
  var $document;
  var bodyElement;
  var scope;
  var originalRequestAnimationFrame;

  // Load modules
  beforeEach(function() {
    module('ov.player');
    module('templates');

    // Mock requestAnimationFrame
    originalRequestAnimationFrame = window.requestAnimationFrame;
    window.requestAnimationFrame = function(callback) {
      callback();
    };
  });

  afterEach(function() {
    window.requestAnimationFrame = originalRequestAnimationFrame;
  });

  // Dependencies injections
  beforeEach(inject(function(_$compile_, _$rootScope_, _$timeout_, _$filter_, _$document_) {
    $rootScope = _$rootScope_;
    $compile = _$compile_;
    $timeout = _$timeout_;
    $filter = _$filter_;
    $document = _$document_;
  }));

  // Initializes tests
  beforeEach(function() {
    scope = $rootScope.$new();
    bodyElement = angular.element($document[0].body);
  });

  it('should display a settings button', function() {
    scope.qualities = [];
    scope.sources = [];
    var element = angular.element('<opl-settings ' +
                                  ' opl-qualities="qualities"' +
                                  ' opl-sources="sources"' +
                                  '></opl-settings>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush();

    var buttonElement = element.find('opl-button');

    assert.equal(buttonElement.attr('opl-icon'), 'settings', 'Wrong button icon');
    assert.equal(
      buttonElement.attr('opl-label'),
      $filter('oplTranslate')('CONTROLS_SETTINGS_ARIA_LABEL'),
      'Wrong button label'
    );
  });

  it('should not display settings by default', function() {
    scope.qualities = [
      {
        id: '1',
        label: 'Quality',
        hd: false
      }
    ];
    scope.sources = [
      {
        id: '2',
        label: 'Source'
      }
    ];
    var element = angular.element('<opl-settings ' +
                                  ' opl-qualities="qualities"' +
                                  ' opl-sources="sources"' +
                                  '></opl-settings>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

    var settingElements = element[0].querySelectorAll('li');

    assert.notOk(
      angular.element(element[0].querySelector('.opl-settings')).hasClass('opl-posted'),
      'Expected settings to be closed'
    );

    settingElements.forEach(function(settingElement) {
      assert.equal(
        angular.element(settingElement).attr('aria-hidden'),
        'true',
        'Wrong ARIA hidden for setting ' + angular.element(settingElement).attr('data-id')
      );
    });
  });

  it('should display the settings when button is actioned', function() {
    var i;
    scope.qualities = [
      {
        id: '1',
        label: 'Quality',
        hd: false
      }
    ];
    scope.sources = [
      {
        id: '2',
        label: 'Source'
      }
    ];
    var element = angular.element('<opl-settings ' +
                                  ' opl-qualities="qualities"' +
                                  ' opl-sources="sources"' +
                                  '></opl-settings>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

    var ctrl = element.controller('oplSettings');

    ctrl.toggleSettings();
    $timeout.flush();

    var headerElements = element.find('h1');
    var ulElements = element.find('ul');
    var qualityElements = angular.element(ulElements[0]).find('li');
    var sourceElements = angular.element(ulElements[1]).find('li');

    assert.ok(
      angular.element(element[0].querySelector('.opl-settings')).hasClass('opl-posted'),
      'Expected settings to be opened'
    );
    assert.equal(
      angular.element(headerElements[0]).text(),
      $filter('oplTranslate')('CONTROLS_SETTINGS_QUALITIES_TITLE'),
      'Wrong qualities header'
    );
    assert.equal(
      angular.element(headerElements[1]).text(),
      $filter('oplTranslate')('CONTROLS_SETTINGS_SOURCES_TITLE'),
      'Wrong sources header'
    );

    for (i = 0; i < qualityElements.length; i++) {
      assert.equal(
        angular.element(qualityElements[i].querySelector('.opl-item-label')).text(),
        scope.qualities[i].label,
        'Wrong label for quality ' + i
      );
      assert.equal(angular.element(qualityElements[i]).attr('role'), 'button', 'Wrong role for quality ' + i);
      assert.equal(angular.element(qualityElements[i]).attr('tabindex'), '-1', 'Wrong tabindex for quality ' + i);
      assert.equal(
        angular.element(qualityElements[i]).attr('data-type'),
        'quality',
        'Wrong data-type for quality ' + i
      );
      assert.equal(
        angular.element(qualityElements[i]).attr('data-id'),
        scope.qualities[i].id,
        'Wrong data-id for quality ' + i
      );
      assert.equal(
        angular.element(qualityElements[i]).attr('aria-label'),
        scope.qualities[i].label,
        'Wrong ARIA label for quality ' + i
      );
      assert.equal(
        angular.element(qualityElements[i]).attr('aria-hidden'),
        'false',
        'Wrong ARIA hidden for quality ' + i
      );
      assert.lengthOf(
        angular.element(qualityElements[i]).find('span'),
        1,
        'Unexpected select or hd for quality ' + i
      );
    }

    for (i = 0; i < sourceElements.length; i++) {
      assert.equal(
        angular.element(sourceElements[i].querySelector('.opl-item-label')).text(),
        scope.sources[i].label,
        'Wrong label for source ' + i
      );
      assert.equal(angular.element(sourceElements[i]).attr('role'), 'button', 'Wrong role for source ' + i);
      assert.equal(angular.element(sourceElements[i]).attr('tabindex'), '-1', 'Wrong tabindex for source ' + i);
      assert.equal(
        angular.element(sourceElements[i]).attr('data-type'),
        'source',
        'Wrong data-type for source ' + i
      );
      assert.equal(
        angular.element(sourceElements[i]).attr('data-id'),
        scope.sources[i].id,
        'Wrong data-id for source ' + i
      );
      assert.equal(
        angular.element(sourceElements[i]).attr('aria-label'),
        scope.sources[i].label,
        'Wrong ARIA label for source ' + i
      );
      assert.equal(
        angular.element(sourceElements[i]).attr('aria-hidden'),
        'false',
        'Wrong ARIA hidden for source ' + i
      );
      assert.lengthOf(
        angular.element(sourceElements[i]).find('span'),
        1,
        'Unexpected select for source ' + i
      );
    }
  });

  it('should not display qualities if no qualities', function() {
    scope.qualities = [];
    scope.sources = [
      {
        id: '1',
        label: 'Source'
      }
    ];
    var element = angular.element('<opl-settings ' +
                                  ' opl-qualities="qualities"' +
                                  ' opl-sources="sources"' +
                                  '></opl-settings>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

    var ctrl = element.controller('oplSettings');

    ctrl.toggleSettings();
    $timeout.flush();

    var headerElements = element.find('h1');
    var ulElements = element.find('ul');

    assert.lengthOf(headerElements, 1, 'Unexpected header');
    assert.lengthOf(ulElements, 1, 'Unexpected qualities');
    assert.equal(
      angular.element(headerElements[0]).text(),
      $filter('oplTranslate')('CONTROLS_SETTINGS_SOURCES_TITLE'),
      'Wrong header'
    );

    var sourceElements = ulElements[0].querySelectorAll('li');

    for (var i = 0; i < sourceElements.length; i++) {
      assert.equal(
        angular.element(sourceElements[i]).attr('data-id'),
        scope.sources[i].id,
        'Wrong source ' + i
      );
    }
  });

  it('should not display sources if no sources', function() {
    scope.qualities = [
      {
        id: '1',
        label: 'Quality',
        hd: false
      }
    ];
    scope.sources = [];
    var element = angular.element('<opl-settings ' +
                                  ' opl-qualities="qualities"' +
                                  ' opl-sources="sources"' +
                                  '></opl-settings>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

    var ctrl = element.controller('oplSettings');

    ctrl.toggleSettings();
    $timeout.flush();

    var headerElements = element.find('h1');
    var ulElements = element.find('ul');

    assert.lengthOf(headerElements, 1, 'Unexpected header');
    assert.lengthOf(ulElements, 1, 'Unexpected sources');
    assert.equal(
      angular.element(headerElements[0]).text(),
      $filter('oplTranslate')('CONTROLS_SETTINGS_QUALITIES_TITLE'),
      'Wrong header'
    );

    var qualityElements = ulElements[0].querySelectorAll('li');

    for (var i = 0; i < qualityElements.length; i++) {
      assert.equal(
        angular.element(qualityElements[i]).attr('data-id'),
        scope.qualities[i].id,
        'Wrong quality ' + i
      );
    }
  });

  it('should mark selected quality and source', function() {
    scope.qualities = [
      {
        id: '1',
        label: 'Quality 1'
      },
      {
        id: '2',
        label: 'Quality 2'
      }
    ];
    scope.sources = [
      {
        id: '3',
        label: 'Source 1'
      },
      {
        id: '4',
        label: 'Source 2'
      }
    ];
    var element = angular.element('<opl-settings ' +
                                  ' opl-qualities="qualities"' +
                                  ' opl-sources="sources"' +
                                  ' opl-quality="' + scope.qualities[0].id + '"' +
                                  ' opl-source="' + scope.sources[0].id + '"' +
                                  '></opl-settings>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush();

    var ctrl = element.controller('oplSettings');

    ctrl.toggleSettings();
    $timeout.flush(1000);

    var ulElements = element.find('ul');
    var qualityElements = ulElements[0].querySelectorAll('li');
    var sourceElements = ulElements[1].querySelectorAll('li');

    qualityElements.forEach(function(qualityElement) {
      if (angular.element(qualityElement).attr('data-id') === scope.qualities[0].id)
        assert.isNotNull(qualityElement.querySelector('.opl-check'), 'Expected quality to be selected');
    });
    sourceElements.forEach(function(sourceElement) {
      if (angular.element(sourceElement).attr('data-id') === scope.sources[0].id)
        assert.isNotNull(sourceElement.querySelector('.opl-check'), 'Expected source to be selected');
    });
  });

  it('should mark HD quality', function() {
    scope.qualities = [
      {
        id: '1',
        label: 'Quality 1',
        hd: true
      }
    ];
    scope.sources = [];
    var element = angular.element('<opl-settings ' +
                                  ' opl-qualities="qualities"' +
                                  ' opl-sources="sources"' +
                                  '></opl-settings>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

    var ctrl = element.controller('oplSettings');

    ctrl.toggleSettings();
    $timeout.flush();

    var ulElements = element.find('ul');
    var qualityElements = ulElements[0].querySelectorAll('li');

    assert.isNotNull(qualityElements[0].querySelector('.opl-hd'), 'Expected quality to be marked as HD');
  });

  it('should call function defined in opl-on-update if a quality is selected', function() {
    scope.qualities = [
      {
        id: '1',
        label: 'Quality 1'
      },
      {
        id: '2',
        label: 'Quality 2'
      }
    ];
    scope.sources = [];
    scope.quality = scope.qualities[0].id;
    scope.handleOnUpdate = chai.spy(function(quality, source) {
      assert.equal(quality, scope.qualities[1].id, 'Wrong quality');
      assert.isUndefined(source, 'Unexpected source');
      scope.quality = quality;
    });
    var element = angular.element('<opl-settings ' +
                                  ' opl-qualities="qualities"' +
                                  ' opl-sources="sources"' +
                                  ' opl-quality="{{quality}}"' +
                                  ' opl-on-update="handleOnUpdate(quality, source)"' +
                                  '></opl-settings>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

    var ctrl = element.controller('oplSettings');

    ctrl.toggleSettings();
    $timeout.flush();

    var qualityElements = element.find('ul')[0].querySelectorAll('li');

    angular.element(qualityElements[1]).triggerHandler('mousedown');
    bodyElement.triggerHandler({type: 'mouseup', target: qualityElements[1]});
    scope.$apply();

    scope.handleOnUpdate.should.have.been.called.exactly(1);
  });

  it('should close settings when selected quality changes and update selected quality', function() {
    scope.qualities = [
      {
        id: '1',
        label: 'Quality 1'
      },
      {
        id: '2',
        label: 'Quality 2'
      }
    ];
    scope.sources = [];
    scope.quality = scope.qualities[0].id;
    var element = angular.element('<opl-settings ' +
                                  ' opl-qualities="qualities"' +
                                  ' opl-sources="sources"' +
                                  ' opl-quality="{{quality}}"' +
                                  '></opl-settings>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

    var ctrl = element.controller('oplSettings');
    var qualityElements = element.find('ul')[0].querySelectorAll('li');

    ctrl.toggleSettings();
    $timeout.flush();

    assert.ok(
      angular.element(element[0].querySelector('.opl-settings')).hasClass('opl-posted'),
      'Expected settings to be opened'
    );

    assert.ok(angular.element(qualityElements[0]).hasClass('opl-selected'), 'Expected first quality to be selected');
    assert.notOk(angular.element(qualityElements[1]).hasClass('opl-selected'), 'Unexpected selected second quality');
    assert.isNotNull(qualityElements[0].querySelector('.opl-check'), 'Expected check mark on first quality');
    assert.isNull(qualityElements[1].querySelector('.opl-check'), 'Unexpected check mark on second quality');

    scope.quality = scope.qualities[1].id;
    scope.$digest();

    assert.notOk(angular.element(qualityElements[0]).hasClass('opl-selected'), 'Unexpected selected first quality');
    assert.ok(angular.element(qualityElements[1]).hasClass('opl-selected'), 'Expected second quality to be selected');
    assert.isNull(qualityElements[0].querySelector('.opl-check'), 'Unexpected check mark on first quality');
    assert.isNotNull(qualityElements[1].querySelector('.opl-check'), 'Expected check mark on second quality');

    assert.notOk(
      angular.element(element[0].querySelector('.opl-settings')).hasClass('opl-posted'),
      'Expected settings to be closed'
    );
  });

  it('should call function defined in opl-on-update if a source is selected and close the settings', function() {
    scope.qualities = [];
    scope.sources = [
      {
        id: '1',
        label: 'Source 1'
      },
      {
        id: '2',
        label: 'Source 2'
      }
    ];
    scope.source = scope.sources[0].id;
    scope.handleOnUpdate = chai.spy(function(quality, source) {
      assert.isNull(quality, 'Unexpected quality');
      assert.equal(source, scope.sources[1].id, 'Wrong source');
      scope.source = source;
    });
    var element = angular.element('<opl-settings ' +
                                  ' opl-qualities="qualities"' +
                                  ' opl-sources="sources"' +
                                  ' opl-source="{{source}}"' +
                                  ' opl-on-update="handleOnUpdate(quality, source)"' +
                                  '></opl-settings>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

    var ctrl = element.controller('oplSettings');
    var sourceElements = element.find('ul')[0].querySelectorAll('li');

    ctrl.toggleSettings();
    $timeout.flush();

    angular.element(sourceElements[1]).triggerHandler('mousedown');
    bodyElement.triggerHandler({type: 'mouseup', target: sourceElements[1]});
    scope.$apply();

    scope.handleOnUpdate.should.have.been.called.exactly(1);
  });

  it('should close settings when selected source changes and update selected source', function() {
    scope.qualities = [];
    scope.sources = [
      {
        id: '1',
        label: 'Source 1'
      },
      {
        id: '2',
        label: 'Source 2'
      }
    ];
    scope.source = scope.sources[0].id;
    var element = angular.element('<opl-settings ' +
                                  ' opl-qualities="qualities"' +
                                  ' opl-sources="sources"' +
                                  ' opl-source="{{source}}"' +
                                  '></opl-settings>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

    var ctrl = element.controller('oplSettings');
    var sourceElements = element.find('ul')[0].querySelectorAll('li');

    ctrl.toggleSettings();
    $timeout.flush();

    assert.ok(
      angular.element(element[0].querySelector('.opl-settings')).hasClass('opl-posted'),
      'Expected settings to be opened'
    );

    assert.ok(angular.element(sourceElements[0]).hasClass('opl-selected'), 'Expected selected first source');
    assert.notOk(angular.element(sourceElements[1]).hasClass('opl-selected'), 'Unexpected selected second source');
    assert.isNotNull(sourceElements[0].querySelector('.opl-check'), 'Expected check mark on first source');
    assert.isNull(sourceElements[1].querySelector('.opl-check'), 'Unexpected check mark on second source');

    scope.source = scope.sources[1].id;
    scope.$digest();

    assert.notOk(angular.element(sourceElements[0]).hasClass('opl-selected'), 'Unexpected selected first source');
    assert.ok(angular.element(sourceElements[1]).hasClass('opl-selected'), 'Expected selected second source');
    assert.isNull(sourceElements[0].querySelector('.opl-check'), 'Unexpected check mark on first source');
    assert.isNotNull(sourceElements[1].querySelector('.opl-check'), 'Expected check mark on second source');

    assert.notOk(
      angular.element(element[0].querySelector('.opl-settings')).hasClass('opl-posted'),
      'Expected settings to be closed'
    );
  });

  it('should be able to close settings using ESCAPE key', function() {
    scope.qualities = [
      {
        id: '1',
        label: 'Quality',
        hd: false
      }
    ];
    scope.sources = [];
    var element = angular.element('<opl-settings ' +
                                  ' opl-qualities="qualities"' +
                                  ' opl-sources="sources"' +
                                  '></opl-settings>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

    var ctrl = element.controller('oplSettings');
    var qualityElements = angular.element(element.find('ul')[0]).find('li');

    ctrl.toggleSettings();
    $timeout.flush();

    assert.ok(
      angular.element(element[0].querySelector('.opl-settings')).hasClass('opl-posted'),
      'Expected settings to be opened'
    );

    angular.element(qualityElements[0]).triggerHandler({type: 'keydown', keyCode: 27});

    assert.notOk(
      angular.element(element[0].querySelector('.opl-settings')).hasClass('opl-posted'),
      'Expected settings to be closed'
    );
  });

  it('should be able to navigate within settings using UP/LEFT and BOTTOM/RIGHT keys', function() {
    scope.qualities = [
      {
        id: '1',
        label: 'Quality 1'
      },
      {
        id: '2',
        label: 'Quality 2'
      }
    ];
    scope.sources = [
      {
        id: '3',
        label: 'Source 1'
      },
      {
        id: '4',
        label: 'Source 2'
      }
    ];
    var element = angular.element('<opl-settings ' +
                                  ' opl-qualities="qualities"' +
                                  ' opl-sources="sources"' +
                                  '></opl-settings>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

    var ctrl = element.controller('oplSettings');
    var ulElements = element.find('ul');
    var qualityElements = angular.element(ulElements[0]).find('li');
    var sourceElements = angular.element(ulElements[1]).find('li');
    qualityElements[0].focus = chai.spy(qualityElements[0].focus);
    qualityElements[1].focus = chai.spy(qualityElements[1].focus);
    sourceElements[0].focus = chai.spy(sourceElements[0].focus);
    sourceElements[1].focus = chai.spy(sourceElements[1].focus);

    ctrl.toggleSettings();
    $timeout.flush();

    qualityElements[0].focus.should.have.been.called.exactly(1);
    angular.element(qualityElements[0]).triggerHandler('focus');
    assert.ok(
      angular.element(qualityElements[0]).hasClass('opl-focus'),
      'Expected first quality to be focused'
    );

    // Next
    angular.element(qualityElements[0]).triggerHandler({type: 'keydown', keyCode: 39});

    qualityElements[1].focus.should.have.been.called.exactly(1);
    angular.element(qualityElements[0]).triggerHandler('blur');
    angular.element(qualityElements[1]).triggerHandler('focus');
    assert.ok(
      angular.element(qualityElements[1]).hasClass('opl-focus'),
      'Expected second quality to be focused'
    );

    // Next
    angular.element(qualityElements[1]).triggerHandler({type: 'keydown', keyCode: 40});

    sourceElements[0].focus.should.have.been.called.exactly(1);
    angular.element(qualityElements[1]).triggerHandler('blur');
    angular.element(sourceElements[0]).triggerHandler('focus');
    assert.ok(
      angular.element(sourceElements[0]).hasClass('opl-focus'),
      'Expected first source to be focused'
    );

    // Next
    angular.element(sourceElements[0]).triggerHandler({type: 'keydown', keyCode: 40});

    sourceElements[1].focus.should.have.been.called.exactly(1);
    angular.element(sourceElements[0]).triggerHandler('blur');
    angular.element(sourceElements[1]).triggerHandler('focus');

    // Next
    angular.element(sourceElements[1]).triggerHandler({type: 'keydown', keyCode: 40});

    qualityElements[0].focus.should.have.been.called.exactly(2);
    angular.element(sourceElements[1]).triggerHandler('blur');
    angular.element(qualityElements[0]).triggerHandler('focus');
    assert.ok(
      angular.element(qualityElements[0]).hasClass('opl-focus'),
      'Expected first quality to be focused again'
    );

    // Previous
    angular.element(qualityElements[0]).triggerHandler({type: 'keydown', keyCode: 38});

    sourceElements[1].focus.should.have.been.called.exactly(2);
    angular.element(qualityElements[0]).triggerHandler('blur');
    angular.element(sourceElements[1]).triggerHandler('focus');
    assert.ok(
      angular.element(sourceElements[1]).hasClass('opl-focus'),
      'Expected second source to be focused again'
    );

    // Previous
    angular.element(sourceElements[1]).triggerHandler({type: 'keydown', keyCode: 37});

    qualityElements[0].focus.should.have.been.called.exactly(2);
    angular.element(sourceElements[1]).triggerHandler('blur');
    angular.element(sourceElements[0]).triggerHandler('focus');
    assert.ok(
      angular.element(sourceElements[0]).hasClass('opl-focus'),
      'Expected first source to be focused again'
    );
  });

  it('should be able to select a new quality using ENTER key', function() {
    scope.qualities = [
      {
        id: '1',
        label: 'Quality 1'
      },
      {
        id: '2',
        label: 'Quality 2'
      }
    ];
    scope.sources = [];
    scope.quality = scope.qualities[0].id;
    scope.handleOnUpdate = chai.spy(function(quality, source) {
      assert.equal(quality, scope.qualities[1].id, 'Wrong quality');
      assert.isUndefined(source, 'Unexpected source');
    });
    var element = angular.element('<opl-settings ' +
                                  ' opl-qualities="qualities"' +
                                  ' opl-sources="sources"' +
                                  ' opl-quality="quality"' +
                                  ' opl-on-update="handleOnUpdate(quality, source)"' +
                                  '></opl-settings>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

    var ctrl = element.controller('oplSettings');
    var qualityElements = angular.element(element.find('ul')[0]).find('li');

    ctrl.toggleSettings();
    $timeout.flush();

    angular.element(qualityElements[0]).triggerHandler('blur');
    angular.element(qualityElements[1]).triggerHandler('focus');
    angular.element(qualityElements[1]).triggerHandler({type: 'keydown', keyCode: 13});
    scope.$digest();

    scope.handleOnUpdate.should.have.been.called.exactly(1);
  });

  it('should be able to select a new source using ENTER key', function() {
    scope.qualities = [
      {
        id: '1',
        label: 'Quality 1'
      }
    ];
    scope.sources = [
      {
        id: '2',
        label: 'Source 1'
      },
      {
        id: '3',
        label: 'Source 2'
      }
    ];
    scope.source = scope.sources[0].id;
    scope.handleOnUpdate = chai.spy(function(quality, source) {
      assert.isNull(quality, 'Unexpected quality');
      assert.equal(source, scope.sources[1].id, 'Wrong source');
    });
    var element = angular.element('<opl-settings ' +
                                  ' opl-qualities="qualities"' +
                                  ' opl-sources="sources"' +
                                  ' opl-source="source"' +
                                  ' opl-on-update="handleOnUpdate(quality, source)"' +
                                  '></opl-settings>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

    var ctrl = element.controller('oplSettings');
    var sourceElements = angular.element(element.find('ul')[1]).find('li');

    ctrl.toggleSettings();
    $timeout.flush();

    angular.element(sourceElements[0]).triggerHandler('blur');
    angular.element(sourceElements[1]).triggerHandler('focus');
    angular.element(sourceElements[1]).triggerHandler({type: 'keydown', keyCode: 13});
    scope.$digest();

    scope.handleOnUpdate.should.have.been.called.exactly(1);
  });

  it('should close settings when clicking outside the component', function() {
    scope.qualities = [
      {
        id: '1',
        label: 'Quality 1'
      }
    ];
    scope.sources = [];
    var element = angular.element('<opl-settings ' +
                                  ' opl-qualities="qualities"' +
                                  ' opl-sources="sources"' +
                                  '></opl-settings>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

    var ctrl = element.controller('oplSettings');

    ctrl.toggleSettings();
    $timeout.flush();

    bodyElement.triggerHandler('mouseup');

    assert.notOk(
      angular.element(element[0].querySelector('.opl-settings')).hasClass('opl-posted'),
      'Expected settings to be closed'
    );
  });

  it('should call function defined in opl-on-focus attribute when button is focused', function() {
    scope.qualities = [];
    scope.sources = [];
    scope.handleOnFocus = chai.spy(function() {});
    var element = angular.element('<opl-settings ' +
                                  ' opl-qualities="qualities"' +
                                  ' opl-sources="sources"' +
                                  ' opl-on-focus="handleOnFocus()"' +
                                  '></opl-settings>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

    element.isolateScope().handleButtonFocus();

    scope.handleOnFocus.should.have.been.called.exactly(1);
  });

  it('should be able to change the list of qualities and sources dynamically', function() {
    var i;
    scope.qualities = [];
    scope.sources = [];
    scope.handleOnFocus = chai.spy(function() {});
    var element = angular.element('<opl-settings ' +
                                  ' opl-qualities="qualities"' +
                                  ' opl-sources="sources"' +
                                  ' opl-on-focus="handleOnFocus()"' +
                                  '></opl-settings>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

    scope.qualities = [
      {
        id: '1',
        label: 'Quality 1'
      },
      {
        id: '2',
        label: 'Quality 2'
      }
    ];
    scope.sources = [
      {
        id: '3',
        label: 'Source 1'
      },
      {
        id: '4',
        label: 'Source 2'
      }
    ];
    scope.$digest();
    $timeout.flush(1000);

    var qualityElements = angular.element(element.find('ul')[0]).find('li');
    var sourceElements = angular.element(element.find('ul')[1]).find('li');

    for (i = 0; i < qualityElements.length; i++) {
      assert.equal(
        angular.element(qualityElements[i]).attr('data-id'),
        scope.qualities[i].id,
        'Wrong quality ' + i
      );
    }

    for (i = 0; i < sourceElements.length; i++) {
      assert.equal(
        angular.element(sourceElements[i]).attr('data-id'),
        scope.sources[i].id,
        'Wrong source ' + i
      );
    }
  });

});
