var main = function() {

  GIZA.init();
  var gl = GIZA.context;
  var M4 = GIZA.Matrix4;

  var attribs = {
    POSITION: 0,
    COLOR: 1
  };

  var programs = GIZA.compile({
    simple: {
      vs: ['simple-vs'],
      fs: ['solid-color'],
      attribs: {
        Position: attribs.POSITION,
        Color: attribs.COLOR
      }
    },
    sinc: {
      vs: ['sinc-vs'],
      fs: ['solid-color'],
      attribs: {
        Position: attribs.POSITION
      }
    }
  });

  var buffers = {
    sincCoords: gl.createBuffer(),
    wireframe: gl.createBuffer()
  };

  var interval = 50;
  var width = 20;
  var maxHeight = 2;
  var rowTess = 120;
  var colTess = 500;
  var surfFlags = GIZA.surfaceFlags.POSITIONS | GIZA.surfaceFlags.COLORS;

  var sinc = GIZA.surface(
    GIZA.equations.sinc(interval, width, maxHeight),
    rowTess, colTess, surfFlags);

  var init = function() {
    gl.clearColor(0.2,0.2,0.2,1);
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.sincCoords);
    gl.bufferData(gl.ARRAY_BUFFER, sinc.points(), gl.STATIC_DRAW);
    buffers.wireframe.lineCount = sinc.lineCount();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.wireframe);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sinc.lines(), gl.STATIC_DRAW);
  }

  var draw = function(currentTime) {
    
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    var mv = M4.lookAt(
        [0,10,2], // eye
        [0,0,0],  // target
        [0,0,1]); // up

    M4.rotateZ(mv, currentTime / 1000);

    var proj = M4.perspective(
      30,        // fov in degrees
      GIZA.aspect,
      3, 200);   // near and far

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.wireframe)
    gl.enableVertexAttribArray(attribs.POSITION);
    gl.enableVertexAttribArray(attribs.COLOR);

    var sincHeight = maxHeight * Math.cos(currentTime / 500);
    sinc = GIZA.surface(
      GIZA.equations.sinc(interval, width, sincHeight),
      rowTess, colTess, surfFlags);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.sincCoords);

    var program = programs.sinc;
    gl.useProgram(program);
    gl.uniform1f(program.interval, interval);
    gl.uniform1f(program.width, width);
    gl.uniform1f(program.height, sincHeight);

    var stride = (surfFlags & GIZA.surfaceFlags.COLORS) ? 16 : 12;
    gl.vertexAttribPointer(attribs.POSITION, 3, gl.FLOAT, false, stride, 0);
    gl.vertexAttribPointer(attribs.COLOR, 4, gl.UNSIGNED_BYTE, true, stride, 12);

    gl.uniformMatrix4fv(program.projection, false, proj);
    gl.uniformMatrix4fv(program.modelview, false, mv);

    gl.drawElements(
      gl.LINES, // drawing primitive
      2 * buffers.wireframe.lineCount, // number of indices
      gl.UNSIGNED_SHORT, // index data type
      0) // offset in bytes

    gl.disableVertexAttribArray(attribs.POSITION);
    gl.disableVertexAttribArray(attribs.COLOR);
  }

  init();
  GIZA.animate(draw);

};
