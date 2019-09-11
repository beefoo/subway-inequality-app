'use strict';

var App = (function() {

  function App() {
    this.init();
  }

  App.prototype.init = function(){
    this.started = false;

    this.$activeVideo = $('.video.active').first();
    this.activeVideo = this.$activeVideo.find('video').first();
    this.$activeButton = $('.radio.active').first();
    this.$activePulse = $('.pulse.active').first();
    this.activeSubway = this.$activeButton.attr('data-subway');

    this.loadListeners();
  };

  App.prototype.loadListeners = function(){
    var _this = this;

    // click anywhere to start
    $('body').one('click', function(e){
      _this.select('2');
    });

    $('.radio').on('click', function(e){
      var subway = $(this).attr('data-subway');
      _this.select(subway);
    });
  };

  App.prototype.select = function(subway){
    if (subway === this.activeSubway) {
      if (!this.started) {
        // play current video
        this.started = true;
      }
      return;
    }
    this.activeSubway = subway;

    // toggle active states
    var $activeVideo = $('.video[data-subway="'+subway+'"]');
    var $activeButton = $('.radio[data-subway="'+subway+'"]');
    var $activePulse = $('.pulse[data-subway="'+subway+'"]');
    this.$activeVideo.removeClass('active');
    this.$activeButton.removeClass('active');
    this.$activePulse.removeClass('active');
    $activeVideo.addClass('active');
    $activeButton.addClass('active');
    $activePulse.addClass('active');
    this.$activeVideo = $activeVideo;
    this.$activeButton = $activeButton;
    this.$activePulse = $activePulse;

    // stop current video
    // start new video

  };

  return App;

})();

$(function() {
  var app = new App();
});
