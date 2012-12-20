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

    var equation = GIZA.equations.sphere(1.25);
    var sphere = GIZA.surface(equation, 32, 32);

    flatten = function(v) { return [v.x, v.y, v.z]; }
    coordsArray = GIZA.flatten(sphere.points().map(flatten));

    typedArray = new Float32Array(coordsArray);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.coords);
    gl.bufferData(gl.ARRAY_BUFFER, typedArray, gl.STATIC_DRAW);
    GIZA.check('Error when trying to create coords VBO');

    wireframeArray = sphere.lines()
    buffers.wireframe.lineCount = wireframeArray.length;
    typedArray = new Uint16Array(GIZA.flatten(wireframeArray));
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.wireframe);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, typedArray, gl.STATIC_DRAW);
    GIZA.check('Error when trying to create wireframe VBO');
  }

  var draw = function(currentTime) {
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
    var mv = (new mat4).lookAt(
        new vec3(0,0,5),  // eye
        new vec3(0,0,0), // target
        new vec3(0,1,0)); // up

    var proj = (new mat4).makePerspective(
      40,      // fov in degrees
      GIZA.aspect,
      3, 4.75); // near and far

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.wireframe)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.coords);
    gl.enableVertexAttribArray(attribs.POSITION);
    gl.vertexAttribPointer(attribs.POSITION, 3, gl.FLOAT, false, 12, 0);
    
    program = programs.solid;
    gl.useProgram(program);
    gl.uniformMatrix4fv(program.modelview, false, mv.elements);
    gl.uniformMatrix4fv(program.projection, false, proj.elements);
    gl.uniform4f(program.color, 0, 0, 0, 0.75);
    gl.drawElements(gl.LINES, buffers.wireframe.lineCount, gl.UNSIGNED_SHORT, 0)
    gl.uniform4f(program.color, 0.5, 0, 0, 0.75);
    gl.drawElements(gl.LINES, buffers.wireframe.lineCount, gl.UNSIGNED_SHORT, buffers.wireframe.lineCount*2)
    
    gl.disableVertexAttribArray(attribs.POSITION);

    GIZA.check('Error during draw cycle');
    window.requestAnimationFrame(draw, GIZA.canvas);
  }

  init();
  draw(0);

});
