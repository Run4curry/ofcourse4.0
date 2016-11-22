
/**
 * Module dependencies.
 */

var express = require('express');
var routes  = require('./routes');
var api  = require('./routes/api');
var favicon = require('serve-favicon');
var ga = require('connect-ganalytics');
var PORT = process.env.PORT || 3000;


var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', {
    layout: false
  });
  app.use(ga('UA-87780359-1'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/public'));
  app.use(favicon(__dirname + '/public/favicon.ico'))
  app.use(app.router);
});


app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);
app.get('/partials/:name', routes.partials);

// JSON API

app.put('/api/UCSD/:course/:mainpost', api.postComment);
app.get('/api/freq/UCSD/:course', api.getFrequencies);
app.get('/api/UCSD', api.getCourses);
app.get('/api/UCSD/:course', api.getOneCourse);
app.get('/api/UCSD/:course/:postind', api.getSubComments);
app.put('/api/UCSD/:course/:subcomment/:postind' , api.postSubComment);
app.put('/api/:course/:objid/:val' , api.vote);
app.put('/api/:course/:postid/:subpostid/:val' , api.subvote);

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);

// Start server

app.listen(PORT, function(){
	console.log("listening on port " + PORT);
});
