# master

- hammer out vectors.  usage:

  var X=0, Y=1, Z=2;
  var V2 = GIZA.Vector2;
  
  V2.translate(foo) // returns a mutated foo
  V2.translated(bar) // returns a new array
  etc...
  

- ch 1 & 2 tangling (please, no fresnel buddha or king tut stuff yet)
  ^-- really need to hammer out the vector math stuff!
  
- Pay for nodejitsu -- maybe it'll get faster

- Invite dbanks as a collaborator

# later

- GIZA.Turtle2D; implement bezierCurveTo

  GIZA.Turtle3D with GIZA.Tube for implementing Knots

https://github.com/bseth99/pathjs
http://bseth99.github.com/pathjs/demo/path-generators.html
https://github.com/phoboslab/Ejecta/blob/master/Source/Ejecta/EJCanvas/EJPath.mm
http://www.antigrain.com/research/adaptive_bezier/index.html
http://code.google.com/p/explorercanvas/source/browse/trunk/excanvas.js

- Screenshots

- PolygonTess
  - degenerate triangle
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
