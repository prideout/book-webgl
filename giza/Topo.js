var GIZA = GIZA || {};

//  - quadsToTriangles
//
// TODO
//   - add processTriangles, similar API as quadsToTriangles
//   - add trianglesToLines, which is fairly simple, like quadsToLines

GIZA.Topo = {

  // Normals Enum
  NONE: 0,
  FACET: 1,
  SMOOTH: 2,

  // Convert an index buffer of 4-tuples (quad mesh) into an index
  // buffer of 3-tuples (triangle mesh).  Optionally dereference the
  // indices to produce a flattened vertex buffer.  If desired, smooth
  // normals or facet normals can be computed.
  //
  // Returns a dictionary with three keys:
  //    indexArray.....this is always filled with a buffer of 3-tupled, constructed with config.destIndexType
  //    pointsArray....if config.dereference is enabled, this returns a buffer of dereferenced coords of type config.destPointsType
  //    normalsArray...if config.normals is not GIZA.Topo.NONE, this holds the result of the computed normal vectors
  //
  quadsToTriangles: function(quadsArray, config) {

    var defaults = {
      destIndexType: quadsArray.constructor,
      destPointsType: Float32Array,
      pointsArray: null,
      dereference: false,
      normals: GIZA.Topo.NONE,
    };

    config = GIZA.merge(defaults, config || {});

    var trianglesArray = new config.destIndexType(quadsArray.length * 6 / 4);
    
    var t = 0;
    for (var q = 0; q < quadsArray.length;) {
      var i0 = quadsArray[q++]; var i1 = quadsArray[q++];
      var i2 = quadsArray[q++]; var i3 = quadsArray[q++];
      trianglesArray[t++] = i2;
      trianglesArray[t++] = i1;
      trianglesArray[t++] = i0;
      trianglesArray[t++] = i0;
      trianglesArray[t++] = i3;
      trianglesArray[t++] = i2;
    }

    if (config.dereference) {
      if (!config.pointsArray) {
        console.error('GIZA.Topo: Dereferencing was requested, but pointsArray was not specified.');
        return;
      }
      var pointsArray = new config.destPointsType(trianglesArray.length * 3);
      var p = 0;
      for (var t = 0; t < trianglesArray.length; t++) {
        var i = trianglesArray[t];
        pointsArray[p++] = config.pointsArray[i*3+0];
        pointsArray[p++] = config.pointsArray[i*3+1];
        pointsArray[p++] = config.pointsArray[i*3+2];
      }
    }

    return {
      indexArray: trianglesArray,
      pointsArray: pointsArray,
      normalsArray: null,
    };

  },

  // Convert an index buffer of 4-tuples (quad mesh) into an index
  // buffer of 2-tuples (wireframe) without duplicating edges.
  quadsToLines: function(quadsArray, destType) {
    destType = destType || quadsArray.constructor;
    edgeList = {};
    
    var addEdge = function(i0, i1) {
      var h0 = ("0000" + i0.toString(16)).slice(-4);
      var h1 = ("0000" + i1.toString(16)).slice(-4);
      if (i0 < i1) {
        edgeList[h0+h1] = [i0,i1];
      } else {
        edgeList[h1+h0] = [i1,i0];
      }
    };

    for (var q = 0; q < quadsArray.length;) {
      var i0 = quadsArray[q++]; var i1 = quadsArray[q++];
      var i2 = quadsArray[q++]; var i3 = quadsArray[q++];
      addEdge(i0, i1); addEdge(i1, i2);
      addEdge(i2, i3); addEdge(i3, i0);
    }

    var keys = Object.keys(edgeList).sort();
    var linesArray = new destType(keys.length * 2);
    var i = 0, j = 0;
    while (i < keys.length) {
      var edge = edgeList[keys[i++]];
      linesArray[j++] = edge[0];
      linesArray[j++] = edge[1];
    }
    return linesArray;
  },

};
