import cron from "cron";
import { generateNewProblem } from "./problem";
import { sendEmbedToChannel } from "./helper";
import Discord from "discord.js";
import { FilterOptions } from "../interfaces/interfaces";

export const queueDailyQuestion = async (client: Discord.Client, channelId: string, filterOptions?: FilterOptions): Promise<void> => {
    // send at a time specified
    // send at the end of 161: 11:50 AM
    let dailyQuestionJob = new cron.CronJob('0 50 11 * * *', async () => {
        console.log("Cron job triggered")
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
