#!/usr/local/bin/node

// https://github.com/rsms/node-imagemagick
// https://github.com/learnboost/node-canvas
// http://www.imagemagick.org/Usage/

var im = require('imagemagick');
var util = require('util');

var srcFiles = [
  'StrobeLight.png',
  'BasicLighting.png' ]

var dstFile = 'Recipe1.png';

var totalWidth = 0;
var maxHeight = 0;
var padding = 50;

var combine = function() {
  args = srcFiles.concat(['+append', dstFile]);
  im.convert(args, function(err, stdout) {
    if (err) throw err;
    console.log('stdout:', stdout);
  });
};

var doneScanning = function() {
  totalWidth += padding * (srcFiles.length - 1);
  console.info(totalWidth, maxHeight);
  combine();
};

var scanCount = 0;

srcFiles.forEach(function(filename) {
  im.identify(filename, function(err, features){
    if (err) {
      console.error(err);
      process.exit(1);
    }
    var w = parseInt(features.width);
    var h = parseInt(features.height);
    console.info(filename, w, h);
    totalWidth += w;
    maxHeight = Math.max(maxHeight, h);
    scanCount++;
    if (scanCount == srcFiles.length) {
      doneScanning();
    }
  });
});
