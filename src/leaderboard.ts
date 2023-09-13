import Axios from "axios";
import { Profile, LeaderboardChannel, Player } from "../interfaces/interfaces";
import { LeaderboardType, PointsByDifficulty, collectionName } from "../types/types";
import * as cheerio from "cheerio";
import { mongoclient } from "./index";
import { WithId, Document } from "mongodb";

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

function getCollection() {
    return mongoclient.db("Leetcode-QOTD-Discord").collection(collectionName);
}

async function getGuildCursor(guildId: string): Promise<WithId<Document> | null> {
    // query databse for guild
    let collection = getCollection();
    let guildCursor = await collection.findOne({ guildId: guildId });

    return guildCursor;

}

async function getLeetcodeUsernameFromDiscordId(discordId: string, guildId: string): Promise<string | null> {
    // query database for guild
    const guild = await getGuildCursor(guildId);
    if (!guild) {
        // error
        return null;
    }
    // get the player object for the discordId
    // return the leetcode username
    const players: Player[] = guild.players;
    const foundPlayer = players.find((player) => player.discordId === discordId);

    return foundPlayer ? foundPlayer.username : null;
}

/**
 * add a player to the mongoDB collection for the leaderboard
 * @param discordId 
 * @param leetcodeUsername 
 * @returns 
 */
export async function addPlayer(discordId: string, leetcodeUsername: string, guildId: string) {

    // check if leetcode username is valid
    const profile = await getLeetcodeProfile(leetcodeUsername);
    if (!profile) {
        // send message rejecting join request due to error, likely missing?
        return;
    }

    // add player to mongoDB collection
    // query database to see if the guildId already exists

    const guildCursor = await getGuildCursor(guildId);

    // if it exists, add player to the collection
    if (guildCursor) {
        // create new player object
        const newPlayer: Player = {
            discordId: discordId,
            username: leetcodeUsername,
            weekly: {
                points: 0,
                initialProfile: profile
            },
            monthly: {
                points: 0,
                initialProfile: profile
            }
        }

        // now need to update mongoDB

        let collection = getCollection();
        // copy old players
        const prevPlayers: Player[] = guildCursor.players;
        // add the new player
        prevPlayers.push(newPlayer);

        // update mongoDB
        await collection.updateOne({
            guildId: guildId
        }, {
            $set: {
                prev_question: prevPlayers
            }
        });
        console.log(`Successfully added ${leetcodeUsername} to the leaderboard`);
    } else {
        // else, create a new guild object
        console.log(`Could not find guild for id: ${guildId} when adding player ${leetcodeUsername}, creating new guild`);
        // TODO: do me
    }

}

/**
 * remove a player from the leaderboard
 * @param discordId the discord ID of the player
 * @param guildId the id of the discord guild
 */
export async function removePlayer(discordId: string, guildId: string) {
    // query database for guild
    const guild = await getGuildCursor(guildId);
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
export async function calculateScore(discordId: string, guildId: string, leaderboardType: keyof LeaderboardType, leetcodeUsername?: string, profileParam?: Profile): Promise<number | undefined> {

    // get the leetcode username, if it was not passed in as a parameter
    const username = leetcodeUsername ? leetcodeUsername : await getLeetcodeUsernameFromDiscordId(discordId, guildId);

    if (!username) {
        // do nothing
        return undefined;
    }

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