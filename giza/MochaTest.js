// To install and run the mocha unit test framework:
//  > npm install -g mocha
//  > mocha MochaTest.js

var assert = require("assert");
var GIZA = require("./NewVector.js").GIZA;

// We recommend that clients set up these useful aliases:
var X=0, Y=1, Z=2;
var V2 = GIZA.Vector2;

describe('V2', function() {

  var a = V2.make(1, 2);
  var a2 = [1, 2];

  it('V2.make and creating an array are equivalent', function() {
    assert(V2.equivalent(a, a2),
           "Equivalency between V2.make(...) and [...]");
  });

  it('The equivalency test can be given a custom epsilon', function() {
    V2.equivalent(a, a2, 0.001);
  });

  it('Simple cloning is provided', function() {
    var b = V2.copy(a);
    a[X] = 3;
    assert.equal(b[X], 1);
    assert.notEqual(a, b);
  });

  it('Past-tense verbs return a new object', function() {
    var c = V2.translated(a, 0.5, 0.5);
    var d = V2.translated(a, [0.5, 0.5]);
    var e = V2.translated(a, V2.make(0.5, 0.5));
    var f = V2.translated(a, new Float32Array([0.5, 0.5]));
    assert.notEqual(c, a);
    assert.notEqual(d, a);
    assert.notEqual(e, a);
    assert.notEqual(f, a);
  });

  it('Present-tense verbs mutate & return this', function() {
    var c = V2.translate(a, 0.5, 0.5);
    var d = V2.translate(a, [0.5, 0.5]);
    var e = V2.translate(a, V2.make(0.5, 0.5));
    var f = V2.translate(a, new Float32Array([0.5, 0.5]));
    assert.equal(c, a);
    assert.equal(d, a);
    assert.equal(e, a);
    assert.equal(f, a);
  });

});
