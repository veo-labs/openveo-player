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
      LOADING: 'Loading...',
      MEDIA_ERR_NO_SOURCE: 'A network error caused the video download to fail part-way.',
      MEDIA_ERR_NETWORK: 'A network error caused the video download to fail part-way.',
      MEDIA_ERR_DECODE: 'The video playback was aborted due to a corruption problem ' +
      'or because the video used features your browser did not support.',
      MEDIA_ERR_SRC_NOT_SUPPORTED: 'The video could not be loaded, either because the server or network failed ' +
      'or because the format is not supported.',
      MEDIA_ERR_PERMISSION: 'Video not available or private.',
      MEDIA_ERR_DEFAULT: 'An unknown error occurred.',
      PREVIEW_IMAGE_PRELOAD_ERROR: 'Image not available',
      TILE_MORE_INFO_BUTTON_LABEL: 'More info',
      TILE_CLOSE_BUTTON_LABEL: 'Close',
      TILE_IMAGE_PRELOAD_ERROR: 'Image not available',
      CONTROLS_VOLUME_MUTE_ARIA_LABEL: 'Mute',
      CONTROLS_VOLUME_UNMUTE_ARIA_LABEL: 'Mute',
      CONTROLS_VOLUME_CURSOR_ARIA_LABEL: 'Change volume',
      CONTROLS_VOLUME_TEXT_ARIA_LABEL: 'Volume %value%%',
      CONTROLS_TEMPLATE_SPLIT_50_50_ARIA_LABEL: 'Mode 50/50',
      CONTROLS_TEMPLATE_FULL_1_ARIA_LABEL: 'Mode video only',
      CONTROLS_TEMPLATE_FULL_2_ARIA_LABEL: 'Mode presentation only',
      CONTROLS_TEMPLATE_SPLIT_25_75_ARIA_LABEL: 'Mode with priority on presentation',
      CONTROLS_SETTINGS_ARIA_LABEL: 'Settings',
      CONTROLS_SETTINGS_QUALITIES_TITLE: 'Quality',
      CONTROLS_SETTINGS_SOURCES_TITLE: 'Source',
      CONTROLS_SETTINGS_SOURCE_LABEL: 'Source %source%',
      CONTROLS_PLAY_ARIA_LABEL: 'Play',
      CONTROLS_PAUSE_ARIA_LABEL: 'Pause',
      CONTROLS_TEMPLATES_SELECTOR_ARIA_LABEL: 'Choose player template',
      CONTROLS_TIME_BAR_ARIA_LABEL: 'Navigate in the video',
      CONTROLS_TIME_BAR_ARIA_VALUE_TEXT: '%value%% seen',
      CONTROLS_FULLSCREEN_ARIA_LABEL: 'Fullscreen',
      CONTROLS_FULLSCREEN_EXIT_ARIA_LABEL: 'Exit fullscreen',
      CONTROLS_VEO_LABS_ARIA_LABEL: 'Go to Veo-Labs web site',
      TABS_CHAPTERS_ARIA_LABEL: 'Display chapters',
      TABS_TIMECODES_ARIA_LABEL: 'Display images',
      TABS_TAGS_ARIA_LABEL: 'Display tags'
    },
    fr: {
      LOADING: 'Chargement...',
      MEDIA_ERR_NO_SOURCE: 'Une erreur réseau à causé l\'échec du téléchargement de la vidéo.',
      MEDIA_ERR_NETWORK: 'Une erreur réseau à causé l\'échec du téléchargement de la vidéo.',
      MEDIA_ERR_DECODE: 'La lecture de la vidéo a été abandonnée en raison d\' un problème de corruption ' +
      'ou parce que la vidéo utilise des fonctionnalités que votre navigateur ne supporte pas.',
      MEDIA_ERR_SRC_NOT_SUPPORTED: 'La vidéo ne peut être chargée , soit parce que le serveur ou le réseau à échoué ' +
      'ou parce que le format ne sont pas supportées.',
      MEDIA_ERR_PERMISSION: 'Vidéo indisponible ou privée.',
      MEDIA_ERR_DEFAULT: 'Une erreur inconnue est survenue.',
      PREVIEW_IMAGE_PRELOAD_ERROR: 'Image non disponible',
      TILE_MORE_INFO_BUTTON_LABEL: 'Plus d\'info',
      TILE_CLOSE_BUTTON_LABEL: 'Fermer',
      TILE_IMAGE_PRELOAD_ERROR: 'Image non disponible',
      CONTROLS_VOLUME_MUTE_ARIA_LABEL: 'Désactiver le son',
      CONTROLS_VOLUME_UNMUTE_ARIA_LABEL: 'Activer le son',
      CONTROLS_VOLUME_CURSOR_ARIA_LABEL: 'Modifier le volume',
      CONTROLS_VOLUME_TEXT_ARIA_LABEL: 'Volume à %value%%',
      CONTROLS_TEMPLATE_SPLIT_50_50_ARIA_LABEL: 'Mode 50/50',
      CONTROLS_TEMPLATE_FULL_1_ARIA_LABEL: 'Mode vidéo seule',
      CONTROLS_TEMPLATE_FULL_2_ARIA_LABEL: 'Mode présentation seule',
      CONTROLS_TEMPLATE_SPLIT_25_75_ARIA_LABEL: 'Mode avec priorité sur la présentation',
      CONTROLS_SETTINGS_ARIA_LABEL: 'Paramètres',
      CONTROLS_SETTINGS_QUALITIES_TITLE: 'Qualité',
      CONTROLS_SETTINGS_SOURCES_TITLE: 'Source',
      CONTROLS_SETTINGS_SOURCE_LABEL: 'Source %source%',
      CONTROLS_PLAY_ARIA_LABEL: 'Lire',
      CONTROLS_PAUSE_ARIA_LABEL: 'Pause',
      CONTROLS_TEMPLATES_SELECTOR_ARIA_LABEL: 'Choisir un modèle de player',
      CONTROLS_TIME_BAR_ARIA_LABEL: 'Se déplacer dans la vidéo',
      CONTROLS_TIME_BAR_ARIA_VALUE_TEXT: '%value%% vu',
      CONTROLS_FULLSCREEN_ARIA_LABEL: 'Plein écran',
      CONTROLS_FULLSCREEN_EXIT_ARIA_LABEL: 'Quitter le plein écran',
      CONTROLS_VEO_LABS_ARIA_LABEL: 'Aller sur le site de Veo-Labs',
      TABS_CHAPTERS_ARIA_LABEL: 'Afficher les chapitres',
      TABS_TIMECODES_ARIA_LABEL: 'Afficher les indexes',
      TABS_TAGS_ARIA_LABEL: 'Afficher les tags'
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
