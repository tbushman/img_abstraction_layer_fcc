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
app.get('/', function(req, res){
	res.render('index', {
		title: 'FCC Image Abstraction Layer'//,
		//page: 1
	});
});

/*client.search('lolcats').then(function(images){
	imgSrc = images[0].url;
	console.log(imgSrc)
});*/

//get offset
app.get(/(.+)/, function(req, res){
	var search_term = url.parse(req.url).pathname;
	search_term = search_term.replace('/', '');
	var offset = url.parse(req.url).search;
	if (offset == undefined) {
		offset = 0;
	} else {		
		offset = offset.split('=')[1];
	}
	var newUrl = req.protocol + '://'+ req.get('host') + '/' + search_term + '?offset='+offset;
	var number = 10;
	//var arr = [1, 11, 21, 31]
	var start;
	if (offset == 0) {
		start = 1;
	} else {
		start = offset+'1'; //i.e. if offset is 1, start w/ result 11
	}
	var imgSrc;
	googleSearch.build({
		q: search_term,
		start: start,
		num: number
	}, function(err, response){
		//console.log(JSON.stringify(response.items.pagemap))
		var list = [];
		for (var i in response.items) {
			//console.log(JSON.stringify(response.items[i].pagemap.cse_image[0].src));
			var title = response.items[i].title;
			var thumb = response.items[i].pagemap.cse_thumbnail;
			imgSrc = response.items[i].pagemap.cse_image[0].src;
			var entry = {title: title, thumbnail: thumb, src: imgSrc}
			list.push(entry)
		}
		var now = new Date().toJSON();
		var insertDb = {
			search_phrase: search_term,
			date: now
		};

		var collection = db.collection('fcc_img_search');
		collection.insertOne(insertDb, function(err, doc){
			if (err) {
				handleError(res, err.message, "Failed to update DB.");
			}
		});
		res.render('index', {
			title: 'FCC Image Abstraction Layer',
		    //display: imgSrc
			//page: offset,
			list: JSON.stringify(list)
		});
	})
});
/*var offset = $('#thisPage').val(); //page

app.post('/offset='+offset+'', urlencodedParser, function(req, res){
	var start = req.body.page
});
*/
/*
app.post('/', urlencodedParser, function(req, res){ //if path empty, post from form
	var search_term = req.body.q;
	var newUrl = 'localhost:8080/' + search_term;
	res.redirect(newUrl)
	//console.log(search_term)
	var imgSrc;
	googleSearch.build({
		q: search_term,
		start: start,
		num: number
	}, function(err, response){
		console.log(JSON.stringify(response.items[0].pagemap.cse_thumbnail[0].src));
		var list = [];
		response.items.forEach(function(item){
			imgSrc = response.items[0].pagemap.cse_thumbnail[0].src;
			var entry = {thumbnail: imgSrc}
			list.push(entry)
		});
		//imgSrc = response.items[0].pagemap.cse_thumbnail[0].src;
		
		res.render('index', {
			title: 'FCC Image Abstraction Layer',
		    //display: imgSrc
			page: offset,
			list: JSON.stringify(list)
		});
	})
	
});*/
