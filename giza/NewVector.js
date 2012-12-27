// This file defines groups of free functions (eg, GIZA.Vector2).  It
// does NOT define new JavaScript objects.  Instead, it simply makes
// working with tuples easier.  The underlying data can be native
// JavaScript Arrays or TypedArrays.
//
// See MochaTest.js for usage examples.
//

var GIZA = GIZA || {};
if (exports) {
  exports.GIZA = GIZA;
}

GIZA.Vector2 = {

  make: function(x, y) {
    return [x, y];
  },

  equivalent: function(a, b, epsilon) {
    epsilon = epsilon || 1e-6;
    return GIZA.Vector2.distanceSquared(a, b) < epsilon;
  },

  copy: function(v) {
    return GIZA.Vector2.make(v[0], v[1]);
  },

  normalize: function(v) {
    var s = 1 / GIZA.length(v);
    return GIZA.Vector2.scale(v, s);
  },

  normalized: function(v) {
    var s = 1 / GIZA.length(v);
    return GIZA.Vector2.scaled(v, s);
  },

  translate: function(v, delta, ty) {
    if (ty) {
      v[0] += delta;
      v[1] += ty;
    } else {
      v[0] += delta[0];
      v[1] += delta[1];
    }
    return v;
  },

  translated: function(v, delta, ty) {
    var r = GIZA.Vector2.make();
    if (ty) {
      r[0] = v[0] + delta;
      r[1] = v[1] + ty;
    } else {
      r[0] = v[0] + delta[0];
      r[1] = v[1] + delta[1];
    }
    return r;
  },

  scale: function(v, s) {
    v[0] *= s;
    v[1] *= s;
    return v;
  },

  scaled: function(v, s) {
    return GIZA.Vector2.make(
      s * v[0],
      s * v[1]);
  },

  negate: function(v) {
    return GIZA.Vector2.scale(v, -1);
  },

  negated: function(v) {
    return GIZA.Vector2.scaled(v, -1);
  },

  length: function(v) {
    return Math.sqrt(GIZA.Vector2.dot(v, v));
  },

  lengthSquared: function(v) {
    return GIZA.Vector2.dot(v, v);
  },

  distance: function(a, b) {
    var d = GIZA.Vector2.subtract(a, b);
    return GIZA.Vector2.length(d);
  },

  distanceSquared: function(a, b) {
    var d = GIZA.Vector2.subtract(a, b);
    return GIZA.Vector2.lengthSquared(d);
  },

  subtract: function(a, b) {
    return GIZA.Vector2.make(
      a[0] - b[0],
      a[1] - b[1]);
  },

  add: function(a, b) {
    return GIZA.Vector2.make(
      a[0] + b[0],
      a[1] + b[1]);
  },

  dot: function(a, b) {
    return a[0]*b[0] + a[1]*b[1];
  },

};
