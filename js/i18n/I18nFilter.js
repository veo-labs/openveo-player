'use strict';

(function(app) {

  /**
   * Defines a filter to translate an id, contained inside a dictionary of translations,
   * into the appropriated text.
   */
  function TranslateFilter(i18nPlayerService) {

    /**
     * Translates an id into the appropriated text.
     * @param {String} id The id of the translation
     */
    return function(id) {
      return i18nPlayerService.translate(id);
    };

  }

  app.filter('ovTranslate', TranslateFilter);
  TranslateFilter.$inject = ['i18nPlayerService'];

})(angular.module('ov.player'));
