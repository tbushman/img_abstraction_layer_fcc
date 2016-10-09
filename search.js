var express = require('express');
var router = express.Router();
var _ = require('underscore');
//attempted to multi-form for offset, but the offset function is limited to typing '?offset=2' in the address bar after search phrase
//var multer  = require('multer');
//var upload = multer();
var google = require('googleapis');
var GoogleSearch = require('google-search');
var path = require("path");
var bodyParser = require("body-parser");
var dotenv = require('dotenv');
var mongodb = require("mongodb");
var mongo = require('./mongo_client.js');
var url = require('url');
var GoogleSearch = require('google-search');
//var $ = require('jquery')(require("jsdom").jsdom().defaultView);
//var jsdom = require("jsdom");
//var window = jsdom.jsdom().defaultView;
dotenv.load();
var googleSearch = new GoogleSearch({
  key: process.env.API_KEY,
  cx: process.env.CX
});

var uri = process.env.MONGODB_URI;

mongo.connect(uri, function(){
	console.log('connected to MongoDB');
})
// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}
var urlencodedParser = bodyParser.urlencoded({ extended: false })

/*jsdom.jQueryify(window, "http://code.jquery.com/jquery.js", function () {
  	var $ = window.$;
 	offset = $('#thisPage').val();
	console.log(offset)
});*/
//var cpUpload = upload.none()
router.post('/', urlencodedParser, function(req, res){
	var search_term = req.body.q;
	var offset;
	console.log(offset)
	processSearch(res, search_term, offset)
})

router.get(/(.+)/, function(req, res){
	var search_term = url.parse(req.url).pathname;
	search_term = search_term.replace('/', '');
	var offset = url.parse(req.url).search;
	processSearch(res, search_term, offset)
	
});
		
function processSearch(res, search_term, offset) {
	
	if (offset == undefined) {
		offset = 0;
	} else {		
		offset = offset.split('=')[1];
	}
	var number = 10;
	var start;
	if (offset == 0) {
		start = 1;
	} else {
		start = offset+'1'; //i.e. if offset is 1, start w/ result 11
	}
	doSearch(res, search_term, start, number, offset)
	
	
}

function doSearch(res, search_term, start, number, offset) {
	var list;
	var imgSrc;
	googleSearch.build({
		q: search_term,
		start: start,
		num: number
	}, function(err, response){
		list = [];
		var response_items = response.items
		//console.log(response_items[0])
		for (var i in response_items) {
			var title = response_items[i].title;
			var thumb = response_items[i].pagemap.cse_thumbnail;
			imgSrc = response_items[i].pagemap.cse_image[0].src;
			var entry = {title: title, thumbnail: thumb, src: imgSrc}
			list.push(entry)
		}
		var now = new Date().toJSON();
		var insertDb = {
			search_phrase: search_term,
			date: now
		};
		mongo.db().collection('fcc_img_search').insertOne(insertDb, function(err, doc){
			if (err) {
				handleError(res, err.message, "Failed to update DB.");
			}
			
		});
		res.render('index', {
			title: 'FCC Image Search Abstraction Layer',
		    //display: imgSrc
			page: offset,
			list: JSON.stringify(list)
		});
	})	
}		


module.exports = router;