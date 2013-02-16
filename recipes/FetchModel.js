var main = function() {

  GIZA.init();
  var gl = GIZA.context;
  var M4 = GIZA.Matrix4;
  var wireframe = false;

  var attribs = {
    POSITION: 0,
    NORMAL: 1,
  };

  var programs = COMMON.compilePrograms({
    lit: {
      vs: ['genericvs'],
      fs: ['litfs'],
      attribs: {
        Position: attribs.POSITION,
        Normal: attribs.NORMAL
      }
    },
    solid: {
      vs: ['genericvs'],
      fs: ['solidfs'],
      attribs: {
        Position: attribs.POSITION,
      }
    }
  });

  var buffers = {
    modelVerts: gl.createBuffer(),
    modelEdges: gl.createBuffer(),
    modelTriangles: gl.createBuffer(),
  };

  var quadArray = null;
  var prims = [];
  var numPendingLoadTasks = 3;
  var turntable = new COMMON.Turntable();

  var onArrival = function(userdata) {

    // Give a status update on what's been downloaded so far.
    if ($('.status').text().length) {
      $('.status').append(" ~ ");
    }
    $('.status').append(userdata);
    numPendingLoadTasks--;

    // Leave early if we're not done downloading all items.
    if (numPendingLoadTasks != 0) {
        return;
    }
    console.info("Done loading", prims.length, "prims.");

    var lines = [];
    var lineOffset = 0;
    var tris = [];
    var triOffset = 0;
    for (var i = 0; i < prims.length; i++) {
      var prim = prims[i];

      // Create a subarray view and convert it to wireframe.
      var quads = quadArray.subarray(
        4 * prim.quadsOffset,
        4 * (prim.quadsOffset + prim.quadsCount));
      lineArray = GIZA.Topo.quadsToLines(quads);
      lines.push(lineArray);

      // Annotate the prim's metadata.
      prim.lineOffset = lineOffset;
      prim.lineCount = lineArray.length / 2;
      lineOffset += prim.lineCount;

      // Now for the filled thingy.
      var triMesh = GIZA.Topo.quadsToTriangles(quads);
      tris.push(triMesh.indexArray);
      prim.triOffset = triOffset;
      prim.triCount = triMesh.indexArray.length / 3;
      triOffset += prim.triCount;
    }

    // Aggregate the buffers into a monolithic VBO.
    lines = GIZA.join(lines);
    tris = GIZA.join(tris);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.modelEdges);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, lines, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.modelTriangles);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, tris, gl.STATIC_DRAW);

    console.info("Done processing quads.");
  };

  var onCoords = function(data) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.modelVerts);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    onArrival('coords');
  };

  var onQuads = function(data) {
    quadArray = new Uint16Array(data);
    onArrival('quads');
  };

  var onMeta = function(data) {
    var vertsCount = 0;
    for (var name in data) {
      prim = {};
      prim.name = name;
      prim.displayColor = data[name][0];
      prim.transform = data[name][1];
      prim.vertsOffset = data[name][2];
      prim.vertsCount = data[name][3];
      prim.quadsOffset = data[name][4];
      prim.quadsCount = data[name][5];
      prims.push(prim);
      vertsCount += prim.vertsCount;
    }
    console.info('Total vert count =', vertsCount);
    onArrival('meta');
  };

  var init = function() {
    GIZA.get('media/Clock.coords.bin', onCoords, 'binary');
    GIZA.get('media/Clock.quads.bin', onQuads, 'binary');
    GIZA.get('media/Clock.meta.json', onMeta, 'json');
    gl.clearColor(0.9, 0.9, 0.9, 1);
  }

  var draw = function(currentTime) {
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    var view = M4.lookAt(
      [0,0,-240], // eye
      [0,0,0],  // target
      [0,1,0]); // up

    var proj = M4.perspective(
      10,       // fov in degrees
      GIZA.aspect,
      3, 2000);  // near and far

    if (numPendingLoadTasks != 0) {
      COMMON.endFrame(draw);
      return;
    }

    var orient = M4.rotateZ(M4.rotateX(M4.identity(), -Math.PI / 2), Math.PI);
    var center = M4.translation(0, 0, -16);
    var spin = M4.make(turntable.getRotation());
    var group = M4.multiply(spin, M4.multiply(orient, center));

    var program = programs.solid;
    gl.useProgram(program);    
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.uniformMatrix4fv(program.projection, false, proj);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, wireframe ?
                  buffers.modelEdges : buffers.modelTriangles);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.modelVerts);
    gl.enableVertexAttribArray(attribs.POSITION);
    for (var i = 0; i < prims.length; i++) {

      var prim = prims[i];
      var color = prim.displayColor.slice(0).concat(1);
      gl.uniform4fv(program.color, color);
    
      var local = M4.make(prim.transform);
      var model = M4.multiply(group, local);
      var mv = M4.multiply(view, model);
    
      gl.uniformMatrix4fv(program.modelview, false, mv);
    
      // This is in bytes:
      var offset = prim.vertsOffset * 3 * 4;

      gl.vertexAttribPointer(attribs.POSITION, 3, gl.FLOAT, false, 0, offset);

      if (wireframe) {
        gl.drawElements(
          gl.LINES,
          prim.lineCount * 2,
          gl.UNSIGNED_SHORT,
          2 * prim.lineOffset * 2);
      } else {
    
        if (-1 == prim.name.indexOf("Glass")) { // HACK
          gl.drawElements(
            gl.TRIANGLES,
            prim.triCount * 3,
            gl.UNSIGNED_SHORT,
            3 * prim.triOffset * 2);
        }
      }

    }
    gl.disableVertexAttribArray(attribs.POSITION);

    COMMON.endFrame(draw);
  }

  init();
  draw(0);

  COMMON.enableScreenshot(draw);

};
