var GIZA = GIZA || { REVISION : '0' };
var gl;

GIZA.init = function() {
  var pixelScale = window.devicePixelRatio || 1;
  var width = parseInt( $('canvas').css('width'));
  var height = parseInt( $('canvas').css('height'));
  var aspect = width / height;

  var canvas = $('canvas')[0];
  canvas.width = width * pixelScale;
  canvas.height = height * pixelScale;
  gl = canvas.getContext(
    'experimental-webgl',
    {antialias: true});

  if (!gl) {
    var msg = "Alas, your browser does not support WebGL."
    var html = "<p class='error'>" + msg + "</p>";
    $('canvas').replaceWith(html);
    return;
  }

  GIZA.pixelScale = pixelScale;
  GIZA.canvas = canvas;
  GIZA.aspect = aspect;

  $(window).resize(function() {
    width = parseInt( $('canvas').css('width'));
    height = parseInt( $('canvas').css('height'));
    GIZA.aspect = width / height;
    canvas.width = width * pixelScale;
    canvas.height = height * pixelScale;
  });
}

GIZA.flatten = function(array) {
    var element, flattened, _i, _len;
    flattened = [];
    for (_i = 0, _len = array.length; _i < _len; _i++) {
      element = array[_i];
      if (element instanceof Array) {
        flattened = flattened.concat(GIZA.flatten(element));
      } else if (element instanceof vec2) {
        flattened = flattened.concat([element.x, element.y]);
      } else {
        flattened.push(element);
      }
    }
    return flattened;
};

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller
// fixes from Paul Irish and Tino Zijdel

( function () {

	var lastTime = 0;
	var vendors = [ 'ms', 'moz', 'webkit', 'o' ];

	for ( var x = 0; x < vendors.length && !window.requestAnimationFrame; ++ x ) {

		window.requestAnimationFrame = window[ vendors[ x ] + 'RequestAnimationFrame' ];
		window.cancelAnimationFrame = window[ vendors[ x ] + 'CancelAnimationFrame' ] || window[ vendors[ x ] + 'CancelRequestAnimationFrame' ];

	}

	if ( window.requestAnimationFrame === undefined ) {

		window.requestAnimationFrame = function ( callback, element ) {

			var currTime = Date.now(), timeToCall = Math.max( 0, 16 - ( currTime - lastTime ) );
			var id = window.setTimeout( function() { callback( currTime + timeToCall ); }, timeToCall );
			lastTime = currTime + timeToCall;
			return id;

		};

	}

	window.cancelAnimationFrame = window.cancelAnimationFrame || function ( id ) { window.clearTimeout( id ) };

}() );

String.prototype.supplant = function (o) {
  return this.replace(
      /{([^{}]*)}/g,
    function (a, b) {
      var r = o[b];
      return typeof r === 'string' ||
        typeof r === 'number' ? r : a;
    }
  );
};
