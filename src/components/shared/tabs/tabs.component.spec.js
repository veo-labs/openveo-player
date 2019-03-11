'use strict';

window.assert = chai.assert;

describe('OplTabs', function() {
  var $compile;
  var $rootScope;
  var $timeout;
  var $document;
  var scope;
  var element;
  var tabsElement;
  var tabsListElement;
  var tabElements;
  var viewElements;
  var tabsWrapperElement;
  var ctrl;

  // Load modules
  beforeEach(function() {
    module('ov.player', function($compileProvider) {

      var OplViewController = function($element) {
        var oplTabsCtrl = $element.controller('oplTabs');
        ctrl = this;
        ctrl.selected = false;
        oplTabsCtrl.addView(ctrl);
      };

      // Mock opl-view component
      $compileProvider.component('oplViewMock', {
        template: 'View',
        controller: OplViewController,
        require: ['^oplTabs'],
        bindings: {
          oplLabel: '@?',
          oplClass: '@?',
          oplViewId: '@',
          oplIcon: '@'
        }
      });

    });
    module('templates');
  });

  // Dependencies injections
  beforeEach(inject(function(_$compile_, _$rootScope_, _$timeout_, _$document_) {
    $rootScope = _$rootScope_;
    $compile = _$compile_;
    $timeout = _$timeout_;
    $document = _$document_;
  }));

  // Initializes tests
  beforeEach(function() {
    var viewsHtml = '';
    scope = $rootScope.$new();
    scope.handleOnSelect = chai.spy(function(view) {});
    scope.noTabs = false;
    scope.views = [
      {
        label: 'View 1',
        class: 'view-1',
        id: 'view1',
        icon: 'icon1'
      },
      {
        label: 'View 2',
        class: 'view-2',
        id: 'view2',
        icon: 'icon2'
      }
    ];

    scope.views.forEach(function(view) {
      viewsHtml += '<opl-view-mock ' +
        'opl-label="' + view.label + '" ' +
        'opl-class="' + view.class + '" ' +
        'opl-view-id="' + view.id + '" ' +
        'opl-icon="' + view.icon + '"' +
      '></opl-view-mock>';
    });

    element = angular.element('<opl-tabs ' +
                              'opl-on-select="handleOnSelect(view)"' +
                              'opl-no-tabs="{{noTabs}}"' +
                              '>' + viewsHtml + '</opl-tabs>');

    $document[0].body.appendChild(element[0]);

    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush();

    ctrl = element.controller('oplTabs');
    tabsElement = angular.element(element[0].querySelector('.opl-tabs'));
    tabsListElement = angular.element(element[0].querySelector('ul'));
    tabElements = angular.element(element[0].querySelectorAll('li'));
    viewElements = angular.element(element[0].querySelectorAll('opl-view-mock'));
    tabsWrapperElement = angular.element(element[0].querySelector('.opl-tabs-wrapper'));
  });

  it('should display a list of tabs and a list of views', function() {
    assert.equal(tabsListElement.attr('role'), 'tablist', 'Wrong role attribute');
    assert.equal(tabsListElement.attr('aria-orientation'), 'vertical', 'Wrong aria-orientation attribute');
    assert.equal(tabsListElement.attr('tabindex'), '0', 'Wrong tabindex attribute');
    assert.lengthOf(tabElements, scope.views.length, 'Wrong number of tabs');
    assert.lengthOf(viewElements, scope.views.length, 'Wrong number of views');

    for (var i = 0; i < scope.views.length; i++) {
      var tabElement = angular.element(tabElements[i]);
      var viewElement = angular.element(viewElements[i]);
      var buttonElement = angular.element(tabElement[0].querySelector('opl-button'));
      var viewController = viewElement.controller('oplViewMock');
      assert.equal(tabElement.attr('role'), 'tab', 'Wrong role attribute for tab ' + i);
      assert.equal(
        tabElement.attr('aria-selected'),
        String(viewController.selected),
        'Wrong aria-selected attribute for tab ' + i
      );
      assert.equal(
        tabElement.attr('aria-controls'),
        viewController.oplViewId,
        'Wrong aria-controls attribute for tab ' + i
      );
      assert.equal(
        tabElement.hasClass('opl-selected'),
        viewController.selected,
        (viewController.selected ? 'Expected ' : 'Unexpected') + ' class opl-selected for tab ' + i
      );
      assert.equal(
        buttonElement.attr('opl-icon'),
        String(viewController.oplIcon),
        'Wrong opl-icon attribute for tab ' + i
      );
      assert.equal(
        buttonElement.attr('opl-label'),
        String(viewController.oplLabel),
        'Wrong opl-label attribute for tab ' + i
      );
      assert.equal(
        buttonElement.attr('opl-no-sequential-focus'),
        'true',
        'Wrong opl-no-sequential-focus attribute for tab ' + i
      );
    }
  });

  it('should set class "opl-focus" when the list of tabs is focused', function() {
    assert.notOk(tabsWrapperElement.hasClass('opl-focus'), 'Unexpected class "opl-focus"');

    tabsListElement.triggerHandler('focus');

    assert.ok(tabsWrapperElement.hasClass('opl-focus'), 'Expected class "opl-focus"');

    tabsListElement.triggerHandler('blur');

    assert.notOk(tabsWrapperElement.hasClass('opl-focus'), 'Unexpected class "opl-focus"');
  });

  it('should be able to navigate between tabs using keyboard arrows', function() {
    var buttonElements = element[0].querySelectorAll('opl-button');
    var selectedIndex = 0;
    var i = 0;

    tabsListElement.triggerHandler('focus');

    assert.ok(
      angular.element(buttonElements[0]).controller('oplButton').isFocused(),
      'First tab should be focused by default'
    );

    for (i = 0; i < buttonElements.length + 1; i++) {
      tabsListElement.triggerHandler({type: 'keydown', keyCode: ((i % 2) ? 39 : 40)});
      selectedIndex = (selectedIndex + 1 >= buttonElements.length) ? 0 : selectedIndex + 1;

      assert.ok(
        angular.element(buttonElements[selectedIndex]).controller('oplButton').isFocused(),
        'Tab ' + selectedIndex + ' should be focused'
      );
    }

    for (i = 0; i < buttonElements.length + 1; i++) {
      tabsListElement.triggerHandler({type: 'keydown', keyCode: ((i % 2) ? 37 : 38)});
      selectedIndex = (selectedIndex - 1 < 0) ? buttonElements.length - 1 : selectedIndex - 1;

      assert.ok(
        angular.element(buttonElements[selectedIndex]).controller('oplButton').isFocused(),
        'Tab ' + selectedIndex + ' should be focused'
      );
    }
  });

  it('should set class "opl-no-tabs" on the tabs element if "opl-no-tabs" is set to true', function() {
    assert.notOk(tabsElement.hasClass('opl-no-tabs'), 'Unexpected class "opl-no-tabs"');

    scope.noTabs = true;
    scope.$digest();

    assert.ok(tabsElement.hasClass('opl-no-tabs'), 'Expected class "opl-no-tabs"');
  });

  it('should call the function defined in "opl-on-select" attribute when a view is selected', function() {
    scope.handleOnSelect = chai.spy(function(view) {
      assert.strictEqual(view, scope.views[0], 'Wrong view');
    });

    element.isolateScope().handleButtonAction(scope.views[0]);

    scope.handleOnSelect.should.have.been.called.exactly(1);
  });

  describe('selectViewById', function() {

    it('should select the view corresponding to the given id', function() {
      ctrl.selectViewById(scope.views[0].id);

      assert.ok(
        angular.element(viewElements[0]).controller('oplViewMock').selected,
        'Expected view ' + scope.views[0].id + ' to be selected'
      );

      ctrl.selectViewById(scope.views[1].id);

      assert.notOk(
        angular.element(viewElements[0]).controller('oplViewMock').selected,
        'Expected view ' + scope.views[0].id + ' to be selected'
      );
      assert.ok(
        angular.element(viewElements[1]).controller('oplViewMock').selected,
        'Expected view ' + scope.views[1].id + ' to be selected'
      );
    });

  });

  describe('select', function() {

    it('should select the view ', function() {
      ctrl.select(angular.element(viewElements[0]).controller('oplViewMock'));

      assert.ok(
        angular.element(viewElements[0]).controller('oplViewMock').selected,
        'Expected view ' + scope.views[0].id + ' to be selected'
      );

      ctrl.select(angular.element(viewElements[1]).controller('oplViewMock'));

      assert.notOk(
        angular.element(viewElements[0]).controller('oplViewMock').selected,
        'Expected view ' + scope.views[0].id + ' to be selected'
      );
      assert.ok(
        angular.element(viewElements[1]).controller('oplViewMock').selected,
        'Expected view ' + scope.views[1].id + ' to be selected'
      );
    });

  });

  describe('getSelectedView', function() {

    it('should return the controller of the selected view', function() {
      ctrl.selectViewById(scope.views[0].id);

      assert.ok(ctrl.getSelectedView().oplViewId, scope.views[0].id, 'Expected view ' + scope.views[0].id);

      ctrl.selectViewById(scope.views[1].id);

      assert.ok(ctrl.getSelectedView().oplViewId, scope.views[1].id, 'Expected view ' + scope.views[1].id);
    });

    it('should return null if no selected view', function() {
      angular.element(viewElements[0]).controller('oplViewMock').selected = false;

      assert.isNull(ctrl.getSelectedView(), 'Unexpected view');
    });

  });

});
