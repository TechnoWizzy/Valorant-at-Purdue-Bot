import Bot from "./objects/Bot";
import * as crypto from "crypto";
import * as config from "./config.json";
import * as nodemailer from "nodemailer";
import {
    ButtonInteraction,
    CommandInteraction,
    GuildMember,
    Interaction,
    InteractionReplyOptions,
    Message,
    MessageActionRow,
    Modal,
    ModalSubmitInteraction,
    Role,
    SelectMenuInteraction,
    TextChannel,
    TextInputComponent
} from "discord.js";
import {collections} from "./database/database.service";
import Student from "./objects/Student";

export const bot = new Bot();

bot.login(config.token).then();

bot.on('ready', async () => {
    await bot.init();
    //readSpreadsheet().then(() => updateRegistrations().then());
});

bot.on('interactionCreate', (interaction: Interaction) => {
    if (interaction.isApplicationCommand()) handleCommand(interaction as CommandInteraction).catch();
    else if (interaction.isButton()) handleButton(interaction as ButtonInteraction).catch();
    else if (interaction.isSelectMenu()) handleSelectMenu(interaction as SelectMenuInteraction).catch();
    else if (interaction.isModalSubmit()) handleModal(interaction as ModalSubmitInteraction).catch();
});

bot.on("messageCreate", (message: Message) => {
    handleMessage(message).catch();
})

bot.on('warn', (warning) => {
    bot.logger.warn(warning);
});

/**
 * Executes logic on a new Message
 * @param message
 */
async function handleMessage(message: Message) {

}

/**
 * Executes logic on a Command Interaction
 * @param interaction
 */
async function handleCommand(interaction: CommandInteraction) {
    try {
        await interaction.deferReply();
        const command = bot.commands.get(interaction.commandName);
        let response = await command.execute(interaction);
        if (response) {
            if (response.ephemeral) {
                await interaction.deleteReply();
                await interaction.followUp(response);
            } else {
                await interaction.deleteReply();
                await interaction.channel.send(response);
            }
        }
        await bot.logger.info(`${interaction.commandName} command issued by ${interaction.user.username}`);
    } catch (error) {
        await bot.logger.error(`${interaction.commandName} command issued by ${interaction.user.username} failed`, error);
        try {
            await interaction.deleteReply();
            await interaction.followUp({content: "There was an error running this command.", ephemeral: true});
        } catch (e) {}
    }
}

/**
 * Executes logic on a Button Interaction
 * @param interaction
 */
async function handleButton(interaction: ButtonInteraction) {
    try {
        let response;
        let id = interaction.customId;
        switch (id) {
            case "join": case "leave": case "bump":
                response = await bot.commands.get("queue").execute(interaction);
                break;

            default:
                let role = await interaction.guild.roles.fetch(id);
                let guildMember = interaction.member as GuildMember;
                response = await requestRole(role, guildMember, interaction);
                break;
        }
        if (response && response.content != null) {
            try {
                await interaction.reply(response);
            } catch {}
        }
        await bot.logger.info(`${interaction.component.label} button used by ${interaction.user.username}`);
    } catch (error) {
        await bot.logger.error(`${interaction.component.label} button used by ${interaction.user.username} failed`, error);
        try {
            await interaction.reply({content: "There was an error handling this button.", ephemeral: true});
        } catch (ignored) {}
    }
}

/**
 * Executes logic on a SelectMenu Interaction
 * @param selectMenu
 */
async function handleSelectMenu(selectMenu: SelectMenuInteraction) {
    let response;
    try {
        response = await bot.commands.get("pick").execute(selectMenu);
        await bot.logger.info(`Select Menu option ${selectMenu.values[0]} selected by ${selectMenu.user.username}`);

        if (response != null && !selectMenu.replied) {
            await selectMenu.reply(response);
        }
    } catch (error) {
        await bot.logger.error(`Select Menu option ${selectMenu.values[0]} selected by ${selectMenu.user.username} failed`, error);
        await selectMenu.reply({content: "There was an error handling this menu.", ephemeral: true});
    }
}

/**
 * Executes logic on a ModalSubmit Interaction
 * @param interaction
 */
