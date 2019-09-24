import config from "./config.js";
import { Twitter } from "twitter";

let T = new Twitter({
    consumer_key: configuration.consumer_key,
    consumer_secret: configuration.consumer_secret,
    access_token_key: configuration.access_token,
    access_token_secret: configuration.access_token_secret
});


