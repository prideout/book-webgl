var main = function() {

  GIZA.init();

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

  var programs = DEMO.compilePrograms(shaders);
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

    // Note that it is MUCH more efficient to preallocate, and
    // populate directly.
    var typedArray = new Float32Array(GIZA.flatten(coords));

    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, typedArray, gl.STATIC_DRAW);
    DEMO.check('Error when trying to create VBO');

    gl.clearColor(0.61, 0.527, .397, 1.0);
    gl.lineWidth(1.5 * GIZA.pixelScale);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  };

  var draw = function(currentTime) {

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, GIZA.canvas.width, GIZA.canvas.height);
    
    var mv = new mat4();
    var proj = new mat4();

    var MinWidth = 700;
    var s = (MinWidth / GIZA.canvas.width) * GIZA.pixelScale;
    s = (s < 1.0) ? 1.0 : s;

    proj.makeOrthographic(
        -s * GIZA.aspect, s * GIZA.aspect, // left right
        -s, +s, // bottom top
        0, 1);  // near far

    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
    gl.enableVertexAttribArray(attribs.POSITION);
    gl.vertexAttribPointer(attribs.POSITION, 2, gl.FLOAT, false, 8, 0);

    var program = programs.simple;
    gl.useProgram(program);

    gl.uniformMatrix4fv(program.projection, false, proj.elements);

    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);

    mv.translate(new vec3(-1.0, 0, 0));
    gl.uniformMatrix4fv(program.modelview, false, mv.elements);

    gl.uniform4f(program.color, 0.5, 0.75, 1.0, 1);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, numPoints);
    gl.uniform4f(program.color, 0, 0.125, 0.5, 1);
    gl.drawArrays(gl.LINE_LOOP, 0, numPoints);

    mv.translate(new vec3(+2.0, 0, 0));
    gl.uniformMatrix4fv(program.modelview, false, mv.elements);

    gl.uniform4f(program.color, 0.5, 0.75, 1.0, 1);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, numPoints);
    gl.uniform4f(program.color, 0, 0.125, 0.5, 1);
    gl.drawArrays(gl.LINE_LOOP, 0, numPoints);

    window.requestAnimationFrame(draw, GIZA.canvas);
  };

  init();
  draw(0);

};
