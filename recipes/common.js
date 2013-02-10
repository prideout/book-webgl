// Create a COMMON namespace for a small handful of helper functions
// and constants.
var COMMON = {}

// Path to a content delivery network for jQuery etc.
COMMON.cdn = "http://ajax.googleapis.com/ajax/libs/";

// Actually, don't use a CDN just yet while we're developing.
COMMON.cdn = "lib/";

// Strip off the .html extension from the URL.
COMMON.basepath = window.location.toString().slice(0, -5)

// Extract the name of the recipe from the basepath.
COMMON.recipe = COMMON.basepath.split('/').pop();

// Use HeadJS to load scripts asynchronously, but execute them
// synchronously.  After we have a build process in place, we'll
// replace the following source list with a single minified file.
head.js(
  "../giza/Giza.js",
  "../giza/Vector.js",
  "../giza/Matrix.js",
  "../giza/Polygon.js",
  "../giza/Surface.js",
  "../giza/Turtle.js",
  "../giza/Path.js",
  "../giza/Trackball.js",
  "lib/stats.min.js",
  COMMON.cdn + "jquery/1.8.0/jquery.min.js",
  COMMON.cdn + "jqueryui/1.9.2/jquery-ui.min.js",
  COMMON.basepath + ".js");

// After all scripts have been loaded AND after the document is
// "Ready", do this:
head.ready(function() {

  // Execute the recipe's main() function
  main();

  // Download highlightjs and provide buttons for it
  var hljsurl = "http://yandex.st/highlightjs/7.3/highlight.min.js";
  head.js(hljsurl, function() {

    // Add some links into the button-bar element
    var slash = document.URL.lastIndexOf("/");
    var recipe = document.URL.slice(slash+1, -4);
    var index = "index.html";
    $('#button-bar').html([
      "<a href='" + index + "'>",
      "    go to recipe list",
      "</a>",
      "<button id='view-html'>",
      "    view HTML source",
      "</button>",
      "<button id='view-js'>",
      "    view JavaScript source",
      "</button>",
    ].join('\n'));

    // Define a generic click handler for the "view source" buttons.
    var clickHandler = function(id, lang) {
      return function(src) {
        var inner = hljs.highlight(lang, src).value;
        $('body').html("<pre>" + inner + "</pre>");
        window.location = '#' + id;
        $(window).bind('hashchange', function(e) {
          if (window.location.hash == "") {
            $(window).unbind('hashchange');
            window.location.reload();
          }
        });
      };
    };

    // Assign the click handlers.
    var base = document.URL.slice(0, -4);
    $('#view-js').button().click(function() {
      $.get(base + 'js', clickHandler(this.id, 'javascript'));
    });
    $('#view-html').button().click(function() {
      $.get(base + 'html', clickHandler(this.id, 'xml'));
    });

    // Tell jQueryUI to style the links as buttons
    $("a").button()

  });

});

// Requests the next animation frame.  Also prevents cascading errors
// by halting animation after a GL error.
COMMON.endFrame = function(drawFunc) {
  var gl = GIZA.context;
  err = gl.getError();
  if (err != gl.NO_ERROR) {
    console.error("WebGL error during draw cycle: ", err);
  } else {
    var wrappedDrawFunc = function(time) {

      COMMON.now = time;

      // Clear out the GL error state at the beginning of the next frame.
      // This is a workaround for a Safari bug.
      gl.getError();
      drawFunc(time);
    };
    window.requestAnimationFrame(wrappedDrawFunc, GIZA.canvas);
  }
};

