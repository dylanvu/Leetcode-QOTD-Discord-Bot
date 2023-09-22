import cron from "cron";
import { generateNewProblem } from "./problem";
import { sendEmbedToChannel } from "./helper";
import Discord from "discord.js";
import { FilterOptions } from "../interfaces/interfaces";
import { updateScores, getCollection } from "./leaderboard";

export const queueDailyQuestion = async (client: Discord.Client, channelId: string, filterOptions?: FilterOptions): Promise<void> => {
    // send at a time specified
    // send at the end of 161: 11:50 AM
    let dailyQuestionJob = new cron.CronJob('0 50 11 * * *', async () => {
        console.log("Daily question job triggered")
        const embed = filterOptions ? await generateNewProblem(filterOptions) : await generateNewProblem();
        if (embed) {
            await sendEmbedToChannel(client, channelId, embed);
        } else {
            console.error("Could not send new question via cron because the generated question was undefined");
        }
    }, null, true, 'America/Los_Angeles');

    // begin cron job
    console.log(`Starting cron job to send questions to channel id ${channelId}`);
    dailyQuestionJob.start();
}

export function queueScoreUpdates() {
    const collection = getCollection();

    // define the job now
    let scoreUpdateJob = new cron.CronJob('0 59 23 * * *', async () => {
        
        console.log("score update job triggered");
        
        // get all guilds
        const allGuilds = collection.find();
        // for every guild in the database
        while (await allGuilds.hasNext()) {
            const guild = await allGuilds.next();
            if (!guild) {
                continue;
            }
            const guildId = guild.guildId;
            // update the score
            await updateScores(guildId);
        }

    }, null, true, 'America/Los_Angeles');

    console.log(`Starting cron job to send update scores each day`);
    scoreUpdateJob.start();
}