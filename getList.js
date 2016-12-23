const googleapis = require("googleapis")
const bluebird = require( 'bluebird' );
const async = require('async');

//var youtube = googleapis.youtube('v3');

function getVideo(id) {
    let part = 'id,snippet,contentDetails,player,recordingDetails,statistics,status,topicDetails';
    let youtube = googleapis.youtube('v3');
    let options = {
        auth: 'AIzaSyAPBCwcnohnbPXScEiVMRM4jYWc43p_CZU',
        id: id,
        part: part
    };

    return bluebird.promisify(youtube.videos.list)(options)
    .catch(function(err) {
      console.log('An error occured while running upload command: '.red + err.message);
      throw err;
    });

    /*
    return youtube.videos.list({
        auth: 'AIzaSyAPBCwcnohnbPXScEiVMRM4jYWc43p_CZU',
        id: id,
        part: part
    }).then(function (err, user) {
        //console.log('Result: ' + (err ? err.message : user));
        console.log(JSON.stringify(user, null, 2))
    })*/

    /*return youtube.videos.list({
        auth: 'AIzaSyAPBCwcnohnbPXScEiVMRM4jYWc43p_CZU',
        id: id,
        part: part
    }, function (err, user) {
        //console.log('Result: ' + (err ? err.message : user));
        console.log(JSON.stringify(user, null, 2))
    })*/
}

/*getVideo('12CeaxLiMgE').then(function(response) {
    console.log(JSON.stringify(response, null, 2))
})*/

class Youtube {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.googleapis = require("googleapis");
        this.bluebird = require( 'bluebird' );
        this.youtube = this.googleapis.youtube('v3');
    }

    getVideo(id) {
        let part = 'id,snippet,contentDetails,player,recordingDetails,statistics,status,topicDetails';
        let options = {
            auth: this.apiKey,
            id: id,
            part: part
        };
        return this.bluebird.promisify(this.youtube.videos.list)(options)
        .catch(function(err) {
          console.log('An error occured while running upload command: '.red + err.message);
          throw err;
        });
    }
    getPlayListItems(playlistId) {
        let part = 'id,snippet,contentDetails,status';
        let options = {
            auth: this.apiKey,
            playlistId: playlistId,
            part: part,
            maxResults: 50,
            pageToken: null
        };
        let items = [];
        let nextPageToken = true;
        async.doWhilst(callback => {
            return this.bluebird.promisify(this.youtube.playlistItems.list)(options)
            .then(list => callback(null, list))
            .catch(function(err) {
              console.log('An error occured while running upload command: '.red + err.message);
              throw err;
            });
        }, function (list, callback) {
            items = items.concat(list.items);
            options.pageToken = list.nextPageToken;
            console.log(options.pageToken, list.items.length)
            return list.nextPageToken;
        }, function (error, result) {
            console.log(JSON.stringify(items, 0, 2))
        });
        /*
        return this.bluebird.promisify(this.youtube.playlistItems.list)(options)
        .catch(function(err) {
          console.log('An error occured while running upload command: '.red + err.message);
          throw err;
        });
        */
    }
}

//googleapis.client.setApiKey('AIzaSyB64sBmL-y8utR_BSHZEaM9KKRYchuEV80');
//var youtube = googleapis.youtube('v3');

var youtube = new Youtube('AIzaSyAPBCwcnohnbPXScEiVMRM4jYWc43p_CZU');

//youtube.getVideo('12CeaxLiMgE').then(console.log).catch(console.log)
youtube.getPlayListItems('PLCD0445C57F2B7F41')//.then(list => console.log(JSON.stringify(list.items.length,0,2))).catch(console.log)
















