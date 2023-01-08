import {SlashCommandBuilder} from "@discordjs/builders";
import {CommandInteraction} from "discord.js";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("flip")
        .setDescription("Flip a coin for heads or tails")
    ,

    async execute(interaction: CommandInteraction): Promise<void> {
        const random = Math.random();
        const message = random > 0.5 ? `Heads` : `Tails`;
        await interaction.reply({content: message});
    }
}