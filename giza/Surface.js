GIZA.equations = {};

GIZA.equations.sphere = function(radius) {
    return function(u, v) {
        u = Math.PI * u;
        v = 2 * Math.PI * v;
        return vec3(
            radius * Math.sin(u) * Math.cos(v),
            radius * Math.cos(u),
            radius * -Math.sin(u) * Math.sin(v)
        );
    };
};

GIZA.equations.torus = function(minor, major) {
    return function(u, v) {
        u = 2 * Math.PI * u;
        v = 2 * Math.PI * v;
        return vec3(
            (major + minor * Math.cos(v)) * Math.cos(u),
            (major + minor * Math.cos(v)) * Math.sin(u),
            minor * sin(v)
        );
    };
};

GIZA.surfaceFlags = {
    "POSITIONS": 0,
    "WRAP_COLS": 1,
    "WRAP_ROWS": 2
};

GIZA.surface = function(equation, flags, rows, cols) {

    // rows and cols refer to the number of quads or "cells" in the mesh.
    //
    // We always emit vertices for both endpoints of the interval, even
    // for wrapping meshes (for texture coordinate continuity).
    //
    // WRAP_COLS and WRAP_ROWS exist purely to prevent overdraw of
    // wireframe lines along the seam.

    var wrapCols = true;
    var wrapRows = true;

    var pointCount = (rows + 1) * (cols + 1);
    var triangleCount = 2 * rows * cols;

    var colLines = wrapCols ? cols : (cols+1);
    var rowLines = wrapRows ? rows : (rows+1);
    var lineCount = (colLines * rows) + (rowLines * cols);

    return {
        "points": function () {
            var du = cols / 1.0;
            var dv = rows / 1.0;
            var u = 0;
            var v = 0;
            var points = [];
            for (var row = 0; row < rows + 1; row++) {
                for (var col = 0; col < cols + 1; col++) {
                    points.push(equation(u, v));
                    u = u + du;
                }
                v = v + du;
            }
            return points;
        },
        "lines": function () {
            var lines = [];
            return lines;
        },
        "triangles": function () {
            var triangles = [];
            return triangles;
        }
    };
};
