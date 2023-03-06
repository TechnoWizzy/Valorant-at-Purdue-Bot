import {ActivityType, ChatInputCommandInteraction,} from "discord.js"
import {SlashCommandBuilder} from "@discordjs/builders"
import {bot} from "../index";
import * as fs from "fs";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("status")
        .setDescription("Sets the Pugg Bot activity status")
        .addStringOption(option => option
            .setName("activity_type")
            .setDescription("The type of activity")
            .setRequired(true)
            .setChoices(
                {name: "competing", value: "COMPETING"},
                {name: "listening", value: "LISTENING"},
                {name: "playing", value: "PLAYING"},
                {name: "watching", value: "WATCHING"},
                {name: "streaming", value: "STREAMING"},
            )
        )
        .addStringOption(option => option
            .setName("activity_name")
            .setDescription("The name of the activity")
            .setRequired(true)
        )
    ,

    async execute(interaction: ChatInputCommandInteraction) {
        const activityName = interaction.options.getString("activity_name");
        const activityType = interaction.options.getString("activity_type");
        const config = JSON.parse(fs.readFileSync("./config.json").toString());

        config.status.name = activityName;
        config.status.type = activityType;

        switch (activityType) {
            case "PLAYING": bot.user.setActivity({name: activityName, type: ActivityType.Playing}); break;
            case "STREAMING": bot.user.setActivity({name: activityName, type: ActivityType.Streaming}); break;
            case "LISTENING": bot.user.setActivity({name: activityName, type: ActivityType.Listening}); break;
            case "WATCHING": bot.user.setActivity({name: activityName, type: ActivityType.Watching}); break;
            case "COMPETING": bot.user.setActivity({name: activityName, type: ActivityType.Competing}); break;
        }

        fs.writeFileSync("./config.json", JSON.stringify(config, null, 2));

        await interaction.reply({content: "Success", ephemeral: true});
    }
}