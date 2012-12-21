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
    sphereCoords: gl.createBuffer(),
    torusCoords: gl.createBuffer(),
    wireframe: gl.createBuffer()
  };

  var init = function() {

    gl.clearColor(0.61, 0.527, .397, 1.0);
    gl.lineWidth(1.25 * GIZA.pixelScale);

    var coordsArray, wireframeArray, typedArray, equation;
    var flatten = function(v) { return [v.x, v.y, v.z]; }

    equation = GIZA.equations.torus(.25, 1);
    var torus = GIZA.surface(equation, 32, 32);
    coordsArray = GIZA.flatten(torus.points().map(flatten));
    typedArray = new Float32Array(coordsArray);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.torusCoords);
    gl.bufferData(gl.ARRAY_BUFFER, typedArray, gl.STATIC_DRAW);

    equation = GIZA.equations.sphere(1.25);
    var sphere = GIZA.surface(equation, 32, 32);
    coordsArray = GIZA.flatten(sphere.points().map(flatten));
    typedArray = new Float32Array(coordsArray);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.sphereCoords);
    gl.bufferData(gl.ARRAY_BUFFER, typedArray, gl.STATIC_DRAW);

    wireframeArray = sphere.lines()
    buffers.wireframe.lineCount = wireframeArray.length;
    typedArray = new Uint16Array(GIZA.flatten(wireframeArray));
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.wireframe);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, typedArray, gl.STATIC_DRAW);

    GIZA.check('Error when trying to create VBOs');
  }

  var draw = function(currentTime) {
    
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    var mv = (new mat4).lookAt(
        new vec3(0,0,20), // eye
        new vec3(0,0,0),  // target
        new vec3(0,1,0)); // up

    var proj = (new mat4).makePerspective(
      10,       // fov in degrees
      GIZA.aspect,
      3, 20);   // near and far

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.wireframe)
    gl.enableVertexAttribArray(attribs.POSITION);
    program = programs.solid;
    gl.useProgram(program);
    gl.uniformMatrix4fv(program.projection, false, proj.elements);

    var theta = currentTime / 1000;
    var previous = mv.clone();
    mv.translate(new vec3(-1.5,0,0));
    mv.rotateZ(theta);

    gl.uniformMatrix4fv(program.modelview, false, mv.elements);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.sphereCoords);
    gl.vertexAttribPointer(attribs.POSITION, 3, gl.FLOAT, false, 12, 0);
    gl.uniform4f(program.color, 0.5, 0, 0, 1);
    gl.drawElements(gl.LINES, buffers.wireframe.lineCount, gl.UNSIGNED_SHORT, 0)
    gl.uniform4f(program.color, 0, 0, 0, 1);
    gl.drawElements(gl.LINES, buffers.wireframe.lineCount, gl.UNSIGNED_SHORT, buffers.wireframe.lineCount*2)
    
    mv = previous;
    mv.translate(new vec3(1.5,0,0));
    mv.rotateZ(theta);

    gl.uniformMatrix4fv(program.modelview, false, mv.elements);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.torusCoords);
    gl.vertexAttribPointer(attribs.POSITION, 3, gl.FLOAT, false, 12, 0);
    gl.uniform4f(program.color, 0.5, 0, 0, 1);
    gl.drawElements(gl.LINES, buffers.wireframe.lineCount, gl.UNSIGNED_SHORT, 0)
    gl.uniform4f(program.color, 0, 0, 0, 1);
    gl.drawElements(gl.LINES, buffers.wireframe.lineCount, gl.UNSIGNED_SHORT, buffers.wireframe.lineCount*2)

    gl.disableVertexAttribArray(attribs.POSITION);
    GIZA.check('Error during draw cycle');
    window.requestAnimationFrame(draw, GIZA.canvas);
  }

  init();
  draw(0);

});
