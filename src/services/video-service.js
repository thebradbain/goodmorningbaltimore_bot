const util = require("util");
const url = require("url");
const path = require("path");
const exec = util.promisify(require("child_process").exec);
const ffmpeg = require("@ffmpeg-installer/ffmpeg");

exports.downloadVideo = async function downloadVideo(video_url) {
    video_id = url.parse(video_url, true).query["v"];
    output_path = `./tmp/${video_id}.mp4`;
    const yt_command = `./bin/youtube-dl -o ${output_path} ${video_url}`;

    const { stdout, stderr } = await exec(`${yt_command}`);

    if(stderr) {
        throw `Unable to download video: ${stderr}`;
    }

    return output_path;
}

exports.overlayVideoWithAudio = async function overlayVideoWithAudio(video_path, audio_path) {
    output_path_params = path.parse(video_path);
    output_path_params.base = `good-morning-${output_path_params.base}`;
    output_path = path.format(output_path_params);

    const ff_command = `${ffmpeg.path} \\
        -i ${video_path} -i ${audio_path} \\
        -c:v copy -map 0:v:0 -map 1:a:0 \\
        -t 140 \\
        -shortest \\
        -y ${output_path}`;
    const { stdout, stderr } = await exec(`${ff_command}`);

    if(stderr) {
        throw `Unable to overlay video with audio: ${stderr}`;
    }

    return output_path;
}

