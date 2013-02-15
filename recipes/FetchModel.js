var main = function() {

  GIZA.init();
  var gl = GIZA.context;
  var M4 = GIZA.Matrix4;

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
    modelEdges: gl.createBuffer()
  };

  var quadArray = null;
  var prims = [];
  var numPendingLoadTasks = 3;
  var trackball = new COMMON.Trackball();

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
    for (var i = 0; i < prims.length; i++) {
      var prim = prims[i];

      // Create a subarray view and convert it to wireframe.
      var quads = quadArray.subarray(
        4 * prim.quadsOffset,
        4 * (prim.quadsOffset + prim.quadsCount));
      lineArray = GIZA.quadsToLines(quads);
      lines.push(lineArray);

      // Annotate the prim's metadata.
      prim.lineOffset = lineOffset;
      prim.lineCount = lineArray.length / 2;
      lineOffset += prim.lineCount;
    }

    // Aggregate the buffers into a monolithic VBO.
    lines = GIZA.join(lines);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.modelEdges);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, lines, gl.STATIC_DRAW);
    console.info("Done converting quads to lines.");
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

  var drawPrim = function(prim, program, mv) {

    var color = prim.displayColor.slice(0).concat(1);
    gl.uniform4fv(program.color, color);
    gl.uniformMatrix4fv(program.modelview, false, mv);

    // This is in bytes:
    var offset = prim.vertsOffset * 3 * 4;

    gl.vertexAttribPointer(attribs.POSITION, 3, gl.FLOAT, false, 0, offset);

    gl.drawElements(
      gl.LINES,
      prim.lineCount * 2,
      gl.UNSIGNED_SHORT,
      2 * prim.lineOffset * 2);
  };

  var draw = function(currentTime) {
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    var view = M4.lookAt(
      [0,0,-240], // eye
      [0,0,0],  // target
      [0,1,0]); // up

    var orient = M4.rotateZ(M4.rotateX(M4.identity(), -Math.PI / 2), Math.PI);
    var center = M4.translation(0, 0, -16);
    var spin = M4.make(trackball.getSpin());
    var model = M4.multiply(spin, M4.multiply(orient, center));
    var mv = M4.multiply(view, model);

    var proj = M4.perspective(
      10,       // fov in degrees
      GIZA.aspect,
      3, 2000);  // near and far

    if (numPendingLoadTasks == 0) {
      var program = programs.solid;
      gl.useProgram(program);    
      gl.enable(gl.DEPTH_TEST);
      gl.uniformMatrix4fv(program.projection, false, proj);
      gl.uniformMatrix4fv(program.modelview, false, mv);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.modelEdges);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.modelVerts);
      gl.enableVertexAttribArray(attribs.POSITION);
      for (var i = 0; i < prims.length; i++) {
        drawPrim(prims[i], program, mv);
      }
      gl.disableVertexAttribArray(attribs.POSITION);
    }

    proj = M4.orthographic(
      0, GIZA.canvas.width,
      0, GIZA.canvas.height,
      0, 10);

    mv = M4.identity();

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);

    program = programs.solid;
    gl.useProgram(program);
    gl.uniformMatrix4fv(program.projection, false, proj);
    gl.uniformMatrix4fv(program.modelview, false, mv);
    gl.uniform4f(program.color, 0, 0, 0.3, 1);
    gl.enableVertexAttribArray(attribs.POSITION);
    trackball.drawCircle(attribs.POSITION);
    gl.disableVertexAttribArray(attribs.POSITION);

    COMMON.endFrame(draw);
  }

  init();
  draw(0);

  COMMON.enableScreenshot(draw);

};
