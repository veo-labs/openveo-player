'use strict';

/**
 * @module ov.player
 */

(function(angular) {

  /**
   * Creates the ov.player module.
   *
   * ov.player offers a directive to easily create a player with associated indexes, chapters and tags. All you have
   * to do is use the component oplPlayer.
   *
   * @main ov.player
   */
  var app = angular.module('ov.player', ['ngCookies']);

  // Player translations
  app.constant('oplI18nTranslations', {
    en: {
      VIDEO_TAB_TITLE: 'Video',
      INDEX_TAB_TITLE: 'Index',
      CHAPTERS_TAB_TITLE: 'Chapters',
      TAGS_TAB_TITLE: 'Tags',
      LOADING: 'Loading...',
      FILE_DOWNLOAD: 'Download',
      MEDIA_ERR_NO_SOURCE: 'A network error caused the video download to fail part-way.',
      MEDIA_ERR_NETWORK: 'A network error caused the video download to fail part-way.',
      MEDIA_ERR_DECODE: 'The video playback was aborted due to a corruption problem ' +
      'or because the video used features your browser did not support.',
      MEDIA_ERR_SRC_NOT_SUPPORTED: 'The video could not be loaded, either because the server or network failed ' +
      'or because the format is not supported.',
      MEDIA_ERR_PERMISSION: 'Video not available or private.',
      MEDIA_ERR_DEFAULT: 'An unknown error occurred.'
    },
    fr: {
      VIDEO_TAB_TITLE: 'Vidéo',
      INDEX_TAB_TITLE: 'Index',
      CHAPTERS_TAB_TITLE: 'Chapitres',
      TAGS_TAB_TITLE: 'Tags',
      LOADING: 'Chargement...',
      FILE_DOWNLOAD: 'Télécharger',
      MEDIA_ERR_NO_SOURCE: 'Une erreur réseau à causé l\'échec du téléchargement de la vidéo.',
      MEDIA_ERR_NETWORK: 'Une erreur réseau à causé l\'échec du téléchargement de la vidéo.',
      MEDIA_ERR_DECODE: 'La lecture de la vidéo a été abandonnée en raison d\' un problème de corruption ' +
      'ou parce que la vidéo utilise des fonctionnalités que votre navigateur ne supporte pas.',
      MEDIA_ERR_SRC_NOT_SUPPORTED: 'La vidéo ne peut être chargée , soit parce que le serveur ou le réseau à échoué ' +
      'ou parce que le format ne sont pas supportées.',
      MEDIA_ERR_PERMISSION: 'Vidéo indisponible ou privée.',
      MEDIA_ERR_DEFAULT: 'Une erreur inconnue est survenue.'
    }
  });

  // Player errors
  // Errors from 1 to 4 are the same as in the HTMLVideoElement specification
  app.constant('oplPlayerErrors', {
    MEDIA_ERR_NO_SOURCE: 0,
    MEDIA_ERR_ABORTED: 1,
    MEDIA_ERR_NETWORK: 2,
    MEDIA_ERR_DECODE: 3,
    MEDIA_ERR_SRC_NOT_SUPPORTED: 4,
    MEDIA_ERR_PERMISSION: 5,
    MEDIA_ERR_UNKNOWN: 6
  });

  // Configures the ov.player application
  app.config(function() {
    var deactivateDashJsLogs = function(player, mediaPlayer) {
      if (videojs && videojs.log) {
        mediaPlayer.getDebug().setLogToBrowserConsole(false);
      }
    };

    if (typeof videojs !== 'undefined' && videojs.Html5DashJS && videojs.Html5DashJS.hook)
      videojs.Html5DashJS.hook('beforeinitialize', deactivateDashJsLogs);
  });

})(angular);
