GIZA.equations = {};

GIZA.equations.sphere = function(radius) {
    return function(u, v) {
        u = Math.PI * u;
        v = 2.0 * Math.PI * v;
        return new vec3(
            radius * Math.sin(u) * Math.cos(v),
            radius * Math.cos(u),
            radius * -Math.sin(u) * Math.sin(v)
        );
    };
};

GIZA.equations.sinc = function(maxu, maxv, height) {
    return function(u, v) {
        var u2 = 50 * (u - 0.5);
        var v2 = 50 * (v - 0.5);
        var d = Math.sqrt(u2 * u2 + v2 * v2);
        return new vec3(
            -maxu + maxu * 2 * u,
            -maxv + maxv * 2 * v,
            height * Math.sin(d) / d
        );
    };
};

GIZA.equations.torus = function(minor, major) {
    return function(u, v) {
        u = 2.0 * Math.PI * u;
        v = 2.0 * Math.PI * v;
        return new vec3(
            (major + minor * Math.cos(v)) * Math.cos(u),
            (major + minor * Math.cos(v)) * Math.sin(u),
            minor * Math.sin(v)
        );
    };
};

GIZA.surfaceFlags = {
    POSITIONS: 0,
    WRAP_COLS: 1,
    WRAP_ROWS: 2
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

    var pointCount = (rows + 1) * (cols + 1);
    var triangleCount = 2 * rows * cols;

    var colLines = wrapCols ? cols : (cols+1);
    var rowLines = wrapRows ? rows : (rows+1);
    var lineCount = (colLines * rows) + (rowLines * cols);

    return {
        "pointCount": function () { return pointCount; },
        "lineCount": function () { return lineCount; },
        "points": function () {
            var coordArray = new Float32Array(pointCount * 3);
            var coordIndex = 0;
            var du = 1.0 / cols;
            var dv = 1.0 / rows;
            var v = 0;
            for (var row = 0; row < rows + 1; row++) {
                var u = 0;
                for (var col = 0; col < cols + 1; col++) {
                    var p = equation(u, v);
                    coordArray[coordIndex++] = p.x;
                    coordArray[coordIndex++] = p.y;
                    coordArray[coordIndex++] = p.z;
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
            var triangles = [];
            // TODO
            return triangles;
        }
    };
};
