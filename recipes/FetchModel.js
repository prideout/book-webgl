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
    torusCoords: gl.createBuffer(),
    mesh: gl.createBuffer(),
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
      lineArray = GIZA.quadsToLines(quads, Uint32Array);
      lines.push(lineArray);

      // Annotate the prim's metadata.
      prim.lineOffset = lineOffset;
      prim.lineCount = lineArray.length / 2;
      lineOffset += prim.lineCount;
    }

    // Aggregate the buffers into a monolithic VBO.
    lines = GIZA.join(lines);

    // Add to the indices so that they index into the correct region
    // of the coordinates buffer.
    var offset = 0, k = 0;
    for (var i = 0; i < prims.length; i++) {
      var prim = prims[i];
      for (var j = 0; j < 2 * prim.lineCount; j++) {
        lines[j + k] += offset;
      }
      offset += prim.vertsCount;
      k += 2 * prim.lineCount;
    }

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

    if (!gl.getExtension('OES_element_index_uint')) {
      console.error('32-bit indices are not supported via OES_element_index_uint');
    }

    GIZA.get('media/Clock.coords.bin', onCoords, 'binary');
    GIZA.get('media/Clock.quads.bin', onQuads, 'binary');
    GIZA.get('media/Clock.meta.json', onMeta, 'json');
      
    gl.clearColor(0, 0, 0, 1);

    var lod = 64;

    var flags = function() {
      var f = GIZA.surfaceFlags;
      return f.POSITIONS | f.NORMALS | f.WRAP_COLS | f.WRAP_ROWS;
    }();

    var torus = function() {
      var equation = GIZA.equations.torus(.25, 1);
      var surface = GIZA.surface(equation, lod, lod, flags);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.torusCoords);
      gl.bufferData(gl.ARRAY_BUFFER, surface.points(), gl.STATIC_DRAW);
      return surface;
    }();

    buffers.mesh.triangleCount = torus.triangleCount();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.mesh);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, torus.triangles(), gl.STATIC_DRAW);

    if (gl.getError() !== gl.NO_ERROR) {
      console.error('Error when trying to create VBOs');
    }
  }

  var drawPrim = function(prim, program, mv) {

    var color = prim.displayColor.slice(0).concat(1);
    gl.uniform4fv(program.color, color);
    gl.uniformMatrix4fv(program.modelview, false, mv);

    gl.drawElements(
      gl.LINES,
      prim.lineCount * 2,
      gl.UNSIGNED_INT,
      4 * prim.lineOffset * 2);
  };

  var draw = function(currentTime) {
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    var view = M4.lookAt(
      [0,-240,20], // eye
      [0,0,17],  // target
      [0,0,1]); // up

    var model = M4.make(trackball.getSpin());
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
      gl.vertexAttribPointer(attribs.POSITION, 3, gl.FLOAT, false, 12, 0);
      gl.enableVertexAttribArray(attribs.POSITION);
      for (var i = 0; i < prims.length; i++) {
        drawPrim(prims[i], program, mv);
      }
      gl.disableVertexAttribArray(attribs.POSITION);

    } else {
      var program = programs.lit;
    
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.mesh);
      gl.enableVertexAttribArray(attribs.POSITION);
      gl.enableVertexAttribArray(attribs.NORMAL);

      gl.useProgram(program);
      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.CULL_FACE);
      gl.uniformMatrix4fv(program.projection, false, proj);
      gl.uniformMatrix4fv(program.modelview, false, mv);
      gl.uniform4f(program.lightPosition, 0.75, .25, 1, 1);
      gl.uniform3f(program.ambientMaterial, 0.2, 0.1, 0.1);
      gl.uniform4f(program.diffuseMaterial, 1, 209/255, 54/255, 1);
      gl.uniform1f(program.shininess, 180.0);
      gl.uniform3f(program.specularMaterial, 0.8, 0.8, 0.7);
      gl.uniform1f(program.fresnel, 0.01);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.torusCoords);
      gl.vertexAttribPointer(attribs.POSITION, 3, gl.FLOAT, false, 24, 0);
        gl.vertexAttribPointer(attribs.NORMAL, 3, gl.FLOAT, false, 24, 12);
      gl.drawElements(gl.TRIANGLES,
                      3 * buffers.mesh.triangleCount,
                      gl.UNSIGNED_SHORT,
                      0)
      gl.disableVertexAttribArray(attribs.POSITION);
      gl.disableVertexAttribArray(attribs.NORMAL);
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
