'use strict';

/**
 * @module ov.player
 */

(function(app) {

  /**
   * Defines a filter to translate an id, contained inside a dictionary of translations, into the appropriated text.
   *
   * @class TranslateFilter
   */
  function TranslateFilter(oplI18nService) {

    /**
     * Translates an id into the appropriated text.
     *
     * @method translate
     * @param {String} id The id of the translation
     * @return {String} The translated string
     */
    return function(id) {
      return oplI18nService.translate(id);
    };

  }

  app.filter('oplTranslate', TranslateFilter);
  TranslateFilter.$inject = ['oplI18nService'];

})(angular.module('ov.player'));
