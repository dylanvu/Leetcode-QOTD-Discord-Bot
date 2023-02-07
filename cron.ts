import cron from "cron";
import { getAndSendNewProblem } from "./problem";
import Discord from "discord.js";
import { FilterOptions } from "./interfaces";

export const queueDailyQuestion = async (client: Discord.Client, channelId: string, filterOptions?: FilterOptions): Promise<void> => {
    // send at 8 AM every day
    let dailyQuestionJob = new cron.CronJob('0 0 8 * * *', async () => {
        getAndSendNewProblem(client, channelId, filterOptions);
    });

    // begin cron job
    dailyQuestionJob.start();

}

