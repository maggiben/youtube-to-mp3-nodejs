var fs = require('fs');
var ytdl = require('ytdl-core');
var ffmpeg = require("ffmpeg.js");
var ffmpeg_mp4  = require('./node_modules/ffmpeg.js/ffmpeg-mp4.js')
var stdout = "";
var stderr = "";

/*
var url = 'http://www.youtube.com/watch?v=foE1mO2yM04';
ytdl(url, { filter: function(format) { return format.container === 'mp4'; } })
  .pipe(fs.createWriteStream('/data/video.mp4'));
*/

/*
ytdl('http://www.youtube.com/watch?v=foE1mO2yM04')
  .pipe(fs.createWriteStream('./data/video.flv'));
*/


function convert2 () {
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

function convert() {

    ffmpeg({
            // Mount /data inside application to the current directory.
            mounts: [{type: "NODEFS", opts: {root: "."}, mountpoint: "/data"}],
            arguments: ["-i", "/data/video.flv", "-b:a", "192K", "-vn", "/data/out.mp3"],
            stdin: function() {},
    });
}


function addCoverArt(audioFile, coverFile) {
    let audio = new Uint8Array(fs.readFileSync(audioFile));
    let cover = new Uint8Array(fs.readFileSync(coverFile));
    // Encode test video to VP8.
    let result = ffmpeg_mp4({
        MEMFS: [{
            name: audioFile, data: audio
        }, {
            name: coverFile, data: cover
        }],
        //arguments: ["-i", "video.flv", "-b:a", "192K", "-vn", "out.mp3"],
        arguments: ["-i", audioFile, "-i", coverFile, "-map", "0:0", "-map", "1:0", "-c", "copy", "-id3v2_version", "3", "-metadata:s:v", "title='Album cover'", "-metadata:s:v", "comment='Cover (Front)'", "out2.mp3"],
        // Ignore stdin read requests.
        stdin: function() {},
        stdout: function (data) {
            console.log('data: ', data)
        },
        stderr: function(data) {
            //console.log('data: ', String.fromCharCode(data));
        }
    });
    // Write out.webm to disk.
    var out = result.MEMFS[0];
    fs.writeFileSync(out.name, Buffer(out.data));

}

addCoverArt('out.mp3', 'cover.jpg')


//ffmpeg -i in.mp3 -i test.jpg -map 0:0 -map 1:0 -c copy -id3v2_version 3 -metadata:s:v title="Album cover" -metadata:s:v comment="Cover (Front)" out.mp3
