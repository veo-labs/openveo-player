'use strict';

/**
 * @module ov.player
 */

(function(app) {

  /**
   * Manages oplTiles component.
   *
   * @param {Object} $scope The component isolated scope
   * @param {Object} $element The HTML element holding the component
   * @param {Object} $timeout AngularJS $timeout service
   * @param {Object} $window AngularJS $window service
   * @param {Object} $document AngularJS $document service
   * @param {Object} $compile AngularJS $compile service
   * @param {Object} $rootScope AngularJS $rootScope service
   * @param {Object} $q AngularJS $q service
   * @param {Object} oplDomFactory Helper to manipulate the DOM
   * @class OplTilesController
   * @constructor
   */
  function OplTilesController(
    $scope,
    $element,
    $timeout,
    $window,
    $document,
    $compile,
    $rootScope,
    $q,
    oplDomFactory
  ) {
    var ctrl = this;
    var tilesElement;
    var tileElements;
    var tileWrapperElements;
    var tilesContentElement;
    var tilesListElement;
    var scrollerElement;
    var enlargedTileElementSize;
    var tilesElementSize;
    var tileElementSize;
    var tilesContentWidth;
    var leaveRequested;
    var scrollTimeoutPromise;
    var tilesAnimationTimer;
    var tileAnimationTimer;
    var enlargedTileIndex = null;
    var tileIndexRequestingFocus = null;
    var tileMargin = 8;
    var marginTop = 40;
    var document = $document[0];
    var lastTime = 0;
    var reseting = false;
    var resetRequested = false;
    var initialized = false;
    var expectedTilesPreload = false;

    $scope.scrollerValue = 0;

    /**
     * Calculates the position and size of the enlarged tile.
     *
     * It also sets the position and size of the resized tile. If tile size is too large for its container you can
     * set resizedWidth and resizedHeight to make the tile fit in its container.
     * Position and dimension of the enlarged tile are stored as CSS variables in the tiles element.
     *
     * @param {Number} [resizedWidth] The resized tile width
     * @param {Number} [resizedHeight] The resized tile height
     */
    function computeEnlargedProperties(resizedWidth, resizedHeight) {
      resizedWidth = resizedWidth || 0;
      resizedHeight = resizedHeight || 0;

      // Calculates the position and size of the enlarged tile
      var scrollValue = scrollerElement.controller('oplScroller').getScrollValue();
      var enlargedHeight =
          (enlargedTileElementSize && enlargedTileElementSize.height) || 0;
      var enlargedWidth =
          (enlargedTileElementSize && enlargedTileElementSize.width) || 0;
      var enlargedTileMaxHeight = tilesElementSize.height - tileMargin * 2 - marginTop;
      var enlargedTileMaxWidth = tilesElementSize.width - tileMargin * 2;
      var enlargedAvailableYSpace = enlargedTileMaxHeight - enlargedHeight;
      var enlargedAvailableXSpace = enlargedTileMaxWidth - enlargedWidth;
      var enlargedXPos = scrollValue + tileMargin + enlargedAvailableXSpace / 2;
      var enlargedYPos = -enlargedAvailableYSpace / 2;

      // Calculates the position and size of the resized tile
      var resizedAvailableYSpace = enlargedTileMaxHeight - resizedHeight;
      var resizedAvailableXSpace = enlargedTileMaxWidth - resizedWidth;
      var resizedXPos = scrollValue + tileMargin + resizedAvailableXSpace / 2;
      var resizedYPos = -resizedAvailableYSpace / 2;

      tilesElement.attr(
        'style',
        '--opl-tiles-enlarged-height: ' + enlargedHeight + 'px;' +
        '--opl-tiles-enlarged-width: ' + enlargedWidth + 'px;' +
        '--opl-tiles-enlarged-xpos: ' + enlargedXPos + 'px;' +
        '--opl-tiles-enlarged-ypos: ' + enlargedYPos + 'px;' +

        '--opl-tiles-resized-height: ' + resizedHeight + 'px;' +
        '--opl-tiles-resized-width: ' + resizedWidth + 'px;' +
        '--opl-tiles-resized-xpos: ' + resizedXPos + 'px;' +
        '--opl-tiles-resized-ypos: ' + resizedYPos + 'px;'
      );
    }

    /**
     * Computes the tiles element size.
     *
     * @return {Promise} A promise resolving with the computed tiles element size
     */
    function computeTilesContainerSize() {
      var deferred = $q.defer();

      oplDomFactory.waitForElementDimension(tilesElement[0], [
        {
          property: 'clientWidth',
          notEqual: 0
        },
        {
          property: 'clientHeight',
          notEqual: 0
        }
      ]).then(function(boundingRectangle) {
        deferred.resolve({
          width: boundingRectangle.clientWidth,
          height: boundingRectangle.clientHeight
        });
      }, function() {
        deferred.resolve({
          width: tilesElement[0].clientWidth,
          height: tilesElement[0].clientHeight
        });
      });

      return deferred.promise;
    }

    /**
     * Computes tile size.
     *
     * @return {Promise} A promise resolving with the computed tile size
     */
    function computeTileSize() {
      if (!tileWrapperElements.length) {
        return $q.when({
          width: 0,
          height: 0
        });
      }
      var deferred = $q.defer();

      oplDomFactory.waitForElementDimension(tileWrapperElements[0], [
        {
          property: 'clientWidth',
          notEqual: 0
        }
      ]).then(function(boundingRectangle) {
        deferred.resolve({
          width: boundingRectangle.clientWidth,
          height: boundingRectangle.clientHeight
        });
      }, function() {
        deferred.resolve({
          width: tileWrapperElements[0].clientWidth,
          height: tileWrapperElements[0].clientHeight
        });
      });

      return deferred.promise;
    }

    /**
     * Gets the list of visible tiles regarding scroller value.
     *
     * The list of visible tiles is the list of tiles fitting in the scrollable container frame.
     *
     * @return {Array} The list of tiles
     */
    function getVisibleTiles() {
      if (!tilesElementSize || !tileElementSize) return;

      var scrollLeft = scrollerElement.controller('oplScroller').getScrollValue();
      var totalLeftTilesMasked = Math.round(
        tileWrapperElements.length -
        ((tilesContentWidth - scrollLeft) / (tileMargin + tileElementSize.width))
      );
      var maxVisibleTiles = Math.round(
        tilesElementSize.width / (tileMargin + tileElementSize.width)
      );

      return tileWrapperElements.slice(totalLeftTilesMasked, totalLeftTilesMasked + maxVisibleTiles).map(
        function(tileWrapperElement) {
          return tileWrapperElement.querySelector('opl-tile');
        }
      );
    }

    /**
     * Scrolls to the given tile.
     *
     * @param {Number} index The index of the tile in the list of tiles
     */
    function scrollToTile(index) {
      if (!tileWrapperElements || !tileWrapperElements.length || !ctrl.automaticScrollActivated) return;

      scrollerElement.controller('oplScroller').setScrollValue(
        (tileMargin + tileElementSize.width) * index
      );
    }

    /**
     * Focuses a tile.
     *
     * @param {Number} index The index of the tile in the list of tiles
     */
    function focusTile(index) {
      angular.element(tileElements[index]).controller('oplTile').focus();
    }

    /**
     * Focuses previous/next tile based on focused tile.
     *
     * @param {Boolean} next true to focus next tile, false to focus previous tile
     */
    function focusSiblingTile(next) {

      // Find focused tab
      var focusedTileIndex = 0;
      for (var i = 0; i < tileElements.length; i++) {
        if (angular.element(tileElements[i]).controller('oplTile').isFocused()) {
          focusedTileIndex = i;
          break;
        }
      }

      var siblingTileIndex = next ? focusedTileIndex + 1 : focusedTileIndex - 1;

      if (siblingTileIndex >= tileElements.length) siblingTileIndex = 0;
      if (siblingTileIndex < 0) siblingTileIndex = tileElements.length - 1;

      focusTile(siblingTileIndex);
    }

    /**
     * Resets tiles.
     *
     * Calls "reset" method of each tile component.
     */
    function resetTiles() {
      if (!tileElements || !tileElements.length) return;

      tileElements.forEach(function(tileElement) {
        var tileController = angular.element(tileElement).controller('oplTile');
        if (tileController) tileController.reset();
      });
    }

    /**
     * Updates the position of a tile and sets it reduced position.
     *
     * @param {Number} index The index of the tile in the list of tiles
     */
    function updateTile(index) {
      if (!tileWrapperElements || !tileWrapperElements.length) return;

      var tileWidth = tileElementSize.width;
      var tileWrapperElement = tileWrapperElements[index];
      var tileWrapperXPosition = ((index + 1) * tileMargin) + (index * tileWidth);
      var tileWrapperYPosition = 0;

      angular.element(tileWrapperElement).attr(
        'style',
        'transform: translateX(' +
          ((enlargedTileIndex === index) ? 'var(--opl-tiles-enlarged-xpos)' : tileWrapperXPosition + 'px') +
        ') translateY(' +
          ((enlargedTileIndex === index) ? 'var(--opl-tiles-enlarged-ypos)' : '0') +
        ');' +
        '--opl-tiles-reduced-xpos: ' + tileWrapperXPosition + 'px;' +
        '--opl-tiles-reduced-ypos: ' + tileWrapperYPosition + 'px;'
      );
    }

    /**
     * Updates tiles.
     *
     * Translate each tile on x-axis to make them appear next to each other.
     */
    function updateTiles() {
      if (!tileWrapperElements || !tileWrapperElements.length) return;

      // Get tile dimensions
      var tileWidth = tileElementSize.width;

      for (var i = 0; i < tileWrapperElements.length; i++) updateTile(i);
      tilesContentWidth =
        tileWidth * tileWrapperElements.length + tileWrapperElements.length * tileMargin + tileMargin;
      tilesContentElement.attr('style', 'width: ' + tilesContentWidth + 'px;');
    }

    /**
     * Preloads visible tiles.
     *
     * Calls "preload" method of on visible tile components.
     */
    function preloadTiles() {
      var tiles = getVisibleTiles();
      if (!tiles) return;

      tiles.forEach(function(tileElement) {
        var tileController = angular.element(tileElement).controller('oplTile');
        if (tileController) angular.element(tileElement).controller('oplTile').preload();
      });
    }

    /**
     * Calculates the full size of an enlarged tile.
     *
     * In case of a tile of type "text" it creates a temporary opl-tile element copying the given tile and add it to
     * the DOM to find its size. Tile description has no limitation in height to get the full height of the tile in
     * case height is infinite.
     * In case of a tile of type "image" it resolves the promise with the size of the large image if already preloaded
     * or enlarged tile maximum size. If large image is not already preloaded, it will be as soon as the tile will be
     * set as enlarged. "opl-on-image-preloaded" attribute is used to be informed when large image has been preloaded.
     *
     * @param {String} index The index of the tile in the list of tiles
     * @return {Promise} A promise resolving with the size of the tile
     */
    function computeTileFullSize(index) {
      if (!tilesElementSize) return $q.reject();

      var enlargedTileMaxHeight = tilesElementSize.height - marginTop - tileMargin * 2;
      var enlargedTileMaxWidth = tilesElementSize.width - tileMargin * 2;
      var tileElement = angular.element(tileElements[index]);

      if (ctrl.oplData[index].type === 'image') {
        var imageSize = tileElement.controller('oplTile').largeImageSize;

        return $q.when({
          width: imageSize ? imageSize.width : enlargedTileMaxWidth,
          height: imageSize ? imageSize.height : enlargedTileMaxHeight
        });
      }

      var liElement;
      var deferred = $q.defer();
      var isolatedScope = $rootScope.$new(true);
      var ghostTileXPosition = Math.max(tilesElementSize.width + tileMargin, tilesContentWidth + tileMargin);

      isolatedScope.ghostTile = angular.copy(ctrl.oplData[index]);
      isolatedScope.ghostTile.abstract = false;

      isolatedScope.handleReady = function() {
        var tileHeight = liElement.find('opl-tile').controller('oplTile').getTileHeight(enlargedTileMaxHeight);

        oplDomFactory.waitForElementDimension(liElement[0], [
          {
            property: 'height',
            notEqual: 0
          }
        ]).then(function(boundingRectangle) {
          boundingRectangle.height = Math.min(enlargedTileMaxHeight, tileHeight);
          boundingRectangle.width = (tilesElementSize.width - tileMargin * 2);
          liElement.remove();
          deferred.resolve(boundingRectangle);
        });
      };

      var oplTileElement = angular.element(document.createElement('opl-tile'));
      liElement = angular.element(document.createElement('li'));

      liElement.addClass('opl-tile-wrapper opl-ghost-tile');
      liElement.attr(
        'style',
        'transform: translateX(' + ghostTileXPosition + 'px);' +
        'width: var(--opl-tiles-enlarged-width);' +
        'height: auto;'
      );
      oplTileElement.attr('opl-data', 'ghostTile');
      oplTileElement.attr('opl-abstract', 'ghostTile.abstract');
      oplTileElement.attr('opl-on-ready', 'handleReady()');

      liElement.append(oplTileElement);
      tilesListElement.append(liElement);

      $compile(oplTileElement)(isolatedScope);
      return deferred.promise;
    }

    /**
     * Finds the index of the tile which corresponds the best to the given time.
     *
     * It looks for the tile equal or just following the given time.
     *
     * @param {Number} time Time in milliseconds
     * @return {Number} The tile index in the list of tiles
     */
    function findTileIndexByTime(time) {
      var index = 0;

      for (var i = 0; i < tileElements.length; i++) {
        var tileController = angular.element(tileElements[i]).controller('oplTile');
        if (tileController && tileController.oplData.time > time) break;
        index = i;
      }

      return index;
    }

    /**
     * Finds the index of the tile which corresponds to the given id.
     *
     * @param {Number} id Tile id to look for
     * @return {Number} The tile index in the list of tiles
     */
    function findTileIndexById(id) {
      for (var i = 0; i < tileWrapperElements.length; i++) {
        if (angular.element(tileWrapperElements[i]).attr('data-id') === String(id)) return i;
      }

      return null;
    }

    /**
     * Selects the tile corresponding to the given time.
     *
     * Tiles with a time anterior to the selected tile are marked as past.
     *
     * @param {Number} time Time in milliseconds
     */
    function selectTile(time) {
      if (!ctrl.oplData || !tileElements) return;

      var tileIndexToSelect = findTileIndexByTime(time);

      for (var i = 0; i < tileWrapperElements.length; i++) {
        var tileWrapperElement = angular.element(tileWrapperElements[i]);
        if (i < tileIndexToSelect) {
          tileWrapperElement.removeClass('opl-selected');
          tileWrapperElement.addClass('opl-past');
        } else if (i === tileIndexToSelect) {
          tileWrapperElement.removeClass('opl-past');
          tileWrapperElement.addClass('opl-selected');
          scrollToTile(i);
        } else {
          tileWrapperElement.removeClass('opl-past opl-selected');
        }
      }
    }

    /**
     * Handles keydown events.
     *
     * Tiles component captures the following keyboard keys:
     *  - LEFT and TOP keys to select previous tile
     *  - RIGHT and BOTTOM keys to select next tile
     *  - BEGIN key to select the first tile
     *  - END key to select the last tile
     *
     * Captured keys will prevent default browser actions.
     *
     * @param {KeyboardEvent} event The captured event
     */
    function handleKeyDown(event) {
      if ((event.key === 'Tab' || event.keyCode === 9) && event.shiftKey) {
        leaveRequested = true;
        return;
      } else if ((event.key === 'ArrowLeft' || event.keyCode === 37) ||
               (event.key === 'ArrowUp' || event.keyCode === 38)
      ) {
        if (enlargedTileIndex !== null) {
          focusTile(enlargedTileIndex);
        } else {
          focusSiblingTile(false);
          preloadTiles();
        }
      } else if ((event.key === 'ArrowRight' || event.keyCode === 39) ||
               (event.key === 'ArrowDown' || event.keyCode === 40)
      ) {
        if (enlargedTileIndex !== null) {
          focusTile(enlargedTileIndex);
        } else {
          focusSiblingTile(true);
          preloadTiles();
        }
      } else if (event.key === 'Home' || event.keyCode === 36) {
        focusTile((enlargedTileIndex !== null) ? enlargedTileIndex : 0);
      } else if (event.key === 'End' || event.keyCode === 35) {
        if (enlargedTileIndex !== null) {
          focusTile(enlargedTileIndex);
        } else {
          focusTile(tileElements.length - 1);
          preloadTiles();
        }
      } else return;

      event.preventDefault();
    }

    /**
     * Handles focus event.
     *
     * Add focus class to the tiles element.
     *
     * @param {FocusEvent} event The captured event
     */
    function handleFocus(event) {
      tilesElement.addClass('opl-focus');

      if (leaveRequested) {
        leaveRequested = false;
        return;
      }

      focusTile((enlargedTileIndex !== null) ? enlargedTileIndex : 0);
    }

    /**
     * Handles blur event.
     *
     * Remove focus class from the tiles element.
     *
     * @param {FocusEvent} event The captured event
     */
    function handleBlur(event) {
      leaveRequested = false;
      tilesElement.removeClass('opl-focus');
    }

    /**
     * Handles resize event.
     *
     * When window is resized, the tiles component may have been resized too and thus the position and size of tiles
     * might need to be recalculated.
     *
     * @param {Event} event The captured event
     */
    function handleResize(event) {
      ctrl.reset();
    }

    /**
     * Sets event listeners on HTML elements of the tiles component.
     */
    function setEventListeners() {
      tilesElement.on('focus', handleFocus);
      tilesElement.on('blur', handleBlur);
      tilesElement.on('keydown', handleKeyDown);
      angular.element($window).on('resize', handleResize);
    }

    /**
     * Removes event listeners set with setEventListeners.
     */
    function clearEventListeners() {
      if (tilesElement) tilesElement.off('focus blur keydown');
      angular.element($window).off('resize', handleResize);
    }

    /**
     * Animates the masking of tiles.
     *
     * @param {String} [excludedTileIndex] An eventually tile index to not mask
     * @return {Promise} Promise resolving when animation is finished
     */
    function animateTilesMasking(excludedTileIndex) {
      if (tilesAnimationTimer) return $q.when();
      var deferred = $q.defer();

      for (var i = 0; i < tileWrapperElements.length; i++) {
        if (i === excludedTileIndex) continue;

        var tileWrapperElement = angular.element(tileWrapperElements[i]);
        tileWrapperElement.addClass('opl-masking');
      }

      // An animation is associated to the "opl-masking" class, wait for it to finish
      // Delay corresponds to the animation duration
      tilesAnimationTimer = $timeout(function() {
        tilesAnimationTimer = null;

        for (var i = 0; i < tileWrapperElements.length; i++) {
          if (i === excludedTileIndex) continue;
          var tileWrapperElement = angular.element(tileWrapperElements[i]);
          tileWrapperElement.addClass('opl-masked');
          tileWrapperElement.removeClass('opl-masking');
        }
        deferred.resolve();
      }, 50);

      return deferred.promise;
    }

    /**
     * Animates the posting of tiles.
     *
     * @param {String} [excludedTileIndex] An eventually tile index to not post
     * @return {Promise} Promise resolving when animation is finished
     */
    function animateTilesPosting(excludedTileIndex) {
      if (tilesAnimationTimer) return $q.when();
      var deferred = $q.defer();

      for (var i = 0; i < tileWrapperElements.length; i++) {
        if (i === excludedTileIndex) continue;

        var tileWrapperElement = angular.element(tileWrapperElements[i]);
        tileWrapperElement.removeClass('opl-masked');
        tileWrapperElement.addClass('opl-posting');
      }

      // An animation is associated to the "opl-posting" class, wait for it to finish
      // Delay corresponds to the animation duration
      tilesAnimationTimer = $timeout(function() {
        tilesAnimationTimer = null;

        for (var i = 0; i < tileWrapperElements.length; i++) {
          if (i === excludedTileIndex) continue;
          var tileWrapperElement = angular.element(tileWrapperElements[i]);
          tileWrapperElement.removeClass('opl-posting');
        }
        deferred.resolve();
      }, 50);

      return deferred.promise;
    }

    /**
     * Animates resize of the enlarged tile.
     *
     * @return {Promise} Promise resolving when animation is finished
     */
    function animateResizing() {
      if (tileAnimationTimer) return $q.when();
      var deferred = $q.defer();
      var tileWrapperElement = angular.element(tileWrapperElements[enlargedTileIndex]);

      tileWrapperElement.removeClass('opl-enlarged');
      tileWrapperElement.addClass('opl-resizing');

      // An animation is associated to the "opl-resizing" class, wait for it to finish
      // Delay corresponds to the animation duration
      tileAnimationTimer = $timeout(function() {
        tileAnimationTimer = null;
        tileWrapperElement.removeClass('opl-resizing');
        tileWrapperElement.addClass('opl-resized');
        deferred.resolve();
      }, 50);

      return deferred.promise;
    }

    /**
     * Animates the enlarging of a tile.
     *
     * @param {String} index The tile index in the list of tiles
     * @return {Promise} Promise resolving when animation is finished
     */
    function animateTileEnlarging(index) {
      if (tileAnimationTimer) return $q.when();
      var deferred = $q.defer();
      var tileWrapperElement = angular.element(tileWrapperElements[index]);

      tileWrapperElement.addClass('opl-enlarging');

      // An animation is associated to the "opl-enlarging" class, wait for it to finish
      // Delay corresponds to the animation duration
      tileAnimationTimer = $timeout(function() {
        tileAnimationTimer = null;
        tileWrapperElement.addClass('opl-enlarged');
        tileWrapperElement.removeClass('opl-enlarging');
        deferred.resolve();
      }, 600);

      return deferred.promise;
    }

    /**
     * Animates the reducing of a tile.
     *
     * @param {String} index The tile index in the list of tiles
     * @return {Promise} Promise resolving when animation is finished
     */
    function animateTileReducing(index) {
      if (tileAnimationTimer) return $q.when();
      var deferred = $q.defer();

      var tileWrapperElement = angular.element(tileWrapperElements[index]);

      tileWrapperElement.addClass('opl-reducing');
      tileWrapperElement.removeClass('opl-enlarged opl-resized');

      // An animation is associated to the "opl-reducing" class, wait for it to finish
      // Delay corresponds to the animation duration
      tileAnimationTimer = $timeout(function() {
        tileAnimationTimer = null;
        tileWrapperElement.removeClass('opl-reducing');
        deferred.resolve();
      }, 500);

      return deferred.promise;
    }

    /**
     * Enlarges a tile and masks other tiles.
     *
     * @param {Number} index The index of the tile to enlarge
     * @return {Promise} Promise resolving when tile is enlarged
     */
    function enlargeTile(index) {
      if (!tileWrapperElements || !tileWrapperElements.length) return $q.reject('Component not initialized');
      var deferred = $q.defer();

      computeEnlargedProperties();

      requestAnimationFrame(function() {
        animateTilesMasking(index).then(function() {
          return animateTileEnlarging(index);
        }).then(function() {

          // Set tile as enlarged
          ctrl.oplData[index].abstract = false;

          enlargedTileIndex = index;
          updateTile(index);

          // Wait for tile to be modified
          tileIndexRequestingFocus = enlargedTileIndex;

          // Deactivate tiles scroller
          ctrl.scrollerDeactivated = true;

          deferred.resolve();
        }).catch(function(reason) {
          deferred.reject(reason);
        });
      });

      return deferred.promise;
    }

    /**
     * Reduces the enlarged tile and displays other tiles.
     *
     * @return {Promise} Promise resolving when tile is reduced
     */
    function reduceTile() {
      if (!tileWrapperElements || !tileWrapperElements.length) return $q.reject('Component is not initialized');
      var deferred = $q.defer();

      requestAnimationFrame(function() {
        animateTilesPosting(enlargedTileIndex).then(function() {
          return animateTileReducing(enlargedTileIndex);
        }).then(function() {

          // Set tile as reduced
          ctrl.oplData[enlargedTileIndex].abstract = true;

          // Wait for tile to be modified
          tileIndexRequestingFocus = enlargedTileIndex;

          enlargedTileIndex = null;
          updateTile(tileIndexRequestingFocus);

          // Deactivate tiles scroller
          ctrl.scrollerDeactivated = false;

          deferred.resolve();
        }).catch(function(reason) {
          deferred.reject(reason);
        });
      });

      return deferred.promise;
    }

    Object.defineProperties(ctrl, {

      /**
       * Indicates if automatic scroll is activated or not.
       *
       * @property automaticScrollActivated
       * @type Boolean
       */
      automaticScrollActivated: {
        value: false,
        writable: true
      },

      /**
       * Indicates if scroller is deactivated or not.
       *
       * @property scrollerDeactivated
       * @type Boolean
       */
      scrollerDeactivated: {
        value: false,
        writable: true
      },

      /**
       * Enlarges a tile.
       *
       * @method enlargeTile
       * @param {String} id The tile id
       * @return {Promise} Promise resolving when tile is enlarged
       */
      enlargeTile: {
        value: function(id) {
          if (!tileWrapperElements || !tileWrapperElements.length) return $q.reject('Component not initialized');
          var deferred = $q.defer();

          // Deactivate automatic scroll
          ctrl.automaticScrollActivated = false;

          var tileIndex = findTileIndexById(id);

          // Compute the size of the tile as it will be when enlarged
          computeTileFullSize(tileIndex).then(function(tileSize) {
            enlargedTileElementSize = tileSize;
            enlargeTile(tileIndex).then(function() {
              deferred.resolve();
            }).catch(function(reason) {
              deferred.reject(reason);
            });
          });

          return deferred.promise;
        }
      },

      /**
       * Reduces the enlarged tile.
       *
       * @method reduceTile
       * @return {Promise} Promise resolving when tile is reduced
       */
      reduceTile: {
        value: function() {
          if (!tileWrapperElements || !tileWrapperElements.length)
            return $q.reject('Component not initialized or no enlarged tile');

          if (enlargedTileIndex === null) return $q.when();

          return reduceTile();
        }
      },

      /**
       * Resets tiles component.
       *
       * @method reset
       */
      reset: {
        value: function() {
          if (!initialized) return;

          if (reseting) {
            resetRequested = true;
            return;
          }

          reseting = true;

          tilesElement = angular.element($element[0].querySelector('.opl-tiles'));
          tilesListElement = angular.element($element[0].querySelector('ul'));
          tileElements = $element[0].querySelectorAll('opl-tile');
          tileWrapperElements = Array.prototype.slice.call($element[0].querySelectorAll('li'));
          scrollerElement = angular.element($element[0].querySelector('opl-scroller'));
          tilesContentElement = angular.element($element[0].querySelector('.opl-tiles-content'));

          $q.all([
            computeTilesContainerSize(),
            computeTileSize(),
            oplDomFactory.waitForController(scrollerElement[0], 'oplScroller')
          ]).then(function(results) {
            tilesElementSize = results[0];
            tileElementSize = results[1];

            clearEventListeners();
            setEventListeners();

            resetTiles();
            updateTiles();
            scrollerElement.controller('oplScroller').reset();
            preloadTiles();
            selectTile(ctrl.oplTime);

            reseting = false;

            if (resetRequested) {
              resetRequested = false;
              ctrl.reset();
            }
          });
        }
      },

      /**
       * Initializes child components.
       *
       * @method $postLink
       */
      $postLink: {
        value: function() {
          initialized = true;

          // Wait for child components
          $timeout(function() {
            ctrl.reset();
          });
        }
      },

      /**
       * Handles one-way binding properties changes.
       *
       * @method $onChanges
       * @param {Object} changedProperties Properties which have changed since last digest loop
       * @param {Object} [changedProperties.oplData] oplData old and new value
       * @param {String} [changedProperties.oplData.currentValue] oplData new value
       * @param {Object} [changedProperties.oplTime] oplTime old and new value
       * @param {String} [changedProperties.oplTime.currentValue] oplTime new value
       */
      $onChanges: {
        value: function(changedProperties) {
          if (
            (changedProperties.oplData && changedProperties.oplData.currentValue)
          ) {
            ctrl.reset();
          } else if ((changedProperties.oplTime && changedProperties.oplTime.currentValue) &&
                    Math.abs(lastTime - changedProperties.oplTime.currentValue) >= 1000) {
            lastTime = changedProperties.oplTime.currentValue;
            selectTile(ctrl.oplTime);
          }
        }
      },

      /**
       * Removes event listeners when component scope is destroyed.
       *
       * @method $onDestroy
       */
      $onDestroy: {
        value: function() {
          clearEventListeners();
        }
      }

    });

    /**
     * Handles select action on a tile.
     *
     * @param {Object} tile The associated tile
     */
    $scope.handleTileSelect = function(tile) {
      if (ctrl.oplOnTileSelect) ctrl.oplOnTileSelect({tile: tile});
    };

    /**
     * Handles "more info" action on a tile.
     *
     * @param {Object} tile The associated tile
     */
    $scope.handleTileMoreInfo = function(tile) {
      if (ctrl.oplOnTileInfo) ctrl.oplOnTileInfo({tile: tile});
    };

    /**
     * Handles close action on a tile.
     *
     * @param {Object} tile The associated tile
     */
    $scope.handleTileClose = function(tile) {
      if (ctrl.oplOnTileClose) ctrl.oplOnTileClose({tile: tile});
    };

    /**
     * Handles scroller changes.
     */
    $scope.handleScrollerChange = function() {
      if (!scrollTimeoutPromise) {
        expectedTilesPreload = false;

        preloadTiles();

        // Add a delay to avoid parsing the list of tiles too many times
        scrollTimeoutPromise = $timeout(function() {
          scrollTimeoutPromise = null;

          if (expectedTilesPreload) $scope.handleScrollerChange();
        }, 100);

      } else {
        expectedTilesPreload = true;
      }
    };

    /**
     * Handles scroller touch.
     */
    $scope.handleScrollTouch = function() {
      ctrl.automaticScrollActivated = false;
    };

    /**
     * Handles tile ready.
     *
     * @param {Object} tile The associated tile
     * @param {String} tile.id The tile id
     */
    $scope.handleTileReady = function(tile) {
      if (tileIndexRequestingFocus !== null && tile.id === ctrl.oplData[tileIndexRequestingFocus].id) {
        focusTile(tileIndexRequestingFocus);
        tileIndexRequestingFocus = null;
      }
    };

    /**
     * Handles tile image preload error.
     *
     * @param {Object} tile The associated tile
     * @param {String} tile.id The tile id
     */
    $scope.handleTileImageError = function(tile) {
      focusTile(enlargedTileIndex);
    };

    /**
     * Handles tile large image preload.
     *
     * Resizes the enlarged tile depending on large image size.
     *
     * @param {Object} tile The associated tile
     * @param {String} tile.id The tile id
     * @param {Object} size The image size
     * @param {Number} size.width The image width
     * @param {Number} size.height The image height
     */
    $scope.handleTileImagePreload = function(tile, size) {
      var enlargedTileMaxHeight = tilesElementSize.height - marginTop - tileMargin * 2;
      var enlargedTileMaxWidth = tilesElementSize.width - tileMargin * 2;
      var tileRatio = enlargedTileMaxWidth / enlargedTileMaxHeight;
      var ratio = size.width / size.height;
      var imageWidth;
      var imageHeight;

      if (ratio > 1 && tileRatio > 1) {
        imageWidth = Math.min(enlargedTileMaxWidth, size.width);
        imageHeight = imageWidth / ratio;

        if (imageHeight > enlargedTileMaxHeight) {
          imageHeight = Math.min(enlargedTileMaxHeight, size.height);
          imageWidth = imageHeight * ratio;
        }
      } else {
        imageHeight = Math.min(enlargedTileMaxHeight, size.height);
        imageWidth = imageHeight * ratio;

        if (imageWidth > enlargedTileMaxWidth) {
          imageWidth = Math.min(enlargedTileMaxWidth, size.width);
          imageHeight = imageWidth / ratio;
        }
      }

      computeEnlargedProperties(imageWidth, imageHeight);

      requestAnimationFrame(function() {
        animateResizing().then(function() {
          enlargedTileElementSize.height = imageHeight;
          enlargedTileElementSize.width = imageWidth;
          computeEnlargedProperties(imageWidth, imageHeight);
          updateTile(enlargedTileIndex);
          focusTile(enlargedTileIndex);
        });
      });
    };

  }

  app.controller('OplTilesController', OplTilesController);
  OplTilesController.$inject = [
    '$scope',
    '$element',
    '$timeout',
    '$window',
    '$document',
    '$compile',
    '$rootScope',
    '$q',
    'oplDomFactory'
  ];

})(angular.module('ov.player'));
