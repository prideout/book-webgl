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
    centerline: gl.createBuffer(),
    points: gl.createBuffer(),
  };

  var arrays = {
      centerline: new Float32Array(128 * 3),
      points: new Float32Array(1 * 3)
  };

  var init = function() {

    gl.clearColor(34 / 255, 74 / 255, 116 / 255, 1);
    gl.enable(gl.DEPTH_TEST);

    var lod = 64;

    var flags = function() {
      var f = GIZA.surfaceFlags;
      return f.POSITIONS | f.NORMALS | f.WRAP_COLS | f.WRAP_ROWS;
    }();

    var tube = function() {
      var equation = GIZA.equations.tube(
        GIZA.equations.grannyKnot, 0.15);
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

    var speed = 300; // the lower, the faster

    var ptCount = arrays.centerline.length / 3;
    var cameraIndex = Math.floor((currentTime / speed) % ptCount);

    var camera = function(t) {
      t = t / (speed * ptCount);
      return GIZA.equations.grannyKnot(t);
    };
    
    var eye = camera(currentTime);
    var target = camera(currentTime + 50);
    var direction = V3.normalize(V3.subtract(eye, target));
    target = V3.subtract(eye, direction);
    var up = V3.perp(direction);
    var mv = M4.lookAt(eye, target, up);

    var proj = M4.perspective(
      40,          // fov in degrees
      GIZA.aspect,
      0.1, 100);  // near and far

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.triangles)
    gl.enableVertexAttribArray(attribs.POSITION);
    gl.enableVertexAttribArray(attribs.NORMAL);

    var program = programs.lit;
    var numIndices = 3 * buffers.triangles.count;
    gl.useProgram(program);
    gl.uniformMatrix4fv(program.projection, false, proj);
    gl.uniformMatrix4fv(program.modelview, false, mv);
    gl.uniform4f(program.lightPosition, 0.75, .25, 1, 1);
    gl.uniform3f(program.ambientMaterial, 0.2, 0.1, 0.1);
    gl.uniform4f(program.diffuseMaterial, 1, 209/255, 54/255, 1);
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
    gl.uniform4f(program.color, 1, 1, 1, 0.125);
    gl.uniformMatrix4fv(program.projection, false, proj);
    gl.uniformMatrix4fv(program.modelview, false, mv);
    gl.drawElements(gl.LINES, numIndices, gl.UNSIGNED_SHORT, 0)

    // Draw the centerline for debug purposes
    if (false) {
      gl.uniform4f(program.color, 1, 1, 0, 0.5);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.centerline);
      gl.vertexAttribPointer(attribs.POSITION, 3, gl.FLOAT, false, 12, 0);
      gl.drawArrays(gl.LINE_LOOP, 0, arrays.centerline.length / 3);
      gl.disable(gl.DEPTH_TEST);
      if (cameraIndex + 2 < arrays.centerline.length / 3) {
        gl.lineWidth(6);
        gl.uniform4f(program.color, 1, 0, 0, 1);
        gl.drawArrays(gl.LINE_STRIP, cameraIndex, 3);
        gl.lineWidth(2);
      }
    }

    // Draw the camera target for debug purposes.
    if (false) {
      arrays.points.set(target);
      gl.uniform4f(program.color, 0, 1, 0, 1);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.points);
      gl.bufferData(gl.ARRAY_BUFFER, arrays.points, gl.STATIC_DRAW);
      gl.vertexAttribPointer(attribs.POSITION, 3, gl.FLOAT, false, 12, 0);
      gl.drawArrays(gl.POINTS, 0, 1);
    }

    gl.enable(gl.DEPTH_TEST);

    gl.disable(gl.BLEND);
    gl.disableVertexAttribArray(attribs.POSITION);

    COMMON.endFrame(draw);
  }

  init();
  draw(0);

  $(document).keydown(function(e) {
    if (e.keyCode == 83) {
      draw(COMMON.now);
      var imgUrl = GIZA.canvas.toDataURL("image/png");
      window.open(imgUrl, '_blank');
      window.focus();
    }
  });

};
