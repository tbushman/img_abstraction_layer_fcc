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

router.use('/history', require('./history.js'))
router.use('/search', require('./search.js'))

router.get('/', function(req, res){
	//home page
	res.render('index', {
		title: 'FCC Image Abstraction Layer'//,
		//page: 1
	});
});

module.exports = router;

