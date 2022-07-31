import {
    CommandInteraction,
    MessageActionRow,
    MessageButton,
    MessageEmbed,
    MessageSelectMenu
} from "discord.js"
import { SlashCommandBuilder } from "@discordjs/builders"
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
            )
        ),

    async execute(interaction: CommandInteraction) {
        let menu_name = interaction.options.getString("menu_name");
        switch(menu_name) {
            case "verification_menu": return buildVerificationMenu();
            case "ranks_menu": return await buildRanksMenu();
            case "roles_menu": return await buildRolesMenu();
            case "welcome_menu": return buildWelcomeMenu();
            default: return ({content: "Sorry, the specified menu does not exist", ephemeral: true});
        }
    }
}

async function buildVerificationMenu() {
    let embed = new MessageEmbed()
        .setTitle("Purdue Verification Menu")
        .setColor("#f1c40f")
        .setDescription("Indicate your affiliation with Purdue. The Purdue role requires email verification.\n\n" +
            "**How to authenticate yourself as a Purdue Student!**\n" +
            "1. Click the **Purdue Button** to have a unique link sent to your email.\n" +
            "2. Click the **Purdue Button** once you have verified your email address.\n");

    let row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId(config.roles.purdue)
                .setLabel("Purdue")
                .setStyle("SECONDARY")
                .setEmoji(config.emotes.purdue),
        );
    return ({embeds: [embed], components: [row]});
}

async function buildRanksMenu() {
    let embed = new MessageEmbed()
        .setTitle("Valorant Ranked Roles")
        .setColor("#f1c40f")
        .setDescription("");

    let iron = new MessageButton().setCustomId(config.roles.ranks.iron).setStyle("SECONDARY").setEmoji(config.emotes.ranks.iron);
    let bronze = new MessageButton().setCustomId(config.roles.ranks.bronze).setStyle("SECONDARY").setEmoji(config.emotes.ranks.bronze);
    let silver = new MessageButton().setCustomId(config.roles.ranks.silver).setStyle("SECONDARY").setEmoji(config.emotes.ranks.silver);
    let gold = new MessageButton().setCustomId(config.roles.ranks.gold).setStyle("SECONDARY").setEmoji(config.emotes.ranks.gold);
    let platinum = new MessageButton().setCustomId(config.roles.ranks.platinum).setStyle("SECONDARY").setEmoji(config.emotes.ranks.platinum);
    let diamond = new MessageButton().setCustomId(config.roles.ranks.diamond).setStyle("SECONDARY").setEmoji(config.emotes.ranks.diamond);
    let ascendant = new MessageButton().setCustomId(config.roles.ranks.ascendant).setStyle("SECONDARY").setEmoji(config.emotes.ranks.ascendant);
    let immortal = new MessageButton().setCustomId(config.roles.ranks.immortal).setStyle("SECONDARY").setEmoji(config.emotes.ranks.immortal);
    let radiant = new MessageButton().setCustomId(config.roles.ranks.radiant).setStyle("SECONDARY").setEmoji(config.emotes.ranks.radiant);

    let row = new MessageActionRow().addComponents(iron, bronze, silver);
    let row2 = new MessageActionRow().addComponents(gold, platinum, diamond);
    let row3 = new MessageActionRow().addComponents(ascendant, immortal, radiant);

    return ({embeds: [embed], components: [row, row2, row3]});
}

async function buildRolesMenu() {
    let embed = new MessageEmbed()
        .setTitle("Miscellaneous Roles")
        .setColor("#f1c40f")
        .setDescription("" +
            "• **Purdue** - React if you are an alumnus, student, or incoming freshman.\n" +
            "• **PUGS** - React if you are interested in PUGs (pick up games).\n" +
            "• **10mans** - React to receive access 10mans channels and notifications.");

    let purdue = new MessageButton().setLabel("Purdue").setCustomId(config.roles.purdue).setStyle("SECONDARY").setEmoji(config.emotes.purdue);
    let pugs = new MessageButton().setLabel("PUGs").setCustomId(config.roles.pugs).setStyle("SECONDARY").setEmoji(config.emotes.pugs);
    let tenmans = new MessageButton().setLabel("10mans").setCustomId(config.roles.tenmans).setStyle("SECONDARY").setEmoji(config.emotes.tenmans);

    let row = new MessageActionRow().addComponents(purdue, pugs, tenmans);

    return ({embeds: [embed], components: [row]});
}

async function buildWelcomeMenu() {
    let row

    row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId(config.roles.valorant)
                .setLabel(`Access ${bot.guild.name}!`)
                .setStyle("SUCCESS")
                .setEmoji(config.emotes.logo)
        )
    return ({components: [row]});
}
