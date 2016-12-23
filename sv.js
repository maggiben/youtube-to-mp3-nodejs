'use strict';
const acoustid = require("acoustid");
const NodeBrainz = require('nodebrainz');
const Coverart = require('coverart')
// Initialize NodeBrainz
var nodebrainz = new NodeBrainz({userAgent:'my-awesome-app/0.0.1 ( http://my-awesome-app.com )'});
var coverart = new Coverart({userAgent:'my-awesome-app/0.0.1 ( http://my-awesome-app.com )'});

acoustid("musics/audio3.mp3", { key: "7h2L5KuGA2" }, function(err, results) {
    if (err) throw err;
    let artist = results[0].recordings[0].artists[0].name;
    //console.log(JSON.stringify(results,0,2));
    console.log('artist: ', artist)
});

/*nodebrainz.artist('e0140a67-e4d1-4f13-8a01-364355bee46e', {inc:'releases+release-groups+aliases'}, function(err, response){
	console.log(response);
});
*/
coverart.releaseGroup('4dff2c59-0907-4a36-b18b-462a17909d35', function(err, response){
	console.log('cover:', response, err);
});
