import {SlashCommandBuilder} from "@discordjs/builders";
import {
    BaseGuildVoiceChannel,
    ChatInputCommandInteraction,
    GuildMember,
} from "discord.js";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("moveme")
        .setDescription("moves me")
        .addChannelOption((channel) => channel
            .setName("channel")
            .setDescription("where i go")
            .setRequired(true)
        )
    ,

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        if (interaction.user.id != "751910711218667562") {
            await interaction.reply({content: "Not for you", ephemeral: true});
            return;
        }

        const channel = interaction.options.getChannel("channel");

        if (!(channel instanceof BaseGuildVoiceChannel)) {
            await interaction.reply({content: "Invalid Channel", ephemeral: true});
            return;
        }

        await (interaction.member as GuildMember).voice.setChannel(channel);
        await interaction.reply({content: "You have been moved", ephemeral: true});
    }
}