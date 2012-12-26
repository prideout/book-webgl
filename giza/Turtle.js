
GIZA.Turtle2D = function(x, y) {
  var coords = [[x,y]];
  return {
    coords: function() {
      return coords;
    },
    lineTo: function(x, y) {
      coords.push([x,y]);
    },
    bezierCurveTo: function(cp1x, cp1y, cp2x, cp2y, x, y) {
      coords.push([x,y]);
    },
    closePath: function() {
      coords.push(coords[0]);
    }
  };
};
