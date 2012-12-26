// To install and run the mocha unit test framework:
//  > npm install -g mocha
//  > mocha MochaTest.js

var assert = require("assert");

var GIZA = require("./NewVector.js").GIZA;

// We recommend that clients set up these useful aliases:
var X=0, Y=1, Z=2;
var V2 = GIZA.Vector2;

// Calling make and manually creating an array are
// equivalent:
var a = V2.make(1, 2);
var a2 = [1, 2];
assert.true(V2.equivalent(a, a2));

// The equivalency test can be given a custom epsilon:
V2.equivalent(a, a2, 0.001);

// Simple cloning is provided:
var b = V2.copy(a);
a[X] = 3;
assert.equal(b[X], 1);

// Past-tense verbs return a new object:
var c = V2.translated(a, 0.5, 0.5);
var d = V2.translated(a, [0.5, 0.5]);
var e = V2.translated(a, V2.make(0.5, 0.5));
var f = V2.translated(a, new Float32Array([0.5, 0.5]));
assert.notEqualObjects(c, a);
assert.notEqualObjects(d, a);
assert.notEqualObjects(e, a);
assert.notEqualObjects(f, a);

// Present-tense verbs mutate & return this:
c = V2.translate(a, 0.5, 0.5);
d = V2.translate(a, [0.5, 0.5]);
e = V2.translate(a, V2.make(0.5, 0.5));
f = V2.translate(a, new Float32Array([0.5, 0.5]));
assert.equalObjects(c, a);
assert.equalObjects(d, a);
assert.equalObjects(e, a);
assert.equalObjects(f, a);

describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal(-1, [1,2,3].indexOf(5));
      assert.equal(-1, [1,2,3].indexOf(0));
    })
  })
});
