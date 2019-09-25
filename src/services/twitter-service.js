const { Autohook } = require('twitter-autohook');
const Twitter = require("twit");
const util = require("util");
const request = require("request-promise");
const videoService = require("./video-service.js");

class TwitterBot {
    constructor(credentials) {
        this.webhook = new Autohook({
            token: credentials.access_token,
            token_secret: credentials.access_token_secret,
            consumer_key: credentials.consumer_key,
            consumer_secret: credentials.consumer_secret,
            env: credentials.webhook_env,
        });
        this.client = new Twitter({
            consumer_key: credentials.consumer_key,
            consumer_secret: credentials.consumer_secret,
            access_token: credentials.access_token,
            access_token_secret: credentials.access_token_secret
        });
    }

    async subscribe() {
        try {
            this.webhook.on('event', async event => {
                if(event.tweet_create_events) {
                    await this._onMention(event);
                }
            });

            await this.webhook.removeWebhooks();
            await this.webhook.start();
            await this.webhook.subscribe({
                oauth_token: process.env.TWITTER_ACCESS_TOKEN,
                oauth_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
            });
        } catch (e) {
            console.error(e);
            process.exit(1);
        }
    }

    async _onMention(event) {
        let tweet_data = event.tweet_create_events[0];
        if(!tweet_data) {
            return;
        }
        if(!tweet_data.in_reply_to_screen_name) {
            return;
        }

        let parent_id = tweet_data.id;
        let parent_username = tweet_data.user.screen_name;

        let message = tweet_data.text
        let words = message.split(" ");
        let twitter_url = words[1];

        if(!twitter_url) {
            return;
        }

        // Workaround twitter link shortner/middleman
        try {
            let redirect = await request({uri: twitter_url, resolveWithFullResponse: true});
            let youtube_url = redirect.request.uri.href;
            console.log(youtube_url);

            await this._replyVideo(youtube_url, parent_id, parent_username);
        } catch(e) {
            console.log(e);
        }
    }

    async _replyVideo(video_url, parent_id, parent_username) {
        console.log(`Downloading video from ${video_url}... `);
        let orig = await videoService.downloadVideo(video_url);

        console.log(`Overlaying audio onto video ${orig}... `);
        let result = await videoService.overlayVideoWithAudio(orig, "./assets/good-morning-baltimore.mp3");

        const upload_path = require("path").resolve(require("app-root-path").path, result);
        console.log(`Uploading ${upload_path}...`);

        // Ugly, but whatever for now
        this.client.postMediaChunked({file_path: upload_path}, (err, data, response) => {
            const mediaId = data.media_id_string;

            setTimeout(() => {
                const tweetParams = {
                    status: `Good morning, @${parent_username}!`,
                    in_reply_to_status_id: parent_id,
                    auto_populate_reply_metadata: true,
                    media_ids: [mediaId]
                }

                console.log(`Sending tweet to @${parent_username}`);
                this.client.post('statuses/update', tweetParams);
            }, 20000);
        });
    }
}

exports.TwitterBot = TwitterBot;