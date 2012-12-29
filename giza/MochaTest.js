// To install and run the mocha unit test framework:
//  > npm install -g mocha
//  > mocha MochaTest.js

// TODO Remove the following two lines; they exist solely to detect
// syntax errors *before* runInThisContext
require("./NewVector.js");
require("./NewMatrix.js");

var assert = require("assert");
var vm = require("vm");
var fs = require("fs");

// Here's a little trick to allow nodejs
// to use simple client-side code files.
// If this were a proper nodejs app, we'd
// wrap these in modules.
function include(path) {
  var code = fs.readFileSync(path, 'utf-8');
  vm.runInThisContext(code, path);
}

include("./GIZA.js");
include("./NewVector.js");
include("./NewMatrix.js");

// We recommend that clients set up these useful aliases:
var X=0, Y=1, Z=2;
var V2 = GIZA.Vector2;
var V3 = GIZA.Vector3;
var V4 = GIZA.Vector4;
var M4 = GIZA.Matrix4;

// Test the 2D vector functions.
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

  it('Linear interpolation for fun and profit', function() {
    var p = V2.make(5, 6);
    var q = V2.make(7, 8);
    var v1 = V2.lerp(p, q, 0.75);
    var v2 = V2.lerp(p, q, 0.25);
    assert(V2.equivalent(v1, [6.5, 7.5]));
    assert(V2.equivalent(v2, [5.5, 6.5]));
  });

});

// Test the 3D vector functions.  Ahem, this needs more coverage :)
describe('V3', function() {
  it('Cross product follows the right-hand rule', function() {
    var a = V3.make(1, 0, 0);
    var b = V3.make(0, 0, -1);
    var n = V3.cross(a, b);
    assert(V3.equivalent(n, [0,1,0]));
  });
});

// Test the 4x4  matrix functions.
describe('M4', function() {

  var m = M4.make(
    1, 2, 3, 4,
    5, 6, 7, 8,
    9, 10, 11, 12,
    13, 14, 15, 16);

  var m2 = [
    1, 2, 3, 4,
    5, 6, 7, 8,
    9, 10, 11, 12,
    13, 14, 15, 16];

  var m3 = M4.make(m2);

  var m4 = M4.make(
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12],
    [13, 14, 15, 16]);
    

  var m5 = M4.make([
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12],
    [13, 14, 15, 16]]);

  it('M4.make has many different forms', function() {
    assert(M4.equivalent(m, m2));
    assert(M4.equivalent(m, m3));
    assert(M4.equivalent(m, m4));
    assert(M4.equivalent(m, m5));
  });

  it('Simple cloning is provided', function() {
    var n = M4.copy(m);
    m[0] = 3;
    assert.equal(n[0], 1);
    assert.notEqual(m, n);
  });

  it('lookAt and perspective constructors', function() {
    var eye = V3.make(0,0,20);
    var target = V3.make(0,0,0);
    var up = V3.make(0,1,0);
    var m = M4.lookAt(eye, target, up);
    assert(M4.equivalent(m, [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, -20, 1]));

    var fov = 10;
    var aspect = 2;
    var near = 3, far = 20;
    var p = M4.perspective(fov, aspect, near, far);
    
    assert(M4.equivalent(p, [
      5.715026378631592, 0, 0, 0,
      0, 11.430052757263184, 0, 0,
      0, 0, -1.3529411554336548, -1,
      0, 0, -7.058823585510254, 0]));
  });

});
