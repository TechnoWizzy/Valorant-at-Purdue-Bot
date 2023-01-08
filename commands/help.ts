import {SlashCommandBuilder} from "@discordjs/builders";
import {ChatInputCommandInteraction, EmbedBuilder} from "discord.js";
import {bot} from "../index";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Displays info about other commands.")

        .addStringOption((string) => string
            .setName("command")
            .setDescription("The command view")
            .setRequired(false)
        )
    ,

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const command = interaction.options.getString("command") ?? "";
        let description = "";
        const list = [];

        await bot.commands.forEach(command => {
            list.push([toTitleCase(command.data.name), command.data.description, command.data.options])
        });

        list.sort();

        for (const [name, nextDescription, options] of list) {
            if (name.toLowerCase().includes(command.toLowerCase())) {
                description += `**${name}** - ${nextDescription}\n`;
                for (const option of options) {
                    description += mapOptions(name.toLowerCase(), option);
                }
                description += "\n";
            }
        }
        const embed = new EmbedBuilder().setDescription(description).setTitle("Help Menu").setColor("#5a69ea");
        await interaction.reply({embeds: [embed], ephemeral: true});
    }
}

function mapOptions(name, option): string {
    let response = "";
    let options = option.options;
    if (option.type) {
        response = response.concat(`⠀⠀⠀⠀\`<${option.name}>\` - ${option.description}\n`)
    } else {
        response = response.concat(`⠀⠀\`/${name} ${option.name}\` - ${option.description}\n`);
        for (let subOption of options) {
            response = response.concat(mapOptions(`${name} ${option.name}`, subOption))
        }
    }
    return response;
}

function toTitleCase(string): string {
    string = string.toLowerCase().split('-');
    for (let i = 0; i < string.length; i++) {
        string[i] = string[i].charAt(0).toUpperCase() + string[i].slice(1);
    }
    return string.join('-');
}