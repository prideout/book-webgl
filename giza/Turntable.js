var GIZA = GIZA || {};

// Restricts rotation to Spin (Y axis) and Tilt (X axis)
GIZA.Turntable = function(config) {

  var M3 = GIZA.Matrix3;
  var V3 = GIZA.Vector3;
  var V2 = GIZA.Vector2;
  
  // Allow clients to skip the "new"
  if (!(this instanceof GIZA.Trackball)) {
    return new GIZA.Trackball(center, radius);
  }

  var defaults = {
    startSpin = 0.5, // radians per second
    allowTilt = true,
    allowSpin = true,
    spinFriction = 1, // 0.5, // 0 means no friction (infinite spin) while 1 means no inertia
    epsilon = 3, // distance (in pixels) to wait before deciding if a drag is a Tilt or a Spin
    radiansPerPixel = 0.01,
    canvas = GIZA.canvas,
    //bounceTilt = false, // if true, returns the tilt to the "home" angle after a mouse release
    //boundSpin = false, // if true, returns to the startSpin state after a mouse release
  };

  config = GIZA.merge(defaults, config || {});

  // diagram please!
  var state = {
    Resting = 0,
    SpinningStart = 1,
    SpinningInertia = 2,
    DraggingInit = 3,
    DraggingSpin = 4,
    DraggingTilt = 5,
    ReturningHome = 6,
  };

  this.startDrag = function(position) {};
  this.endDrag = function(position) {};
  this.updateDrag = function(position) {};
  this.getRotation = function() {};
  this.returnHome = function() {};

  var startPosition;
  var currentPosition;
  var currentRotation = M3.identity();
  var currentState = config.startSpin ?
    state.SpinningStart : state.Resting;

  this.startDrag = function(position) {
    startPosition = position.slice(0);
    currentState = state.DraggingInit;
  };

  this.updateDrag = function(position) {
    var delta = V2.subtract(position, startPosition);

    // If we haven't decided yet, decide if we're spinning or tilting.
    if (currentState == state.DraggingInit) {
      if (Math.abs(delta[0]) > config.epsilon && config.allowSpin) {
        currentState = state.DraggingSpin;
      } else if (Math.abs(delta[1]) > config.epsilon && config.allowTilt) {
        currentState = state.DraggingTilt;
      } else {
        return;
      }
    }

    currentPosition = position.slice(0);
  };

  this.getRotation = function() {
    if (currentState == state.DraggingSpin) {
      var radians = config.radiansPerPixel * delta[0];
      return M3.rotateY(currentRotation, radians);
    }
    if (currentState == state.DraggingTilt) {
      var radians = config.radiansPerPixel * delta[1];
      return M3.rotateX(currentRotation, radians);
    }
    return currentRotation;
  };

  // When releasing the mouse, capture the current rotation and change
  // the state machine back to 'Resting' or 'SpinningInertia'.
  this.endDrag = function(position) {
    currentPosition = position.slice(0);
    currentRotation = this.getRotation();
    currentState = (config.spinFriction == 1) ?
      state.Resting : state.SpinningInertia;
  };

};

GIZA.Turntable.INFINITE = 1000; // not sure if I'll use this
