import {SlashCommandBuilder} from "@discordjs/builders";
import {CommandInteraction, SelectMenuInteraction, TextChannel} from "discord.js";
import Game from "../objects/Game";
import {collections} from "../database/database.service";
import Player from "../objects/Player";
import Team from "../objects/Team";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("pick")
        .setDescription("Set teams for a 10 mans game.")
        .addStringOption((string) => string
            .setName("team")
            .setDescription("The target team")
            .setRequired(true)
            .addChoices({name: "Team 1", value: "0"}, {name: "Team 2", value: "1"}))
        .addUserOption((user) => user
            .setName("player-1")
            .setDescription("The first player.")
            .setRequired(true))
        .addUserOption((user) => user
            .setName("player-2")
            .setDescription("The second player.")
            .setRequired(true))
        .addUserOption((user) => user
            .setName("player-3")
            .setDescription("The third player.")
            .setRequired(true))
        .addUserOption((user) => user
            .setName("player-4")
            .setDescription("The fourth player.")
            .setRequired(true))
        .addUserOption((user) => user
            .setName("player-5")
            .setDescription("The fifth player.")
            .setRequired(true))
    ,

    async execute(interaction: CommandInteraction) {
        let response = {content: null, ephemeral: true}
        let game = Game.fromObject(await collections.games.findOne({_channel: interaction.channel.id}));
        let fails = []
        if (game) {
            for (let i = 0; i < 5; i++) {
                try {
                    let player = await Player.get(interaction.options.getUser(`player-${i + 1}`).id);
                    let team = await Team.get(Team.fromObject(game.teams[Number.parseInt(interaction.options.getString("team"))]).id);
                    team.players[i] = player;
                    game.teams[Number.parseInt(interaction.options.getString("team"))] = team;
                    game.players = game.players.filter((object) => object["_id"] != player.id);
                    await Team.put(team);
                    await Game.put(game);
                } catch {
                    fails.push(interaction.options.getUser(`player-${i}`));
                }
            }
            await interaction.followUp({content: "Your players have been allocated!"});
            fails.forEach(fail => interaction.followUp({content: `Failed to add <@${fail.id}>`}));
        } else response.content = "You can't do this outside of a game channel.";
        return null;
    }
}
