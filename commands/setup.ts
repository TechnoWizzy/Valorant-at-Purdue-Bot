import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    Colors,
    EmbedBuilder,
    MessageReplyOptions,
} from "discord.js"
import {SlashCommandBuilder} from "@discordjs/builders"
import * as config from "../config.json";
import {bot} from "../index";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setup")
        .setDescription("Creates a various-purpose menu.")
        .addStringOption(option => option
            .setName("menu_name")
            .setDescription("The name of the menu to setup")
            .setRequired(true)
            .setChoices(
                {name: "verification", value: "verification_menu"},
                {name: "welcome", value: "welcome_menu"},
                {name: "roles", value: "roles_menu"},
                {name: "ranks", value: "ranks_menu"},
                {name: "tournament", value: "tournament_menu"}
            )
        ),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        let menu_name = interaction.options.getString("menu_name");
        switch(menu_name) {
            case "verification_menu": await interaction.channel.send(buildVerificationMenu()); break;
            case "ranks_menu": await interaction.channel.send(buildRanksMenu()); break;
            case "roles_menu": await interaction.channel.send(buildRolesMenu()); break;
            case "welcome_menu": await interaction.channel.send(buildWelcomeMenu()); break;
            case "tournament_menu": await interaction.channel.send(buildTournamentMenu()); break;
        }
        await interaction.reply({content: "Success", ephemeral: true});
    }
}

function buildTournamentMenu(): MessageReplyOptions {
    const embed = new EmbedBuilder()
        .setColor(Colors.Gold)
        .setTitle("A Valorant At Purdue Tournament")
        .setDescription("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris diam dui, sagittis accumsan tellus non, rutrum venenatis diam. Quisque iaculis pellentesque dapibus. Mauris at sagittis elit. Integer ornare justo dolor.\nSign up now with the button below!")

    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(config.roles.tournament)
                .setLabel("Sign Up")
                .setStyle(ButtonStyle.Success)
                .setEmoji(config.emotes.logo)
        );

    return {embeds: [embed], components: [row]};
}

function buildVerificationMenu(): MessageReplyOptions {
    let embed = new EmbedBuilder()
        .setTitle("Student Email Verification")
        .setColor("#2f3136")
        .setDescription(
            "**How to authenticate yourself as a Purdue Student!**\n" +
            "1. Click the **Purdue Button** to have a verification email sent to you.\n" +
            "2. Click the link within the verification email.\n"
        );

    let row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(config.roles.purdue)
                .setLabel("Purdue")
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(config.emotes.purdue),
        );
    return ({embeds: [embed], components: [row]});
}

function buildRanksMenu(): MessageReplyOptions {
    let embed = new EmbedBuilder()
        .setTitle("Valorant Ranked Roles")
        .setColor("#2f3136")
        .setDescription("");

    let iron = new ButtonBuilder().setCustomId(config.roles.ranks.iron).setStyle(ButtonStyle.Secondary).setEmoji(config.emotes.ranks.iron);
    let bronze = new ButtonBuilder().setCustomId(config.roles.ranks.bronze).setStyle(ButtonStyle.Secondary).setEmoji(config.emotes.ranks.bronze);
    let silver = new ButtonBuilder().setCustomId(config.roles.ranks.silver).setStyle(ButtonStyle.Secondary).setEmoji(config.emotes.ranks.silver);
    let gold = new ButtonBuilder().setCustomId(config.roles.ranks.gold).setStyle(ButtonStyle.Secondary).setEmoji(config.emotes.ranks.gold);
    let platinum = new ButtonBuilder().setCustomId(config.roles.ranks.platinum).setStyle(ButtonStyle.Secondary).setEmoji(config.emotes.ranks.platinum);
    let diamond = new ButtonBuilder().setCustomId(config.roles.ranks.diamond).setStyle(ButtonStyle.Secondary).setEmoji(config.emotes.ranks.diamond);
    let ascendant = new ButtonBuilder().setCustomId(config.roles.ranks.ascendant).setStyle(ButtonStyle.Secondary).setEmoji(config.emotes.ranks.ascendant);
    let immortal = new ButtonBuilder().setCustomId(config.roles.ranks.immortal).setStyle(ButtonStyle.Secondary).setEmoji(config.emotes.ranks.immortal);
    let radiant = new ButtonBuilder().setCustomId(config.roles.ranks.radiant).setStyle(ButtonStyle.Secondary).setEmoji(config.emotes.ranks.radiant);

    let row = new ActionRowBuilder<ButtonBuilder>().addComponents(iron, bronze, silver);
    let row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(gold, platinum, diamond);
    let row3 = new ActionRowBuilder<ButtonBuilder>().addComponents(ascendant, immortal, radiant);

    return ({embeds: [embed], components: [row, row2, row3]});
}

function buildRolesMenu(): MessageReplyOptions {
    let embed = new EmbedBuilder()
        .setTitle("Miscellaneous Roles")
        .setColor("#2f3136")
        .setDescription("" +
            "• **Purdue** - React if you are an alumnus, student, or incoming freshman.\n" +
            "• **PUGS** - React if you are interested in PUGs (pick up games).\n" +
            "• **10mans** - React to receive access 10mans channels and notifications.");

    let purdue = new ButtonBuilder().setLabel("Purdue").setCustomId(config.roles.purdue).setStyle(ButtonStyle.Secondary).setEmoji(config.emotes.purdue);
    let pugs = new ButtonBuilder().setLabel("PUGs").setCustomId(config.roles.pugs).setStyle(ButtonStyle.Secondary).setEmoji(config.emotes.pugs);
    let tenmans = new ButtonBuilder().setLabel("10mans").setCustomId(config.roles.tenmans).setStyle(ButtonStyle.Secondary).setEmoji(config.emotes.tenmans);

    let row = new ActionRowBuilder<ButtonBuilder>().addComponents(purdue, pugs, tenmans);

    return ({embeds: [embed], components: [row]});
}

function buildWelcomeMenu(): MessageReplyOptions {
    let row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(config.roles.valorant)
                .setLabel(`Access ${bot.guild.name}!`)
                .setStyle(ButtonStyle.Success)
                .setEmoji(config.emotes.logo)
        )
    return ({components: [row]});
}
