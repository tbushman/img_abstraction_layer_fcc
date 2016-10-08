var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var dotenv = require('dotenv');
var url = require('url');
var pug = require('pug');
var _ = require('underscore');
var google = require('googleapis');
var GoogleSearch = require('google-search');
//var imageSearch = require('node-google-image-search');
//var ImagesClient = require('google-images');
var ObjectID = mongodb.ObjectID;

var app = express();
dotenv.load();

app.use(express.static(__dirname + '/public'));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(bodyParser.json());
var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.use(urlencodedParser);

var googleSearch = new GoogleSearch({
  key: process.env.API_KEY,
  cx: process.env.CX
});

//this is how I'm getting the .env MONGOLAB_URI loaded:
//var client = new ImagesClient(''+process.env.CX+'', ''+process.env.API_KEY+'');
var MongoClient = mongodb.MongoClient;
var uri = process.env.MONGODB_URI;
var db;
//MongoClient will save searches for reference.
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

/*client.search('lolcats').then(function(images){
	imgSrc = images[0].url;
	console.log(imgSrc)
});*/

app.post('/', urlencodedParser, function(req, res){ //if path empty, post from form
	var search_term = req.body.q;
	//console.log(search_term)
	var imgSrc;
	googleSearch.build({
		q: search_term,
		num: 1
	}, function(err, response){
		console.log(JSON.stringify(response.items[0].pagemap.cse_thumbnail[0].src));
		imgSrc = response.items[0].pagemap.cse_thumbnail[0].src;
		res.render('index', {
			title: 'FCC Image Abstraction Layer',
		    display: imgSrc
		});
	})
});
