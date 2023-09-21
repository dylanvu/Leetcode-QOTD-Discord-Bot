import Axios from "axios";
import { Profile, LeaderboardChannel, Player } from "../interfaces/interfaces";
import { LeaderboardTypes, AllLeaderboardTypes, PointsByDifficulty, collectionName } from "../types/types";
import * as cheerio from "cheerio";
import { mongoclient } from "./index";
import { WithId, Document } from "mongodb";
import Discord from "discord.js"

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

async function createGuild(guildId: string) {
    let collection = getCollection();
    const newGuild: LeaderboardChannel = {
        guildId: guildId,
        channelId: "",
        players: []
    }
    await collection.insertOne(newGuild)
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
export async function addPlayer(msg: Discord.Message<boolean>, discordId: string, leetcodeUsername: string, guildId: string, profileParam?: Profile) {

    // check if leetcode username is valid
    const profile = profileParam ? profileParam : await getLeetcodeProfile(leetcodeUsername);
    if (!profile) {
        // send message rejecting join request due to error, likely missing/incorrect leetcode username?
        console.error(`Could not find leetcode profile for ${leetcodeUsername}, did not add player.`);
        await msg.reply(`Could not find leetcode profile for "${leetcodeUsername}". Are you sure this user exists?`)
        return;
    }

    // query database to see if the guildId already exists

    let guildCursor = await getGuildCursor(guildId);
    const collection = getCollection();

    // if guild does not exist, create it
    if (!guildCursor) {
        console.log(`Could not find guild for id: ${guildId} when adding player ${leetcodeUsername}, creating new guild`);

        await createGuild(guildId);

        // now get the guild cursor again
        guildCursor = await getGuildCursor(guildId);
        if (!guildCursor) {
            // error when creating new guild
            console.error(`Could not create the new guild in mongoDB for guildId ${guildId} while adding player ${leetcodeUsername}`);
            // send message rejecting join request due to error, likely in the backend/bot side
            await msg.reply("There was an error in the bot end when creating the leaderboard. Please contact the developer.");
            return;
        }
    }

    
    // add player to the collection

    // check if player already exists
    const prevPlayers: Player[] = guildCursor.players;
    if (prevPlayers.filter((player) => player.discordId === discordId).length >= 1) {
        // player already exists
        await msg.reply("You've already joined the leaderboard! Remove yourself if you want to add add a different account!");
        return;
    }


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

    // update mongoDB
    await collection.updateOne({
        guildId: guildId
    }, {
        $push: {
            players: newPlayer
        }
    });
    console.log(`Successfully added ${leetcodeUsername} to the leaderboard`);
    await msg.reply("You've joined the leaderboard!");

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
    if (!guild) {
        console.error(`Could not remove player ${discordId} because could not find guild id matching ${guildId}`);
        return;
    }

    // remove player from collection
    // find player
    const players = guild.players;
    if (players.filter((player: Player) => player.discordId === discordId).length < 1) {
        // could not find player
        // send a message saying not found and return
        // TODO: send a discord message
        return;
    }

    // remove player from database
    const collection = getCollection();
    await collection.updateOne({
        guildId: guildId
    }, {
        $pull: {
            players: { discordId: discordId }
        }
    });

    console.log(`Successfully deleted player ${discordId}.`);
    // check if the number of players is empty
    const updatedGuild = await getGuildCursor(guildId);
    if (!updatedGuild) {
        console.error(`Could not find guild id ${guildId} after deleting player ${discordId}`);
    } else if (updatedGuild.players.length) {
        // remove guild from mongodb collection
        await collection.deleteOne({
            guildId: guildId
        })
        console.log(`Deleting ${guildId} from database due to no active players`);
    }
}


/**
 * update mongodb database with the most recent profile of a user for the specified leaderboard type
 * @param leetcodeUsername 
 * @param discordId 
 * @param guildId 
 * @param leaderboardType 
 */
export async function updateProfile(leetcodeUsername: string, discordId: string, guildId: string, leaderboardType: LeaderboardTypes, profileParam?: Profile) {
    // get current profile if it wasn't passed in, to reduce API calls
    const profile = profileParam ? profileParam : await getLeetcodeProfile(leetcodeUsername);
    if (!profile) {
        console.error(`Error getting profile for the updating of the profile for ${leetcodeUsername}`);
    }
    // find out the type

    // update the database with the new profile depending on the leaderboard type
    const collection = getCollection();
    // update the right guild and the right discordId
    await collection.updateOne({
        guildId: guildId,
        "players.playerId": discordId
    }, {
        $set: {
            [`players.$.${leaderboardType}.profile`]: profile
        }
    });
}

/**
 * calculate the new score. does not update in database
 * @param discordId 
 * @param guildId 
 * @param leaderboardType 
 * @param leetcodeUsername 
 * @param profileParam 
 */
export async function calculateScoreDifference(discordId: string, guildId: string, leaderboardType: LeaderboardTypes, leetcodeUsername?: string, profileParam?: Profile): Promise<number | undefined> {

    // get the leetcode username, if it was not passed in as a parameter
    const username = leetcodeUsername ? leetcodeUsername : await getLeetcodeUsernameFromDiscordId(discordId, guildId);

    if (!username) {
        // do nothing
        return undefined;
    }

    // get the current profile, if it wasn't passed in
    const profile = profileParam ? profileParam : await getLeetcodeProfile(username);

    if (!profile) {
        // could not get profile
        console.error(`Could not get profile while calculating score for ${username}`);
        return;
    }

    // get the old profile of the player
    const guild = await getGuildCursor(guildId);
    if (!guild) {
        console.error(`Could not get guild cursor while calculating score for guild ${guildId}`)
        return;
    }
    const players: Player[] = guild.players;
    const player = players.find((player) => player.discordId === discordId);
    if (!player) {
        console.error(`Could not get player ${discordId} data from guild ${guildId}`);
        return;
    }

    const oldProfile = player[leaderboardType].initialProfile;

    // calculate the new score by finding the difference between the old profile, the current profile, and the point difficulty
    const oldProfileScore = calculateScore(oldProfile);
    if (oldProfileScore === undefined) {
        console.error(`Error while calculating old profile score of ${discordId} in guild ${guildId}`);
    }

    const newProfileScore = calculateScore(profile);
    if (newProfileScore === undefined) {
        console.error(`Error while calculating new profile score of ${discordId} in guild ${guildId}`);
    }

    if (oldProfileScore === undefined || newProfileScore === undefined) {
        return;
    }

    // return the player's score
    return newProfileScore - oldProfileScore;
}

function calculateScore(profile: Profile): number {
    return profile.easy * PointsByDifficulty.Easy + profile.medium * PointsByDifficulty.Medium + profile.hard * PointsByDifficulty.Hard;
}

/**
 * function that the cron job runs to update the leaderboard every day. does not update the profile
 * @param guildId string representing the discord guild ID
 * @returns 
 */
export async function updateScoreJob(guildId: string) {
    const collection = getCollection();
    // grab all the players for the guild
    const guild = await getGuildCursor(guildId);
    if (!guild) {
        console.error(`Could not get guild cursor for guild ${guildId} when running score job update`)
        return;
    }
    // for each player
    await guild.players.forEach(async (player: Player) => {
        // for each specific leaderboard type:
        for (const type of AllLeaderboardTypes) {
            // calculate new scores based on the initial profile, and the current profile
            const newScore = await calculateScoreDifference(player.discordId, guildId, type, player.username, player[type].initialProfile);
            if (newScore === undefined) {
                console.error(`Could not get score difference for player ${player.discordId} (${player.username}) for "${type}" leaderboard`)
                continue;
            }
            // update the score for the player
            player[type].points = newScore;
        }
    });

    // update score in the database
    await collection.updateOne({
        guildId: guildId
    }, {
        $set: {
            players: guild.players
        }
    });

    console.log("Successfully updated scores");
}

// function to display the current leaderboard in an embed message
export async function displayLeaderboard(msg: Discord.Message<boolean>, guildId: string) {

}