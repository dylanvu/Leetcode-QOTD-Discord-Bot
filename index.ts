// use import to pull in code from the discord.js package
import Discord from "discord.js";

// import dotenv to load the token from the .env file
import dotenv from "dotenv";

// import express to keep the bot alive via unholy means
import express from "express";


// import useful functions
import { queueDailyQuestion } from "./cron";
import { getAndSendNewProblem } from "./problem";

// run the dotenv package to actually load from the .env file
dotenv.config();

// create a webserver to keep the bot alive
const APP = express();
const PORT: number = 3000;

APP.get('/', (req: any, res: any) => res.send("Giving CPR to Ileen's Dead Server!"));
APP.listen(PORT, () => console.log(`Leetcode Bot doing leetcode at http://localhost:${PORT}`));

// create the discord client object
const client = new Discord.Client({
    // give it a list of intents (aka permissions basically), configure this as needed
    // this list of intents allows the bot to see and send replies to messages
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.MessageContent
    ],
});

// obtain the bot token from the .env file
const BOT_TOKEN = process.env.TOKEN;

// something nice for debugging: when the bot logs in, print out a ready statement to the console
if (!client) {
    throw new Error("Client is undefined!");
}

const dailyChannelId = process.env.DAILY_CHANNEL;
if (!dailyChannelId) {
    throw new Error("Channel ID to send daily leetcode to is missing");
}

client.on("ready", () => {
    if (!client.user) {
        throw new Error("Client.user is undefined!");
    }
    console.log(`Logged in as ${client.user.tag}!`);
    queueDailyQuestion(client, dailyChannelId);
});



// when a "messageCreate" event happens (message is sent in a server where the bot lives in), handle it
client.on("messageCreate", msg => {
    // console.log(msg.channelId);
    if (msg.content === "!lc new") {
        console.log(msg.channelId);
        getAndSendNewProblem(client, msg.channelId);
    }
});

// log into discord to take the bot online
client.login(BOT_TOKEN);