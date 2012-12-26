var main = function() {

  var getComps = function() {
    var getid = function() { return $(this).attr('id'); };
    return $("input:checked").map(getid).get();
  };
  var comps = getComps();

  $("#checks").buttonset().change(function() {
    comps = getComps();
  });

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
      Position: attribs.POSITION,
      Normal: attribs.NORMAL
    }
  };

  var programs = DEMO.compilePrograms(shaders);

  var buffers = {
    sphereCoords: gl.createBuffer(),
    torusCoords: gl.createBuffer(),
    mesh: gl.createBuffer()
  };

  var init = function() {

    gl.clearColor(34 / 255, 74 / 255, 116 / 255, 1);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    var lod = 100;

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

    var sphere = function() {
      var equation = GIZA.equations.sphere(1.25);
      var surface = GIZA.surface(equation, lod, lod, flags);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.sphereCoords);
      gl.bufferData(gl.ARRAY_BUFFER, surface.points(), gl.STATIC_DRAW);
      return surface;
    }();

    buffers.mesh.triangleCount = sphere.triangleCount();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.mesh);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sphere.triangles(), gl.STATIC_DRAW);

    DEMO.check('Error when trying to create VBOs');
  }

  var draw = function(currentTime) {
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    var mv = (new mat4).lookAt(
      new vec3(0,0,20), // eye
      new vec3(0,0,0),  // target
      new vec3(0,1,0)); // up

    var proj = (new mat4).makePerspective(
      10,       // fov in degrees
      GIZA.aspect,
      3, 200);   // near and far

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.mesh)
    gl.enableVertexAttribArray(attribs.POSITION);
    gl.enableVertexAttribArray(attribs.NORMAL);

    var program = programs.solid;
    gl.useProgram(program);
    gl.uniformMatrix4fv(program.projection, false, proj.elements);
    gl.uniform4f(program.lightPosition, 0.75, .25, 1, 1);

    if (comps.indexOf("ambient") > -1) {
      gl.uniform3f(program.ambientMaterial, 0.2, 0.1, 0.1);
    } else {
      gl.uniform3f(program.ambientMaterial, 0, 0, 0);
    }

    if (comps.indexOf("diffuse") > -1) {
      gl.uniform4f(program.diffuseMaterial, 1, 209/255, 54/255, 1);
    } else {
      gl.uniform4f(program.diffuseMaterial, 0, 0, 0, 1);
    }

    if (comps.indexOf("specular") > -1) {
      gl.uniform3f(program.specularMaterial, 0.8, 0.8, 0.7);
      gl.uniform1f(program.shininess, 180.0);
    } else {
      gl.uniform3f(program.specularMaterial, 0, 0, 0);
    }

    if (comps.indexOf("fresnel") > -1) {
      gl.uniform1f(program.fresnel, 0.125);
    } else {
      gl.uniform1f(program.fresnel, 0);
    }

    var theta = currentTime / 1000;
    var previous = mv.clone();
    mv.translate(new vec3(-1.5,0,0));
    mv.rotateY(theta);

    gl.uniformMatrix4fv(program.modelview, false, mv.elements);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.sphereCoords);
    gl.vertexAttribPointer(attribs.POSITION, 3, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(attribs.NORMAL, 3, gl.FLOAT, false, 24, 12);
    gl.drawElements(gl.TRIANGLES,
                    3 * buffers.mesh.triangleCount,
                    gl.UNSIGNED_SHORT,
                    0)
    
    mv = previous;
    mv.translate(new vec3(1.5,0,0));
    mv.rotateY(theta);

    gl.uniformMatrix4fv(program.modelview, false, mv.elements);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.torusCoords);
    gl.vertexAttribPointer(attribs.POSITION, 3, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(attribs.NORMAL, 3, gl.FLOAT, false, 24, 12);
    gl.drawElements(gl.TRIANGLES,
                    3 * buffers.mesh.triangleCount,
                    gl.UNSIGNED_SHORT,
                    0)

    gl.disableVertexAttribArray(attribs.POSITION);
    gl.disableVertexAttribArray(attribs.NORMAL);

    if (DEMO.check('Error during draw cycle')) {
      window.requestAnimationFrame(draw, GIZA.canvas);
    }
  }

  init();
  draw(0);

};
