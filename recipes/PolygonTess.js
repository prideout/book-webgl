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
  var coordsBuffer, outlineBuffer, indexBuffer;
  var pointCount;

  GIZA.loadTexture('media/PointSprite.png', function(i) {
      spriteTexture = i;
      ready = true;
  });

  var init = function() {

    coordsBuffer = gl.createBuffer();
    outlineBuffer = gl.createBuffer();
    indexBuffer = gl.createBuffer();

    var c = [{x:520,y:440},{x:315,y:100},{x:90,y:440}];
    var h = [{x:300,y:290},{x:330,y:290},{x:315,y:380}];
    vec2ify = function(o) { return new vec2(o.x, o.y); }

    contourPts = c.map(vec2ify);
    holePts = h.map(vec2ify);

    pointCount = contourPts.length + holePts.length;
    var coordsArray = GIZA.flatten(contourPts.concat(holePts));
    var typedArray = new Float32Array(coordsArray);
    gl.bindBuffer(gl.ARRAY_BUFFER, coordsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, typedArray, gl.STATIC_DRAW);
    GIZA.check('Error when trying to create points VBO');

    var triangles = POLYGON.tessellate(
      contourPts,
      [holePts]);

  }

  var draw = function(currentTime) {

    if (!ready) {
      window.requestAnimationFrame(draw, GIZA.canvas);
      return;
    }

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.disable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);

    var mv = new mat4();
    var proj = new mat4();
    proj.makeOrthographic(
      0, GIZA.canvas.width,
      0, GIZA.canvas.height,
      0, 1);

    gl.bindBuffer(gl.ARRAY_BUFFER, coordsBuffer);
    gl.enableVertexAttribArray(attribs.POSITION);
    gl.vertexAttribPointer(attribs.POSITION, 2, gl.FLOAT, false, 8, 0);

    var program = programs.dot;
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
