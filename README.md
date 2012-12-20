# master

  Patch to ThreeJs:
- giza/Vector/lookAt is wrong (doesn't translate by eye)

https://github.com/prideout/iphone-3d-programming/tree/master/ModelViewer.SimpleWireframe

- ParametricSurf (please, wireframe only)
  - Sphere on left, Torus on right
  - Move eval into a worker?
  - Move portions of it to giza/Surface
- ColorGraph
- ch 1 & 2 tangling (please, no fresnel buddha or king tut stuff yet)

# later

- Add lighting to ParametricSurf
- PolygonTess
  - degenerate triangle
  - Add an Ankh. (wikipedia page has a nice SVG)
  - Move eval into a worker?
- pycollada -> King Tut

# giza design

- Should giza make ANY webgl calls?
- Should the recipes make ANY jquery calls?

# server 

- a build system that uses jslint and minification
  > maybe this would just slow me down...
  > perhaps I should wait to do this, and do it at the same time
    that I write some rst docs
    http://vimalkumar.in/sphinx-themes/solar/html/index.html

# Notes

We need to add a section somewhere for lost context stuff
http://blog.xeolabs.com/handling-a-lost-webgl-context-in-scenejs
+ I think there's an extension

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
