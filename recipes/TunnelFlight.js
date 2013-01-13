var main = function() {

  GIZA.init();
  var M4 = GIZA.Matrix4;

  var attribs = {
    POSITION: 0,
    NORMAL: 1,
  };

  var programs = COMMON.compilePrograms({
    lit: {
      vs: ['solidvs'],
      fs: ['lit'],
      attribs: {
        Position: attribs.POSITION,
        Normal: attribs.NORMAL
      }
    },
    nonlit: {
      vs: ['solidvs'],
      fs: ['nonlit'],
      attribs: {
        Position: attribs.POSITION,
        Normal: attribs.NORMAL
      }
    }
  });

  var buffers = {
    torusCoords: gl.createBuffer(),
    triangles: gl.createBuffer(),
    wireframe: gl.createBuffer()
  };

  var init = function() {

    gl.clearColor(34 / 255, 74 / 255, 116 / 255, 1);
    gl.enable(gl.DEPTH_TEST);

    var lod = 64;

    var flags = function() {
      var f = GIZA.surfaceFlags;
      return f.POSITIONS | f.NORMALS | f.WRAP_COLS | f.WRAP_ROWS;
    }();

    var torus = function() {
      var equation = GIZA.equations.torus(4, 16);
      var surface = GIZA.surface(equation, lod, lod, flags);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.torusCoords);
      gl.bufferData(gl.ARRAY_BUFFER, surface.points(), gl.STATIC_DRAW);
      return surface;
    }();

    buffers.wireframe.lineCount = torus.lineCount();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.wireframe);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, torus.lines(), gl.STATIC_DRAW);

    buffers.triangles.count = torus.triangleCount();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.triangles);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, torus.triangles(), gl.STATIC_DRAW);

    if (gl.getError() !== gl.NO_ERROR) {
      console.error('Error when trying to create VBOs');
    }
  }

  var draw = function(currentTime) {
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    var mv = M4.lookAt(
      [0,0,100], // eye
      [0,0,0],  // target
      [0,1,0]); // up

    var proj = M4.perspective(
      10,       // fov in degrees
      GIZA.aspect,
      3, 2000);  // near and far

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.triangles)
    gl.enableVertexAttribArray(attribs.POSITION);
    gl.enableVertexAttribArray(attribs.NORMAL);

    var program = programs.lit;
    gl.useProgram(program);
    gl.uniformMatrix4fv(program.projection, false, proj);
    gl.uniform4f(program.lightPosition, 0.75, .25, 1, 1);
    gl.uniform3f(program.ambientMaterial, 0.2, 0.1, 0.1);
    gl.uniform4f(program.diffuseMaterial, 1, 209/255, 54/255, 1);
    gl.uniform1f(program.shininess, 180.0);
    gl.uniform3f(program.specularMaterial, 0.8, 0.8, 0.7);
    gl.uniform1f(program.fresnel, 0.01);
    gl.uniformMatrix4fv(program.modelview, false, mv);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.torusCoords);
    gl.vertexAttribPointer(attribs.POSITION, 3, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(attribs.NORMAL, 3, gl.FLOAT, false, 24, 12);
    gl.drawElements(gl.TRIANGLES,
                    3 * buffers.triangles.count,
                    gl.UNSIGNED_SHORT,
                    0)
    gl.disableVertexAttribArray(attribs.NORMAL);


    var program = programs.lit;
    gl.disable(gl.DEPTH_TEST);
    gl.useProgram(program);
    gl.uniformMatrix4fv(program.projection, false, proj);
    gl.uniformMatrix4fv(program.modelview, false, mv);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.torusCoords);
    gl.vertexAttribPointer(attribs.POSITION, 3, gl.FLOAT, false, 24, 0);
    gl.drawElements(gl.LINES,
                    2 * buffers.wireframe.lineCount,
                    gl.UNSIGNED_SHORT,
                    0)
    gl.enable(gl.DEPTH_TEST);
    gl.disableVertexAttribArray(attribs.POSITION);

    COMMON.endFrame(draw);
  }

  init();
  draw(0);

};
