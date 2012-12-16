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
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
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

var authenticated = false;

var previousRoute = '/buddha';

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(id, done) {
  done(null, id);
});

passport.use(new LocalStrategy(
    function(uname, pswd, done) {
        if (pswd === "grasshopper") {
            return done(null, 'anonymous');
        }
        return done(null, false, { message: 'Invalid password' });
    }
));    

app.post('/login',
         passport.authenticate('local', { failureRedirect: '/' }),
         function(request, response) {
             authenticated = true;
             response.redirect(previousRoute);
         });

app.get('/buddha*', function(request, response) {
    if (!authenticated) {
        previousRoute = '/buddha';
        response.redirect('/');
    } else {
        var head = request.url.indexOf('/buddha');
        var tail;
        if (request.url === '/buddha') {
            tail = 'index.html'
        } else {
            tail = request.url.substring(head + '/buddha'.length);
        }
        var stream = fs.createReadStream(__dirname + '/buddha/' + tail);
        stream.pipe(response);
    }
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port %d in %s mode", app.get('port'), app.settings.env);
});

