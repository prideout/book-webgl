# master

- TODO sections
  - Brief History of GL
  - Building Giza: Literate Programming
  - The Assembly Line Metaphor
  - PRESERVEDRAWINGBUFFER
  - PAGECOMPOSITOR
  - Animation Timing
  - Recipe

- Try to author all of chapter 1 (except the recipe) BEFORE generating a PDF.

- FIGURE
  ClosedTunnel should have thicker lines
  OpenTunnel-Clear
  OpenTunnel-NoClear-Preserved
  OpenTunnel-NoClear-NOPreserved

- FIGURE - Compositing

    - images of a web page that has a background image (Egypt!)
    each canvas should have an opaque perspective cube

    0,0.25,.5,.5 -- no alpha, css-opacity=1
    0,0.25,.5,.5 -- alpha without premultiplied, css-opacity=1
    0,0.25,.5,.5 -- alpha with premultiplied, css-opacity=1

    0,0.25,.5,.5 -- no alpha, css-opacity=.5
    0,0.25,.5,.5 -- alpha without premultiplied, css-opacity=.5
    0,0.25,.5,.5 -- alpha with premultiplied, css-opacity=.5

- FIGURE - The Assembly Line Metaphor

- FIGURE - Timeline of GL (include the inception of RSL and GLSL)

# later

- positional lighting for TunnelFlight

- manipulators, BEAUTIFUL docs, fresnel/marble spiral horn

- styling on the recipe index doesn't work with the node server

- test & impl rotateAxis and scale in Matrix4

- GIZA.Turtle2D.bezierCurveTo
    https://github.com/bseth99/pathjs
    http://bseth99.github.com/pathjs/demo/path-generators.html
    https://github.com/phoboslab/Ejecta/blob/master/Source/Ejecta/EJCanvas/EJPath.mm
    http://www.antigrain.com/research/adaptive_bezier/index.html
    http://code.google.com/p/explorercanvas/source/browse/trunk/excanvas.js

- GIZA.Turtle3D and GIZA.Tube for implementing Knots

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
