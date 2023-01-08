import {SlashCommandBuilder} from "@discordjs/builders";
import {CommandInteraction} from "discord.js";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("pong")
    ,

    global: true,

    async execute(interaction: CommandInteraction) {
        await interaction.reply({content: "pong", ephemeral: true});
    }
}