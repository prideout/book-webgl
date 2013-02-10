var GIZA = GIZA || {};

GIZA.Trackball = function(center, radius) {

  var M3 = GIZA.Matrix3;
  var V3 = GIZA.Vector3;
  var V2 = GIZA.Vector2;
  
  // Allow clients to skip the "new"
  if (!(this instanceof GIZA.Trackball)) {
    return new GIZA.Trackball(center, radius);
  }

  this.startPosition = null;
  this.endPosition = null;
  this.currentPosition = null;

  var inCircle = false;

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
        V2.normalized(V2.subtract(p2d, center2d)),
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
    this.startPosition = start;
    console.info("prideout mouse drag started at ", position, start);
  };

  // Ideally this isn't even used, since trackpads can occur a delay,
  // and since the mouse can be dragged off-window.
  this.endDrag = function(position) {
    this.endPosition = project(position);
    console.info("prideout mouse drag ended at ", position, this.endPosition);
  };

  this.updateDrag = function(position) {
    //console.info("prideout mouse drag currently at ", position);
    this.currentPosition = project(position);
  };

  this.getSpin = function() {

    var start = V3.make(0,0,1);
    var end = V3.make(1,0,0);
    var center = V3.make(0,0,0);

    var a = V3.subtract(start, center);
    var b = V3.subtract(end, center);
    var axis = V3.normalized(V3.cross(a, b));
    var radians = Math.acos(V3.dot(a, b));

    var retval = M3.rotateAxis(M3.identity(), axis, radians);

    return retval;
  };

};
