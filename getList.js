const fs = require('fs');
const googleapis = require("googleapis")
const bluebird = require( 'bluebird' );
const async = require('async');

const ytdl = require('ytdl-core');
const ffmpeg_mp4  = require('./node_modules/ffmpeg.js/ffmpeg-mp4.js');
const sanitize = require('sanitize-filename');

const path = require('path')

//var youtube = googleapis.youtube('v3');

//https://www.youtube.com/watch?v=JRfuAukYTKg SUPER !

class Youtube {

    constructor(apiKey) {
        this.apiKey = apiKey;
        this.googleapis = require('googleapis');
        this.bluebird = require('bluebird');
        this.youtube = this.googleapis.youtube('v3');
    }

    getVideos(ids) {
        let part = 'id,snippet,contentDetails,player,recordingDetails,statistics,status,topicDetails';
        let options = {
            auth: this.apiKey,
            id: ids.join(','),
            part: part
        };
        return this.bluebird.promisify(this.youtube.videos.list)(options)
        .catch(function(err) {
          console.log('An error occured while running upload command: '.red + err.message);
          throw err;
        });
    }

    convert (file) {
        var testData = new Uint8Array(fs.readFileSync("./data/video.flv"));
        // Encode test video to VP8.
        var result = ffmpeg_mp4({
          MEMFS: [{name: "video.flv", data: testData}],
          //arguments: ["-i", "video.flv", "-b:a", "192K", "-vn", "out.mp3"],
          arguments: ["-i", "video.flv", "-q:a", "0", "-map", "a", "-stats" ,"out.mp3"],
          // Ignore stdin read requests.
          stdin: function() {},
          stdout: function (data) {
            console.log('data: ', data)
          },
          stderr: function(data) {
            console.log('data: ', String.fromCharCode(data));
          },
        });
        // Write out.webm to disk.
        var out = result.MEMFS[0];
        fs.writeFileSync(out.name, Buffer(out.data));
    }

    downloadVideo (video) {
        let url = `http://www.youtube.com/watch?v=${video.id}`
        let output = path.resolve(`${__dirname}/data`, sanitize(video.snippet.title));
        console.log(`get: ${url} to ${output}`)
        return new Promise(function (resolve, reject) {
            ytdl(url, {
                filter: function(format) { 
                    return format.container === 'mp4'; 
                }
            })
            .pipe(fs.createWriteStream(`./data/${sanitize(video.snippet.title)}`))
            .on('progress', function(progress) {
                process.stdout.cursorTo(0);
                process.stdout.clearLine(1);
                process.stdout.write(progress.timemark);
            })
            .on('finish', resolve)
            .on('error', reject);            
        })

    }

    getWoot() {
        return 'woot';
    }

    getPlayListItems(playlistId) {
        let part = 'id,snippet,contentDetails,status';
        let options = {
            auth: this.apiKey,
            playlistId: playlistId,
            part: part,
            maxResults: 5,
            pageToken: null
        };
        let items = [];
        let nextPageToken = true;
        return new Promise((resolve, reject) => {
            async.doWhilst(callback => {
                return this.bluebird.promisify(this.youtube.playlistItems.list)(options)
                .then(list => callback(null, list))
                .catch(callback);
            }, function (list, callback) {
                items = items.concat(list.items);
                options.pageToken = list.nextPageToken;
                return false;list.nextPageToken;
            }, function (error, result) {
                if(error) {
                    return reject(error);
                } else {
                    return resolve(items)
                }
            });            
        })
    }
}

//googleapis.client.setApiKey('AIzaSyB64sBmL-y8utR_BSHZEaM9KKRYchuEV80');
//var youtube = googleapis.youtube('v3');

var youtube = new Youtube('AIzaSyAPBCwcnohnbPXScEiVMRM4jYWc43p_CZU');

//youtube.getVideo('12CeaxLiMgE').then(console.log).catch(console.log)
youtube.getPlayListItems('PLCD0445C57F2B7F41')
.then(items => {

    let videoIds = items.map(item => item.snippet.resourceId.videoId);
    youtube.getVideos(videoIds).then(videos => {
        console.log(JSON.stringify(videos.items.map(video => `${video.id}, ${video.snippet.title}`), 0, 2))

        youtube.downloadVideo(videos.items[0])
    })
    /*
    var iteratee = items.map(item => youtube.getVideo(item.snippet.resourceId.videoId))
    Promise.all(iteratee).then(videos => {
        console.log(JSON.stringify(videos.map(video => video.snippet.title), 0, 2))
    })
    console.log(JSON.stringify(iteratee,0,2))
    */
    //console.log(JSON.stringify(items.map(x => x.snippet.resourceId.videoId), 0, 2))
})

//.then(list => console.log(JSON.stringify(list.items.length,0,2))).catch(console.log)
















