'use strict';

var express = require('express');
var http = require('http');
var https = require('https');
var bodyParser = require('body-parser');
var socket = require('socket.io');
var tellstick = require('tellstick');
var os = require('os');

// Setup server
var app = express();

app.use("/js", express.static(__dirname + "/web/js"));
app.use("/css", express.static(__dirname + "/web/css"));
app.use("/html", express.static(__dirname + "/web/html"));
app.use("/assets", express.static(__dirname + "/web/assets"));
app.use("/bower_components", express.static(__dirname + "/web/bower_components"));

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

var WORKERS = process.env.WEB_CONCURRENCY || 1;

var server = app.listen(process.env.PORT || 8080, function () {
	var host = server.address().address;
	var port = server.address().port;
	console.log('Tellstick Lighting Controller is listening at http://%s:%s', host, port);
});

var io = socket.listen(server);

// STATIC CONTENT
app.all("/", function(req, res, next) {
	res.sendfile("index.html", { root: __dirname + "/web" });
});

	// TEST PING
app.get('/ping', function(req, res){
	res.status(200);
  res.send('pong');
});

// LIGHTING API
var lamps = [];

app.get('/api/lighting', function(req, res) {
	res.send(lamps);
});

app.post('/api/lighting/', function(req, res) {
	var lamp = req.body.lamp;
	console.log(lamp);
	for (var i = 0; i < lamps.length; i++) {
		if (lamps[i].id == lamp.id) {
			if (lamps[i].on == true) {
				td.turnOff(lamps[i].id, function(err){
				  if(!err) {
						lamps[i].on = false;
						console.log(lamps[i].name + ' is turned off');
					}
				});
			} else {
				td.turnOn(lamps[i].id, function(err){
				  if(!err) {
						lamps[i].on = true;
						console.log(lamps[i].name + ' is turned on');
					}
				});
			}
			break;
		}
	}
	io.emit('lightingChange', lamp);
	res.status(200);
	res.send();
});

// tellstickvar
var tdtoolPath = '';
var currOs = os.platform().toLowerCase();
switch (currOs) {
	case 'linux':
		tdtoolPath = '/usr/bin/';
		break;

	case 'darwin':
		tdtoolPath = '/usr/local/bin/';

	default:
		tdtoolPath = '/usr/local/bin/';
}
console.log('You are on a ' + currOs + ' system.');
var td = tellstick(tdtoolPath); // Leave blanc for mac

// list all registered devices and prepare
console.log('Lamps:');
td.list(function(err, list){
	lamps = list;
	if (lamps) {
		for (var i = 0; i < lamps.length; i++) {
			console.log('Name: ' + lamps[i].name + ' is: ' + lamps[i].on);
		}
	}
});
