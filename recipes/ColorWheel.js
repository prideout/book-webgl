var main = function() {

  GIZA.init();
  var gl = GIZA.context;
  var M4 = GIZA.Matrix4;
  var C4 = GIZA.Color4;
  var V2 = GIZA.Vector2;

  var attribs = {
    POSITION: 0,
    COLOR: 1,
  };

  var programs = COMMON.compilePrograms({
    simple: {
      vs: ['simplevs'],
      fs: ['simplefs'],
      attribs: {
        Position: attribs.POSITION,
        Color: attribs.COLOR,
      }
    }
  });

  var numPoints = 64;
  var buffer = gl.createBuffer();

  var init = function() {

    // Set up a description of the vertex format.
    var bufferView = new GIZA.BufferView({
      position: [Float32Array, 2],
      color: [Uint8Array, 4],
    });

    // Allocate the memory.
    var vertexArray = bufferView.makeBuffer(numPoints);

    // Initialize the center point of the wheel.
    var vertex = bufferView.getVertex(0);
    V2.set(vertex.position, [0, 0]);
    C4.set(vertex.color, [1, 1, 1, 1], 255);

    // Now create the vertices along the circumference.
    var dtheta = Math.PI * 2 / (numPoints - 2);
    var theta = 0;
    var radius = .75;
    for (var i = 1; i < numPoints; i++) {
      vertex = bufferView.getVertex(i);

      var x = radius * Math.cos(theta);
      var y = radius * Math.sin(theta);
      V2.set(vertex.position, [x, y]);

      var hue = (i - 1) / (numPoints - 1);
      C4.set(vertex.color, C4.hsvToRgb(hue, 1, 1), 255);

      theta += dtheta;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);
    gl.clearColor(0.61, 0.527, .397, 1.0);
  };

  var draw = function(currentTime) {

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, GIZA.canvas.width, GIZA.canvas.height);
    
    var MinWidth = 700;
    var s = (MinWidth / GIZA.canvas.width) * GIZA.pixelScale;
    s = (s < 1.0) ? 1.0 : s;
    var proj = M4.orthographic(
        -s * GIZA.aspect, s * GIZA.aspect, // left right
        -s, +s, // bottom top
        -10, 10);  // near far

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    gl.enableVertexAttribArray(attribs.POSITION);
    gl.vertexAttribPointer(attribs.POSITION, 2, gl.FLOAT, false, 12, 0);

    gl.enableVertexAttribArray(attribs.COLOR);
    gl.vertexAttribPointer(attribs.COLOR, 4, gl.UNSIGNED_BYTE, true, 12, 8);

    var program = programs.simple;
    gl.useProgram(program);
    gl.uniformMatrix4fv(program.projection, false, proj);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    var mv = M4.rotationZ(currentTime * 0.01);
    gl.uniformMatrix4fv(program.modelview, false, mv);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, numPoints);

    GIZA.endFrame(draw);
  };

  init();
  draw(GIZA.getTime());

};
