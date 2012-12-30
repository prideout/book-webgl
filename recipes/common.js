var cdn = "http://ajax.googleapis.com/ajax/libs/";
var github = "http://github.com/prideout/book-webgl/blob/master/recipes/";

// Use HeadJS to load scripts asynchronously, but execute them synchronously.
head.js(
  "../giza/Giza.js",
  "../giza/Vector.js",
  "../giza/Matrix.js",
  "../giza/Polygon.js",
  "../giza/Surface.js",
  "../giza/Turtle.js",
  "lib/demo.js",
  "lib/stats.min.js",
  cdn + "jquery/1.8.0/jquery.min.js",
  cdn + "jqueryui/1.9.2/jquery-ui.min.js");

// After all scripts have been loaded AND after the document is "Ready", do this:
head.ready(function() {

  // Execute the recipe's main() function
  main();

  // Add some github links into the button-bar element
  var slash = document.URL.lastIndexOf("/");
  var recipe = document.URL.slice(slash+1, -4);
  var index = "index.html";
  $('#button-bar').html([
    "<a href='" + index + "'>",
    "    go to recipe list",
    "</a>",
    "<a href='" + github + recipe + ".html'>",
    "    view HTML source",
    "</a>",
    "<a href='" + github + recipe + ".js'>",
    "    view JavaScript source",
    "</a>",
  ].join('\n'));

  // Tell jQueryUI to style the links as buttons
  $("a").button()

});