async function handleModal(interaction: ModalSubmitInteraction) {
    let response = {content: null, ephemeral: true};
    let student: Student;
    // let discord, uplay, purdue, captain, registrant, payment, json;
    switch (interaction.customId) {
        case "verify-start":
            let email = interaction.fields.getTextInputValue("email");
            student = Student.fromObject(await collections.students.findOne({_email: email}));
            if (student && student.status) {
                response.content = "This email is already in use.";
            } else {
                if (isValidEmail(email)) {
                    let username = interaction.user.username;
                    let hash = encrypt(interaction.user.id + "-" + Date.now());
                    let token = hash.iv + "-" + hash.content;
                    let url = `https://www.technowizzy.dev/api/v1/students/verify/${token}`;
                    await sendEmail(email, url);
                    await bot.logger.info(`New Student Registered - Username: ${username}`)
                    await Student.post(new Student(interaction.user.id, username, email, 0, false));
                    response.content = `A verification email was sent to \`${email}\`. Click the **Purdue Button** once you have verified!`;
                } else {
                    response.content = `The email you provided, \`${email}\`, is invalid. Please provide a valid Purdue email.`;
                }
            }
            break;

        case "duo":
            response.content = "Sorry, registration has closed.";

            /*
            if (fs.existsSync("./registrants.json")) {
                json = JSON.parse(fs.readFileSync("./registrants.json").toString());
            } else {
                json = {}
            }
            let partnerUplay = interaction.fields.getTextInputValue("partner-uplay");
            discord = interaction.user.tag;
            uplay = interaction.fields.getTextInputValue("uplay");
            purdue = (interaction.fields.getTextInputValue("purdue").toLowerCase() === "yes");
            payment = interaction.fields.getTextInputValue("payment");
            captain = (interaction.fields.getTextInputValue("captain").toLowerCase() === "yes");
            if (uplay.length < 1) response.content = "Invalid Uplay username, please try again";
            else {
                if (payment.length < 1) response.content = "Invalid payment information, please try again";
                else {
                    if (partnerUplay.length < 1) response.content = "Invalid Partner Uplay username, please try again";
                    else {
                        registrant = new Registrant(uplay, discord, purdue, payment, false, false, captain, partnerUplay);
                        json[registrant.discord] = registrant;
                        fs.writeFileSync("./registrants.json", JSON.stringify(json, null, 2));
                        response.content = `Your registration has been submitted.`;
                    }
                }
            }
             */
            break;

        case "solo":
            response.content = "Sorry, registration has closed.";

            /*
            if (fs.existsSync("./registrants.json")) {
                json = JSON.parse(fs.readFileSync("./registrants.json").toString());
            } else {
                json = {}
            }
            discord = interaction.user.tag;
            uplay = interaction.fields.getTextInputValue("uplay");
            purdue = (interaction.fields.getTextInputValue("purdue").toLowerCase() === "yes");
            payment = interaction.fields.getTextInputValue("payment");
            captain = (interaction.fields.getTextInputValue("captain").toLowerCase() === "yes");

            if (uplay.length < 1) response.content = "Invalid Uplay username, please try again";
            else {
                if (payment.length < 1) response.content = "Invalid payment information, please try again";
                else {
                    registrant = new Registrant(uplay, discord, purdue, payment, true, false, captain, null);
                    json[registrant.discord] = registrant;
                    fs.writeFileSync("./registrants.json", JSON.stringify(json, null, 2));
                    response.content = `Your registration has been submitted.`;
                }
            }
             */

            break;
    }

    if (response.content != null) {
        await interaction.reply(response);
    }
}

/**
 * Executes logic for managing role requests
 * @param role the requested role
 * @param guildMember the requester
 * @param interaction the interaction
 */
