#!/usr/bin/env node

var fs = require('fs');
var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var app = express();

app.configure(function(){
    app.set('port', 8080);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'html');
    app.engine('html', require('ejs').renderFile);
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.session({ secret: 'carmen sandiego' }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);

passport.serializeUser(function(user, done) {
    var id = 1;
    done(null, id);
});

passport.deserializeUser(function(id, done) {
    done(null, {
        id: 1,
        username: 'anonymous'
    });
});

passport.use(new LocalStrategy(
    function(uname, pswd, done) {
        if (pswd === "foyle") {
            return done(null, 'anonymous');
        }
        return done(null, false, { message: 'Invalid password' });
    }
));    

app.post('/login',
         passport.authenticate('local', { failureRedirect: '/' }),
         function(request, response) {
             response.redirect('/buddha');
         });

app.get('/buddha', ensureAuthenticated, function(request, response) {
    response.sendfile(
        'buddha/index.html',
        {root: __dirname, maxAge: null});
});

app.get('/buddha/:file', ensureAuthenticated, function(request, response) {
    response.sendfile(
        'buddha/' + request.params.file,
        {root: __dirname, maxAge: null});
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/')
}

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port %d in %s mode", app.get('port'), app.settings.env);
});
