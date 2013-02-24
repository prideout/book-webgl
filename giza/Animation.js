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

      time += GIZA.timeOffset;

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
  GIZA.pauseTime = GIZA.getTime();
};

GIZA.resume = function() {
  if (GIZA.paused) {
    var resumeTime = GIZA.getTime();
    var deltaTime = resumeTime - GIZA.pauseTime;
    GIZA.timeOffset -= deltaTime;
    GIZA.paused = false;
    GIZA.animate(GIZA.animation);
  }
};

// Return a high-precision time that's consistent with what the
// browser passes to the requestAnimationFrame function, and that
// honors an offset created by the pause and resume.
GIZA.getTime = function() {

  var now;

  // Firefox
  if ('mozAnimationStartTime' in window) {
    now = window.mozAnimationStartTime;
  }
      
  // Chrome
  else if (window.performance && 'now' in window.performance) {
    now = window.performance.now();
  }
  
  // Safari
  else {
    now = Date.now();
  }

  return now + GIZA.timeOffset;
};
