var main = function() {

  GIZA.init();
  var gl = GIZA.context;
  var M4 = GIZA.Matrix4;

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

    var coordSize = 3 * Float32Array.BYTES_PER_ELEMENT;
    var colorSize = 4 * Uint8Array.BYTES_PER_ELEMENT;
    var vertexSize = coordSize + colorSize;
    var vertexArray = new ArrayBuffer(numPoints * vertexSize);
    var coordArray = new Float32Array(vertexArray, 0);
    var colorArray = new Uint8Array(vertexArray, coordSize);
    var coordStride = elementSize / Float32Array.BYTES_PER_ELEMENT;
    var colorStide = elementSize / Uint8Array.BYTES_PER_ELEMENT;

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
    V3.set(vertex.position, [0, 0, 0]);
    C4.set(vertex.color, [1, 1, 1, 1]);

    // Now create the vertices along the circumference.
    var dtheta = Math.PI * 2 / (numPoints - 1);
    var theta = 0;
    var radius = .75;
    for (i = 1; i < numPoints; i++) {
      var x = radius * Math.cos(theta);
      var y = radius * Math.sin(theta);

      vertex = getVertex(i);
      V3.set(vertex.position, [x, y, 0]);
      C4.set(vertex.color, C4.hsvToRgb(hue, 1, 1));

      theta += dtheta;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);

    gl.clearColor(0.61, 0.527, .397, 1.0);
    gl.lineWidth(1.5 * GIZA.pixelScale);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
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
        0, 1);  // near far

    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
    gl.enableVertexAttribArray(attribs.POSITION);
    gl.vertexAttribPointer(attribs.POSITION, 2, gl.FLOAT, false, 8, 0);

    var program = programs.simple;
    gl.useProgram(program);
    gl.uniformMatrix4fv(program.projection, false, proj);
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);

    var mv = M4.identity();
    M4.translate(mv, [-1.0, 0, 0]);
    gl.uniformMatrix4fv(program.modelview, false, mv);

    gl.uniform4f(program.color, 0.5, 0.75, 1.0, 1);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, numPoints);
    gl.uniform4f(program.color, 0, 0.125, 0.5, 1);
    gl.drawArrays(gl.LINE_LOOP, 0, numPoints);

    M4.translate(mv, [+2.0, 0, 0]);
    gl.uniformMatrix4fv(program.modelview, false, mv);

    gl.uniform4f(program.color, 0.5, 0.75, 1.0, 1);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, numPoints);
    gl.uniform4f(program.color, 0, 0.125, 0.5, 1);
    gl.drawArrays(gl.LINE_LOOP, 0, numPoints);

    GIZA.endFrame(draw);
  };

  init();
  draw(GIZA.getTime());

};
