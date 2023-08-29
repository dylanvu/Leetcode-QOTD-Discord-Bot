// use import to pull in code from the discord.js package
import Discord from "discord.js";

// import dotenv to load the token from the .env file
import dotenv from "dotenv";

// import express to keep the bot alive via unholy means
import express from "express";

// enable the process to exit automatically if we get rate limited
import { exec } from "child_process"


// import useful functions
import { queueDailyQuestion } from "./cron";
import { generateNewProblem } from "./problem";
import { sendEmbedToChannel } from "./helper";

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
        generateNewProblem().then((embed) => {
            embed ? sendEmbedToChannel(client, msg.channelId, embed) : msg.reply("Sorry, there was an error getting a new embed. Please contact Dylan.")
        });
    }
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    console.log(client.commands);
    const command = client.commands.get(interaction.commandName);
    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        command.run();
    }
    catch (e) {
        console.error(e);
    }
});

// 429 is a rate limit
client.on('debug', debug => {
    console.log(debug)
    if (debug.includes("429")) { // 429 is a rate limit, kill replit if it is rate limited
        exec("kill 1");
    }
});

// log into discord to take the bot online
client.login(BOT_TOKEN);