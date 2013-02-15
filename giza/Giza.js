// As a design philosophy, giza never makes WebGL calls, and it
// doesn't have dependencies on any other JavaScript libraries.  It's
// a low-level utility layer rather than a scene graph or effects
// library.

var GIZA = GIZA || { REVISION : '0' };

GIZA.init = function(canvas, options) {

  window.requestAnimationFrame = window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.msRequestAnimationFrame;

  // Find a canvas element if it wasn't specified.
  canvas = canvas || document.getElementsByTagName('canvas')[0];

  // Gather information about the canvas.
  var pixelScale = window.devicePixelRatio || 1;
  var width = canvas.clientWidth;
  var height = canvas.clientHeight;
  var aspect = width / height;

  // Handle retina displays correctly.
  // At the time of writing (Dec 30 2012) this only works for Chrome.
  canvas.width = width * pixelScale;
  canvas.height = height * pixelScale;

  // Set up the WebGL context.
  options = options || {
    preserveDrawingBuffer: false,
    antialias: true
  };
  var gl = canvas.getContext('experimental-webgl', options);

  if (!gl) {
    var msg = document.createElement('p');
    msg.classList.add('error');
    msg.innerHTML = "Alas, your browser does not support WebGL.";
    canvas.parentNode.replaceChild(msg, canvas);
    return;
  }

  // Publish some globally-accessible properties.
  GIZA.context = gl;
  GIZA.pixelScale = pixelScale;
  GIZA.canvas = canvas;
  GIZA.aspect = aspect;

  // Handle resize events appropriately.
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

// Aggregate a list of typed arrays by pre-allocating a giant array
// and blitting into it.  Another idea is to create a Blob which you
// then pass to a FileReader.  This seems more straightforward though.
GIZA.join = function(arrays, destType) {
  destType = destType || arrays[0].constructor;
  var totalSize = arrays.reduce(function(prev, curr) {
    return prev + curr.length;
  }, 0);
  var dest = new destType(totalSize);
  var offset = 0;
  for (var i = 0; i < arrays.length; i++) {
    dest.set(arrays[i], offset);
    offset += arrays[i].length;
  }
  return dest;
};

// Kinda like jQuery's get function, except that dataType can be
// either "binary" or "json".
GIZA.get = function(url, successFunc, dataType) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  if (dataType == 'json') {
    var onloadFunc = function() {
      if (xhr.responseText) {
        successFunc(JSON.parse(xhr.responseText));
      }
    };
  } else {
    xhr.responseType = 'arraybuffer';
    var onloadFunc = function() {
      if (xhr.response) {
        successFunc(xhr.response);
      }
    };
  }
  xhr.onload = onloadFunc;
  xhr.send(null);
};
