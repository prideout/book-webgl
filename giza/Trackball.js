var GIZA = GIZA || {};

GIZA.Trackball = function(center, radius) {

  var M3 = GIZA.Matrix3;
  var V3 = GIZA.Vector3;
  var V2 = GIZA.Vector2;
  
  // Allow clients to skip the "new"
  if (!(this instanceof GIZA.Trackball)) {
    return new GIZA.Trackball(center, radius);
  }

  center.push(0);

  // TODO this can be private state too, right?
  this.startPosition = null;
  this.endPosition = null;
  this.currentPosition = null;

  // Private state
  var inCircle = false;
  var isDragging = false;
  var currentSpin = M3.identity();

  // Private function that projects a 2D screen-space point down to a
  // 3D sphere and returns the new position.
  var project = function(p2d) {
    var center2d = center.slice(0, 2);
    var distanceSquared = V2.distanceSquared(center2d, p2d);

    // First snap the point to the circle that is an epsilon smaller
    // than the sphere's silhouette.
    var r = radius * 0.9;
    if (distanceSquared > r * r) {
      inCircle = false;
      p2d = V2.add(center2d, V2.scaled(
        V2.direction(center2d, p2d),
        r));
    } else {
      inCircle = true;
    }

    // Next compute (z^2 = r^2 - x^2 - y^2)
    var distanceSquared = V2.distanceSquared(center2d, p2d)
    var z = Math.sqrt(radius * radius - distanceSquared);
    return p2d.concat(z);
  };

  this.startDrag = function(position) {
    var start = project(position);
    if (!inCircle) {
      return;
    }
    isDragging = true;
    this.startPosition = start;
    this.currentPosition = this.startPosition;
  };

  // Ideally this isn't even used, since trackpads can occur a delay,
  // and since the mouse can be dragged off-window.
  this.endDrag = function(position) {
    this.currentPosition = project(position);
    currentSpin = this.getSpin();
    isDragging = false;
  };

  this.updateDrag = function(position) {
    this.currentPosition = project(position);
  };

  this.getSpin = function() {
    if (!isDragging) {
      return currentSpin;
    }
    var a = V3.direction(this.currentPosition, center);
    var b = V3.direction(this.startPosition, center);
    var axis = V3.cross(a, b);
    var radians = Math.acos(V3.dot(a, b));
    var activeSpin = M3.rotateAxis(M3.identity(), axis, radians);
    return M3.multiply(currentSpin, activeSpin);
  };

};
