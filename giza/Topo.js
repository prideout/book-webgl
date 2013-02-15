var GIZA = GIZA || {};

//  - add quadsToTriangles, which might have a config dict, and a return dict. (flatten=false, normals=none/facet/smooth, etc)
//  - add processTriangles, similar API as quadsToTriangles
//  - add trianglesToLines, which is fairly simple, like quadsToLines

GIZA.Topo = {

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
