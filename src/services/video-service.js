const util = require("util");
const url = require("url");
const path = require("path");
const uuid = require('uuid/v1');
const exec = util.promisify(require("child_process").exec);
const ffmpeg = require("@ffmpeg-installer/ffmpeg");

exports.downloadVideo = async function downloadVideo(video_url) {
    video_id = url.parse(video_url, true).query["v"];
    output_path = `./tmp/${video_id}.mp4`;
    const yt_command = `./bin/youtube-dl \\
        -f worstvideo[ext=mp4] \\
        -o ${output_path} ${video_url}`;

    try {
        await exec(`${yt_command}`);
    } catch(e) {

    }

    return output_path;
}

exports.overlayVideoWithAudio = async function overlayVideoWithAudio(video_path, audio_path) {
    const output_path = `./tmp/${uuid()}.mp4`

    const ff_command = `${ffmpeg.path} \\
        -i ${video_path} -i ${audio_path} \\
        -c:v copy -map 0:v:0 -map 1:a:0 \\
        -t 140 \\
        -shortest \\
        -y ${output_path}`;

    try {
        await exec(`${ff_command}`);
    } catch(e) {

    }

    return output_path;
}

