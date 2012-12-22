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
        Position: attribs.POSITION
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

  var sinc = GIZA.surface(
    GIZA.equations.sinc(interval, width, maxHeight),
    rowTess, colTess, 0);

  var init = function() {

    gl.clearColor(1, 1, 1, 1);
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

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

    var sincHeight = maxHeight * Math.cos(currentTime / 500);
    sinc = GIZA.surface(
      GIZA.equations.sinc(interval, width, sincHeight),
      rowTess, colTess, 0);

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
      gl.bufferData(gl.ARRAY_BUFFER, sinc.points(), gl.STATIC_DRAW);
    }

    gl.vertexAttribPointer(attribs.POSITION, 3, gl.FLOAT, false, 12, 0);
    gl.uniformMatrix4fv(program.projection, false, proj.elements);
    gl.uniformMatrix4fv(program.modelview, false, mv.elements);
    gl.uniform4f(program.color, 0, 0.1, 0.25, 0.5);

    gl.drawElements(gl.LINES, 2*buffers.wireframe.lineCount, gl.UNSIGNED_SHORT, 0)

    gl.disableVertexAttribArray(attribs.POSITION);
    if (GIZA.check('Error during draw cycle')) {
      window.requestAnimationFrame(draw, GIZA.canvas);
    }
  }

  init();
  draw(0);

});
