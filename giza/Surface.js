GIZA.equations = {};

GIZA.equations.sphere = function(radius) {
  return function(u, v) {
    u = Math.PI * u;
    v = 2.0 * Math.PI * v;
    return GIZA.Vector3.make(
      radius * Math.sin(u) * Math.cos(v),
      radius * Math.cos(u),
      radius * -Math.sin(u) * Math.sin(v)
    );
  };
};

GIZA.equations.plane = function(width) {
  return function(u, v) {
    return GIZA.Vector3.make(
        -width/2 + width * u,
        -width/2 + width * v,
      0
    );
  };
};

GIZA.equations.sinc = function(interval, width, height) {
  var plane = GIZA.equations.plane(width);
  return function(u, v) {
    var p = plane(u, v);
    var x = p[0] * interval / width;
    var y = p[1] * interval / width;
    var r = Math.sqrt(x*x + y*y);
    p[2] = height * Math.sin(r) / r;
    return p;
  };
};

GIZA.equations.torus = function(minor, major) {
  return function(u, v) {
    u = 2.0 * Math.PI * u;
    v = 2.0 * Math.PI * v;
    return GIZA.Vector3.make(
      (major + minor * Math.cos(v)) * Math.cos(u),
      (major + minor * Math.cos(v)) * Math.sin(u),
      minor * Math.sin(v)
    );
  };
};

GIZA.surfaceFlags = {
  POSITIONS: 1,
  COLORS: 2,
  NORMALS: 4,
  WRAP_COLS: 8,
  WRAP_ROWS: 16
};

GIZA.surface = function(equation, rows, cols, flags) {

  var f = GIZA.surfaceFlags;
  if (flags == null) {
    flags = f.POSITIONS | f.WRAP_COLS | f.WRAP_ROWS;
  }

  // rows and cols refer to the number of quads or "cells" in the mesh.
  //
  // We always emit vertices for both endpoints of the interval, even
  // for wrapping meshes (for texture coordinate continuity).
  //
  // WRAP_COLS and WRAP_ROWS exist purely to prevent overdraw of
  // wireframe lines along the seam.

  var wrapCols = flags & GIZA.surfaceFlags.WRAP_COLS;
  var wrapRows = flags & GIZA.surfaceFlags.WRAP_ROWS;
  var colors   = flags & GIZA.surfaceFlags.COLORS;
  var normals  = flags & GIZA.surfaceFlags.NORMALS;

  var pointCount = (rows + 1) * (cols + 1);
  var triangleCount = 2 * rows * cols;
  var colLines = wrapCols ? cols : (cols+1);
  var rowLines = wrapRows ? rows : (rows+1);
  var lineCount = (colLines * rows) + (rowLines * cols);

  var numFloats = 3;
  if (normals) {
    numFloats += 3;
  }
  if (colors) {
    numFloats++;
  }
  var bytesPerPoint = 4 * numFloats;

  return {
    "pointCount": function () { return pointCount; },
    "lineCount": function () { return lineCount; },
    "triangleCount": function () { return triangleCount; },

    "points": function () {
      if (pointCount > 65535) {
        console.error("Too many points for 16-bit indices");
      }
      var coordArray = new Float32Array(pointCount * bytesPerPoint / 4);
      var coordIndex = 0;
      var du = 1.0 / cols;
      var dv = 1.0 / rows;
      var v = 0;
      for (var row = 0; row < rows + 1; row++) {
        var u = 0;
        for (var col = 0; col < cols + 1; col++) {
          var p = equation(u, v);

          coordArray[coordIndex++] = p[0];
          coordArray[coordIndex++] = p[1];
          coordArray[coordIndex++] = p[2];

          if (normals) {
            var p2 = V3.subtract(equation(u+du, v), p);
            var p1 = V3.subtract(equation(u, v+dv), p);
            var n = V3.cross(p1, p2).normalize();
            coordArray[coordIndex++] = n[0];
            coordArray[coordIndex++] = n[1];
            coordArray[coordIndex++] = n[2];
          }

          if (colors) {
            coordIndex++;
          }
          u = (col == cols) ? 1.0 : (u + du);
        }
        v = (row == rows) ? 1.0 : (v + dv);
      }
      return coordArray;
    },

    "lines": function () {
      var lineArray = new Uint16Array(lineCount * 2);
      var lineIndex = 0;
      var pointsPerRow = cols+1;
      var pointsPerCol = rows+1;
      for (var row = 0; row < rowLines; row++) {
        for (var col = 0; col < cols; col++, lineIndex += 2) {
          lineArray[lineIndex] = row * pointsPerRow + col;
          lineArray[lineIndex+1] = lineArray[lineIndex] + 1;
        }
      }
      for (var row = 0; row < rows; row++) {
        for (var col = 0; col < colLines; col++, lineIndex += 2) {
          lineArray[lineIndex] = row * pointsPerRow + col;
          lineArray[lineIndex+1] = lineArray[lineIndex] + pointsPerRow;
        }
      }
      return lineArray;
    },

    "triangles": function () {
      var triangles = new Uint16Array(triangleCount * 3);
      var triIndex = 0;
      var pointsPerRow = cols+1;
      for (var row = 0; row < rows; row++) {
        for (var col = 0; col < cols; col++) {
          var i = row * pointsPerRow + col;
          triangles[triIndex++] = i;
          triangles[triIndex++] = i+1;
          triangles[triIndex++] = i+pointsPerRow;
          triangles[triIndex++] = i+pointsPerRow;
          triangles[triIndex++] = i+1;
          triangles[triIndex++] = i+pointsPerRow+1;
        }
      }
      return triangles;
    }
  };
};