// Simple texture loader for point sprite textures etc.
COMMON.loadTexture = function (filename, onLoaded) {

  var gl = GIZA.context;
  var tex = gl.createTexture();
  tex.image = new Image();
  tex.image.onload = function() {

    // clear out the GL error state to appease Safari
    gl.getError();

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

// Use the supplied JSON metadata to fetch GLSL, compile it, bind
// attributes, and finally link it into a program object.
COMMON.compilePrograms = function(shaders) {
  var name, programs, shd;
  programs = {};
  for (name in shaders) {
    shd = shaders[name];
    programs[name] = COMMON.compileProgram(shd.vs, shd.fs, shd.attribs);
  }
  return programs;
};

COMMON.compileProgram = function(vNames, fNames, attribs) {
  var fShader, key, numUniforms, program, status, u, uniforms, vShader, value, _i, _len;
  var gl = GIZA.context;
  vShader = COMMON.compileShader(vNames, gl.VERTEX_SHADER);
  fShader = COMMON.compileShader(fNames, gl.FRAGMENT_SHADER);
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

COMMON.compileShader = function(names, type) {
  var gl = GIZA.context;
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
//   <iframe src="ResizeTest-Shaders.html" width="0" height="0" />
//
// This function will extract the spec and attribs for you.
COMMON.initFrame = function() {
  eval($('iframe').contents().find('#shaders').text());
  COMMON.programs = COMMON.compilePrograms(spec);
  COMMON.attribs = attribs;
};

// If you have a div with radio buttons inside, this function will
// synchronize a given dictionary of attributes to the radio button
// states.  For example:
//
//  var options = {};
//  COMMON.syncOptions(options, '#checks');
//
COMMON.bindOptions = function(options, divid) {
  var updateOptions = function() {
    $(divid + " > input").each(function() {
      var id = $(this).attr('id');
      var checked = $(this).attr('checked') ? true : false;
      options[id] = checked;
    });
  };
  updateOptions();
  $(divid).buttonset().change(updateOptions);
};

// Returns a relative mouse position inside the given element,
// which is usually a canvas.  It's tempting to use offsetX
// instead, but that's not safe across browsers.
COMMON.getMouse = function(event, element) {
  var p = $(element).position();
  var x = event.pageX - p.left;
  var y = event.pageY - p.top;
  var s = GIZA.pixelScale;
  return GIZA.Vector2.make(x * s, y * s);
};

// Create an event handler that listens for a chosen screenshot key,
// which is 's' if unspecified.  When pressed, a new tab opens with
// the PNG image.
COMMON.enableScreenshot = function(drawFunc, triggerKey) {
  triggerKey = triggerKey || 83;
  $(document).keydown(function(e) {
    if (e.keyCode == triggerKey) {
      drawFunc(COMMON.now);
      var imgUrl = GIZA.canvas.toDataURL("image/png");
      window.open(imgUrl, '_blank');
      window.focus();
    }
  });

};

// 'canvas' is the canvas element you wish to tumble on;
// 'extent' is a percentage in [0,1] that defines the radius.
COMMON.Trackball = function(canvas, extent) {
  var V2 = GIZA.Vector2;
  var V3 = GIZA.Vector3;
  var gl = GIZA.context;
  if (!(this instanceof COMMON.Trackball)) {
    return new COMMON.Trackball(canvas);
  }
  canvas = canvas || $('canvas');
  extent = extent || 0.8;

  var w = GIZA.canvas.width, h = GIZA.canvas.height;
  var center = V2.make(w / 2, h / 2);
  var radius = (radius || 0.8) * Math.min(w, h / 2);
  var trackball = new GIZA.Trackball(center, radius);
  this.getSpin = trackball.getSpin;

  var isDown = false;

  canvas.mousedown(function(e) {
    var pos = COMMON.getMouse(e, this);
    trackball.startDrag(pos);
    isDown = true;
  });

  canvas.mouseup(function(e) {
    var pos = COMMON.getMouse(e, this);
    trackball.endDrag(pos);
    isDown = false;
  });

  canvas.mousemove(function(e) {
    var pos = COMMON.getMouse(e, this);
    trackball.updateDrag(pos);
  });

  var center = V3.make(center[0], center[1], 0);
  var normal = V3.make(0, 0, 1);
  var path = new GIZA.Path.Circle(center, radius, normal);
  var numPoints = 128;

  var typedArray = path.tessellate(numPoints);
  var circleBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, circleBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, typedArray, gl.STATIC_DRAW);

  this.drawCircle = function(attrib) {
    if (isDown) {
      gl.bindBuffer(gl.ARRAY_BUFFER, circleBuffer);
      gl.vertexAttribPointer(attrib || 0, 3, gl.FLOAT, false, 12, 0);
      gl.drawArrays(gl.LINE_LOOP, 0, numPoints);
    }
  };

};
