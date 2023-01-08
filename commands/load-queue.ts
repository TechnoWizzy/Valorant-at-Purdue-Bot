import {SlashCommandBuilder} from "@discordjs/builders";
import {ChatInputCommandInteraction} from "discord.js";
import Player from "../objects/Player";
import {bot} from "../index";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("load-queue")
        .setDescription("Queue testing command")
    ,

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const  documents = await bot.database.players.find().sort({_rank: 1}).limit(10).toArray();

        for (const document of documents) {
            const player = Player.fromObject(document);
            if (player.username != "Techno") await bot.queue.set(player.id, setTimeout(() => {}, 10000));
        }

        await interaction.reply({content: "Success", ephemeral: true});
    }
}