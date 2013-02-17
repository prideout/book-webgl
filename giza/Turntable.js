var GIZA = GIZA || {};

// Restricts rotation to Spin (Y axis) and Tilt (X axis)
GIZA.Turntable = function(config) {

  var M3 = GIZA.Matrix3;
  var V3 = GIZA.Vector3;
  var V2 = GIZA.Vector2;
  
  // Allow clients to skip the "new"
  if (!(this instanceof GIZA.Turntable)) {
    return new GIZA.Turntable(config);
  }

  var defaults = {
    startSpin: 0.001, // radians per second
    allowTilt: true,
    allowSpin: true,
    spinFriction: 1, // 0.5, // 0 means no friction (infinite spin) while 1 means no inertia
    epsilon: 3, // distance (in pixels) to wait before deciding if a drag is a Tilt or a Spin
    radiansPerPixel: V2.make(0.01, -0.01),
    canvas: GIZA.canvas,
    //bounceTilt: false, // if true, returns the tilt to the "home" angle after a mouse release
    //boundSpin: false, // if true, returns to the startSpin state after a mouse release
  };

  this.config = config = GIZA.merge(defaults, config || {});

  // diagram please!
  var state = {
    Resting: 0,
    SpinningStart: 1,
    SpinningInertia: 2,
    DraggingInit: 3,
    DraggingSpin: 4,
    DraggingTilt: 5,
    ReturningHome: 6,
  };

  this.startDrag = function(position) {};
  this.endDrag = function(position) {};
  this.updateDrag = function(position) {};
  this.getRotation = function() {};
  this.returnHome = function() {};

  var startPosition = V2.make(0, 0);
  var currentPosition = V2.make(0, 0);
  var currentSpin = 0;
  var currentTilt = 0;
  var currentState = config.startSpin ?
    state.SpinningStart : state.Resting;
  var previousTime = null;

  GIZA.drawHooks.push(function(time) {
    if (previousTime == null) {
      previousTime = time;
    }
    var deltaTime = time - previousTime;
    previousTime = time;

    if (currentState == state.SpinningStart) {
      currentSpin += config.startSpin * deltaTime; 
    }
  });

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

  this.getAngles = function() {
    var delta = V2.subtract(currentPosition, startPosition);
    var spin = currentSpin;
    var tilt = currentTilt;
    if (currentState == state.DraggingSpin) {
      var radians = config.radiansPerPixel[0] * delta[0];
      spin += radians;
    }
    if (currentState == state.DraggingTilt) {
      var radians = config.radiansPerPixel[1] * delta[1];
      tilt += radians;
    }
    return [spin, tilt];
  };

  this.getRotation = function() {
    var r = this.getAngles();
    var spin = M3.rotationY(r[0]);
    var tilt = M3.rotationX(r[1]);
    return M3.multiply(spin, tilt);
  };

  // When releasing the mouse, capture the current rotation and change
  // the state machine back to 'Resting' or 'SpinningInertia'.
  this.endDrag = function(position) {
    currentPosition = position.slice(0);
    var r = this.getAngles();
    currentSpin = r[0];
    currentTilt = r[1];
    currentState = (config.spinFriction == 1) ?
      state.Resting : state.SpinningInertia;
  };

};

GIZA.Turntable.INFINITE = 1000; // not sure if I'll use this
