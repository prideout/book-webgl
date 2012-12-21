
GIZA.check = function(msg) {
  if (gl.getError() !== gl.NO_ERROR) {
    console.error(msg);
  }
};

GIZA.loadTexture = function (filename, onLoaded) {
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
      GIZA.check('Error when loading texture');
      return onLoaded(tex);
    };
    return tex.image.src = filename;
};

GIZA.compilePrograms = function(shaders) {
  var name, programs, shd;
  programs = {};
  for (name in shaders) {
    shd = shaders[name];
    programs[name] = GIZA.compileProgram(shd.vs, shd.fs, shd.attribs);
  }
  return programs;
};

GIZA.compileProgram = function(vNames, fNames, attribs) {
  var fShader, key, numUniforms, program, status, u, uniforms, vShader, value, _i, _len;
  vShader = GIZA.compileShader(vNames, gl.VERTEX_SHADER);
  fShader = GIZA.compileShader(fNames, gl.FRAGMENT_SHADER);
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

GIZA.compileShader = function(names, type) {
  var handle, id, source, status;
  source = ((function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = names.length; _i < _len; _i++) {
      id = names[_i];
      _results.push($('#' + id).text());
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

