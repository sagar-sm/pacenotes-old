var express = require('express');
var async = require('async');
var router = express.Router();

var apn = require('apn');           // Apple Push Notification service module
var DS = require('darksky');   // Darksky API
var distance = require('distance')  // Google Distance Matrix API

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
function sendNotification()

  // identify device token
  var device = new apn.Device(req.body.token);

  // create connection to APN gateway server
  var options = { };
  var apnConnection = new apn.Connection(options);

  var _data = {};

  async.series(darksky.forecast(req.body.lat, req.body.lon, function(err, data){
      if(err) console.log(err);
      _data.weather = data;}),
    distance.get({ origin: 'San Francisco, CA', destination: 'San Diego, CA'}, function(err, data) {
      if (err) return console.log(err);
      _data.traffic = data;
    }), computeNotification(_data));


  res.sendStatus(200);

}

function computeNotification(data) {
  var traffic = data.traffic;
  var weather = data.weather;

  var note = new apn.Notification();

  // do something with the data here and populate note as follows -

  note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
  note.badge = 3;
  note.sound = "something.aiff"; // specify the audio file to be played.
  note.alert = "\uD83D\uDCE7 \u2709 You have a new message";
  note.payload = {'messageFrom': 'Pacenotes'};

  return note;
}


module.exports = router;