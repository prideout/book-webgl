$(document).ready(function() {

  // The mode variable is either "glsl" or "js".  It specifies if
  // evaluation of the sinc function occurs on the CPU or on the GPU.
  var mode = $("input:checked")[0].id;

  $("#radio").buttonset().change(function (e) {
    mode = $("input:checked")[0].id;
  });

  GIZA.init();

  var attribs = {
    POSITION: 0,
    COLOR: 1
  };

  var programs = GIZA.compilePrograms({
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
  var rowTess = 100;
  var colTess = 500;
  var surfFlags = GIZA.surfaceFlags.POSITIONS | GIZA.surfaceFlags.COLORS;

  var sinc = GIZA.surface(
    GIZA.equations.sinc(interval, width, maxHeight),
    rowTess, colTess, surfFlags);

  var init = function() {

    gl.clearColor(1, 1, 1, 1);
    gl.disable(gl.DEPTH_TEST);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.sincCoords);
    gl.bufferData(gl.ARRAY_BUFFER, sinc.points(), gl.STATIC_DRAW);

    buffers.wireframe.lineCount = sinc.lineCount();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.wireframe);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sinc.lines(), gl.STATIC_DRAW);

    GIZA.check('Error when trying to create VBOs');
  }

  var draw = function(currentTime) {
    
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    var mv = (new mat4).lookAt(
        new vec3(0,10,2), // eye
        new vec3(0,0,0),  // target
        new vec3(0,0,1)); // up

    var proj = (new mat4).makePerspective(
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

    var program;
    if (mode == "glsl") {
      program = programs.sinc;
      gl.useProgram(program);
      gl.uniform1f(program.interval, interval);
      gl.uniform1f(program.width, width);
      gl.uniform1f(program.height, sincHeight);
    } else {
      program = programs.simple;
      gl.useProgram(program);

      var rawBuffer = sinc.points().buffer;
      var byteOffset = 0;
      for (var i = 0; i < sinc.pointCount(); i++) {
        var coordView = new Float32Array(rawBuffer, byteOffset, 3)
        var colorView = new Uint8Array(rawBuffer, 12  + byteOffset, 4);

        var v = 255 * Math.abs(coordView[2] * 4);
        v = Math.min(v, 255);

        colorView[0] = 0;
        colorView[1] = v / 2;
        colorView[2] = v;
        colorView[3] = 255;

        byteOffset += 16;
      }

      gl.bufferData(gl.ARRAY_BUFFER, rawBuffer, gl.STATIC_DRAW);
    }

    var stride = (surfFlags & GIZA.surfaceFlags.COLORS) ? 16 : 12;
    gl.vertexAttribPointer(attribs.POSITION, 3, gl.FLOAT, false, stride, 0);
    gl.vertexAttribPointer(attribs.COLOR, 4, gl.UNSIGNED_BYTE, true, stride, 12);

    gl.uniformMatrix4fv(program.projection, false, proj.elements);
    gl.uniformMatrix4fv(program.modelview, false, mv.elements);

    gl.drawElements(
      gl.LINES, // drawing primitive
      2 * buffers.wireframe.lineCount, // number of indices
      gl.UNSIGNED_SHORT, // index data type
      0) // offset in bytes

    gl.disableVertexAttribArray(attribs.POSITION);
    gl.disableVertexAttribArray(attribs.COLOR);

    if (GIZA.check('Error during draw cycle')) {
      window.requestAnimationFrame(draw, GIZA.canvas);
    }
  }

  init();
  draw(0);

});
