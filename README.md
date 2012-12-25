# master

- ch 1 & 2 tangling (please, no fresnel buddha or king tut stuff yet)
  ^-- really need to hammer out the vector math stuff!
  
- Add lighting to ParametricSurf

- Pay for nodejitsu -- maybe it'll get faster

- Invite dbanks as a collaborator

# later

- GIZA.Turtle2D for implementing Ankh in PolygonTess and
  GIZA.Turtle3D with GIZA.Tube for implementing Knots

https://github.com/bseth99/pathjs
http://bseth99.github.com/pathjs/demo/path-generators.html
https://github.com/phoboslab/Ejecta/blob/master/Source/Ejecta/EJCanvas/EJPath.mm
http://www.antigrain.com/research/adaptive_bezier/index.html
http://code.google.com/p/explorercanvas/source/browse/trunk/excanvas.js

    ctx.moveTo(145.81951,11.151985);
    ctx.bezierCurveTo(95.611047,11.151985,64.330726,57.81599,65.04964,114.16208);
    ctx.bezierCurveTo(65.570813,155.00985,86.749849,194.54165,119.00057,243.25502);
    ctx.lineTo(11.1508857,230.99317);
    ctx.lineTo(11.1508857,291.06037);
    ctx.lineTo(127.32279,277.84718);
    ctx.lineTo(102.04307,503.55502);
    ctx.lineTo(189.62203,503.55502);
    ctx.lineTo(164.31623,277.84718);
    ctx.lineTo(280.51422,291.06037);
    ctx.lineTo(280.51422,230.99317);
    ctx.lineTo(172.63844,243.25502);
    ctx.bezierCurveTo(204.88917,194.54165,226.0682,155.00985,226.58938,114.16208);
    ctx.bezierCurveTo(227.30829,57.81599,196.02797,11.151985,145.81951,11.151985);
    ctx.closePath();

    ctx.moveTo(145.81951,50.025214);
    ctx.bezierCurveTo(160.87845,50.025214,171.12769,56.48072,179.76059,69.052219);
    ctx.bezierCurveTo(188.3935,81.623719,193.95465,101.05069,193.87445,123.43774);
    ctx.bezierCurveTo(193.69265,174.18665,166.85172,209.27827,145.81951,241.22019);
    ctx.bezierCurveTo(124.7873,209.27827,97.946363,174.18665,97.764567,123.43774);
    ctx.bezierCurveTo(97.684371,101.05069,103.24552,81.623719,111.87842,69.052219);
    ctx.bezierCurveTo(120.51133,56.48072,130.76056,50.025214,145.81951,50.025214);
    ctx.closePath();

- Screenshots

- PolygonTess
  - degenerate triangle
  - Add an Ankh. (wikipedia page has a nice SVG)
  - Move eval into a worker?
- pycollada -> King Tut

# server 

- a build system that uses jslint and minification
  > maybe this would just slow me down...
  > perhaps I should wait to do this, and do it at the same time
    that I write some rst docs
    http://vimalkumar.in/sphinx-themes/solar/html/index.html

# Notes

Immediately-Invoked Function Expression 

Alpha compositing with canvas.  Alpha of ClearColor matters!!

We need to add a section somewhere for lost context stuff
http://blog.xeolabs.com/handling-a-lost-webgl-context-in-scenejs
WEBKIT_WEBGL_lose_context

How to capture WebGL/Canvas by writing out PNGs to a sandboxed filesystem
https://gist.github.com/4370822

For chapter 11:
http://jster.net/blog/webgl-3d-engines-and-tools#.UNKaGonjk5s

Possibly add webgl-texture-utils to Chapter 11
https://github.com/alteredq/webgl-texture-utils

The chapter on loading large meshes should demo a progress bar

The chapter on webcam effects:
http://webcamtoy.com/

Why you should let google host jquery for you:
https://developers.google.com/speed/libraries/
http://encosia.com/3-reasons-why-you-should-let-google-host-jquery-for-you/

protocol-less
http://encosia.com/cripple-the-google-cdns-caching-with-a-single-character/
