$(document).ready(function() {

  var pixelRatio = window.devicePixelRatio || 1;

  (function () {

    var width = parseInt( $('canvas').css('width'));
    var height = parseInt( $('canvas').css('height'));

    // TODO cleaner way of doing this?
    var c = $('canvas').get(0);
    c.width = width * pixelRatio;
    c.height = height * pixelRatio;
    gl = c.getContext('experimental-webgl', {antialias: true});

  }());

  if (!gl) {
    var msg = "Alas, your browser does not support WebGL."
    var html = "<p class='error'>" + msg + "</p>";
    $('canvas').replaceWith(html);
    return;
  }

  // requestAnimationFrame();

});
