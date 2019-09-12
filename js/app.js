'use strict';

var App = (function() {

  function App() {
    this.init();
  }

  App.prototype.init = function(){
    this.debug = false;
    this.started = false;
    this.rendering = false;

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
      var id = $video.attr('data-subway');
      if ($video.hasClass('active')) activeSubway = id;
      var $player = $video.find('video').first();
      var player = $player[0];
      // set volume to zero
      player.volume = 0.0;
      // seek to 10 seconds in
      player.currentTime = 10.0;

      // initialize the analyzer
      var context = new AudioContext();
      var src = context.createMediaElementSource(player);
      var analyser = context.createAnalyser();
      src.connect(analyser);
      analyser.connect(context.destination);
      analyser.fftSize = 256;
      var bufferLength = analyser.frequencyBinCount;
      var soundArray = new Uint8Array(bufferLength);

      return {
        'id': id,
        'duration': parseFloat($video.attr('data-duration')),
        '$el': $video,
        '$player': $player,
        '$pulse': $('.pulse[data-subway="'+id+'"]').first(),
        'player': player,
        'active': $video.hasClass('active'),
        'pauseTimeout': false,
        'audioContext': context,
        'analyser': analyser,
        'soundArray': soundArray
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

    // start the render loop
    if (!this.rendering) {
      this.rendering = true;
      this.render();
    }

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
      this.videos[subway].pauseTimeout = setTimeout(function(){
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

  App.prototype.render = function(){
    var _this = this;

    var video = this.videos[this.activeSubway];
    video.analyser.getByteFrequencyData(video.soundArray);

    var scale = 1.0 + (video.soundArray[2] - 96.0) / 255.0;
    video.$pulse.css('transform', 'scale3d('+scale+', '+scale+', '+scale+')');

    requestAnimationFrame(function(){
      _this.render();
    });
  };

  App.prototype.select = function(subway){
    var _this = this;

    if (subway === this.activeSubway && this.started) return;

    var firstTime = !this.started;
    this.activeSubway = subway;
    this.started = true;

    $.each(this.videos, function(id, video) {
      _this.videos[id].active = (id===subway);
      // clear existing pause timeouts
      if (video.pauseTimeout) clearTimeout(video.pauseTimeout);
      if (firstTime) video.audioContext.resume();
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
