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

  lerp: function(a, b, t) {
    a = GIZA.Vector2.scaled(a, 1-t);
    b = GIZA.Vector2.scaled(b, t);
    return GIZA.Vector2.add(a, b);
  },

};

GIZA.Vector3 = {

  make: function(x, y, z) {
    return [x, y, z];
  },

  equivalent: function(a, b, epsilon) {
    epsilon = epsilon || 1e-6;
    return GIZA.Vector3.distanceSquared(a, b) < epsilon;
  },

  copy: function(v) {
    return GIZA.Vector3.make(v[0], v[1], v[2]);
  },

  normalize: function(v) {
    var s = 1 / GIZA.length(v);
    return GIZA.Vector3.scale(v, s);
  },

  normalized: function(v) {
    var s = 1 / GIZA.length(v);
    return GIZA.Vector3.scaled(v, s);
  },

  translate: function(v, delta, ty, tz) {
    if (ty) {
      v[0] += delta;
      v[1] += ty;
      v[2] += tz;
    } else {
      v[0] += delta[0];
      v[1] += delta[1];
      v[2] += delta[2];
    }
    return v;
  },

  translated: function(v, delta, ty, tz) {
    var r = GIZA.Vector3.make();
    if (ty) {
      r[0] = v[0] + delta;
      r[1] = v[1] + ty;
      r[2] = v[2] + tz;
    } else {
      r[0] = v[0] + delta[0];
      r[1] = v[1] + delta[1];
      r[2] = v[2] + delta[2];
    }
    return r;
  },

  scale: function(v, s) {
    v[0] *= s;
    v[1] *= s;
    v[2] *= s;
    return v;
  },

  scaled: function(v, s) {
    return GIZA.Vector3.make(
      s * v[0],
      s * v[1],
      s * v[2]);
  },

  negate: function(v) {
    return GIZA.Vector3.scale(v, -1);
  },

  negated: function(v) {
    return GIZA.Vector3.scaled(v, -1);
  },

  length: function(v) {
    return Math.sqrt(GIZA.Vector3.dot(v, v));
  },

  lengthSquared: function(v) {
    return GIZA.Vector3.dot(v, v);
  },

  distance: function(a, b) {
    var d = GIZA.Vector3.subtract(a, b);
    return GIZA.Vector3.length(d);
  },

  distanceSquared: function(a, b) {
    var d = GIZA.Vector3.subtract(a, b);
    return GIZA.Vector3.lengthSquared(d);
  },

  subtract: function(a, b) {
    return GIZA.Vector3.make(
      a[0] - b[0],
      a[1] - b[1],
      a[2] - b[2]);
  },

  add: function(a, b) {
    return GIZA.Vector3.make(
      a[0] + b[0],
      a[1] + b[1],
      a[2] + b[2]);
  },

  dot: function(a, b) {
    return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
  },

  lerp: function(a, b, t) {
    a = GIZA.Vector3.scaled(a, 1-t);
    b = GIZA.Vector3.scaled(b, t);
    return GIZA.Vector3.add(a, b);
  },

};

GIZA.Vector4 = {

  make: function(x, y, z, w) {
    return [x, y, z, w];
  },

  equivalent: function(a, b, epsilon) {
    epsilon = epsilon || 1e-6;
    return GIZA.Vector4.distanceSquared(a, b) < epsilon;
  },

  copy: function(v) {
    return GIZA.Vector4.make(v[0], v[1], v[2], v[3]);
  },

  normalize: function(v) {
    var s = 1 / GIZA.length(v);
    return GIZA.Vector4.scale(v, s);
  },

  normalized: function(v) {
    var s = 1 / GIZA.length(v);
    return GIZA.Vector4.scaled(v, s);
  },

  translate: function(v, delta, ty, tz, tw) {
    if (ty) {
      v[0] += delta;
      v[1] += ty;
      v[2] += tz;
      v[3] += tw;
    } else {
      v[0] += delta[0];
      v[1] += delta[1];
      v[2] += delta[2];
      v[3] += delta[3];
    }
    return v;
  },

  translated: function(v, delta, ty, tz, tw) {
    var r = GIZA.Vector4.make();
    if (ty) {
      r[0] = v[0] + delta;
      r[1] = v[1] + ty;
      r[2] = v[2] + tz;
      r[3] = v[3] + tw;
    } else {
      r[0] = v[0] + delta[0];
      r[1] = v[1] + delta[1];
      r[2] = v[2] + delta[2];
      r[3] = v[3] + delta[3];
    }
    return r;
  },

  scale: function(v, s) {
    v[0] *= s;
    v[1] *= s;
    v[2] *= s;
    v[3] *= s;
    return v;
  },

  scaled: function(v, s) {
    return GIZA.Vector4.make(
      s * v[0],
      s * v[1],
      s * v[2],
      s * v[3]);
  },

  negate: function(v) {
    return GIZA.Vector4.scale(v, -1);
  },

  negated: function(v) {
    return GIZA.Vector4.scaled(v, -1);
  },

  length: function(v) {
    return Math.sqrt(GIZA.Vector4.dot(v, v));
  },

  lengthSquared: function(v) {
    return GIZA.Vector4.dot(v, v);
  },

  distance: function(a, b) {
    var d = GIZA.Vector4.subtract(a, b);
    return GIZA.Vector4.length(d);
  },

  distanceSquared: function(a, b) {
    var d = GIZA.Vector4.subtract(a, b);
    return GIZA.Vector4.lengthSquared(d);
  },

  subtract: function(a, b) {
    return GIZA.Vector4.make(
      a[0] - b[0],
      a[1] - b[1],
      a[2] - b[2],
      a[3] - b[3]);
  },

  add: function(a, b) {
    return GIZA.Vector4.make(
      a[0] + b[0],
      a[1] + b[1],
      a[2] + b[2],
      a[3] + b[3]);
  },

  dot: function(a, b) {
    return a[0]*b[0] + a[1]*b[1] + a[2]*b[2] + a[3]*b[3];
  },

  lerp: function(a, b, t) {
    a = GIZA.Vector4.scaled(a, 1-t);
    b = GIZA.Vector4.scaled(b, t);
    return GIZA.Vector4.add(a, b);
  },

};
