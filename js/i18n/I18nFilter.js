'use strict';

(function(app) {

  /**
   * Defines a filter to translate an id, contained inside a dictionary of translations,
   * into the appropriated text.
   *
   * @module ov.player
   * @class TranslateFilter
   */
  function TranslateFilter(i18nPlayerService) {

    /**
     * Translates an id into the appropriated text.
     *
     * @method translate
     * @param {String} id The id of the translation
     * @return {String} The translated string
     */
    return function(id) {
      return i18nPlayerService.translate(id);
    };

  }

  app.filter('ovPlayerTranslate', TranslateFilter);
  TranslateFilter.$inject = ['ovPlayerI18nService'];

})(angular.module('ov.player'));
