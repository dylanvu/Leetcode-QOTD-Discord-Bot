import { DifficultyOptions } from "../types/types"
/**
 * Define the problem object for a leetcode problem
 */
export interface Problem {
    id: string,
    title: string,
    titleSlug: string,
    difficulty: DifficultyOptions,
    paid: boolean,
    url: string
}

/**
 * Leetcode profile object
 */
export interface Profile {
    easy: number,   // number of easy questions solved
    medium: number, // number of medium questions solved
    hard: number // number of hard questions solved
}

/**
 * Represent the necessary information for ranking a player
 */
interface scoreInformation {
    points: number,
    initialProfile: Profile // the representation of the leetcode profile of the user at the beginning of the specified timeframe. Will be updated and overwritten at the end of each leaderboard period. Is not updated daily, unless the timeframe is daily.
}

export interface Player {
    discordId: string, // discord id of the user
    username: string, // leetcode username
    weekly: scoreInformation, // information about weekly score
    monthly: scoreInformation, // information about monthly score
    // add more fields as needed, like quarterly, yearly, lifetime, etc
}

export interface LeaderboardChannel {
    guildId: string, // the discord server/guild ID
    channelId: string, // the discord channel ID to send the leaderboard updates to
    players: Player[] // an array of users participating in the leaderboard
}

/**
 * Define filtering options for questions
 * @param {DifficultyOptions} difficulty question difficulty.  "Hard" | "Medium" | "Easy"
 * @param {boolean} paid whether the question should be paid or not.
 */
export interface FilterOptions {
    difficulty: DifficultyOptions,
    paid: boolean
}