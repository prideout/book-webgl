var GIZA = GIZA || {};

GIZA.Trackball = function(center, radius) {

  var M3 = GIZA.Matrix3;
  var V3 = GIZA.Vector3;
  
  // Allow clients to skip the "new"
  if (!(this instanceof GIZA.Trackball)) {
    return new GIZA.Trackball(center, radius);
  }

  this.startPosition = null;
  this.endPosition = null;
  this.currentPosition = null;

  this.startDrag = function(position) {
    console.info("prideout mouse drag started at ", position);
    this.startPosition = position;
  };

  // Ideally this isn't even used, since trackpads can occur a delay,
  // and since the mouse can be dragged off-window.
  this.endDrag = function(position) {
    console.info("prideout mouse drag ended at ", position);
    this.endPosition = position;
  };

  this.updateDrag = function(position) {
    //console.info("prideout mouse drag currently at ", position);
    this.currentPosition = position;
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
