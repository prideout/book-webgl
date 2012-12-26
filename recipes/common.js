
// To find the "main" function definition, replace the HTML extension with JS.
var thisPage = document.URL;
var mainScript = thisPage.slice(0,-4) + "js"

// Use HeadJS to load scripts asynchronously, but execute them synchronously.
head.js(
  "../giza/Giza.js",
  "../giza/Vector.js",
  "../giza/Matrix.js",
  "../giza/Polygon.js",
  "../giza/Surface.js",
  "../giza/Turtle.js",
  "../recipes/lib/demo.js",
  "../recipes/lib/stats.min.js",
  "http://ajax.googleapis.com/ajax/libs/jquery/1.8.0/jquery.min.js",
  "http://ajax.googleapis.com/ajax/libs/jqueryui/1.9.2/jquery-ui.min.js",
  mainScript);

// After all scripts have been loaded AND after the document is "Ready", do this:
head.ready(function() {
  main();
  var github = "https://github.com/prideout/book-webgl/blob/master/recipes";
  var slash = mainScript.lastIndexOf("/");
  var url = github + mainScript.slice(slash, -2);
  var index = "../recipes/index.html";
  $('#button-bar').html([
    "<a href='" + index + "'>go to recipe list</a>",
    "<a href='" + url + "html'>view HTML source</a>",
    "<a href='" + url + "js'>view JavaScript source</a>",
  ].join('\n'));

  $("a").button()

});
