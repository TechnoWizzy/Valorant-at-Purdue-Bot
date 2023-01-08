import {SlashCommandBuilder} from "@discordjs/builders";
import {ChatInputCommandInteraction, GuildMember} from "discord.js";
import Player from "../objects/Player";
import * as blacklist from "../blacklist.json";
import ProfileImage from "../objects/images/Profile.Image";
import {bot} from "../index";

const censoredWords = blacklist.list.split(" ");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("profile")
        .setDescription("General-use profile command")

        // info - subcommand
        .addSubcommand((command) => command
            .setName('info')
            .setDescription('Command to view a profile')
            .addMentionableOption((mentionable) => mentionable
                .setName('target')
                .setDescription('The profile to view')
            )
        )
        // set-name - subcommand
        .addSubcommand((command) => command
            .setName('set-name')
            .setDescription('Command to change your name')
            .addStringOption((string) => string
                .setName('username')
                .setDescription('Your new username')
                .setRequired(true)
            )
        )
    ,

    async execute(interaction: ChatInputCommandInteraction) {

        const subcommand = interaction.options.getSubcommand();

        if (subcommand == "info") {

            await interaction.deferReply();
            await bot.database.updateRankings();
            const mentionable = interaction.options.getMentionable('target') as GuildMember;
            const player = mentionable ? await Player.get(mentionable.id) : await Player.get(interaction.user.id);
            if (!player) return interaction.editReply({content: "This player is not registered."});
            const file = await ProfileImage.build(player);
            await interaction.editReply({files: [file]});

        } else if (subcommand == "set-name") {

            const username = interaction.options.getString("username");
            const player = (await Player.get(interaction.user.id)) as Player;
            if (!player) return interaction.reply({content: "This player is not registered.", ephemeral: true});
            if (!isValidUsername(username)) return interaction.reply({content: `Sorry, the provided username, \`${username}\`, isn't allowed`, ephemeral: true});
            player.username = username;
            await Player.put(player);
            await interaction.reply({content: `Success! You have changed your username to \`${username}\``});

        }
    }
}

function isValidUsername(username: String): boolean {
    for (const word of censoredWords) if (username.toLowerCase().includes(word)) return false;
    let usernameFilter = new RegExp(/^[a-zA-Z0-9]([._-](?![._-])|[a-zA-Z0-9]){1,18}[a-zA-Z0-9]$/);
    let filteredUsername = username.toLowerCase().match(usernameFilter);
    return !!filteredUsername;
}