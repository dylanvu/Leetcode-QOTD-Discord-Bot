import cron from "cron";
import { getAndSendNewProblem } from "./problem";
import Discord from "discord.js";
import { FilterOptions } from "./interfaces";

export const queueDailyQuestion = async (client: Discord.Client, channelId: string, filterOptions?: FilterOptions): Promise<void> => {
    // send at a time specified
    // send at the end of 161: 11:50 AM
    let dailyQuestionJob = new cron.CronJob('0 50 11 * * *', async () => {
        console.log("Cron job triggered")
        getAndSendNewProblem(client, channelId, filterOptions);
    }, null, true, 'America/Los_Angeles');

    // begin cron job
    console.log(`Starting cron job to send questions to channel id ${channelId}`);
    dailyQuestionJob.start();
}

