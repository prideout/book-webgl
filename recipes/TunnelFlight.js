var main = function() {

  GIZA.init();
  var M4 = GIZA.Matrix4;
  var V3 = GIZA.Vector3;

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
    tubeCoords: gl.createBuffer(),
    triangles: gl.createBuffer(),
    wireframe: gl.createBuffer()
  };

  var init = function() {

    gl.clearColor(34 / 255, 74 / 255, 116 / 255, 1);
    gl.enable(gl.DEPTH_TEST);

    var lod = 32;

    var flags = function() {
      var f = GIZA.surfaceFlags;
      return f.POSITIONS | f.NORMALS | f.WRAP_COLS | f.WRAP_ROWS;
    }();

    var tube = function() {
      var equation = GIZA.equations.tube(
        GIZA.equations.grannyKnot, 0.2);
      var surface = GIZA.surface(equation, lod, 6*lod, flags);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.tubeCoords);
      gl.bufferData(gl.ARRAY_BUFFER, surface.points(), gl.STATIC_DRAW);
      return surface;
    }();

    buffers.wireframe.lineCount = tube.lineCount();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.wireframe);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, tube.lines(), gl.STATIC_DRAW);

    buffers.triangles.count = tube.triangleCount();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.triangles);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, tube.triangles(), gl.STATIC_DRAW);

    if (gl.getError() !== gl.NO_ERROR) {
      console.error('Error when trying to create VBOs');
    }
  }

  var draw = function(currentTime) {
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var camera = function(t) {
      return GIZA.equations.grannyKnot(t);
    };
    
    var t = (currentTime / 10000.0);
    var eye = camera(t);
    var target = camera(t + 0.01);
    var direction = V3.normalize(V3.subtract(target, eye));
    var up = V3.normalize(V3.cross(direction, [0, 0, 1]));
    
    var mv = M4.lookAt(
      [0,0,-2],  // eye
      [0,0,0],  // target
      [0,1,0]); // up

    //var mv = M4.lookAt(eye, target, up);

    var proj = M4.perspective(
      60,       // fov in degrees
      GIZA.aspect,
      0.1, 1000);  // near and far

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.triangles)
    gl.enableVertexAttribArray(attribs.POSITION);
    gl.enableVertexAttribArray(attribs.NORMAL);

    var program = programs.lit;
    var numIndices = 3 * buffers.triangles.count;
    gl.useProgram(program);
    gl.uniformMatrix4fv(program.projection, false, proj);
    gl.uniform4f(program.lightPosition, 0.75, .25, 1, 1);
    gl.uniform3f(program.ambientMaterial, 0.2, 0.1, 0.1);
    gl.uniform4f(program.diffuseMaterial, 1, 209/255, 54/255, 1);
    gl.uniform1f(program.shininess, 180.0);
    gl.uniform3f(program.specularMaterial, 0.8, 0.8, 0.7);
    gl.uniform1f(program.fresnel, 0.01);
    gl.uniformMatrix4fv(program.modelview, false, mv);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.tubeCoords);
    gl.vertexAttribPointer(attribs.POSITION, 3, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(attribs.NORMAL, 3, gl.FLOAT, false, 24, 12);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(10, 10);
    gl.drawElements(gl.TRIANGLES, numIndices, gl.UNSIGNED_SHORT, 0)
    gl.disable(gl.POLYGON_OFFSET_FILL);
    gl.disableVertexAttribArray(attribs.NORMAL);

    var program = programs.nonlit;
    var numIndices = 2 * buffers.wireframe.lineCount;
    gl.lineWidth(2);
    gl.useProgram(program);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.uniform4f(program.color, 1, 1, 1, 0.25);
    gl.uniformMatrix4fv(program.projection, false, proj);
    gl.uniformMatrix4fv(program.modelview, false, mv);
    gl.drawElements(gl.LINES, numIndices, gl.UNSIGNED_SHORT, 0)
    gl.disable(gl.BLEND);
    gl.disableVertexAttribArray(attribs.POSITION);

    COMMON.endFrame(draw);
  }

  init();
  draw(0);

};
