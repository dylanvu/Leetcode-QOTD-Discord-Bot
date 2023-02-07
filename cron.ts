// import cron from "cron";
import { getAllProblems } from "./problem";
import { getRandomInt } from "./util";
import Discord from "discord.js";
import { FilterOptions, Problem } from "./interfaces";

const thumbnailIcon = "https://leetcode.com/static/images/LeetCode_logo_rvs.png";
const githubLogo = "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"

export const sendDailyQuestion = async (client: Discord.Client, channelId: string, filterOptions?: FilterOptions): Promise<void> => {
    // let dailyQuestionJob = new cron.CronJob('0 59 23 * * *', async () => {
    console.log("Sending a new problem");
    // make the api call
    const problems = await getAllProblems();
    let filtered: Problem[] = [];

    // default filtering options
    if (!filterOptions) {
        // filter out only free problems
        filtered = problems.filter((problem) => {
            return !problem.paid;
        });
    } else {
        // filter based on inputted options
        filtered = problems.filter((problem) => {
            return problem.difficulty === filterOptions.difficulty && problem.paid === filterOptions.paid;
        })
    }
    if (filtered.length === 0) {
        // TODO: send a "no valid problem found" embed
        return;
    }
    // generate a random number
    const randInt = getRandomInt(filtered.length - 1);
    // get problem
    const today = filtered.at(randInt);
    if (!today) {
        // TODO: generate an error embed
        return;
    } else {
        // format embedded question
        // Generate initial embed
        let embed: Discord.EmbedBuilder = new Discord.EmbedBuilder()
            .setColor('#fcc34a') // leetcode orange
            .setTitle("Leetcode Question of the Day")
            .addFields({
                name: "Problem", value: today.title
            }, {
                name: "Difficulty", value: today.difficulty
            }, {
                name: "Link", value: today.url
            })
            .setThumbnail(thumbnailIcon)
            .setFooter({ text: 'Wondering how I work? https://github.com/vu-dylan/Leetcode-QOTD-Discord-Bot', iconURL: githubLogo });
        // send message
        const channel = client.channels.cache.get(channelId) as Discord.TextChannel;
        if (channel) {
            channel.send({ embeds: [embed] });
        } else {
            console.error(`Could not find channel associated with id ${channelId}`);
        }
    }
    // });

    // dailyQuestionJob.start();

}

