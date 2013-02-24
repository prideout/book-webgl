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

// Convenient mouse location
COMMON.mouse = {
  position = null,
  buttons = null
};

// Use HeadJS to load scripts asynchronously, but execute them
// synchronously.  After we have a build process in place, we'll
// replace the following source list with a single minified file.
head.js(
  "../giza/Giza.js",
  "../giza/Shaders.js",
  "../giza/BufferView.js",
  "../giza/Vector.js",
  "../giza/Matrix.js",
  "../giza/Color.js",
  "../giza/Topo.js",
  "../giza/Polygon.js",
  "../giza/Surface.js",
  "../giza/Turtle.js",
  "../giza/Path.js",
  "../giza/Turntable.js",
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

// If you wish the store your shaders in a separate HTML file,
// include this at the bottom of your main page body:
//
//   <iframe src="ResizeTest-Shaders.html" width="0" height="0" />
//
// This function will extract the spec and attribs for you.
COMMON.initFrame = function() {
  eval($('iframe').contents().find('#shaders').text());
  COMMON.programs = GIZA.compile(spec);
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
// instead, but that's not safe across browsers.  Also invert
// Y such that the origin is at the lower-left corner.
COMMON.getMouse = function(event, element) {
  var p = $(element).position();
  var x = event.pageX - p.left;
  var y = event.pageY - p.top;
  var s = GIZA.pixelScale;
  y = $(element).height() - y;
  COMMON.mouse.position = GIZA.Vector2.make(x * s, y * s);
  return COMMON.mouse.position;
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

COMMON.Turntable = function(config) {

  var V2 = GIZA.Vector2;
  var V3 = GIZA.Vector3;
  var gl = GIZA.context;
  if (!(this instanceof COMMON.Turntable)) {
    return new COMMON.Turntable(config);
  }

  var turntable = new GIZA.Turntable(config);

  this.getRotation = function() {
    return turntable.getRotation();
  };

  var isDown = false;
  var canvas = $(turntable.config.canvas);

  canvas.mousedown(function(e) {
    var pos = COMMON.getMouse(e, this);
    turntable.startDrag(pos);
    isDown = true;
  });

  canvas.mouseup(function(e) {
    var pos = COMMON.getMouse(e, this);
    turntable.endDrag(pos);
    isDown = false;
  });

  canvas.mousemove(function(e) {
    var pos = COMMON.getMouse(e, this);

    // Handle the case where the mouse was released off-canvas
    if (isDown && !e.which) {
      turntable.endDrag(pos);
      isDown = false;
      return;
    }
    if (isDown) {
      turntable.updateDrag(pos);
    }
  });

};

COMMON.initMultiple = function(canvasList) {

  var global = Function('return this')();

  // Use head.js to load scripts in parallel.
  for (var i = 0; i < canvasList.length; i++) {
    head.js(canvasList[i].scriptUrl);
  }

  // Execute the GIZA.init() method for each canvas
  // then execute its designated entry point function.
  head.ready(function() {
    for (var i = 0; i < canvasList.length; i++) {
      var canvasId = canvasList[i].canvasId;
      var entryFunction = canvasList[i].entryFunction;
      GIZA.init(document.getElementById(canvasId));
      global[entryFunction]();
    }
  });

};
