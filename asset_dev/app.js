
'use strict';

require( 'dotenv' ).config( {silent: true} );

var express = require( 'express' );  // app server
var request = require('request');  // request
var bodyParser = require( 'body-parser' );  // parser for post requests
var _ = require("underscore");  // アンダースコア
var util = require("util");

// login
var uuid = require( 'uuid' );
var vcapServices = require( 'vcap_services' );
var basicAuth = require( 'basic-auth-connect' );
require('date-utils');

//DB

var Cloudant = require('cloudant');
var cloudant = Cloudant({instanceName: "Cloudant NoSQL DB-ji",vcapServices: JSON.parse(process.env.VCAP_SERVICES)});
var accesslogdb = cloudant.db.use('accesslog');
var userdb = cloudant.db.use('userdb');
var feedbackdb = cloudant.db.use('feedbacklog');

// endpoints
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//Log
global.accessUser = "";
var accessDate = "0000/00/00 00:00:00";

//authentication
app.use(basicAuth((function(user, pass, callback) {
	accessUser = user;
	var query = {
  	"selector": {
    	"user" : user
 	 },
	"fields": ["pass"]
	};
	userdb.find(query, function(er, result) {
	    if (er) {
	        console.log("no user data");
			callback(er);
	    } else {
	        callback(null, result.docs[0].pass && result.docs[0].pass === pass);
	    }
	});
})));

//'trust proxy', true をセットすると、req.connection.remoteAddress, req.ipが、最初のプロキシのIPアドレスと同じにセットされる。 BluemixのIPフィルターに必要
app.set('trust proxy', true);
//IP filter list
var allowips =  ['106.', '203.141.91.'];

//IP filtering -->off
app.use(function(req, res, next) {
	//if (_.find(allowips, function(ip_temp){ return req.connection.remoteAddress.indexOf(ip_temp) == 0}) || // Local IPがリストにある場合
	//	 _.find(allowips, function(ip_temp){ return req.ip.indexOf(ip_temp) == 0})) {  // Proxy IPがリストにある場合
			if(req.url == "/"){
			   insertAccessLog(req.ip);
			}
           next();
	//} else {
    //        var err = new Error('Filter Error');
    //        err.code = 404;
    //        err.message = 'IP Address Filter Error: Local: ' + req.connection.remoteAddress + ' or Proxy: ' + req.ip;
    //        next(err);
	//}
});

//App.jsのsubmitFeedbackで/feedbacklogにPOSTされたbody: JSON.stringify(data)をFeedBackLogへ渡す
app.post('/feedbacklog',function(req, res){
  var jsonStr = JSON.stringify(req.body);
  FeedBackLog(jsonStr);
  console.log(util.inspect(req.body, false,null));

  res.send("Your data written in cloudant db");
});


//AccessLog書き出し
function insertAccessLog(ip){
	//login-date
	var dt = new Date();
	dt.setTime(dt.getTime() + 1000 * 60 * 60 * 9);//日本時間に修正
	var accessDate = dt.toFormat("YYYY/MM/DD HH24:MI:SS");
	//insert log into cloudantDB
	accesslogdb.insert({ accessdate: accessDate , user: accessUser, ipaddress:ip}, function (er, result) {
    if (er) {
        console.log("DB Access Error!!!");
    } else {
        console.log("Write Success Result: %s", JSON.stringify(result));
    }
});
}


//FeedBackLog書き出し
function FeedBackLog(jsonstr){
  var obj = JSON.parse(jsonstr);
	var objNum = Object.keys(obj).length;
	for(var i = 0 ;  i < objNum ; i++){
		var queryString = obj[i]["queryString"];
		var docTitle = obj[i]["examples"]["title"];
		var docId = obj[i]["examples"]["document_id"];
		var relevanceScore = obj[i]["examples"]["relevance"];
		//insert log into cloudantDB
		feedbackdb.insert({"queryString":queryString,"title":docTitle,"document_id":docId,"relevance":relevanceScore}, function (er, result) {
	    if (er) {
	        console.log("DB Access Error!!!");
	    } else {
	        console.log("Write Success Result: %s", JSON.stringify(result));
	    }
	  });
	}
}


// Bootstrap application settings
app.use( express.static( './public' ) ); // load UI from public folder


module.exports = app;
