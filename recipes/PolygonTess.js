$(document).ready(function() {

  var Mode = {
    HOLE: 0,
    CONTOUR: 1,
    VISUALIZE: 2
  };


  var Semantics = {
    POSITION: 0,
    VERTEXID: 0,
    NORMAL: 1,
    TEXCOORD: 2
  };

  var Shaders = {};

  Shaders.dot = {
    vs: ['dotvs'],
    fs: ['dotfs'],
    attribs: {
      Position: Semantics.POSITION
    }
  };

  Shaders.contour = {
    vs: ['contourvs'],
    fs: ['contourfs'],
    attribs: {
      Position: Semantics.POSITION
    }
  };

  var pixelRatio = window.devicePixelRatio || 1;
  var contourPts = [];
  var holePts = [];
  var mode = Mode.HOLE;
  var dragList = [];

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

  //nextMode();
  //assignEventHandlers();
  //requestAnimationFrame();

});
