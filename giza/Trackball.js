var GIZA = GIZA || {};

GIZA.Trackball = function(center, radius) {

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
    var M3 = GIZA.Matrix3;
    return null; // M3.make(...);
  };

};
