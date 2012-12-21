$(document).ready(function() {

  $("#radio").buttonset();

  GIZA.init();

  var attribs = {
    POSITION: 0,
    NORMAL: 1,
  };

  var shaders = {};

  shaders.solid = {
    vs: ['solidvs'],
    fs: ['solidfs'],
    attribs: {
      Position: attribs.POSITION
    }
  };

  var programs = GIZA.compilePrograms(shaders);

  var buffers = {
    sincCoords: gl.createBuffer(),
    wireframe: gl.createBuffer()
  };

  var init = function() {

    //gl.clearColor(0.61, 0.527, .397, 1.0);
    gl.clearColor(1, 1, 1, 1);
    gl.lineWidth(1.5 * GIZA.pixelScale);
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    var equation = GIZA.equations.sinc(50, 20, 2);
    var sinc = GIZA.surface(equation, 150, 150, 0);

    typedArray = sinc.points();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.sincCoords);
    gl.bufferData(gl.ARRAY_BUFFER, typedArray, gl.STATIC_DRAW);

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
      30,       // fov in degrees
      GIZA.aspect,
      3, 200);   // near and far

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.wireframe)
    gl.enableVertexAttribArray(attribs.POSITION);
    program = programs.solid;
    gl.useProgram(program);
    gl.uniformMatrix4fv(program.projection, false, proj.elements);

    var theta = currentTime / 1000;
    gl.uniform1f(program.time, Math.cos(2 * theta));

    gl.uniformMatrix4fv(program.modelview, false, mv.elements);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.sincCoords);
    gl.vertexAttribPointer(attribs.POSITION, 3, gl.FLOAT, false, 12, 0);
    gl.uniform4f(program.color, 0, 0, 0, 0.5);
    gl.drawElements(gl.LINES, buffers.wireframe.lineCount, gl.UNSIGNED_SHORT, 0)

    gl.disableVertexAttribArray(attribs.POSITION);
    GIZA.check('Error during draw cycle');
    window.requestAnimationFrame(draw, GIZA.canvas);
  }

  init();
  draw(0);

});
