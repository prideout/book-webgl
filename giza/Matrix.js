// This file defines groups of free functions (eg, GIZA.Matrix3).  It
// does NOT define new JavaScript objects.  The underlying data must be
// a one-dimensional native JavaScript Array, or TypedArray.
//
// See MochaTest.js for usage examples.
//

var GIZA = GIZA || {};

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

  makeBasis: function(i, j, k) {
    return this.make(
      a[0], a[1],  a[2], 0,
      b[0], b[1],  b[2], 0,
      c[0], c[1],  c[2], 0,
      0,    0,     0,    1);
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

  set: function(dest, src) {
    for (var i = 0; i < 16; i++) {
      dest[i] = src[i];
    }
    return dest;
  },

  lookAt: function(eye, target, up) {
    var V3 = GIZA.Vector3;
	var z = V3.normalize(V3.subtract(eye, target));
	if (V3.length(z) === 0) {
	  z[2] = 1;
	}
    var x = V3.normalize(V3.cross(up, z));
	if (V3.length(x) === 0) {
	  z[0] += 0.0001;
      x = V3.normalize(cross(up, z));
	}
	var y = V3.cross(z, x);
	return this.transpose(this.make(
	  x[0], y[0], z[0], V3.dot(x, eye),
	  x[1], y[1], z[1], V3.dot(y, eye),
	  x[2], y[2], z[2], -V3.dot(z, eye),
      0, 0, 0, 1));
  },

  frustum: function(left, right, bottom, top, near, far) {
	var x = 2 * near / (right - left);
	var y = 2 * near / (top - bottom);
	var a = (right + left) / (right - left);
	var b = (top + bottom) / (top - bottom);
	var c = -(far + near) / (far - near);
	var d = - 2 * far * near / (far - near);
    return this.transpose(this.make(
	  x, 0, a, 0,
	  0, y, b, 0,
	  0, 0, c, d,
	  0, 0, -1, 0));
  },

  orthographic: function(left, right, top, bottom, near, far) {
	var w = right - left;
	var h = top - bottom;
	var p = far - near;
	var x = ( right + left ) / w;
	var y = ( top + bottom ) / h;
	var z = ( far + near ) / p;
    return this.transpose(this.make(
	  2 / w, 0,     0,      -x,
	  0,     2 / h, 0,      -y,
	  0,     0,     -2 / p, -z,
	  0,     0,     0,      1));
  },

  perspective: function(fov, aspect, near, far) {
	var ymax = near * Math.tan(fov * Math.PI / 360);
	var ymin = -ymax;
	var xmin = ymin * aspect;
	var xmax = ymax * aspect;
	return this.frustum(xmin, xmax, ymin, ymax, near, far);
  },
  
  translate: function(m, xOrArray, y, z) {
    var v = xOrArray;
    if (y) {
      v = [xOrArray, y, z];
    }
    m[12] = m[0]*v[0] + m[4]*v[1] + m[8]*v[2] + m[12];
	m[13] = m[1]*v[0] + m[5]*v[1] + m[9]*v[2] + m[13];
	m[14] = m[2]*v[0] + m[6]*v[1] + m[10]*v[2] + m[14];
	m[15] = m[3]*v[0] + m[7]*v[1] + m[11]*v[2] + m[15];
    return m;
  },

  // TODO Check if "v" is length 4 or length 16.
  //      Throw for anything else.
  //
  // Multiplies a matrix with a column vector:
  //
  // V' =  M * V
  //
  // The matrix is assumed to be a 1D array using COLUMN
  // MAJOR order, and a new column vector is returned.
  //
  // This function similar to the GLSL asterisk operator, when the
  // matrix data is transfered to the GPU using uniformMatrix4fv
  // with transpose = false.
  //
  multiply: function(m, v) {
    return GIZA.Vector4.make(
      m[0]*v[0] + m[4]*v[1] + m[8]*v[2]  + m[12]*v[3],
      m[1]*v[0] + m[5]*v[1] + m[9]*v[2]  + m[13]*v[3],
      m[2]*v[0] + m[6]*v[1] + m[10]*v[2] + m[14]*v[3],
      m[3]*v[0] + m[7]*v[1] + m[11]*v[2] + m[15]*v[3]);
  },

  rotateX: function(m, radians) {
	var m12 = m[4];
	var m22 = m[5];
	var m32 = m[6];
	var m42 = m[7];
	var m13 = m[8];
	var m23 = m[9];
	var m33 = m[10];
	var m43 = m[11];
	var c = Math.cos(radians);
	var s = Math.sin(radians);
	m[4] = c * m12 + s * m13;
	m[5] = c * m22 + s * m23;
	m[6] = c * m32 + s * m33;
	m[7] = c * m42 + s * m43;
	m[8] = c * m13 - s * m12;
	m[9] = c * m23 - s * m22;
	m[10] = c * m33 - s * m32;
	m[11] = c * m43 - s * m42;
	return m;
  },

  rotateY: function(m, radians) {
	var te = m;
	var m11 = te[0];
	var m21 = te[1];
	var m31 = te[2];
	var m41 = te[3];
	var m13 = te[8];
	var m23 = te[9];
	var m33 = te[10];
	var m43 = te[11];
	var c = Math.cos(radians);
	var s = Math.sin(radians);
	te[0] = c * m11 - s * m13;
	te[1] = c * m21 - s * m23;
	te[2] = c * m31 - s * m33;
	te[3] = c * m41 - s * m43;
	te[8] = c * m13 + s * m11;
	te[9] = c * m23 + s * m21;
	te[10] = c * m33 + s * m31;
	te[11] = c * m43 + s * m41;
    return te;
  },

  rotateZ: function(m, radians) {
	var m11 = m[0];
	var m21 = m[1];
	var m31 = m[2];
	var m41 = m[3];
	var m12 = m[4];
	var m22 = m[5];
	var m32 = m[6];
	var m42 = m[7];
	var c = Math.cos(radians);
	var s = Math.sin(radians);
	m[0] = c * m11 + s * m12;
	m[1] = c * m21 + s * m22;
	m[2] = c * m31 + s * m32;
	m[3] = c * m41 + s * m42;
	m[4] = c * m12 - s * m11;
	m[5] = c * m22 - s * m21;
	m[6] = c * m32 - s * m31;
	m[7] = c * m42 - s * m41;
    return m;
  },

  // TODO: impl & test.  also add rotatedAxis
  rotateAxis: function (m, axis, radians) {
	var x = axis.x, y = axis.y, z = axis.z;
	var n = Math.sqrt(x * x + y * y + z * z);
	x /= n;
	y /= n;
	z /= n;
	var xx = x * x, yy = y * y, zz = z * z;
	var c = Math.cos(radians);
	var s = Math.sin(radians);
	var oneMinusCosine = 1 - c;
	var xy = x * y * oneMinusCosine;
	var xz = x * z * oneMinusCosine;
	var yz = y * z * oneMinusCosine;
	var xs = x * s;
	var ys = y * s;
	var zs = z * s;
	var r11 = xx + (1 - xx) * c;
	var r21 = xy + zs;
	var r31 = xz - ys;
	var r12 = xy - zs;
	var r22 = yy + (1 - yy) * c;
	var r32 = yz + xs;
	var r13 = xz + ys;
	var r23 = yz - xs;
	var r33 = zz + (1 - zz) * c;
	var m11 = m[0], m21 = m[1], m31 = m[2], m41 = m[3];
	var m12 = m[4], m22 = m[5], m32 = m[6], m42 = m[7];
	var m13 = m[8], m23 = m[9], m33 = m[10], m43 = m[11];
	var m14 = m[12], m24 = m[13], m34 = m[14], m44 = m[15];
	m[0] = r11 * m11 + r21 * m12 + r31 * m13;
	m[1] = r11 * m21 + r21 * m22 + r31 * m23;
	m[2] = r11 * m31 + r21 * m32 + r31 * m33;
	m[3] = r11 * m41 + r21 * m42 + r31 * m43;
	m[4] = r12 * m11 + r22 * m12 + r32 * m13;
	m[5] = r12 * m21 + r22 * m22 + r32 * m23;
	m[6] = r12 * m31 + r22 * m32 + r32 * m33;
	m[7] = r12 * m41 + r22 * m42 + r32 * m43;
	m[8] = r13 * m11 + r23 * m12 + r33 * m13;
	m[9] = r13 * m21 + r23 * m22 + r33 * m23;
	m[10] = r13 * m31 + r23 * m32 + r33 * m33;
	m[11] = r13 * m41 + r23 * m42 + r33 * m43;
	return this;
  },

  // TODO impl & test
  scale: function(m, sOrxOrArray, y, z) {
	var x = v.x, y = v.y, z = v.z;
	m[0] *= x; m[4] *= y; m[8] *= z;
	m[1] *= x; m[5] *= y; m[9] *= z;
	m[2] *= x; m[6] *= y; m[10] *= z;
	m[3] *= x; m[7] *= y; m[11] *= z;
	return m;
  },

  translated: function(m, xOrArray, y, z) {
    var retval = this.copy(m);
    return this.translate(retval, xOrArray, y, z);
  },
  
  scaled: function(m, sOrxOrArray, y, z) {
    var retval = this.copy(m);
    return this.scale(retval, sOrxOrArray, y, z);
  },
  
  transpose: function(m) {
    var n = this.transposed(m);
    this.set(m, n);
    return m;
  },

  transposed: function(m) {
    return this.make(
      m[0], m[4], m[8], m[12],
      m[1], m[5], m[9], m[13],
      m[2], m[6], m[10], m[14],
      m[3], m[7], m[11], m[15]);
  },

  rotatedX: function(m, theta) {
    var retval = this.copy(m);
    return this.rotateX(retval, theta);
  },

  rotatedY: function(m, theta) {
    var retval = this.copy(m);
    return this.rotateY(retval, theta);
  },

  rotatedZ: function(m, theta) {
    var retval = this.copy(m);
    return this.rotateZ(retval, theta);
  },

  stringify: function(m) {
    return m[0] + " " + m[1] + " " + m[2] + " " + m[3] + "\n" +
      m[4] + " " + m[5] + " " + m[6] + " " + m[7] + "\n" +
      m[8] + " " + m[9] + " " + m[10] + " " + m[11] + "\n" +
      m[12] + " " + m[13] + " " + m[14] + " " + m[15] + "\n";
  }
};
