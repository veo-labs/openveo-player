# Introduction

Player can be controlled by methods and emits catchable events on the player HTML element.

# Methods

## selectTemplate(template)

Sets the display template.

Usage:

```javascript
var myPlayer = document.getElementById('myPlayer');

angular.element(myPlayer).on('ready', function(event){
  console.log('ready');

  var playerController = angular.element(myPlayer).controller('oplPlayer');
  playerController.selectTemplate('split_2');
});
```

Arguments:

Param | Type | Details
----- | ---- | ----
template  | String  | Display template (can be either **split_1**, **split_50_50**, **split_25_75** or **split_2**)

## playPause()

Starts / Pauses the player.

Usage:

```javascript
var myPlayer = document.getElementById('myPlayer');

angular.element(myPlayer).on('ready', function(event){
  console.log('ready');

  var playerController = angular.element(myPlayer).controller('oplPlayer');
  playerController.playPause();
});
```

## setVolume(volume)

Sets the player volume.

Usage:

```javascript
var myPlayer = document.getElementById('myPlayer');

angular.element(myPlayer).on('ready', function(event){
  console.log('ready');

  var playerController = angular.element(myPlayer).controller('oplPlayer');
  playerController.setVolume(50);
});
```

Arguments:

Param | Type | Details
----- | ---- | ----
volume  | Number  | The volume to set from 0 to 100

## setTime(time)

Sets the player time.

Usage:

```javascript
var myPlayer = document.getElementById('myPlayer');

angular.element(myPlayer).on('ready', function(event){
  console.log('ready');

  var playerController = angular.element(myPlayer).controller('oplPlayer');
  playerController.setTime(50000);
});
```

Arguments:

Param | Type | Details
----- | ---- | ----
time  | Number  | The time to set (in milliseconds) relative to the cut media

## setDefinition(definition)

Sets actual media definition.

Usage:

```javascript
var myPlayer = document.getElementById('myPlayer');

angular.element(myPlayer).on('ready', function(event){
  console.log('ready');

  var playerController = angular.element(myPlayer).controller('oplPlayer');
  playerController.setDefinition('720');
});
```

Arguments:

Param | Type | Details
----- | ---- | ----
definition  | String  | The definition height as String

## setSource

Sets actual media source if multi sources.

Usage:

```javascript
var myPlayer = document.getElementById('myPlayer');

angular.element(myPlayer).on('ready', function(event){
  console.log('ready');

  var playerController = angular.element(myPlayer).controller('oplPlayer');
  playerController.setSource(1);
});
```

Arguments:

Param | Type | Details
----- | ---- | ----
source  | Number  | The index of the source to load from the list of sources

# Events

## ready

The player is ready to receive actions.

```javascript
var myPlayer = document.getElementById('myPlayer');

angular.element(myPlayer).on('ready', function(event){
  console.log('ready');
});
```

## waiting

Media playback has stopped because the next frame is not available.

```javascript
var myPlayer = document.getElementById('myPlayer');

angular.element(myPlayer).on('waiting', function(event){
  console.log('waiting');
});
```

## playing

Media playback is ready to start after being paused or delayed due to lack of media data.

```javascript
var myPlayer = document.getElementById('myPlayer');

angular.element(myPlayer).on('playing', function(event){
  console.log('playing');
});
```

## durationChange

The duration attribute has just been updated.

```javascript
var myPlayer = document.getElementById('myPlayer');

angular.element(myPlayer).on('durationChange', function(event, duration){
  console.log('durationChange with new duration = ' + duration + 'ms');
});
```

## play

Media is no longer paused.

```javascript
var myPlayer = document.getElementById('myPlayer');

angular.element(myPlayer).on('play', function(event, duration){
  console.log('play');
});
```

## pause

Media has been paused.

```javascript
var myPlayer = document.getElementById('myPlayer');

angular.element(myPlayer).on('pause', function(event, duration){
  console.log('pause');
});
```

## loadProgress

Got buffering information.

```javascript
var myPlayer = document.getElementById('myPlayer');

angular.element(myPlayer).on('loadProgress', function(event, percents){
  console.log('loadProgress');
  console.log('Buffering start = ' + percents.loadedStart);
  console.log('Buffering end = ' + percents.loadedPercent);
});
```

## playProgress

Media playback position has changed.

```javascript
var myPlayer = document.getElementById('myPlayer');

angular.element(myPlayer).on('playProgress', function(event, data){
  console.log('playProgress');
  console.log('Current time = ' + data.time + 'ms');
  console.log('Played percent = ' + data.percent);
});
```

## end

Media playback has reached the end.

```javascript
var myPlayer = document.getElementById('myPlayer');

angular.element(myPlayer).on('end', function(event, duration){
  console.log('end');
});
```

## error

Player has encountered an error.

```javascript
var myPlayer = document.getElementById('myPlayer');

angular.element(myPlayer).on('error', function(event, error){
  console.log(error.message);
  console.log(error.code);
});
```

## needPoiConversion

Player has detected the old format of chapters / tags / indexes. Time of chapters / tags and indexes have to be expressed in milliseconds and not in percentage.

```javascript
var myPlayer = document.getElementById('myPlayer');

angular.element(myPlayer).on('needPoiConversion', function(event, duration){
  console.log('needPoiConversion');
  console.log('Video duration = ' + duration + 'ms');
});
```
