'use strict';

window.assert = chai.assert;

describe('OplView', function() {
  var $compile;
  var $rootScope;
  var $timeout;
  var scope;
  var element;
  var viewElement;
  var tabsController;
  var ctrl;

  // Load modules
  beforeEach(function() {
    module('ov.player');
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
    scope.label = 'Label';
    scope.html = 'HTML';
    scope.class = 'class';
    scope.id = 'id';
    scope.icon = 'icon_ligature';
    scope.handleOnSelect = chai.spy(function() {});

    element = angular.element('<opl-tabs>' +
                                '<opl-view ' +
                                  'opl-label="{{label}}"' +
                                  'opl-class="{{class}}"' +
                                  'opl-view-id="{{id}}"' +
                                  'opl-icon="{{icon}}"' +
                                  'opl-on-select="handleOnSelect(id)"' +
                                '>' +
                                  '{{html}}' +
                                '</opl-view>' +
                              '</opl-tabs>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush();

    tabsController = element.controller('oplTabs');

    viewElement = angular.element(element[0].querySelector('.' + scope.class));
    ctrl = angular.element(element[0].querySelector('opl-view')).controller('oplView');
  });

  it('should display a tab panel with the transcluded content', function() {
    assert.equal(viewElement.attr('role'), 'tabpanel', 'Wrong role');
    assert.equal(viewElement.attr('id'), scope.id, 'Wrong id');
    assert.equal(viewElement.attr('class'), scope.class, 'Wrong class');
    assert.equal(viewElement.text(), scope.html, 'Wrong content');
    assert.notOk(viewElement.hasClass('ng-hide'), 'Expected view to be displayed');
  });

  it('should add itself to parent oplTabs component', function() {
    assert.strictEqual(tabsController.getSelectedView(), ctrl, 'Wrong view');
  });

  it('should remove itself from parent oplTabs component when destroyed', function() {
    scope.$destroy();
    assert.isNull(tabsController.getSelectedView(), 'Unexpected view');
  });

  it('should be masked if not selected', function() {
    ctrl.selected = false;
    scope.$digest();

    assert.ok(viewElement.hasClass('ng-hide'), 'Expected view to be hidden');
  });

  it('should call function defined in attribute "opl-on-select" when view is selected', function() {
    scope.handleOnSelect = chai.spy(function(id) {
      assert.equal(id, scope.id, 'Wrong id');
    });

    ctrl.selected = false;
    scope.$digest();

    ctrl.selected = true;
    scope.$digest();


    scope.handleOnSelect.should.have.been.called.exactly(1);
  });

});
