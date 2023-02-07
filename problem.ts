// import axios for API calls to the leetcode website
import Axios from "axios";
import { Problem, FilterOptions } from "./interfaces";
import { getRandomInt } from "./util";
import Discord from "discord.js";

const leetcodeApiUrl = "https://leetcode.com/api/problems/all/";
const leetcodeProblemUrlBase = "https://leetcode.com/problems/";

// icons for the embed message
const thumbnailIcon = "https://leetcode.com/static/images/LeetCode_logo_rvs.png";
const githubLogo = "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png";

/**
 * API call to get all questions, no filtering
 * @returns 
 */
export async function getAllProblems(): Promise<Problem[]> {
    // make api request for problems
    const res = await Axios.get(leetcodeApiUrl);

    const allProblems = res.data.stat_status_pairs;

    // parse through all problems and create a list
    // TODO: create interface for problem
    return allProblems.map((problem: any): Problem => {
        const stat = problem.stat;
        const id = stat.question_id;
        const title = stat.question__title;
        const slug = stat.question__title_slug;
        const url = `${leetcodeProblemUrlBase}${slug}/`; // ex: https://leetcode.com/problems/two-sum/
        const difficulty: number = problem.difficulty.level;
        const paid = problem.paid_only;

        const strDifficulty = difficulty === 3 ? 'Hard' : difficulty === 2 ? 'Medium' : 'Easy';

        // create the object
        return {
            id: id,
            title: title,
            url: url,
            titleSlug: slug,
            difficulty: strDifficulty,
            paid: paid
        }
    });
}

export async function getAndSendNewProblem(client: Discord.Client, channelId: string, filterOptions?: FilterOptions) {
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
        console.error("no valid problem");
        return;
    }
    // generate a random number
    const randInt = getRandomInt(filtered.length - 1);
    // get problem
    const today = filtered.at(randInt);
    if (!today) {
        // TODO: generate an error embed
        console.error("error finding random problem");
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
}