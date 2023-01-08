import {
    ButtonInteraction,
    ChatInputCommandInteraction,
    GuildMember,
    GuildMemberRoleManager
} from "discord.js";
import {SlashCommandBuilder} from "@discordjs/builders";
import * as blacklist from "../blacklist.json";
import * as config from "../config.json";
import Player from "../objects/Player";
import {bot} from "../index";

const censoredWords = blacklist.list.split(" ");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("register")
        .setDescription("Registers a new player for the PUPL")
        .addStringOption((option) => option
            .setName("username")
            .setDescription("Your preferred username")
            .setRequired(false)
        ),

    async execute(interaction: ChatInputCommandInteraction | ButtonInteraction): Promise<void> {
        const player = await Player.get(interaction.user.id);
        if (player) {
            await (interaction.member as GuildMember).roles.add(config.roles.tenmans);
            await interaction.reply({content: "You are already registered", ephemeral: true});
            return;
        }
        const username = (interaction instanceof ChatInputCommandInteraction) ? interaction.options.getString("username") : interaction.user.username;
        if (!isValidUsername(username)) {
            await interaction.reply({content: `The username, \`${username}\`, is invalid. Try using /register with a different username.`});
            return;
        }
        if (username.length > 18 || username.length < 2) {
            await interaction.reply({content: `Your username must be 3-16 characters long.`, ephemeral: true});
            return;
        }
        await Player.post(new Player(interaction.user.id, username));
        await (interaction.member.roles as GuildMemberRoleManager).add(config.roles.tenmans);
        await bot.database.updateRankings();
        await interaction.reply({content: `You have been registered as \`${username}\``, ephemeral: true});
    }
}

function isValidUsername(username: String): boolean {
    for (const word of censoredWords) if (username.toLowerCase().includes(word)) return false;
    let usernameFilter = new RegExp(/^[a-zA-Z0-9]([._-](?![._-])|[a-zA-Z0-9]){1,18}[a-zA-Z0-9]$/);
    let filteredUsername = username.toLowerCase().match(usernameFilter);
    return !!filteredUsername;
}