import {SlashCommandBuilder} from "@discordjs/builders";
import {CommandInteraction} from "discord.js";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("pong")
    ,

    async execute(interaction: CommandInteraction) {
        return {content: "pong", ephemeral: true};
    }
}