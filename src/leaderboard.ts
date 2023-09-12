import Axios from "axios";
import { Profile, LeaderboardChannel } from "../interfaces/interfaces";
import { LeaderboardType, PointsByDifficulty } from "../types/types";
import * as cheerio from "cheerio";
import { mongoclient } from "./index";

/**
 * scrape the leetcoder profile information to obtain number of solved problems of each difficulty
 * @param leetcodeUsername leetcode username to scrape
 * @returns 
 */
export async function getLeetcodeProfile(leetcodeUsername: string): Promise<Profile | null> {
    // make api request for problems
    let res;
    try {
        res = await Axios.get(`https://leetcode.com/${leetcodeUsername}`);
    } catch (error) {
        if (Axios.isAxiosError(error)) {
            const jsonError: any = error.toJSON();
            if (jsonError.status === 404) {
                console.error(`Could not find leetcode profile for ${leetcodeUsername}`);
            }
        }
        return null;
    }

    // parse the html now
    let profileObject = {
        easy: 0,
        medium: 0,
        hard: 0
    }
    const $ = cheerio.load(res.data);

    // get all the rows of the table that has difficulty, number completed, and beats %
    // example: Easy    20/711  Beats 51.9 %
    const problemFlextable = $('div[class="flex w-full items-end text-xs"]');
    for (const problem of problemFlextable) {
        // this kind of helped: https://blog.callumsteele.com/scraping-web-page-with-nodejs-and-cheerio/
        // https://cheerio.js.org/docs/basics/selecting
        const $difficulty = cheerio.load(problem)
        // get the difficulty by querying the div that has the right class
        const difficultySelector = $difficulty('div[class="w-[53px] text-label-3 dark:text-dark-label-3"]');
        const difficulty = cheerio.load(difficultySelector[0]).text();

        // query the span to get the number completed
        const completedSelector = $difficulty('span[class="mr-[5px] text-base font-medium leading-[20px] text-label-1 dark:text-dark-label-1"]');
        const completed = cheerio.load(completedSelector[0]).text();
        const completedInt = parseInt(completed);

        switch (difficulty.toLowerCase()) {
            case "easy":
                profileObject.easy = completedInt;
                break;
            case "medium":
                profileObject.medium = completedInt;
                break;
            case "hard":
                profileObject.hard = completedInt;
                break;
        }
    }
    console.log(profileObject);
    return profileObject;
}

async function getGuild(guildId: string): Promise<LeaderboardChannel | null> {
    // query databse for guild
}

async function getLeetcodeUsernameFromDiscordId(discordId: string, guildId: string): Promise<string> {
    // query database for guild
    const guild = await getGuild(guildId);
    // get the player object for the discordId
    // return the leetcode username
}

/**
 * add a player to the mongoDB collection for the leaderboard
 * @param discordId 
 * @param leetcodeUsername 
 * @returns 
 */
export async function addPlayer(discordId: string, leetcodeUsername: string) {

    // check if leetcode username is valid
    const profile = await getLeetcodeProfile(leetcodeUsername);
    if (!profile) {
        // send message rejecting join request due to error, likely missing?
        return;
    }

    // add player to mongoDB collection
    
    // query database to see if the guildId already exists

    // if it exists, add player to the collection
    // else, create a new object

}

/**
 * remove a player from the leaderboard
 * @param discordId the discord ID of the player
 * @param guildId the id of the discord guild
 */
export async function removePlayer(discordId: string, guildId: string) {
    // query database for guild
    const guild = await getGuild(guildId);
    // if it does not exist, return

    // remove player from collection
    // check if the number of players is empty
    // if empty, remove guild from mongodb collection
}


/**
 * update mongodb database with the most recent profile
 * @param leetcodeUsername 
 * @param profile 
 * @param leaderboardType 
 */
export async function updateProfile(leetcodeUsername: string, leaderboardType: keyof LeaderboardType) {
    // get current profile
    const profile = await getLeetcodeProfile(leetcodeUsername);
    // update the database with the new profile
}

/**
 * update the player score in the leaderboard database
 * @param discordId 
 * @param guildId 
 * @param leaderboardType 
 */
export async function updateScore(discordId: string, guildId: string, leaderboardType: keyof LeaderboardType) {
    // get the score
    const score = await calculateScore(discordId, guildId, leaderboardType);
    // update the player score in the database

}

/**
 * calculate the new score. does not update in database
 * @param discordId 
 * @param guildId 
 * @param leaderboardType 
 * @param leetcodeUsername 
 * @param profileParam 
 */
export async function calculateScore(discordId: string, guildId: string, leaderboardType: keyof LeaderboardType, leetcodeUsername?: string, profileParam?: Profile): Promise<number> {

    // get the leetcode username, if it was not passed in as a parameter
    const username = leetcodeUsername ? leetcodeUsername : await getLeetcodeUsernameFromDiscordId(discordId, guildId);

    // get the current profile, if it wasn't passed in
    const profile = profileParam ? profileParam : getLeetcodeProfile(username);

    // get the old profile of the player
    // calculate the new score by finding the difference between the old profile, the current profile, and the point difficulty
    // return the player's score
}

export async function updateJob(guildId: string, leaderboardType: keyof LeaderboardType) {
    // grab all the players for the guild
    // for each player
        // for the specific leaderboard type:
        // calculate new scores
        // update profile object
}