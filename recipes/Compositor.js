var main = function() {

  var options = {};
  COMMON.bindOptions(options, '#checks');

  var pma = false; // default is TRUE
  $(".tagline").text("premultipliedAlpha = " + pma);

  GIZA.init(null, {
    preserveDrawingBuffer: false,
    antialias: true,
    alpha: true, // default
    premultipliedAlpha: pma,
  });

  var gl = GIZA.context;
  var M4 = GIZA.Matrix4;
  var V3 = GIZA.Vector3;

  var attribs = {
    POSITION: 0,
    NORMAL: 1,
  };

  var init = function() {
    gl.clearColor(1, 1, 1, 0.5);
  }

  var draw = function(currentTime) {
    gl.clear(gl.COLOR_BUFFER_BIT);
    COMMON.endFrame(draw);
  }

  init();
  draw(0);

  $(document).keydown(function(e) {
    if (e.keyCode == 83) {
      draw(COMMON.now);
      var imgUrl = GIZA.canvas.toDataURL("image/png");
      window.open(imgUrl, '_blank');
      window.focus();
    }
  });

};
