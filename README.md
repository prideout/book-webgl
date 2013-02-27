
# giza

- Spin inertia with physical mouse doesn't work

- Make GIZA into its own repo by moving it into giza/giza and recipes into giza/demos. Remove the two Clock demos.  Then, make a subproject in book-webgl.  Also update the URL in chapter 1.  Root giza should contain an index.html so that gh-pages can
be an exact duplicate of master.  Or, move pbrowser into sandbox to free up a repo.

# book

Ch 1

- Canvas is NOT block-level like div...  it's "phrasing content" like span

- Verbiage for animate()

Ch 2 Verbiage

Ch 3 : Interaction (?)
  Pointer Lock and Fullscreen APIs
  Verbiage for MultiContext
  Enhance MultiContext demo with go-to-fullscreen

# later

- Fix refresh issue in ThumbTest when checks are visible: COMMON.bindOptions should call GIZA.refresh (when paused, equiv to resume + pause)
   with all GIZA contexts.  Perhaps this uses "GIZA.forEachGizaContext"

- TunnelFlight is lit incorrectly

- Combine Turtle and Path; use SVG Path.getPointAtLength

  http://stackoverflow.com/questions/12253855/svg-path-getpointatlength-returning-wrong-values

- Turntable
  - HomePosition
  - Pan / Zoom (similar to tdsview controls)

- Jump into Chapter 3 demos (TexCoords, Ribbons and Tubes)
  Use a superellipsoid Mobius shape for demo purposes

- http://webgl-bench.appspot.com/

- manipulators, BEAUTIFUL docs, fresnel/marble spiral horn

- test & impl rotateAxis and scale in Matrix4

- GIZA.Turtle2D.bezierCurveTo
    https://github.com/bseth99/pathjs
    http://bseth99.github.com/pathjs/demo/path-generators.html
    https://github.com/phoboslab/Ejecta/blob/master/Source/Ejecta/EJCanvas/EJPath.mm
    http://www.antigrain.com/research/adaptive_bezier/index.html
    http://code.google.com/p/explorercanvas/source/browse/trunk/excanvas.js

- GIZA.Turtle3D and GIZA.Tube for implementing Knots

- PolygonTess
  - degenerate triangle
  - Move eval into a worker?
  
- My explanation of premultiplied alpha sucks.
  There's a twitter link to a NVIDIA post about this.

- a build system that uses jslint and minification
  > maybe this would just slow me down...
    2 space indention
    ' over "
    functio expressions over declarations
  > perhaps I should wait to do this, and do it at the same time
    that I write some rst docs
    http://vimalkumar.in/sphinx-themes/solar/html/index.html

# Notes

- Shadow Mapping -- http://t.co/rOHU6Tcp

to escape inside a listing:
escapechar=\%,
// see %\color{purple}Listings~\ref{lst:GIZA:init1} and \ref{lst:GIZA:init2}%

WebGL Best Practices
https://developer.mozilla.org/en-US/docs/WebGL/WebGL_best_practices

Immediately-Invoked Function Expression 

Chapter 7 is wimpy

The foggy glass in front of butterfly screenshot is cool in RTR

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
