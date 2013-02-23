var main = function() {

  COMMON.initMultiple([
    {
      canvasId: 'canvas1',
      scriptUrl: 'MultiCanvas1.js',
      entryFunction: 'main1'
    },
    {
      canvasId: 'canvas2',
      scriptUrl: 'MultiCanvas2.js',
      entryFunction: 'main2'
    }
  ]);

};
