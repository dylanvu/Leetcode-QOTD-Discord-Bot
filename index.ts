// use import to pull in code from the discord.js package
import Discord from "discord.js";

// import dotenv to load the token from the .env file
import dotenv from "dotenv";
import { sendDailyQuestion } from "./cron";

// run the dotenv package to actually load from the .env file
dotenv.config();

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


client.on("ready", () => {
    if (!client.user) {
        throw new Error("Client.user is undefined!");
    }
    console.log(`Logged in as ${client.user.tag}!`);
});



// when a "messageCreate" event happens (message is sent in a server where the bot lives in), handle it
client.on("messageCreate", msg => {
    // console.log(msg.channelId);
    if (msg.content === "!lc new") {
        sendDailyQuestion(client, msg.channelId);
    }
});

// log into discord to take the bot online
client.login(BOT_TOKEN);