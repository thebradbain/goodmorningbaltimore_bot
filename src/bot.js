const config = require("./config.js");

const { TwitterBot } = require("./services/twitter-service.js");

let bot = new TwitterBot(config.twitter);
bot.subscribe();