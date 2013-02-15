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
    startSpin = 0.5,    // radians per second
    allowTilt = true,
    allowSpin = true,
    spinFriction = 0.5, // 0 means no friction (infinite spin) while 1 means no inertia
    epsilon = 3, // distance (in pixels) to wait before deciding if a drag is a Tilt or a Spin
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

};

GIZA.Turntable.INFINITE = 1000; // not sure if I'll use this
