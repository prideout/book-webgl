$(document).ready(function() {

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
    coords: gl.createBuffer(),
    wireframe: gl.createBuffer()
  };

  var init = function() {

    var coordsArray, wireframeArray, typedArray;

    gl.clearColor(0.7, 0.8, 0.9, 1.0);
    gl.lineWidth(1.5 * GIZA.pixelScale);

    coordsArray = [
      -1, -1, 10,
      0, 1, 10,
      1, -1, 10
    ];
    typedArray = new Float32Array(coordsArray);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.coords);
    gl.bufferData(gl.ARRAY_BUFFER, typedArray, gl.STATIC_DRAW);
    GIZA.check('Error when trying to create coords VBO');

    wireframeArray = [
      0, 1,
      1, 2,
      2, 0
    ];
    buffers.wireframe.lineCount = wireframeArray.length / 2;
    typedArray = new Uint16Array(wireframeArray);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.wireframe);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, typedArray, gl.STATIC_DRAW);
    GIZA.check('Error when trying to create wireframe VBO');
  }

  var draw = function(currentTime) {
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    
    var mv = (new mat4).lookAt(
        new vec3(0,0,0),  // eye
        new vec3(0,0,10), // target
        new vec3(0,1,0)); // up

    var proj = (new mat4).makePerspective(
      40,      // fov in degrees
      GIZA.aspect,
      3, 100); // near and far

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.wireframe)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.coords);
    gl.enableVertexAttribArray(attribs.POSITION);
    gl.vertexAttribPointer(attribs.POSITION, 3, gl.FLOAT, false, 12, 0);
    
    program = programs.solid;
    gl.useProgram(program);
    gl.uniformMatrix4fv(program.modelview, false, mv.elements);
    gl.uniformMatrix4fv(program.projection, false, proj.elements);
    gl.uniform4f(program.color, 0, 0.4, 0.8, 1);
    gl.drawElements(gl.LINES, 2 * buffers.wireframe.lineCount, gl.UNSIGNED_SHORT, 0)
    
    gl.disableVertexAttribArray(attribs.POSITION);

    GIZA.check('Error during draw cycle');
    window.requestAnimationFrame(draw, GIZA.canvas);
  }

  init();
  draw(0);

});