async function requestRole(role: Role, guildMember: GuildMember, interaction: ButtonInteraction) {
    let response: InteractionReplyOptions = {content: null, ephemeral: true};
    let hasRole = await checkIfMemberHasRole(role.id, guildMember);
    let student = await Student.get(guildMember.id);

    switch (role.id) {

        case config.roles.purdue:
            if (student && student.status) {
                response.content = "You are verified!";
                await addRole(config.roles.purdue, guildMember);
                // await removeRole(config.roles.other, guildMember);
            } else {
                let modal = new Modal().setCustomId("verify-start").setTitle("Purdue Verification");
                let emailInput = new TextInputComponent().setCustomId("email").setLabel("What is your Purdue email address?").setStyle("SHORT");
                let row = new MessageActionRow().addComponents(emailInput);
                // @ts-ignore
                modal.addComponents(row);
                await interaction.showModal(modal);
            }
            break;

            /*
        case config.roles.other:
            if (hasRole) {
                response.content = "You have removed the role **Other** from yourself.";
                await removeRole(config.roles.other, guildMember);
            } else {
                if (student) {
                    response.content = "Purdue students cannot apply the Non-Purdue role.";
                } else {
                    response.content = "You have applied the role **Other** to yourself.";
                    await addRole(config.roles.other, guildMember);
                }
            }
            break;
             */

        case config.roles["10mans"]:
            const command = bot.commands.get("register");
            response = await command.execute(interaction);
            break;

        case config.roles.ranks.immortal:
            if (hasRole) {
                await removeRole(role.id, guildMember);
                response.content = "I didn't believe you either\nYou removed the role **Immortal** from yourself";
            } else {
                await addRole(role.id, guildMember);
                response.content = "Haha, sure buddy.\nYou have applied the role **Immortal** to yourself";
            }
            break;

        case config.roles.ranks.ascendant:
            if (hasRole) {
                await removeRole(role.id, guildMember);
                response.content = "Nothing lasts forever!\nYou removed the role **Ascendant** from yourself";
            } else {
                await addRole(role.id, guildMember);
                response.content = "Are you sure about that?\n You have applied the role **Ascendant** to yourself";
            }
            break;

        case config.roles.ranks.diamond:
            if (hasRole) {
                await removeRole(role.id, guildMember);
                response.content = "Ending on a loss are we?\nYou removed the role **Diamond** from yourself";
            } else {
                await addRole(role.id, guildMember);
                response.content = "I can't be the only one surprised, right?\nYou have applied the role **Diamond** to yourself";
            }
            break;

        case config.roles.ranks.platinum:
            if (hasRole) {
                await removeRole(role.id, guildMember);
                response.content = "Back to the trenches.\nYou removed the role **Platinum** from yourself";
            } else {
                await addRole(role.id, guildMember);
                response.content = "I knew you could do it!\nYou have applied the role **Platinum** to yourself";
            }
            break;

        case config.roles.ranks.gold:
            if (hasRole) {
                await removeRole(role.id, guildMember);
                response.content = "Ranking up I hope?\nYou removed the role **Gold** from yourself";
            } else {
                response.content = "This makes sense!\nYou applied the role **Gold** to yourself.";
                await addRole(role.id, guildMember);
            }
            break;

        case config.roles.ranks.silver:
            if (hasRole) {
                await removeRole(role.id, guildMember);
                response.content = "Don't take anything for granted.\nYou removed the role **Silver** from yourself";
            } else {
                response.content = "Not having much fun are we?\nYou applied the role **Silver** to yourself.";
                await addRole(role.id, guildMember);
            }
            break;

        case config.roles.ranks.bronze:
            if (hasRole) {
                response.content = "Good or bad luck? You tell me.\nYou removed the role **Bronze** from yourself";
                await removeRole(role.id, guildMember);
            } else {
                response.content = "Maybe something isn't working...\nYou applied the role **Bronze** to yourself.";
                await addRole(role.id, guildMember);
            }
            break;

        case config.roles.ranks.iron:
            if (hasRole) {
                response.content = "Hope is on the horizon! (not)\nYou removed the role **Iron** from yourself";
                await removeRole(role.id, guildMember);
            } else {
                response.content = "Achievement Got! How did we get here? But seriously.. how are you this lost?" +
                    "\nYou applied the role **Iron** to yourself.";
                await addRole(role.id, guildMember);
            }
            break;

        case config.roles.valorant:
            if (hasRole) {
                response.content = "You already have access!";
            } else {
                await addRole(role.id, guildMember);
                response.content = "Welcome to the Club!";
            }
            break;

        default:
            if (!hasRole) {
                await addRole(role.id, guildMember);
                response.content = `You applied the role **${role.name}** to yourself.`;
            } else {
                await removeRole(role.id, guildMember);
                response.content = `You have removed the role **${role.name}** from yourself.`;
            }
            break;
    }

    return response;
}

/**
 * Adds a Role to a GuildMember
 * @param id
 * @param guildMember
 */
async function addRole(id: string, guildMember: GuildMember) {
    await guildMember.roles.add(id);
}

/**
 * Removes a Role from a GuildMember
 * @param id
 * @param guildMember
 */
async function removeRole(id: string, guildMember: GuildMember) {
    await guildMember.roles.remove(id);
}

/**
 * Determines whether a GuildMember has a certain Role
 * @param snowflake
 * @param guildMember
 */
async function checkIfMemberHasRole(snowflake: string, guildMember: GuildMember): Promise<boolean> {
    let result = false;
    let roles = guildMember.roles.cache;

    roles.forEach(role => {
        if (role.id === snowflake) result = true;
    })
    return result;
}

/**
 * Parses the provided email address and confirms that is valid
 * @param email the provided email address
 */
function isValidEmail(email): boolean {
    let emailRegEx = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/m);
    let matches = email.toLowerCase().match(emailRegEx);
    if (matches != null) {
        return matches[0].endsWith('@purdue.edu') || matches[0].endsWith('@alumni.purdue.edu') || matches[0].endsWith("@student.purdueglobal.edu");
    }
    return false;
}

/**
 * Sends an authentication code to a provided email address
 * @param email
 * @param link
 */
async function sendEmail(email, link) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: config.email.username,
            pass: config.email.password
        }
    });
    let mailOptions = {
        from: config.email.username,
        to: email,
        subject: 'PUGG Discord Account Verification',
        text:
            `Click this link to verify your account!
            \nLink: ${link}
            \nClick the \'Purdue Button\' in #verify to finalize verification!`
    };

    await transporter.sendMail(mailOptions, async function (error, info) {
        if (error) await bot.logger.error(`An error occurred sending an email to ${email}`, error);
        else await bot.logger.info("Verification email sent");
    });
}

/**
 * Encrypts a string
 * @param text
 */
const encrypt = (text) => {

    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv("aes-256-ctr", config.key, iv);

    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    return {
        iv: iv.toString('hex'),
        content: encrypted.toString('hex')
    };
};