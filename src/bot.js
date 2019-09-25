const Twitter = require("twitter");
const path = require("path");
const config = require("./config.js");
const videoService = require("./services/video-service.js");

let T = new Twitter({
    consumer_key: config.consumer_key,
    consumer_secret: config.consumer_secret,
    access_token_key: config.access_token,
    access_token_secret: config.access_token_secret
});

async function go() {
    video_path = await videoService.downloadVideo("https://www.youtube.com/watch\?v\=d-OrHsG-03I");
    await videoService.overlayVideoWithAudio(video_path, "./assets/good-morning-baltimore.mp3");
};

go();