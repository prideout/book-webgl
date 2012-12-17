$(document).ready(function() {

  var attribs = {
    POSITION: 0,
  };

  var shaders = {};

  shaders.simple = {
    vs: ['simplevs'],
    fs: ['simplefs'],
    attribs: {
      Position: attribs.POSITION
    }
  };

  var pixelRatio = window.devicePixelRatio || 1;
  var canvas;
  var width = parseInt( $('canvas').css('width'));
  var height = parseInt( $('canvas').css('height'));

  (function () {

    // TODO cleaner way of doing this?
    canvas = $('canvas').get(0);
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    gl = canvas.getContext(
      'experimental-webgl',
      {antialias: true});

  }());

  if (!gl) {
    var msg = "Alas, your browser does not support WebGL."
    var html = "<p class='error'>" + msg + "</p>";
    $('canvas').replaceWith(html);
    return;
  }

  var programs = GIZA.compilePrograms(shaders);
  var scale = 1; // TODO make this 2 for retina
  var numPoints = 3;
  var lineBuffer = gl.createBuffer();

  var init = function() {
    var coords = [[0,0],[0,1],[1,1]]; // TODO
    var typedArray = new Float32Array(GIZA.flatten(coords));

    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, typedArray, gl.STATIC_DRAW);
    GIZA.check('Error when trying to create VBO');

    gl.clearColor(0.9, 0.9, 0.9, 1.0);
    gl.lineWidth(2 * scale);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  };

  var draw = function(currentTime) {
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    var mv = new mat4();
    var proj = new mat4();
    proj.makeOrthographic(0, width, 0, height, 0, 1);

    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
    gl.enableVertexAttribArray(attribs.POSITION);
    gl.vertexAttribPointer(attribs.POSITION, 2, gl.FLOAT, false, 8, 0);

    var program = programs.simple;
    gl.useProgram(program);

    gl.uniformMatrix4fv(program.modelview, false, mv.elements);
    gl.uniformMatrix4fv(program.projection, false, proj.elements);

    gl.uniform4f(program.color, 0.25, 0.25, 0, 0.5);
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
    gl.drawArrays(gl.LINE_LOOP, 0, numPoints);

    window.requestAnimationFrame(draw, canvas);
  };

  init();
  draw(0);

});
