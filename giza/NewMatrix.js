// This file defines groups of free functions (eg, GIZA.Matrix3).  It
// does NOT define new JavaScript objects.  The underlying data must be
// a one-dimensional native JavaScript Array, or TypedArray.
//
// See MochaTest.js for usage examples.
//

var GIZA = require("./NewVector.js").GIZA;
if (exports) {
  exports.GIZA = GIZA;
}

GIZA.Matrix4 = {

  make: function() {
    if (arguments.length == 0) {
      return self.identity();
    } else if (arguments.length == 4) {
      var m = arguments;
        return this.make(
          m[0][0], m[0][1],  m[0][2],  m[0][3],
          m[1][0], m[1][1],  m[1][2],  m[1][3],
          m[2][0], m[2][1],  m[2][2],  m[2][3],
          m[3][0], m[3][1],  m[3][2],  m[3][3]);
    } else if (arguments.length == 16) {
      return Array.prototype.slice.call(arguments);
    } else if (arguments.length == 1) {
      var m = arguments[0];
      if (m.length == 16) {
        return m.slice(0);
      } else if (m.length == 4) {
        return this.make(
          m[0][0], m[0][1], m[0][2], m[0][3],
          m[1][0], m[1][1], m[1][2], m[1][3],
          m[2][0], m[2][1], m[2][2], m[2][3],
          m[3][0], m[3][1], m[3][2], m[3][3]);
      }
    } else {
      console.error("GIZA.Matrix4 has wrong number of arguments");
    }
  },

  copy: function(m) {
    return this.make(m);
  },

  identity: function() {
    return this.make(
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1);
  },

  equivalent: function(a, b, epsilon) {
    epsilon = epsilon || 1e-6;
    for (var i = 0; i < 16; i++) {
      if (Math.abs(a[i] - b[i]) > epsilon) {
        return false;
      }
    }
    return true;
  },

  lookAt: function(eye, target, up) {},
  perspective: function(fov, aspect, near, far) {},
  
  translate: function(m, xOrArray, y, z) {},
  translated: function(m, xOrArray, y, z) {},
  
  scale: function(sOrxOrArray, y, z) {},
  scaled: function(m, sOrxOrArray, y, z) {},
  
  transpose: function(m) {},
  transposed: function(m) {},

  rotateX: function(m, theta) {},
  rotatedX: function(m, theta) {},

  rotateY: function(m, theta) {},
  rotatedY: function(m, theta) {},

  rotateZ: function(m, theta) {},
  rotatedZ: function(m, theta) {},
};
