import {SlashCommandBuilder} from "@discordjs/builders";
import {
    ChatInputCommandInteraction,
    GuildMember,
} from "discord.js";
import Player from "../objects/Player";
import Game, {GamePhase} from "../objects/Game";
import Team from "../objects/Team";
import {bot} from "../index";
import GameEmbed from "../objects/embeds/Game.Embed";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("pick")
        .setDescription("Picks a player in a PUPL game")
        .addIntegerOption((string) => string
            .setName("team")
            .setDescription("The team you are assigning players to")
            .setChoices({name: "Team 1", value: 1}, {name: "Team 2", value: 2})
            .setRequired(true)
        )
        .addUserOption((user) => user
            .setName("player_one")
            .setDescription("p1")
            .setRequired(true)
        )
        .addUserOption((user) => user
            .setName("player_two")
            .setDescription("p2")
            .setRequired(false)
        )
        .addUserOption((user) => user
            .setName("player_three")
            .setDescription("p3")
            .setRequired(false)
        )
        .addUserOption((user) => user
            .setName("player_four")
            .setDescription("p4")
            .setRequired(false)
        )
        .addUserOption((user) => user
            .setName("player_five")
            .setDescription("p5")
            .setRequired(false)
        )
    ,

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {

        const game = Game.fromObject(await bot.database.games.findOne({_channel: interaction.channel.id}));

        if (!game) {
            await interaction.reply({content: "You can't do this outside of a game channel.", ephemeral: true});
            return;
        }

        const players = [];
        players[0] = await Player.get((interaction.options.getMember("p1") as GuildMember).id);
        players[1] = await Player.get((interaction.options.getMember("p2") as GuildMember).id);
        players[2] = await Player.get((interaction.options.getMember("p3") as GuildMember).id);
        players[3] = await Player.get((interaction.options.getMember("p4") as GuildMember).id);
        players[4] = await Player.get((interaction.options.getMember("p5") as GuildMember).id);

        for (let i = 0; i < 5; i++) {
            const player = players[i];

            if (!player) {
                await interaction.reply({content: `${interaction.options.getUser(`p${i + 1}`).username} cannot be selected because they are not registered.`, ephemeral: true});
                return;
            }

            if (!game.players.some(id => player.id == id)) {
                await interaction.reply({content: `${interaction.options.getUser(`p${i + 1}`).username} cannot be selected because they are not in this game.`, ephemeral: true});
                return;
            }

            for (let j = i + 1; j < 5; j++) {
                if (players[j] && players[j].id == player.id) {
                    await interaction.reply({content: "You cannot select duplicate players.", ephemeral: true});
                    return;
                }
            }
        }

        const teamIndex = interaction.options.getInteger("team");
        const teamOne = await Team.get(game.teamOne);
        const teamTwo = await Team.get(game.teamTwo);

        if (teamIndex == 1) {
            for (let i = 0; i < 5; i++) {
                teamOne.players[i] = players[i].id;
            }

            await teamOne.save();
            const unpickedPlayers = await game.unpickedPlayers();

            for (let i = 0; i < 5; i++) {
                teamTwo.players[i] = unpickedPlayers[i].id;
            }
        } else {
            for (let i = 0; i < 5; i++) {
                teamTwo.players[i] = players[i].id;
            }

            await teamTwo.save();
            const unpickedPlayers = await game.unpickedPlayers();

            for (let i = 0; i < 5; i++) {
                teamOne.players[i] = unpickedPlayers[i].id;
            }
        }

        game.phase = GamePhase.PlayPhase;
        await game.save();

        await interaction.reply({embeds: [new GameEmbed(game, teamOne, teamTwo)]});
    }
}
