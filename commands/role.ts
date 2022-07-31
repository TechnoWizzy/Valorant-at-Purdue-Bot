import {SlashCommandBuilder} from "@discordjs/builders";
import {CommandInteraction} from "discord.js";
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

    async execute(interaction: CommandInteraction) {
        let response;
        let subcommand = interaction.options.getSubcommand();
        let role = interaction.options.getRole("role");
        let member = await bot.guild.members.fetch(interaction.options.getUser("target"));
        try {
            switch(subcommand) {
                case "add":
                    await member.roles.add(role.id);
                    response = {content: `<@&${role.id}> given to <@!${member.id}>`, ephemeral: true};
                    break;
                case "remove":
                    await member.roles.remove(role.id);
                    response = {content: `<@&${role.id}> taken from <@!${member.id}>`, ephemeral: true};
                    break;
                default:
                    response = {content: "Something went very wrong... Please send this to <@!751910711218667562>."};
                    await bot.logger.fatal("Manage Command Failed", new Error("Inaccessible option"));
            }
        } catch(error) {
            await bot.logger.error("Could not execute /role command", error);
            response = {content: `This role can't be applied to <@!${member.id}>.`, ephemeral: true};
        }
        return response;
    }
}