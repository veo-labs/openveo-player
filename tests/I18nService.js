'use strict';

window.assert = chai.assert;

// i18nService.js
describe('i18nPlayerService', function() {
  var i18nPlayerService;

  // Load i18n module
  beforeEach(module('ov.player'));

  // Dependencies injections
  beforeEach(inject(function(_i18nPlayerService_) {
    i18nPlayerService = _i18nPlayerService_;
  }));

  it('Should be able to test if a language is supported', function() {
    assert.ok(i18nPlayerService.isLanguageSupported('en'));
    assert.notOk(i18nPlayerService.isLanguageSupported('sw'));
  });

  it('Should be able to set a different language', function() {
    i18nPlayerService.setLanguage('en');
    assert.equal(i18nPlayerService.getLanguage(), 'en');
    i18nPlayerService.setLanguage('fr');
    assert.equal(i18nPlayerService.getLanguage(), 'fr');
    i18nPlayerService.setLanguage('sw');
    assert.equal(i18nPlayerService.getLanguage(), 'en');
  });

  it('Should be able to translate an id', function() {
    i18nPlayerService.setLanguage('en');
    assert.equal(i18nPlayerService.translate('VIDEO_TAB_TITLE'), 'Video');
    i18nPlayerService.setLanguage('fr');
    assert.equal(i18nPlayerService.translate('VIDEO_TAB_TITLE'), 'Vidéo');
  });

});
