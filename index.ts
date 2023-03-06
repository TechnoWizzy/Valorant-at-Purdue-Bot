import Bot from "./objects/Bot";
import * as crypto from "crypto";
import * as config from "./config.json";
import * as express from "express";
import * as nodemailer from "nodemailer";
import {
    ButtonInteraction,
    CommandInteraction, Events,
    GuildMember,
    Interaction,
    Message,
    ModalSubmitInteraction,
    Role,
    SelectMenuInteraction,
    User
} from "discord.js";
import Student from "./objects/Student";
import InteractionStatus, {InteractionType} from "./objects/InteractionStatus";
import {Router} from "./objects/Router";
import PurdueModal from "./objects/modals/Purdue.Modal";
import Verifier from "./objects/Verifier";
import TournamentModal from "./objects/modals/Tournament.Modal";

export const bot = new Bot();

bot.login(config.token).then(async () => {
    await bot.init();
    const app = express();
    app.use("/", Router);
    app.listen(1623, () => {
        console.info(`Server started at http://localhost:1623`)
    })
});

bot.on(Events.InteractionCreate, (interaction: Interaction) => {
    let status: Promise<InteractionStatus>;
    if (interaction.isButton()) status = receiveButton(interaction);
    if (interaction.isSelectMenu()) status = receiveSelectMenu(interaction);
    if (interaction.isCommand()) status = receiveCommand(interaction);
    if (interaction.isModalSubmit()) status = receiveModal(interaction);

    status.then((response) => {
        // console.log(response.type + " - " + response.status);
        if (!response.status) {
            if (interaction.isRepliable()) {
                interaction.reply({content: "Sorry, that didn't work.", ephemeral: true}).catch();
            }
            bot.logger.error(`${response.type} by ${response.user.username} failed.`, response.error);
        }
    }).catch((error) => {
        bot.logger.error(`Unknown Interaction failed.`, error);
    });
});

/**
 * Executes logic on a Command Interaction
 * @param interaction
 */
async function receiveCommand(interaction: CommandInteraction): Promise<InteractionStatus> {
    const user = interaction.user;
    const command = bot.commands.get(interaction.commandName);

    try {
        await command.execute(interaction);
        return new InteractionStatus(InteractionType.Command, user, true, null);
    } catch (error) {
        return new InteractionStatus(InteractionType.Command, user, false, error);
    }
}

/**
 * Executes logic on a Button Interaction
 * @param interaction
 */
async function receiveButton(interaction: ButtonInteraction): Promise<InteractionStatus> {
    const user: User = interaction.user;
    const role: Role = await bot.guild.roles.fetch(interaction.customId);

    try {

        const member = await bot.guild.members.fetch(user);

        if (!role) {
            if (interaction.customId == "team_one" || interaction.customId == "team_two" || interaction.customId == "reset") await bot.commands.get("pick").execute(interaction);
            else if (interaction.customId == "join" || interaction.customId == "leave" || interaction.customId == "bump") await bot.commands.get("queue").execute(interaction);
            else if (interaction.customId == "register") await bot.commands.get("register").execute(interaction);
        } else {
            if (role.id == config.roles.purdue) {
                const student: Student = await Student.get(user.id);
                if (student && student.status) {
                    await member.roles.add(role.id);
                    await interaction.reply({content: `You are verified. Thank you!`, ephemeral: true});
                } else {
                    await interaction.showModal(new PurdueModal());
                }
            } else if (role.id == config.roles.tournament) {
                await interaction.showModal(new TournamentModal());
            } else {
                if (member.roles.cache.has(role.id)) {
                    const response = await removeRankedRoles(member, role);
                    if (response) await interaction.reply({content: response, ephemeral: true});
                    if (interaction.replied) await interaction.followUp({content: `You removed **<@&${role.id}>**.`, ephemeral: true});
                    else await interaction.reply({content: `You removed **<@&${role.id}>**.`, ephemeral: true});
                } else {
                    const response = await applyRankedRoles(member, role);
                    if (response) await interaction.reply({content: response, ephemeral: true});
                    if (interaction.replied) await interaction.followUp({content: `You applied **<@&${role.id}>**.`, ephemeral: true});
                    else await interaction.reply({content: `You applied **<@&${role.id}>**.`, ephemeral: true});
                }
            }
        }
        return new InteractionStatus(InteractionType.Button, user, true, null);
    } catch (error) {
        return new InteractionStatus(InteractionType.Button, user, false, error);
    }
}

