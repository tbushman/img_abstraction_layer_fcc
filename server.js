var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var dotenv = require('dotenv');
var url = require('url');
var pug = require('pug');
var ObjectID = mongodb.ObjectID;

var app = express();

app.use(express.static(__dirname + '/public'));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(bodyParser.json());
var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.use(urlencodedParser);

//this is how I'm getting the .env MONGOLAB_URI loaded:
dotenv.load();
var MongoClient = mongodb.MongoClient;
var uri = process.env.MONGODB_URI;
var db;
MongoClient.connect(uri, function (err, database) {
  	if (err) {
    	console.log('Unable to connect to the mongoDB server. Error:', err);
		process.exit(1);
  	} else {
		db = database;
    	console.log('Connection established to', uri);

		var server = app.listen(process.env.PORT/* || 8080*/, function(){
			var port = server.address().port;
			console.log('App now running on port', port);
		});
	}
});

var newUrl;
app.get('/', function(req, res){
	newUrl = req.protocol + '://'+ req.get('host') + req.originalUrl;
	res.render('index', {
		title: 'FCC Image Abstraction Layer'//,
	});
});
