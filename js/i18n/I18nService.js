'use strict';

(function(angular, app) {

  /**
   * Defines an internationalization service to manage string translations.
   *
   * @module ov.player
   * @class I18nService
   */
  function I18nService(i18nTranslations) {
    var currentLanguage = navigator.language || navigator.browserLanguage;

    /**
     * Tests if a language is supported.
     *
     * @method isLanguageSupported
     * @param {String} language The language code to test (e.g en-CA)
     * @return {Boolean} true if supported, false otherwise
     */
    function isLanguageSupported(language) {
      return Object.keys(i18nTranslations).indexOf(language) >= 0;
    }

    /**
     * Sets current language.
     *
     * @method setLanguage
     * @param {String} language The current language country code (e.g en-CA)
     */
    function setLanguage(language) {
      if (isLanguageSupported(language))
        currentLanguage = language;
      else
        currentLanguage = 'en';
    }

    /**
     * Gets current language.
     *
     * @method getLanguage
     * @return {String} The current language country code (e.g en-US)
     */
    function getLanguage() {
      return currentLanguage;
    }

    /**
     * Translates the given id using current language.
     *
     * @method translate
     * @param {String} id The id of the translation
     * @return {String} The translated string
     */
    function translate(id) {
      var translatedText = (i18nTranslations[currentLanguage] && i18nTranslations[currentLanguage][id]) || id;

      // Translation does not exist
      // Use english language as default
      if (translatedText === id)
        translatedText = i18nTranslations['en'][id] || id;

      return translatedText;
    }

    return {
      translate: translate,
      isLanguageSupported: isLanguageSupported,
      setLanguage: setLanguage,
      getLanguage: getLanguage
    };

  }

  app.service('ovPlayerI18nService', I18nService);
  I18nService.$inject = ['ovPlayerI18nTranslations'];

})(angular, angular.module('ov.player'));
