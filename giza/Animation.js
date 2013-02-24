var GIZA = GIZA || {};

GIZA.drawHooks = []

// Requests the next animation frame and prevents cascading errors
// by halting animation after a WebGL error.
GIZA.endFrame = function(drawFunc) {
  var gl = GIZA.context;
  var gizaContext = GIZA.currentGizaContext;
  err = gl.getError();
  if (err != gl.NO_ERROR) {
    console.error("WebGL error during draw cycle: ", err);
  } else {
    var wrappedDrawFunc = function(time) {

      // In case there are multiple canvases, select the "current"
      // GIZA context before calling the draw function.
      GIZA.setGizaContext(gizaContext);

      // Clear out the GL error state at the beginning of the next frame.
      // This is a workaround for a Safari bug.
      gl.getError();

      // Before drawing the main frame, execute all draw hooks.
      for (var i = 0; i < GIZA.drawHooks.length; i++) {
        GIZA.drawHooks[i](time);
      }

      // Finally, draw the main frame.
      gl.viewport(0, 0, GIZA.canvas.width, GIZA.canvas.height);
      drawFunc(time);
    };
    window.requestAnimationFrame(wrappedDrawFunc, GIZA.canvas);
  }
};

// Kicks off an infinite series of animation frames,
// honoring 'pause' and 'resume'.
GIZA.animate = function(drawFunction) {
  GIZA.paused = false;
  GIZA.animation = drawFunction;
  var renderFrame = function(time) {
    if (!GIZA.paused) {
      GIZA.animation(time);
      GIZA.endFrame(renderFrame);
    }
  };
  renderFrame(GIZA.getTime());
};

GIZA.pause = function() {
  GIZA.paused = true;
};

GIZA.resume = function() {
  if (GIZA.paused) {
    GIZA.paused = false;
    GIZA.animate(GIZA.animation);
  }
};
