var main = function() {

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

  var programs = DEMO.compilePrograms(shaders);

  var buffers = {
    sphereCoords: gl.createBuffer(),
    torusCoords: gl.createBuffer(),
    wireframe: gl.createBuffer()
  };

  var init = function() {

    gl.clearColor(1, 1, 1, 1);
    gl.lineWidth(1.5 * GIZA.pixelScale);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    var equation;

    equation = GIZA.equations.torus(.25, 1);
    var torus = GIZA.surface(equation, 32, 32);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.torusCoords);
    gl.bufferData(gl.ARRAY_BUFFER, torus.points(), gl.STATIC_DRAW);

    equation = GIZA.equations.sphere(1.25);
    var sphere = GIZA.surface(equation, 32, 32);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.sphereCoords);
    gl.bufferData(gl.ARRAY_BUFFER, sphere.points(), gl.STATIC_DRAW);

    buffers.wireframe.lineCount = sphere.lineCount();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.wireframe);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sphere.lines(), gl.STATIC_DRAW);

    DEMO.check('Error when trying to create VBOs');
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
    gl.uniform4f(program.color, 0, 0, 0, 0.75);
    gl.drawElements(gl.LINES, 2 * buffers.wireframe.lineCount, gl.UNSIGNED_SHORT, 0)
    
    mv = previous;
    mv.translate(new vec3(1.5,0,0));
    mv.rotateZ(theta);

    gl.uniformMatrix4fv(program.modelview, false, mv.elements);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.torusCoords);
    gl.vertexAttribPointer(attribs.POSITION, 3, gl.FLOAT, false, 12, 0);
    gl.drawElements(gl.LINES, 2 * buffers.wireframe.lineCount, gl.UNSIGNED_SHORT, 0)

    gl.disableVertexAttribArray(attribs.POSITION);
    DEMO.check('Error during draw cycle');
    window.requestAnimationFrame(draw, GIZA.canvas);
  }

  init();
  draw(0);

};
