'use strict';

var App = (function() {

  function App() {
    this.init();
  }

  App.prototype.init = function(){
    this.debug = true;
    this.started = false;

    // add playing property to videos
    Object.defineProperty(HTMLMediaElement.prototype, 'playing', {
      get: function(){
        return !!(this.currentTime > 0 && !this.paused && !this.ended && this.readyState > 2);
      }
    });

    // gather video metadata
    var activeSubway = '2';
    var videos = $.map($('.video'), function(el, i) {
      var $video = $(el);
      if ($video.hasClass('active')) activeSubway = $video.attr('data-subway');
      var $player = $video.find('video').first();
      // set volume to zero
      $player[0].volume = 0.0;
      // seek to 10 seconds in
      $player[0].currentTime = 10.0;
      return {
        'id': $video.attr('data-subway'),
        'duration': parseFloat($video.attr('data-duration')),
        '$el': $video,
        '$player': $player,
        'player': $player[0],
        'active': $video.hasClass('active'),
        'pauseTimeout': false
      }
    });

    // create a look-up
    var videoMap = videos.reduce(function(map, obj) {
      map[obj.id] = obj;
      return map;
    }, {});
    console.log('Loaded videos:', videoMap);
    this.videos = videoMap;

    this.activeSubway = '';

    this.loadListeners();
  };

  App.prototype.loadListeners = function(){
    var _this = this;

    // click anywhere to start
    $('body').one('click', function(e){
      _this.select('2');
    });

    $('.radio').on('click', function(e){
      e.stopPropagation();
      var subway = $(this).attr('data-subway');
      _this.select(subway);
    });

    $.each(this.videos, function(id, video) {
      video.player.addEventListener('playing', function(){
        _this.onPlaying(id);
      });
    });
  };

  App.prototype.onPlaying = function(subway){
    if (this.debug) console.log('Playing: '+subway);
    var _this = this;

    var video = this.videos[subway];
    if (!video.active) return;

    video.$player.animate({volume: 1.0}, 2000);

    // hide all other subways
    $('.video, .pulse').removeClass('active');
    // show current subway
    $('.video[data-subway="'+subway+'"], .pulse[data-subway="'+subway+'"]').addClass('active');

    // pause other playing videos
    $.each(this.videos, function(id, video) {
      if (!video.active) _this.pauseVideo(id);
    });
  };

  App.prototype.pauseVideo = function(subway){
    var _this = this;
    var video = this.videos[subway];
    var player = video.player;
    if (player.playing && !video.active) {
      video.$player.animate({volume: 0.0}, 2000);
      video.pauseTimeout = setTimeout(function(){
        if (_this.debug) console.log('Pause: '+subway);
        if (!_this.videos[subway].active) player.pause();
      }, 2000);
    }
  };

  App.prototype.playVideo = function(subway){
    var player = this.videos[subway].player;
    if (!player.playing) player.play();
    else this.onPlaying(subway);
  };

  App.prototype.select = function(subway){
    var _this = this;

    if (subway === this.activeSubway && this.started) return;

    this.activeSubway = subway;
    this.started = true;

    $.each(this.videos, function(id, video) {
      _this.videos[id].active = (id===subway);
      // clear existing pause timeouts
      if (video.pauseTimeout) clearTimeout(video.pauseTimeout);
    });

    // hide all other radios
    $('.radio').removeClass('active');
    // show current radio
    $('.radio[data-subway="'+subway+'"]').addClass('active');

    this.playVideo(subway);

  };

  return App;

})();

$(function() {
  var app = new App();
});
