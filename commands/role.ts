import {SlashCommandBuilder} from "@discordjs/builders";
import {ChatInputCommandInteraction} from "discord.js";
import {bot} from "../index";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("role")
        .setDescription("role management cmd")

        // add - subcommand
        .addSubcommand((command) => command
            .setName('add')
            .setDescription('Adds and removes roles')
            .addRoleOption((role) => role
                .setName("role")
                .setDescription("role to add")
                .setRequired(true)
            )
            .addUserOption((user) => user
                .setName("target")
                .setDescription("user to modify")
                .setRequired(true)
            )
        )

        // remove - subcommand
        .addSubcommand((command) => command
            .setName('remove')
            .setDescription('Command to remove role')
            .addRoleOption((role) => role
                .setName("role")
                .setDescription("role to remove")
                .setRequired(true)
            )
            .addUserOption((user) => user
                .setName("target")
                .setDescription("user to modify")
                .setRequired(true)
            )
        ),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const subcommand = interaction.options.getSubcommand();
        const role = interaction.options.getRole("role");
        const member = await bot.guild.members.fetch(interaction.options.getUser("target"));

        try {
            if (subcommand == "add") {
                await member.roles.add(role.id);
                await interaction.reply({content: `<@&${role.id}> given to <@!${member.id}>`, ephemeral: true});
            } else {
                await member.roles.remove(role.id);
                await interaction.reply({content: `<@&${role.id}> taken from <@!${member.id}>`, ephemeral: true});
            }
        } catch (error) {
            await interaction.reply({content: "Sorry, that didn't work.", ephemeral: true});
        }
    }
}