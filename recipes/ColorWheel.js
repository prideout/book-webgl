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

    var coordSize = 2 * Float32Array.BYTES_PER_ELEMENT;
    var colorSize = 4 * Uint8Array.BYTES_PER_ELEMENT;
    var vertexSize = coordSize + colorSize;
    var vertexArray = new ArrayBuffer(numPoints * vertexSize);
    var coordArray = new Float32Array(vertexArray, 0);
    var colorArray = new Uint8Array(vertexArray, coordSize);
    var coordStride = vertexSize / Float32Array.BYTES_PER_ELEMENT;
    var colorStride = vertexSize / Uint8Array.BYTES_PER_ELEMENT;

    var getVertex = function(vertexIndex) {
      var coordIndex = vertexIndex * coordStride;
      var colorIndex = vertexIndex * colorStride;
      var position = coordArray.subarray(coordIndex, coordIndex + 3);
      var color = colorArray.subarray(colorIndex, colorIndex + 4);
      return {position: position, color: color};
    };

    // First set up the center point.
    var i = 0;
    var vertex = getVertex(i);
    V2.set(vertex.position, [0, 0]);
    C4.set(vertex.color, [1, 1, 1, 1], 255);

    // Now create the vertices along the circumference.
    var dtheta = Math.PI * 2 / (numPoints - 2);
    var theta = 0;
    var radius = .75;
    for (i = 1; i < numPoints; i++) {
      var x = radius * Math.cos(theta);
      var y = radius * Math.sin(theta);

      vertex = getVertex(i);
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

    var mv = M4.rotationY(currentTime * 0.01);
    gl.uniformMatrix4fv(program.modelview, false, mv);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, numPoints);

    GIZA.endFrame(draw);
  };

  init();
  draw(GIZA.getTime());

};
