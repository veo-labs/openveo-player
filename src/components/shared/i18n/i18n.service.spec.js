'use strict';

window.assert = chai.assert;

describe('oplI18nService', function() {
  var oplI18nService;

  // Load i18n module
  beforeEach(module('ov.player'));

  // Dependencies injections
  beforeEach(inject(function(_oplI18nService_) {
    oplI18nService = _oplI18nService_;
  }));

  it('should be able to test if a language is supported', function() {
    assert.ok(oplI18nService.isLanguageSupported('en'));
    assert.notOk(oplI18nService.isLanguageSupported('sw'));
  });

  it('should be able to set a different language', function() {
    oplI18nService.setLanguage('en');
    assert.equal(oplI18nService.getLanguage(), 'en');
    oplI18nService.setLanguage('fr');
    assert.equal(oplI18nService.getLanguage(), 'fr');
    oplI18nService.setLanguage('sw');
    assert.equal(oplI18nService.getLanguage(), 'en');
  });

  it('should be able to translate an id', function() {
    oplI18nService.setLanguage('en');
    assert.equal(oplI18nService.translate('VIDEO_TAB_TITLE'), 'Video');
    oplI18nService.setLanguage('fr');
    assert.equal(oplI18nService.translate('VIDEO_TAB_TITLE'), 'Vidéo');
  });

});
