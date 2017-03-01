'use strict';

window.assert = chai.assert;

// i18nService.js
describe('ovPlayerI18nService', function() {
  var ovPlayerI18nService;

  // Load i18n module
  beforeEach(module('ov.player'));

  // Dependencies injections
  beforeEach(inject(function(_ovPlayerI18nService_) {
    ovPlayerI18nService = _ovPlayerI18nService_;
  }));

  it('Should be able to test if a language is supported', function() {
    assert.ok(ovPlayerI18nService.isLanguageSupported('en'));
    assert.notOk(ovPlayerI18nService.isLanguageSupported('sw'));
  });

  it('Should be able to set a different language', function() {
    ovPlayerI18nService.setLanguage('en');
    assert.equal(ovPlayerI18nService.getLanguage(), 'en');
    ovPlayerI18nService.setLanguage('fr');
    assert.equal(ovPlayerI18nService.getLanguage(), 'fr');
    ovPlayerI18nService.setLanguage('sw');
    assert.equal(ovPlayerI18nService.getLanguage(), 'en');
  });

  it('Should be able to translate an id', function() {
    ovPlayerI18nService.setLanguage('en');
    assert.equal(ovPlayerI18nService.translate('VIDEO_TAB_TITLE'), 'Video');
    ovPlayerI18nService.setLanguage('fr');
    assert.equal(ovPlayerI18nService.translate('VIDEO_TAB_TITLE'), 'Vidéo');
  });

});
