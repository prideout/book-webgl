COMMON = {gizapath: "../giza/giza/"};

require.config({
  urlArgs: "bust=" + (new Date()).getTime()
});

require(["../giza/demos/common.js"]);
