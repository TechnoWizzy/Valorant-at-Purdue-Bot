import {SlashCommandBuilder} from "@discordjs/builders";
import {ButtonInteraction, ChatInputCommandInteraction} from "discord.js";
import {bot} from "../index";
import Player from "../objects/Player";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("queue")
        .setDescription("General-purpose queue interactions")

        // view - subcommand
        .addSubcommand((command) => command
            .setName('bump')
            .setDescription('Command to bump the queue')
        )

        // join - subcommand
        .addSubcommand((command) => command
            .setName('join')
            .setDescription('Command to join the queue')
        )

        // leave - subcommand
        .addSubcommand((command) => command
            .setName('leave')
            .setDescription('Command to leave the queue')
        ),

    async execute(interaction: ChatInputCommandInteraction | ButtonInteraction): Promise<void> {
        const subcommand = interaction instanceof ChatInputCommandInteraction ? interaction.options.getSubcommand() : interaction.customId;
        const player = await Player.get(interaction.user.id);
        if (!player) {
            await interaction.reply({content: "Use \`/register\` to be able to interact with the ten-mans queue.", ephemeral: true});
            return;
        }
        if (player.banTime > Math.round(Date.now() / 1000)) {
            await interaction.reply({content: `You will be unbanned <t:${player.banTime}:R>`, ephemeral: true});
            return;
        }
        if (subcommand == "bump" || subcommand == "v") {
            await bot.queue.update("Current Queue");
            await interaction.reply({content: "Success", ephemeral: true});
        } else if (subcommand == "join" || subcommand == "v") {
            const response = await bot.queue.join(player);
            if (response) await interaction.reply({content: response, ephemeral: true});
        } else if (subcommand == "leave" || subcommand == "l") {
            const response = await bot.queue.remove(player);
            if (response) await interaction.reply({content: response, ephemeral: true});
        }
    }
}