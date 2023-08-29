import Discord from "discord.js";

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("new")
        .setDescription("Get a new (free) Leetcode problem with the specified difficulty")
        .addStringOption(option =>
            option.setName('difficulty')
                .setDescription('The problem difficulty')
                .addChoices(
                    {
                        name: "Easy", value: "Easy"
                    },
                    {
                        name: "Medium", value: "Medium"
                    },
                    {
                        name: "Hard", value: "Hard"
                    }
                )),
    // TODO: figure out the right input type for interaction
    async execute(interaction: any) {
        console.log(interaction);
        await interaction.reply(interaction)
        // const difficulty: difficultyOptions | null = interaction.command as difficultyOptions | null;
        // let filterOptions: FilterOptions | undefined;
        // let embed: Discord.EmbedBuilder | undefined;
        // if (difficulty) {
        //     filterOptions = {
        //         difficulty: difficulty,
        //         paid: false
        //     }
        //     embed = await generateNewProblem(filterOptions);
        // } else {
        //     // no difficulty specified
        //     embed = await generateNewProblem();
        // }
        // if (embed) {
        //     await interaction.reply({ embeds: [embed] })
        // }
    }
}