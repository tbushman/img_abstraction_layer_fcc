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


var uri = process.env.MONGODB_URI;

mongo.connect(uri, function(){
	console.log('connected to MongoDB');
})

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

router.get(/(.*)/, function(req, res){
	//var list = //[];
	//var find = mongo.db().collection.find();
	mongo.db().collection('fcc_img_search').find({}).toArray(function(err, doc){
	//find.toArray(function(err, doc){
		if (err) {
			handleError(res, err.message, "collection is empty.");
		} else {

			res.render('index', {
				title: 'FCC Image Abstraction Layer',
			    //display: imgSrc
				//page: offset,
				list: JSON.stringify(doc)
			});		
		}
	});
	
	
});

module.exports = router;
