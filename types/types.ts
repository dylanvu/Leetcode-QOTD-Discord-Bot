import { Collection } from "discord.js"

// difficulty of leetcode problems
export type DifficultyOptions = "Hard" | "Medium" | "Easy"

// types of leaderboards
export type LeaderboardTypes = "weekly" | "monthly"

// an array of LeaderboardType values using a mapped type, meant for the updateScoreJob function
export type LeaderboardTypesIterable = keyof {
    [K in LeaderboardTypes]: K;
}[];

// how much each leetcode question value should be
export enum PointsByDifficulty {
    Easy = 1,
    Medium = 2,
    Hard = 4
}

// collection name of the leaderboard in mongodb
export const collectionName = "Leaderboard";

/**
 * Declare commands because it should exist on the Discord.js client, but does not for some reason
 * https://stackoverflow.com/questions/69500556/discord-js-guide-property-commands-does-not-exist-on-type-clientboolean
 */
declare module "discord.js" {
    export interface Client {
        commands: Collection<unknown, any>
    }
}