$(document).ready(function() {

  GIZA.init();

  var attribs = {
    POSITION: 0,
    VERTEXID: 0,
    NORMAL: 1,
    TEXCOORD: 2
  };

  var shaders = {};

  shaders.dot = {
    vs: ['dotvs'],
    fs: ['dotfs'],
    attribs: {
      Position: attribs.POSITION
    }
  };

  shaders.contour = {
    vs: ['contourvs'],
    fs: ['contourfs'],
    attribs: {
      Position: attribs.POSITION
    }
  };

  var programs = GIZA.compilePrograms(shaders);

  var contourPts = [];
  var holePts = [];
  var ready = false;
  var spriteTexture;
  var coordsBuffer, outlineBuffer, triangleBuffer;
  var pointCount, outerPointCount, triangleCount;

  GIZA.loadTexture('media/PointSprite.png', function(i) {
      spriteTexture = i;
      ready = true;
  });

  var init = function() {

    gl.clearColor(0.9, 0.9, 0.9, 1.0);
    gl.lineWidth(1.5 * GIZA.pixelScale);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    coordsBuffer = gl.createBuffer();
    outlineBuffer = gl.createBuffer();
    triangleBuffer = gl.createBuffer();

    var c = [{x:570,y:336},{x:365,y:30},{x:140,y:336}];
    var h = [{x:350,y:201},{x:380,y:201},{x:365,y:282}];

    vec2ify = function(o) { return new vec2(o.x, o.y); }
    contourPts = c.map(vec2ify);
    holePts = h.map(vec2ify);

    // Diagnostics
    console.info("outer =", JSON.stringify(contourPts));
    console.info("inner =", JSON.stringify(holePts));

    // Outer hull
    outerPointCount = contourPts.length;
    pointCount = contourPts.length + holePts.length;
    var coordsArray = GIZA.flatten(contourPts.concat(holePts));
    var typedArray = new Float32Array(coordsArray);
    gl.bindBuffer(gl.ARRAY_BUFFER, coordsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, typedArray, gl.STATIC_DRAW);
    GIZA.check('Error when trying to create points VBO');

    // Run ear clipping
    var triangles = GIZA.tessellate(
      contourPts,
      [holePts]);

    // Diagnostics
    console.info("result =", JSON.stringify(triangles, null, 4));

    // Filled triangles
    triangleCount = triangles.length;
    typedArray = new Uint16Array(GIZA.flatten(triangles));
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, typedArray, gl.STATIC_DRAW);
    GIZA.check('Error when trying to create triangle VBO');

    // Triangle outlines
    var outlines = [];
    for (var i = 0; i < triangles.length; i++) {
      var tri = triangles[i];
      outlines.push(tri[0]);
      outlines.push(tri[1]);
      outlines.push(tri[1]);
      outlines.push(tri[2]);
      outlines.push(tri[2]);
      outlines.push(tri[0]);
    }
    typedArray = new Uint16Array(outlines);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, outlineBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, typedArray, gl.STATIC_DRAW);
    GIZA.check('Error when trying to create skeleton VBO');
  }

  var draw = function(currentTime) {

    if (!ready) {
      window.requestAnimationFrame(draw, GIZA.canvas);
      return;
    }

    gl.clear(gl.COLOR_BUFFER_BIT);

    var mv = new mat4();
    var proj = new mat4();
    proj.makeOrthographic(
      0, GIZA.canvas.width / GIZA.pixelScale,
      0, GIZA.canvas.height / GIZA.pixelScale,
      0, 1);

    gl.bindBuffer(gl.ARRAY_BUFFER, coordsBuffer);
    gl.enableVertexAttribArray(attribs.POSITION);
    gl.vertexAttribPointer(attribs.POSITION, 2, gl.FLOAT, false, 8, 0);

    // Draw the filled triangles
    var program = programs.contour;
    gl.useProgram(program);
    gl.uniformMatrix4fv(program.modelview, false, mv.elements);
    gl.uniformMatrix4fv(program.projection, false, proj.elements);
    gl.uniform4f(program.color, 0.25, 0.25, 0, 0.5);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer);
    gl.drawElements(gl.TRIANGLES, 3 * triangleCount, gl.UNSIGNED_SHORT, 0);

    // Draw the triangle borders to visualize the tessellation
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, outlineBuffer);
    gl.drawElements(gl.LINES, 6 * triangleCount, gl.UNSIGNED_SHORT, 0);

    // Draw the outer contour
    program = programs.contour;
    gl.useProgram(program);
    gl.uniformMatrix4fv(program.modelview, false, mv.elements);
    gl.uniformMatrix4fv(program.projection, false, proj.elements);
    gl.uniform4f(program.color, 0, 0.4, 0.8, 1);
    gl.drawArrays(gl.LINE_LOOP, 0, outerPointCount);

    // Draw the hole outline if it exists
    var innerPointCount = pointCount - outerPointCount;
    if (innerPointCount > 0) {
      gl.uniform4f(program.color, 0.8, 0.4, 0, 1);
      gl.drawArrays(gl.LINE_LOOP, outerPointCount, innerPointCount);
    }

    // Finally draw the dots
    program = programs.dot;
    gl.useProgram(program);
    gl.uniformMatrix4fv(program.modelview, false, mv.elements);
    gl.uniformMatrix4fv(program.projection, false, proj.elements);
    gl.uniform1f(program.pointSize, 6 * GIZA.pixelScale);
    gl.bindTexture(gl.TEXTURE_2D, spriteTexture);
    gl.uniform4f(program.color, 0, 0.25, 0.5, 1);
    gl.drawArrays(gl.POINTS, 0, pointCount);

    gl.disableVertexAttribArray(attribs.POSITION);

    GIZA.check('Error during draw cycle');
    window.requestAnimationFrame(draw, GIZA.canvas);
  }

  init();
  draw(0);

});
