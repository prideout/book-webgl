var GIZA = GIZA || {};

GIZA.BufferView = function(desc) {

  // Allow clients to skip the "new"
  if (!(this instanceof GIZA.BufferView)) {
    return new GIZA.BufferView(desc);
  }

  // First populate the offsets and lengths.
  this.offsets = {};
  this.dims = {};
  var offset = 0;
  for (var key in desc) {
    var arrayType = desc[key][0];
    var arrayDim = desc[key][1];
    var size = arrayDim * arrayType.BYTES_PER_ELEMENT;
    this.offsets[key] = offset;
    this.dims[key] = arrayDim;
    offset += size;
  }
  this.vertexSize = offset;

  // Now compute a stride for each attribute.
  this.strides = {};
  for (var key in desc) {
    var arrayType = desc[key][0];
    var stride = this.vertexSize / arrayType.BYTES_PER_ELEMENT;
    if (stride != Math.floor(stride)) {
      console.error("GIZA.BufferView is not aligned properly.");
    }
    this.strides[key] = stride;
  };

  // Populate the typed views.
  this.setArray = function(arrayBuffer) {
    this.typedArrays = {};
    for (var key in desc) {
      var arrayType = desc[key][0];
      this.typedArrays[key] = new arrayType(arrayBuffer, this.offsets[key]);
    }
  };

  // Create an array large enough to accomodate the specified vertex count.
  this.makeBuffer = function(vertexCount) {
    var vertexArray = new ArrayBuffer(vertexCount * this.vertexSize);
    this.setArray(vertexArray);
    return vertexArray;
  };


  // Provide an object constructor.
  this.getVertex = function(vertexIndex) {
    retval = {};
    for (var key in desc) {
      var index = vertexIndex * this.strides[key];
      //console.info('prideout', key, index, index + this.dims[key]);
      retval[key] = this.typedArrays[key].subarray(
        index, index + this.dims[key]);
    }
    return retval;
  };

};
