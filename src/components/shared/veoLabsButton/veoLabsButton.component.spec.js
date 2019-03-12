'use strict';

window.assert = chai.assert;

describe('OplVeoLabsButton', function() {
  var $compile;
  var $rootScope;
  var scope;

  // Load modules
  beforeEach(function() {
    module('ov.player');
    module('templates');
  });

  // Dependencies injections
  beforeEach(inject(function(_$compile_, _$rootScope_) {
    $rootScope = _$rootScope_;
    $compile = _$compile_;
  }));

  // Initializes tests
  beforeEach(function() {
    scope = $rootScope.$new();
  });

  it('should display a link to Veo-Labs web site', function() {
    scope.label = 'Label';
    var element = angular.element('<opl-veo-labs-button ' +
                                  ' opl-label="{{label}}"' +
                                  '></opl-veo-labs-button>');
    element = $compile(element)(scope);
    scope.$digest();

    var linkElement = element.find('a');

    assert.equal(linkElement.attr('href'), 'https://www.veo-labs.com', 'Wrong URL');
    assert.equal(linkElement.attr('aria-label'), scope.label, 'Wrong label');
  });

  it('should set focus class when link is focused', function() {
    var element = angular.element('<opl-veo-labs-button></opl-veo-labs-button>');
    element = $compile(element)(scope);
    scope.$digest();

    var linkElement = element.find('a');
    var buttonElement = angular.element(element[0].querySelector('.opl-veo-labs-button'));

    linkElement.triggerHandler('focus');

    assert.ok(buttonElement.hasClass('opl-focus'), 'Expected class "opl-focus"');

    linkElement.triggerHandler('blur');

    assert.notOk(buttonElement.hasClass('opl-focus'), 'Unexpected class "opl-focus"');
  });

  it('should call function defined in "opl-on-focus" attribute when focused', function() {
    scope.handleOnFocus = chai.spy(function() {});
    var element = angular.element('<opl-veo-labs-button ' +
                                  ' opl-on-focus="handleOnFocus()"' +
                                  '></opl-veo-labs-button>');
    element = $compile(element)(scope);
    scope.$digest();

    var linkElement = element.find('a');

    linkElement.triggerHandler('focus');

    scope.handleOnFocus.should.have.been.called.exactly(1);
  });

});
