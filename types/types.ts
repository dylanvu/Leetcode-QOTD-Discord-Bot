import { Collection } from "discord.js"

export type difficultyOptions = "Hard" | "Medium" | "Easy"

/**
 * Declare commands because it should exist on the Discord.js client, but does not for some reason
 * https://stackoverflow.com/questions/69500556/discord-js-guide-property-commands-does-not-exist-on-type-clientboolean
 */
declare module "discord.js" {
    export interface Client {
        commands: Collection<unknown, any>
    }
}