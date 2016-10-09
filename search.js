var express = require('express');
var router = express.Router();
var itemRouter = express.Router({mergeParams: true});
var _ = require('underscore');
var google = require('googleapis');
var GoogleSearch = require('google-search');
var path = require("path");
var bodyParser = require("body-parser");
var dotenv = require('dotenv');
var mongodb = require("mongodb");
var mongo = require('./mongo_client.js');
var url = require('url');
var GoogleSearch = require('google-search');

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

router.get(/(.+)/, function(req, res){
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
	var list = [];
	var imgSrc;
	googleSearch.build({
		q: search_term,
		start: start,
		num: number
	}, function(err, response){
		//console.log(JSON.stringify(response.items.pagemap))
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
		mongo.db().collection('fcc_img_search').insertOne(insertDb, function(err, doc){
			if (err) {
				handleError(res, err.message, "Failed to update DB.");
			}
			
		});
		/*				collection.insertOne(insertDb, function(err, doc){
			if (err) {
				handleError(res, err.message, "Failed to update DB.");
			}
		});
		*/
		res.render('index', {
			title: 'FCC Image Abstraction Layer',
		    //display: imgSrc
			//page: offset,
			list: JSON.stringify(list)
		});
	})		

});
		
		


module.exports = router;