/**
 * Executes logic on a SelectMenu Interaction
 * @param interaction
 */
async function receiveSelectMenu(interaction: SelectMenuInteraction): Promise<InteractionStatus> {
    const role = await bot.guild.roles.fetch(interaction.values[0]);
    const user = interaction.user;

    try {
        if (!role) return new InteractionStatus(InteractionType.Menu, user, false, new Error("Non-existent role"));
        else {
            const member: GuildMember = await bot.guild.members.fetch(user);
            if (member.roles.cache.has(role.id)) {
                await member.roles.remove(role.id);
                await interaction.reply({content: `You removed **<@&${role.id}>**.`, ephemeral: true});
            } else {
                await member.roles.add(role.id);
                await interaction.reply({content: `You applied **<@&${role.id}>**.`, ephemeral: true});
            }
        }
        return new InteractionStatus(InteractionType.Menu, user, true, null);
    } catch (error) {
        return new InteractionStatus(InteractionType.Menu, user, false, error);
    }
}

/**
 * Executes logic on a ModalSubmit Interaction
 * @param interaction
 */
async function receiveModal(interaction: ModalSubmitInteraction): Promise<InteractionStatus> {
    const user: User = interaction.user;

    if (interaction.customId == "purdue") {
        const email: string = interaction.fields.getTextInputValue("email");

        try {
            if (!Verifier.isValidEmail(email)) {
                await interaction.reply({content: `The address you provided, \`${email}\`, is invalid. Please provide a valid Purdue address.`, ephemeral: true});
            } else {
                const username = user.username;
                const student = new Student(user.id, username, email, false);
                const hash = Verifier.encrypt(user.id + "-" + Date.now());
                const token = hash.iv + "-" + hash.content;
                const url = `https://www.technowizzy.dev/api/v1/students/verify/${token}`;
                await student.save();
                await Verifier.sendEmail(email, url);
                await bot.verifier.insert(user, interaction);
                await interaction.reply({content: `An email was sent to \`${email}\`.`, ephemeral: true});
            }


        } catch (error) {
            return new InteractionStatus(InteractionType.Modal, user, false, error);
        }

    } else if (interaction.customId == "tournament") {
        const riotId: string = interaction.fields.getTextInputValue("riotId");
        await interaction.reply({content: `Hi, ${user.username}! Your Riot ID is: ${riotId}`, ephemeral: true});
    }

    return new InteractionStatus(InteractionType.Modal, user, true, null);

}

async function applyRankedRoles(member: GuildMember, role: Role): Promise<string> {
    await member.roles.add(role.id);
    switch (role.id) {
        case config.roles.ranks.radiant: return config.roles.ranks.onMessages.radiant;
        case config.roles.ranks.immortal: return config.roles.ranks.onMessages.immortal;
        case config.roles.ranks.ascendant: return config.roles.ranks.onMessages.ascendant;
        case config.roles.ranks.diamond: return config.roles.ranks.onMessages.diamond;
        case config.roles.ranks.platinum: return config.roles.ranks.onMessages.platinum;
        case config.roles.ranks.gold: return config.roles.ranks.onMessages.gold;
        case config.roles.ranks.silver: return config.roles.ranks.onMessages.silver;
        case config.roles.ranks.bronze: return config.roles.ranks.onMessages.bronze;
        case config.roles.ranks.iron: return config.roles.ranks.onMessages.iron;
    }
    return undefined;
}

async function removeRankedRoles(member: GuildMember, role: Role) {
    await member.roles.remove(role.id);
    switch (role.id) {
        case config.roles.ranks.radiant: return config.roles.ranks.offMessages.radiant;
        case config.roles.ranks.immortal: return config.roles.ranks.offMessages.immortal;
        case config.roles.ranks.ascendant: return config.roles.ranks.offMessages.ascendant;
        case config.roles.ranks.diamond: return config.roles.ranks.offMessages.diamond;
        case config.roles.ranks.platinum: return config.roles.ranks.offMessages.platinum;
        case config.roles.ranks.gold: return config.roles.ranks.offMessages.gold;
        case config.roles.ranks.silver: return config.roles.ranks.offMessages.silver;
        case config.roles.ranks.bronze: return config.roles.ranks.offMessages.bronze;
        case config.roles.ranks.iron: return config.roles.ranks.offMessages.iron;
    }
    return undefined;
}