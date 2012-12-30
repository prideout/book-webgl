var DEMO = DEMO || {}

// Prevents cascading errors by halting animation after a GL error.
DEMO.endFrame = function(drawFunc) {
  if (gl.getError() != gl.NO_ERROR) {
    console.error("GL error during draw cycle.");
  } else {
    window.requestAnimationFrame(drawFunc, GIZA.canvas);
  }
};

DEMO.loadTexture = function (filename, onLoaded) {
    var tex;
    tex = gl.createTexture();
    tex.image = new Image();
    tex.image.onload = function() {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex.image);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.bindTexture(gl.TEXTURE_2D, null);
      if (gl.getError() != gl.NO_ERROR) {
        console.error('GL error when loading texture');
      }
      return onLoaded(tex);
    };
    return tex.image.src = filename;
};

DEMO.compilePrograms = function(shaders) {
  var name, programs, shd;
  programs = {};
  for (name in shaders) {
    shd = shaders[name];
    programs[name] = DEMO.compileProgram(shd.vs, shd.fs, shd.attribs);
  }
  return programs;
};

DEMO.compileProgram = function(vNames, fNames, attribs) {
  var fShader, key, numUniforms, program, status, u, uniforms, vShader, value, _i, _len;
  vShader = DEMO.compileShader(vNames, gl.VERTEX_SHADER);
  fShader = DEMO.compileShader(fNames, gl.FRAGMENT_SHADER);
  program = gl.createProgram();
  gl.attachShader(program, vShader);
  gl.attachShader(program, fShader);
  for (key in attribs) {
    value = attribs[key];
    gl.bindAttribLocation(program, value, key);
  }
  gl.linkProgram(program);
  status = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!status) {
    console.error("Could not link " + vNames + " with " + fNames);
  }
  numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  uniforms = (function() {
    var _i, _results;
    _results = [];
    for (u = _i = 0; 0 <= numUniforms ? _i < numUniforms : _i > numUniforms; u = 0 <= numUniforms ? ++_i : --_i) {
      _results.push(gl.getActiveUniform(program, u).name);
    }
    return _results;
  })();
  for (_i = 0, _len = uniforms.length; _i < _len; _i++) {
    u = uniforms[_i];
    program[u] = gl.getUniformLocation(program, u);
  }
  return program;
};

DEMO.compileShader = function(names, type) {
  var handle, id, source, status;
  source = ((function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = names.length; _i < _len; _i++) {
      id = names[_i];
      var e = $('#' + id);
      if (!e.length) {
        e = $('iframe').contents().find('#' + id);
      }
      _results.push(e.text());
    }
    return _results;
  })()).join();
  handle = gl.createShader(type);
  gl.shaderSource(handle, source);
  gl.compileShader(handle);
  status = gl.getShaderParameter(handle, gl.COMPILE_STATUS);
  if (!status) {
    console.error(gl.getShaderInfoLog(handle));
  }
  return handle;
};

// If you wish the store your shaders in a separate HTML file,
// include this at the bottom of your main page body:
//
//     <iframe src="ResizeTest-Shaders.html" width="0" height="0" />
//
// The following function will extract the spec and attribs for you.
DEMO.initFrame = function() {

  // This sets 'attribs' and 'spec' in the local scope:
  eval($('iframe').contents().find('#shaders').text());

  DEMO.programs = DEMO.compilePrograms(spec);
  DEMO.attribs = attribs;
}
