import {SlashCommandBuilder} from "@discordjs/builders";
import {AttachmentBuilder, ChatInputCommandInteraction} from "discord.js";
import GameEmbed from "../objects/embeds/Game.Embed";
import Team from "../objects/Team";
import Game from "../objects/Game";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("game")
        .setDescription("General-use command for viewing and managing games")

        // info - subcommand
        .addSubcommand((command) => command
            .setName("info")
            .setDescription("Command to view the details of a game")
            .addIntegerOption((option) => option
                .setName("id")
                .setDescription("The ID of this game")
                .setRequired(true))
        )
    ,

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const subcommand = interaction.options.getSubcommand();
        const game = await Game.get(interaction.options.getInteger("id").toString());

        if (!game) {
            await interaction.reply({content: "This game does not exist.", ephemeral: true});
            return;
        }

        if (subcommand == "info") {
            const teamOne = await Team.get(game.teamOne);
            const teamTwo = await Team.get(game.teamTwo);
            const map = new AttachmentBuilder(`./media/maps/${game.map.replace(/ /g,"_").toLowerCase()}.png`, {name: "map.jpg"});
            const embed= new GameEmbed(game, teamOne, teamTwo).setImage("attachment://map.jpg");
            await interaction.reply({embeds: [embed], files: [map]});
        }
    }
}
