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
    modelQuads: gl.createBuffer()
  };
  var arrays = {
    quads: null,
    lines: null,
    coords: null
  };
  var prims = [];

  var numPendingLoadTasks = 3;

  var trackball = new COMMON.Trackball();

  var onArrival = function(userdata) {
    if ($('.status').text().length) {
      $('.status').append(" ~ ");
    }
    $('.status').append(userdata);
    numPendingLoadTasks--;
    if (numPendingLoadTasks != 0) {
        return;
    }
    console.info("Done loading", prims.length, "prims.");

    lines = []
    for (var i = 0; i < prims.length; i++) {
      var prim = prims[i];
      var quads = arrays.quads.subarray(
        prim.quadsOffset, prim.quadsOffset + prim.quadsCount);
      lines.push(GIZA.quadsToLines(quads));
    }
    arrays.lines = GIZA.join(lines);
    console.info("Done converting quads to lines.");
  };

  var onCoords = function(data) {
    arrays.coords = new Float32Array(data);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.modelVerts);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    onArrival('coords');
  };

  var onQuads = function(data) {
    arrays.quads = new Uint32Array(data);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.modelQuads);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
    onArrival('quads');
  };

  var onMeta = function(data) {
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
    }
    onArrival('meta');
  };

  var init = function() {

    GIZA.get('media/Clock.coords.bin', onCoords, 'binary');
    GIZA.get('media/Clock.quads.bin', onQuads, 'binary');
    GIZA.get('media/Clock.meta.json', onMeta, 'json');
      
    gl.clearColor(34 / 255, 74 / 255, 116 / 255, 1);

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
      // TODO: set color, set mv, issue drawElements
  };

  var draw = function(currentTime) {
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    var view = M4.lookAt(
      [0,0,-15], // eye
      [0,0,0],  // target
      [0,1,0]); // up

    var model = M4.make(trackball.getSpin());
    var mv = M4.multiply(view, model);

    var proj = M4.perspective(
      10,       // fov in degrees
      GIZA.aspect,
      3, 200);  // near and far

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.mesh)
    gl.enableVertexAttribArray(attribs.POSITION);
    gl.enableVertexAttribArray(attribs.NORMAL);

    var program = programs.lit;
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

    if (numPendingLoadTasks == 0) {
        program = programs.solid;
        gl.useProgram(program);    
        gl.uniformMatrix4fv(program.projection, false, proj);
        gl.uniformMatrix4fv(program.modelview, false, mv);
        gl.enableVertexAttribArray(attribs.POSITION);
        prims.forEach(drawPrim, program, mv);
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
    gl.lineWidth(2);
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
