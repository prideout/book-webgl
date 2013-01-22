#!/usr/local/bin/node

// https://github.com/rsms/node-imagemagick

var im = require('imagemagick');
var util = require('util');

im.identify('ClosedTunnel.png', function(err, features){
  if (err) {
    console.error(err);
    process.exit(1);
  }
  var msg = util.format('%s x %s', features.width, features.height);
  console.info(msg);
});

/*

im.resize({
  srcPath: 'kittens.jpg',
  dstPath: 'kittens-small.jpg',
  width:   256
}, function(err, stdout, stderr){
  if (err) throw err;
  console.log('resized kittens.jpg to fit within 256x256px');
});

*/
