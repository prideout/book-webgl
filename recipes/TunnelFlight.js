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
    wireframe: gl.createBuffer(),
    centerline: gl.createBuffer()
  };

  var arrays = {
      centerline: new Float32Array(128 * 3)
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

    var spine = function() {
      var pointCount = arrays.centerline.length / 3;
      var i = 0;
      var t = 0;
      var dt = 1.0 / pointCount;
      for (var p = 0; p < pointCount; p++) {
        var c = GIZA.equations.grannyKnot(t);
        arrays.centerline[i++] = c[0];
        arrays.centerline[i++] = c[1];
        arrays.centerline[i++] = c[2];
        t += dt;
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.centerline);
      gl.bufferData(gl.ARRAY_BUFFER, arrays.centerline, gl.STATIC_DRAW);
    }();
      
    if (gl.getError() !== gl.NO_ERROR) {
      console.error('Error when trying to create VBOs');
    }
  }

  var draw = function(currentTime) {
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var speed = 200; // the lower, the faster

    var ptCount = arrays.centerline.length / 3;
    var cameraIndex = Math.floor((currentTime / speed) % ptCount);

    var camera = function(t) {
      t = t / (speed * ptCount);
      return GIZA.equations.grannyKnot(t);
    };
    
    var eye = camera(currentTime);
    var target = camera(currentTime + speed);
    var direction = V3.normalize(V3.subtract(target, eye));
    var up = V3.normalize(V3.cross(direction, [0, 0, 1]));
    var mv = M4.lookAt(eye, target, up);

    if (true) {
      target = V3.copy(eye);
      eye[2] += 1;
      mv = M4.lookAt(eye, target, [0,1,0]);
    }

    var proj = M4.perspective(
      60,          // fov in degrees
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
    //gl.drawElements(gl.TRIANGLES, numIndices, gl.UNSIGNED_SHORT, 0)
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

    gl.uniform4f(program.color, 1, 1, 0, 0.5);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.centerline);
    gl.vertexAttribPointer(attribs.POSITION, 3, gl.FLOAT, false, 12, 0);
    gl.drawArrays(gl.LINE_LOOP, 0, arrays.centerline.length / 3);

    if (cameraIndex + 1 < arrays.centerline.length / 3) {
      gl.lineWidth(6);
      gl.disable(gl.DEPTH_TEST);
      gl.uniform4f(program.color, 1, 0, 0, 1);
      gl.drawArrays(gl.LINE_STRIP, cameraIndex, 2);
      gl.enable(gl.DEPTH_TEST);
      gl.lineWidth(2);
    }

    gl.disable(gl.BLEND);
    gl.disableVertexAttribArray(attribs.POSITION);

    COMMON.endFrame(draw);
  }

  init();
  draw(0);

};
