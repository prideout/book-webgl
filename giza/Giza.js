// As a design philosophy, giza never makes WebGL calls, and it
// doesn't have dependencies on any other JavaScript libraries.  It's
// a low-level utility layer rather than a scene graph or effects
// library.

var GIZA = GIZA || { REVISION : '0' };
var gl;

GIZA.init = function(canvasElement) {

  // First, ensure that "window" has requestAnimationFrame and cancelAnimationFrame.
  // Cribbed from code by Erik Möller, Paul Irish, and Tino Zijdel
  //   http://paulirish.com/2011/requestanimationframe-for-smart-animating/
  //   http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
  var lastTime = 0;
  var vendors = [ 'ms', 'moz', 'webkit', 'o' ];
  for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
	window.requestAnimationFrame = window[ vendors[ x ] + 'RequestAnimationFrame' ];
	window.cancelAnimationFrame =
      window[ vendors[ x ] + 'CancelAnimationFrame' ] ||
      window[ vendors[ x ] + 'CancelRequestAnimationFrame' ];
  }
  if (window.requestAnimationFrame === undefined) {
	window.requestAnimationFrame = function (callback, element) {
	  var currTime = Date.now(), timeToCall = Math.max( 0, 16 - ( currTime - lastTime ) );
	  var id = window.setTimeout( function() { callback( currTime + timeToCall ); }, timeToCall );
	  lastTime = currTime + timeToCall;
	  return id;
	};
  }
  window.cancelAnimationFrame = window.cancelAnimationFrame || function (id) {
    window.clearTimeout(id);
  };

  // Next, find the canvas element if it wasn't given to us
  var canvas;
  if (canvasElement == null) {
    canvas = document.getElementsByTagName('canvas')[0];
  }

  // Gather various information about the canvas
  var pixelScale = window.devicePixelRatio || 1;
  var width = canvas.clientWidth;
  var height = canvas.clientHeight;
  var aspect = width / height;

  // Handle retina displays correctly.
  // At the time of writing (Dec 30 2012) this only works for Chrome.
  canvas.width = width * pixelScale;
  canvas.height = height * pixelScale;

  // Set up the WebGL context
  gl = canvas.getContext('experimental-webgl', {antialias: true});

  if (!gl) {
    var msg = document.createElement('p');
    msg.classList.add('error');
    msg.innerHTML = "Alas, your browser does not support WebGL.";
    canvas.parentNode.replaceChild(msg, canvas);
    return;
  }

  // Publish some globally-accessible properties
  GIZA.pixelScale = pixelScale;
  GIZA.canvas = canvas;
  GIZA.aspect = aspect;

  // Handle resize events appropriately
  window.onresize = function() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    GIZA.aspect = width / height;
    canvas.width = width * pixelScale;
    canvas.height = height * pixelScale;
  };
}

GIZA.flatten = function(array) {
    var element, flattened, _i, _len;
    flattened = [];
    for (_i = 0, _len = array.length; _i < _len; _i++) {
      element = array[_i];
      if (element instanceof Array) {
        flattened = flattened.concat(GIZA.flatten(element));
      } else {
        flattened.push(element);
      }
    }
    return flattened;
};

// The infamous "supplant" method from the esteemed Douglas Crockford
GIZA.format = function (s, o) {
  return s.replace(
      /{([^{}]*)}/g,
    function (a, b) {
      var r = o[b];
      return typeof r === 'string' ||
        typeof r === 'number' ? r : a;
    }
  );
};

GIZA.merge = function (a, b) {
  for (var attrname in b) {
    a[attrname] = b[attrname];
  }
};
