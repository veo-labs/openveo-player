'use strict';

/**
 * @module ov.player
 */

(function(angular, app) {

  /**
   * Defines an internationalization service to manage string translations.
   *
   * @class oplI18nService
   */
  function oplI18nService(oplI18nTranslations) {
    var currentLanguage = navigator.language || navigator.browserLanguage;

    /**
     * Tests if a language is supported.
     *
     * @method isLanguageSupported
     * @param {String} language The language code to test (e.g en-CA)
     * @return {Boolean} true if supported, false otherwise
     */
    function isLanguageSupported(language) {
      return Object.keys(oplI18nTranslations).indexOf(language) >= 0;
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
     * @param {Object} [parameters] Parameters with for each parameter the key as the placeholder to replace and the
     * value as the placeholder substitution string
     * @return {String} The translated string
     */
    function translate(id, parameters) {
      var translatedText = (oplI18nTranslations[currentLanguage] && oplI18nTranslations[currentLanguage][id]) || id;

      // Translation does not exist
      // Use english language as default
      if (translatedText === id)
        translatedText = oplI18nTranslations['en'][id] || id;

      // Parameters
      if (parameters) {
        var reg = new RegExp(Object.keys(parameters).join('|'), 'gi');
        translatedText = translatedText.replace(reg, function(matched) {
          return parameters[matched];
        });
      }

      return translatedText;
    }

    return {
      translate: translate,
      isLanguageSupported: isLanguageSupported,
      setLanguage: setLanguage,
      getLanguage: getLanguage
    };

  }

  app.service('oplI18nService', oplI18nService);
  oplI18nService.$inject = ['oplI18nTranslations'];

})(angular, angular.module('ov.player'));
