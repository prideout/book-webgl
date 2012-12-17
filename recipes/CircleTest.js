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

  var canvas;
  var pixelScale = window.devicePixelRatio || 1;
  var width = parseInt( $('canvas').css('width'));
  var height = parseInt( $('canvas').css('height'));
  var aspect = width / height;

  (function () {

    // TODO cleaner way of doing this?
    canvas = $('canvas').get(0);
    canvas.width = width * pixelScale;
    canvas.height = height * pixelScale;
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
  var numPoints = 64;
  var lineBuffer = gl.createBuffer();

  var init = function() {

    var coords = [];
    var dtheta = Math.PI * 2 / numPoints;
    var theta = 0;
    var radius = .75;
    for (var i = 0; i < numPoints; i++) {
      var x = radius * Math.cos(theta);
      var y = radius * Math.sin(theta);
      coords.push([x, y]);
      theta += dtheta;
    }

    var typedArray = new Float32Array(GIZA.flatten(coords));

    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, typedArray, gl.STATIC_DRAW);
    GIZA.check('Error when trying to create VBO');

    gl.clearColor(0.9, 0.9, 0.9, 1.0);
    gl.lineWidth(2 * pixelScale);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  };

  var draw = function(currentTime) {

    var pulse = 0.9; // 0.5 + 0.5 * Math.sin(currentTime / 100);
    gl.clearColor(pulse, 0.9, 0.9, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    var mv = new mat4();
    var proj = new mat4();
    proj.makeOrthographic(-aspect, +aspect, -1, +1, 0, 1);

    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
    gl.enableVertexAttribArray(attribs.POSITION);
    gl.vertexAttribPointer(attribs.POSITION, 2, gl.FLOAT, false, 8, 0);

    var program = programs.simple;
    gl.useProgram(program);

    gl.uniformMatrix4fv(program.projection, false, proj.elements);

    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);

    mv.translate(new vec3(-1.0, 0, 0));
    gl.uniformMatrix4fv(program.modelview, false, mv.elements);

    gl.disable(gl.DEPTH_TEST);

    gl.uniform4f(program.color, 0.25, 0.5, 0.75, 1);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, numPoints);
    gl.uniform4f(program.color, 0, 0.125, 0.5, 1);
    gl.drawArrays(gl.LINE_LOOP, 0, numPoints);

    mv.translate(new vec3(+2.0, 0, 0));
    gl.uniformMatrix4fv(program.modelview, false, mv.elements);

    gl.uniform4f(program.color, 0.25, 0.5, 0.75, 1);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, numPoints);
    gl.uniform4f(program.color, 0, 0.125, 0.5, 1);
    gl.drawArrays(gl.LINE_LOOP, 0, numPoints);

    window.requestAnimationFrame(draw, canvas);
  };

  init();
  draw(0);

});
