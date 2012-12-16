
GIZA.compilePrograms = function(shaders) {
  var name, programs, shd;
  programs = {};
  for (name in shaders) {
    shd = shaders[name];
    programs[name] = compileProgram(shd.vs, shd.fs, shd.attribs);
  }
  return programs;
};

GIZA.compileProgram = function(vNames, fNames, attribs) {
  var fShader, key, numUniforms, program, status, u, uniforms, vShader, value, _i, _len;
  vShader = compileShader(vNames, gl.VERTEX_SHADER);
  fShader = compileShader(fNames, gl.FRAGMENT_SHADER);
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

