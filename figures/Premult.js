#!/usr/local/bin/node

// https://github.com/rsms/node-imagemagick
// https://github.com/learnboost/node-canvas
// http://www.imagemagick.org/Usage/

var im = require('imagemagick');
var util = require('util');

var srcFiles = [
  'PremultTrue.png',
  'PremultFalse.png' ]

var dstFile = 'Premult.png';

var singleWidth = 0;
var totalWidth = 0;
var maxHeight = 0;
var padding = 50;

var combine = function() {

  var genFiles = []
  for (var i = 0; i < srcFiles.length; i++) {
    var genFile = 'gen.' + srcFiles[i];
    genFiles.push(genFile);
    args = [
      srcFiles[i],
      '-gravity', 'South',
      '-crop', singleWidth + 'x' + (maxHeight - 260) + '+0+0',
      genFile,
    ];
    im.convert(args, function() {
      args = genFiles.concat(['+append', dstFile]);
      im.convert(args, function() {
      });
    });
  }
};

var doneScanning = function() {
  totalWidth += padding * (srcFiles.length - 1);
  console.info(totalWidth, maxHeight);
  console.info("\n");
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
    singleWidth = w;
    console.info(filename, w, h);
    totalWidth += w;
    maxHeight = Math.max(maxHeight, h);
    scanCount++;
    if (scanCount == srcFiles.length) {
      doneScanning();
    }
  });
});
