var express = require('express');
var async = require('async');
var router = express.Router();

var apn = require('apn');           // Apple Push Notification service module
var DS = require('darksky');   // Darksky API
var distance = require('google-distance')  // Google Distance Matrix API

//setup darksky
var darksky = new DS.Client("api_key"); 

//setup google distance matrix
distance.apiKey = "api_key";
distance.businessClientKey = 'CLIENT_KEY';
distance.businessSignatureKey = 'SIGNATURE_KEY';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Pacenotes' });
});


//schedule this function to execute for every user at his/her desired time
function getData(user){

  // create connection to APN gateway server
  var options = { };
  var apnConnection = new apn.Connection(options);

  var _data = {};

  //simplify code
  async.parallel([
    function(callback) {
      darksky.forecast(user.location.lat, user.location.lon, function(err, data){
        if(err) callback(err);
        _data.weather = data;
        callback();
      });
    },
    function(callback){
      distance.get({ origin: 'San Francisco, CA', destination: 'San Diego, CA'}, function(err, data) {
        if (err) return callback(err);
        _data.traffic = data;
        callback();
      });
    }], computeNotification(user, _data));


  res.sendStatus(200);

}

//compute and send notification
function computeNotification(user, data) {
  var traffic = data.traffic;
  var weather = data.weather;

  // identify device token
  var myDevice = new apn.Device(user.token);
  var note = new apn.Notification();

  // do something with the data here, check whether notification is in order and populate note as follows -

  note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
  note.badge = 3;
  note.sound = "something.aiff"; // specify the audio file to be played.
  note.alert = "\uD83D\uDCE7 \u2709 You have a new message";
  note.payload = {'messageFrom': 'Pacenotes'};

  apnConnection.pushNotification(note, myDevice);
}


module.exports = router;