
# Current Tasks

- Ch 1
  - Remove stuff about `GIZA = GIZA || {}`
  - Use yepnope instead of requirejs
  - replace placeholder URL with [glcompanion.com](glcompanion.com) and giza repo

- Ch 2
  - Verbiage from VBOs downwards, skipping Lines and Triangles.
  - Verbiage for the ColorWheel sample
  - Vector math -- make this as brief as possible
  - Avoid model / view / proj terminology in favor of objectToClip etc
  
- Ch 3 : Jump to interaction
  - Pointer Lock and Fullscreen APIs
  - Verbiage for MultiContext
  - Enhance MultiContext demo with go-to-fullscreen
  - Extract world space by reading from the zbuffer, transform back to eye space with the inverse of the projection matrix, and divide by w
- Add a tools section to Outline (WebGL Inspector, WebGL Bench, WebGL Texture Utils)

# Later

- Digitize figure 2.1 and create a figure for interleaved data and/or typed views.
- data-main and canvas are highlighted incorrectly in Listing 1.7

# Demo Stuff

- Fix refresh issue in ThumbTest when checks are visible: COMMON.bindOptions should call GIZA.refresh (when paused, equiv to resume + pause)
   with all GIZA contexts.  Perhaps this uses "GIZA.forEachGizaContext"
- TunnelFlight is lit incorrectly on HP laptop
- Jump into Chapter 3 demos (TexCoords, Ribbons and Tubes)
  Use a superellipsoid Mobius shape for demo purposes

# Longer Term

- Invite Inigo to contribute

- 2D API to mimic KineticJS ?
  
- My explanation of premultiplied alpha sucks.
  There's a twitter link to a NVIDIA post about this.

# Notes to Self

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
