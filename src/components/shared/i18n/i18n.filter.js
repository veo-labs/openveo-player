'use strict';

/**
 * @module ov.player
 */

(function(app) {

  /**
   * Defines a filter to translate an id, contained inside a dictionary of translations, into the appropriated text.
   *
   *
   * @example
   *     // Translation dictionary
   *     var translations = {
   *       SIMPLE_TRANSLATION_ID: 'Simple translation',
   *       TRANSLATION_WITH_PARAMETERS_ID: 'Translation with "%parameter%"'
   *     };
   *
   *     $scope.translationParameters = {
   *       '%parameter%': 'my value'
   *     };
   *
   * @example
   *     <!-- Simple translation -->
   *     <p>{{'SIMPLE_TRANSLATION_ID' | oplTranslate}}</p>
   *
   *     <!-- Translation with parameters -->
   *     <p>{{'TRANSLATION_WITH_PARAMETERS_ID' | oplTranslate:translationParameters}}</p>
   *
   * @class TranslateFilter
   */
  function TranslateFilter(oplI18nService) {

    /**
     * Translates an id into the appropriated text.
     *
     * @method translate
     * @param {String} id The id of the translation
     * @param {Object} [parameters] Parameters with for each parameter the key as the placeholder to replace and the
     * value as the placeholder substitution string
     * @return {String} The translated string
     */
    return function(id, parameters) {
      return oplI18nService.translate(id, parameters);
    };

  }

  app.filter('oplTranslate', TranslateFilter);
  TranslateFilter.$inject = ['oplI18nService'];

})(angular.module('ov.player'));
