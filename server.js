////////////////////////////////////////////////////////////////////////////////
// Create a node-static server instance to proxy Picasa API requests
////////////////////////////////////////////////////////////////////////////////
var static = require('node-static'),
    express = require('express'),
    request = require('request');

var port = 5555;
var file = new(static.Server)('.'),
    app  = express();

var base = 'http://picasaweb.google.com/data/feed/api/user/';
var suffix = '?alt=json'; // Force JSON format


// Get a list of albums by a user identifier
app.get('/albums', function(req, res) {
   var username = req.query['user'];
   var url = base + username + suffix;
   console.log('URL', url);
   request(url, function(error, response, body) {
      if (!error && response.statusCode == 200) {
         // Reduce the amount of stuff, we only want basic album info
         var result = [];
         var obj = JSON.parse(body);
         obj.feed.entry.forEach(function(entry) {
            var e = {};
            e.title = entry.title.$t;
            e.url   = entry.gphoto$id.$t;
            //e.url   = entry.id.$t;
            result.push(e); 
         });
         res.set('Content-Type', 'application/json');
         res.send(result);
      } else {
         console.log('Oh crap...', error);
      }
   });
});


// Get photos associated with an album url
app.get('/photos', function(req, res) {
   var user  = req.query['user'];
   var album = req.query['album'];

   var url = base + user + '/albumid/' + album + suffix;
   console.log('URL', url);
   request(url, function(error, response, body) {
      if (!error && response.statusCode == 200) {
         // Reduce the amount of stuff, we only want basic album info
         var result = [];
         var obj = JSON.parse(body);
         obj.feed.entry.forEach(function(entry) {
            var e = {};
            e.id = entry.gphoto$id.$t;
            e.link = entry.media$group.media$thumbnail[0].url; // 63x72
            //e.link = entry.media$group.media$thumbnail[1].url; // 126x144
            //e.link = entry.media$group.media$thumbnail[2].url; // 251x288
            result.push(e);
         });
         res.set('Content-Type', 'application/json');
         res.send(result);
      } else {
         console.log('Oh crap...', error);
      }
   });
});



app.get(/\w*/, function(req, res){
    file.serve(req, res);
});



app.listen(port);
console.log('Listening on port',  port, ' Cheers!...');
