import Discord from "discord.js"

/**
 * Send an embed to a specific channel
 * @param client Discord.js client
 * @param channelId id to send the message to
 * @param embed embed contents
 */
export async function sendEmbedToChannel(client: Discord.Client, channelId: string, embed: Discord.EmbedBuilder) {
    // send message
    const channel = client.channels.cache.get(channelId) as Discord.TextChannel;
    if (channel) {
        await channel.send({ embeds: [embed] });
    } else {
        console.error(`Could not find channel associated with id ${channelId}`);
    }
}