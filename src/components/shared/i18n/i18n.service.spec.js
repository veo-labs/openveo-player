'use strict';

window.assert = chai.assert;

describe('oplI18nService', function() {
  var oplI18nService;
  var expectedTranslations;

  // Mocks
  beforeEach(function() {
    expectedTranslations = {
      en: {},
      fr: {}
    };
    module('ov.player', function($provide) {

      // Mock players
      $provide.constant('oplI18nTranslations', expectedTranslations);

    });
  });

  // Dependencies injections
  beforeEach(inject(function(_oplI18nService_) {
    oplI18nService = _oplI18nService_;
  }));

  describe('isLanguageSupported', function() {

    it('should indicate if a language is supported or not', function() {
      assert.ok(
        oplI18nService.isLanguageSupported(Object.keys(expectedTranslations)[0]),
        'Expected language support'
      );
      assert.notOk(oplI18nService.isLanguageSupported('not supported language'), 'Unexpected language support');
    });

  });

  describe('setLanguage', function() {

    it('should set a different language', function() {
      oplI18nService.setLanguage('en');
      assert.equal(oplI18nService.getLanguage(), 'en', 'Expected "en" language');
      oplI18nService.setLanguage('fr');
      assert.equal(oplI18nService.getLanguage(), 'fr', 'Expected "fr" language');
    });

    it('should set language to "en" if specified language is not supported', function() {
      oplI18nService.setLanguage('not supported language');
      assert.equal(oplI18nService.getLanguage(), 'en', 'Expected "en" language');
    });

  });

  describe('translate', function() {

    it('should translate a string using current language', function() {
      expectedTranslations.en.TRANSLATION_ID = 'English';
      expectedTranslations.fr.TRANSLATION_ID = 'Français';

      oplI18nService.setLanguage('en');
      assert.equal(
        oplI18nService.translate('TRANSLATION_ID'),
        expectedTranslations.en.TRANSLATION_ID,
        'Wrong english translation'
      );
      oplI18nService.setLanguage('fr');
      assert.equal(
        oplI18nService.translate('TRANSLATION_ID'),
        expectedTranslations.fr.TRANSLATION_ID,
        'Wrong french translation'
      );
    });

    it('should translate string in english if no translation found for the curent language', function() {
      expectedTranslations.en.TRANSLATION_ID = 'English';
      oplI18nService.setLanguage('fr');
      assert.equal(
        oplI18nService.translate('TRANSLATION_ID'),
        expectedTranslations.en.TRANSLATION_ID,
        'Wrong translation'
      );
    });

    it('should not translate string if no translation found', function() {
      var expectedTranslation = 'wrong translation id';
      assert.equal(oplI18nService.translate(expectedTranslation), expectedTranslation, 'Wrong translation');
    });

    it('should replace specified placeholders by associated values in the translated string', function() {
      var expectedParameters = {
        '%placeholder%': 'Substitution text'
      };
      expectedTranslations.en.TRANSLATION_ID = 'Text to replace: %placeholder%';
      oplI18nService.setLanguage('en');
      assert.equal(
        oplI18nService.translate('TRANSLATION_ID', expectedParameters),
        expectedTranslations.en.TRANSLATION_ID.replace('%placeholder%', expectedParameters['%placeholder%']),
        'Wrong translation'
      );
    });

  });

});
