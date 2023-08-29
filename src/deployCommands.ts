/**
 * This file should run once to deploy the slash commands to all guilds the bot is in with the authorized command scope.
 */
import { REST, Routes } from "discord.js";
import fs from "fs";
import path from "path"

import dotenv from "dotenv";

dotenv.config()

const clientID = process.env.CLIENT_ID;
const token = process.env.TOKEN;

if (!clientID) {
    throw new Error("clientid not found");
}

if (!token) {
    throw new Error("token not found");
}

const commandDir = path.join(__dirname, '../commands')

const commands = [];
// Grab all the command files from the commands directory you created earlier
const commandFiles = fs.readdirSync(commandDir).filter(file => file.endsWith('.js'));

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
    const command = require(`${commandDir}/${file}`);
    commands.push(command.data.toJSON());
}

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(token);

// and deploy your commands!
(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // The put method is used to fully refresh all commands in the guild with the current set
        // deploy to all servers (global slash command registration)
        const data = await rest.put(
            Routes.applicationCommands(clientID),
            { body: commands },
        );

        console.log(`Successfully reloaded ${(data as any).length} application (/) commands.`);
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
    }
})();