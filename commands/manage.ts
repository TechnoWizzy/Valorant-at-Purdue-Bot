import {SlashCommandBuilder} from "@discordjs/builders";
import {ChatInputCommandInteraction} from "discord.js";
import Player from "../objects/Player";
import {bot} from "../index";
import Queue from "../objects/Queue";
import * as blacklist from "../blacklist.json";
import Game, {GameResult} from "../objects/Game";

const censoredWords = blacklist.list.split(" ");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("manage")
        .setDescription("General-purpose management command")

        // game
        .addSubcommandGroup((group) => group
            .setName("game")
            .setDescription("Game management")
            .addSubcommand((subcommand) => subcommand
                .setName("sub")
                .setDescription("Subs a player into a game")
                .addIntegerOption((integer) => integer
                    .setName("id")
                    .setDescription("The ID of this game")
                    .setRequired(true)
                    .setMinValue(1)
                )
                .addUserOption((user) => user
                    .setName("sub")
                    .setDescription("Player to be added")
                    .setRequired(true)
                )
                .addUserOption((user) => user
                    .setName("target")
                    .setDescription("Player to be removed")
                    .setRequired(true)
                )
            )
            .addSubcommand((subcommand) => subcommand
                .setName("set-winner")
                .setDescription("Sets a winner for a game")
                .addIntegerOption((integer) => integer
                    .setName("id")
                    .setDescription("The ID of this game")
                    .setRequired(true)
                    .setMinValue(1)
                )
                .addIntegerOption((integer) => integer
                    .setName("winner")
                    .setDescription("The winner of this game")
                    .setRequired(true)
                    .setChoices(
                        {name: "Team 1", value: 1},
                        {name: "Team 2", value: 2}
                    )
                )
            )
            .addSubcommand((subcommand) => subcommand
                .setName("set-draw")
                .setDescription("Sets a game as a draw")
                .addIntegerOption((integer) => integer
                    .setName("id")
                    .setDescription("The ID of this game")
                    .setRequired(true)
                    .setMinValue(1)
                )
            )
            .addSubcommand((subcommand) => subcommand
                .setName("set-map")
                .setDescription("Sets the map for a game")
                .addIntegerOption((integer) => integer
                    .setName("id")
                    .setDescription("The ID of this game")
                    .setRequired(true)
                    .setMinValue(1)
                )
                .addStringOption((string) => string
                    .setName("map")
                    .setDescription("The new map")
                    .setRequired(true)
                    // "Bank", "Chalet", "Clubhouse", "Coastline", "Kafe Dostoyevsky", "Oregon", "Villa"
                    .setChoices(
                        {name: "Bank", value: "Bank"}, {name: "Chalet", value: "Chalet"},
                        {name: "Clubhouse", value: "Clubhouse"}, {name: "Coastline", value: "Coastline"},
                        {name: "Kafe Dostoyevsky", value: "Kafe Dostoyevsky"},
                        {name: "Oregon", value: "Oregon"}, {name: "Villa", value: "Villa"}
                    )
                )
            )
        )

        // queue
        .addSubcommandGroup((group) => group
            .setName("queue")
            .setDescription("Queue management")
            .addSubcommand((subcommand) => subcommand
                .setName("add")
                .setDescription("Adds a player to the current queue")
                .addUserOption((user) => user
                    .setName("target")
                    .setDescription("The player too be added")
                    .setRequired(true)
                )
            )
            .addSubcommand((subcommand) => subcommand
                .setName("kick")
                .setDescription("Kicks a player from the queue")
                .addUserOption((user) => user
                    .setName("target")
                    .setDescription("The player to be kicked")
                    .setRequired(true)
                )
            )
            .addSubcommand((subcommand) => subcommand
                .setName("reset")
                .setDescription("Empties the current queue")
            )
        )

        // player
        .addSubcommandGroup((group) => group
            .setName("player")
            .setDescription("Player management")
            .addSubcommand((subcommand) => subcommand
                .setName("set-username")
                .setDescription("Changes a player's username")
                .addUserOption((user) => user
                    .setName("target")
                    .setDescription("The player to update")
                    .setRequired(true)
                )
                .addStringOption((string) => string
                    .setName("username")
                    .setDescription("The new username")
                    .setRequired(true)
                )
            )
            .addSubcommand((subcommand) => subcommand
                .setName("register")
                .setDescription("Registers a player for the PUPL")
                .addUserOption((user) => user
                    .setName("target")
                    .setDescription("The player to register")
                    .setRequired(true)
                )
                .addStringOption((string) => string
                    .setName("username")
                    .setDescription("The username of the player")
                    .setRequired(false)
                )
            )
            .addSubcommand((subcommand) => subcommand
                .setName("set-stats")
                .setDescription("Changes a player's stats")
                .addUserOption((user) => user
                    .setName("target")
                    .setDescription("The player to update")
                    .setRequired(true)
                )
                .addIntegerOption((integer) => integer
                    .setName("points")
                    .setDescription("The new amount of points")
                    .setRequired(false)
                    .setMinValue(0)
                )
                .addIntegerOption((integer) => integer
                    .setName("wins")
                    .setDescription("The new amount of wins")
                    .setRequired(false)
                    .setMinValue(0)
                )
                .addIntegerOption((integer) => integer
                    .setName("losses")
                    .setDescription("The new amount of losses")
                    .setRequired(false)
                    .setMinValue(0)
                )
                .addIntegerOption((integer) => integer
                    .setName("draws")
                    .setDescription("The new amount of draws")
                    .setRequired(false)
                    .setMinValue(0)
                )
            )
            .addSubcommand((subcommand) => subcommand
                .setName("ban")
                .setDescription("Bans a player from the PUPL")
                .addUserOption((user) => user
                    .setName("target")
                    .setDescription("The player to be banned")
                    .setRequired(true)
                )
                .addIntegerOption((integer) => integer
                    .setName("length")
                    .setDescription("The magnitude of the ban length")
                    .setRequired(true)
                    .setMaxValue(100)
                )
                .addStringOption((string) => string
                    .setName("unit")
                    .setDescription("The unit of time to use")
                    .setRequired(true)
                    .setChoices(
                        {name: "Second(s)", value: "seconds"}, {name: "Minute(s)", value: "minutes"},
                        {name: "Hour(s)", value: "hours"}, {name: "Day(s)", value: "days"},
                        {name: "Week(s)", value: "weeks"}, {name: "Month(s)", value: "months"},
                        {name: "Year(s)", value: "years"}
                    )
                )
            )
            .addSubcommand((subcommand) => subcommand
                .setName("unban")
                .setDescription("Unbans a player from the PUPL")
                .addUserOption((user) => user
                    .setName("target")
                    .setDescription("The player to be unbanned")
                    .setRequired(true)
                )
            )
        )
    ,

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const group = interaction.options.getSubcommandGroup()
        const subcommand = interaction.options.getSubcommand();

        try {

            if (group == "game") {

                const game = await Game.get(interaction.options.getInteger("id").toString());

                if (!game) {
                    await interaction.reply({content: "This game could not be found.", ephemeral: true});
                    return;
                }

                if (subcommand == "sub") {

                    const sub = await Player.get(interaction.options.getUser('sub').id);
                    const target = await Player.get(interaction.options.getUser('target').id);
                    if (!sub) {
                        await interaction.reply({content: "The sub is not a valid player.", ephemeral: true});
                        return;
                    }
                    if (!target) {
                        await interaction.reply({content: "The target is not a valid player.", ephemeral: true});
                        return;
                    }
                    if (!(await game.sub(sub, target))) {
                        await interaction.reply({content: "This substitution could not be completed.", ephemeral: true});
                        return;
                    }
                    await interaction.reply({content: `<@!${sub.id}> has been subbed in for <@!${target.id}> in Game ${game.id}`});

                } else if (subcommand == "set-winner") {

                    const code = interaction.options.getInteger("winner");
                    await game.end(code as GameResult);
                    await interaction.reply({content: `Game ${game.id} result has been set. Team ${code} won!`});

                } else if (subcommand == "set-draw") {

                    await game.end(GameResult.Draw);
                    await interaction.reply({content: `Game ${game.id} result has been set. It's a draw!`});

                } else if (subcommand == "set-map") {

                    const map = interaction.options.getString("map");
                    game.map = map;
                    await game.save();
                    await interaction.reply({content: `Game ${game.id} has been moved to ${map}.`});

                }

            } else if (group == "queue") {

                if (subcommand == "add") {

                    const player = await Player.get(interaction.options.getUser("target").id);
                    if (!player) {
                        await interaction.reply({content: "This player is not registered.", ephemeral: true});
                        return;
                    }
                    if (bot.queue.has(player.id)) {
                        await interaction.reply({content: `${player.username} is already in queue.`, ephemeral: true});
                        return;
                    }
                    await bot.queue.join(player);
                    await interaction.reply({content: `${player.username} has been added to the queue`});

                } else if (subcommand == "kick") {

                    const player = await Player.get(interaction.options.getUser("target").id);
                    if (!player) {
                        await interaction.reply({content: "This player is not registered.", ephemeral: true});
                        return;
                    }
                    if (!bot.queue.has(player.id)) {
                        await interaction.reply({content: `${player.username} is not in the queue.`, ephemeral: true});
                        return;
                    }
                    bot.queue.delete(player.id);
                    await bot.queue.update(`${player.username} has been removed`);
                    await interaction.reply({content: `${player.username} has been kicked from the queue.`});

                } else if (subcommand == "reset") {

                    bot.queue = new Queue(bot.queue.channel);
                    await bot.queue.update("The queue has been reset.");
                    await interaction.reply({content: "The queue has been reset."});

                }

            } else if (group == "player") {
                const user = await interaction.options.getUser("target");

                if (subcommand == "register") {
                    const player = await Player.get(user.id);
                    if (player) {
                        await interaction.reply({content: "This player is already registered.", ephemeral: true});
                        return;
                    }
                    const username = interaction.options.getString("username") ?? interaction.options.getUser("target").username;
                    await Player.post(new Player(user.id, username));
                    await interaction.reply({content: `<@!${user.id}> has been registered as ${username}.`});

                } else if (subcommand == "set-username") {

                    const player = await Player.get(user.id);
                    if (!player) {
                        await interaction.reply({content: "This player is not registered.", ephemeral: true});
                        return;
                    }
                    const oldUsername = player.username;
                    const username = interaction.options.getString("username");
                    player.username = username;
                    await player.save();
                    if (isValidUsername(username)) await interaction.reply({content: `${oldUsername} is now ${username}.`});
                    else await interaction.reply({content: `${oldUsername} is now ${username}. Warning, this username is against the rules. Please address this.`, ephemeral: true});

                } else if (subcommand == "set-stats") {

                    const player = await Player.get(user.id);
                    if (!player) {
                        await interaction.reply({content: "This player is not registered.", ephemeral: true});
                        return;
                    }
                    player.points = interaction.options.getInteger("points") ?? player.points;
                    player.wins = interaction.options.getInteger("wins") ?? player.wins;
                    player.losses = interaction.options.getInteger("losses") ?? player.losses;
                    player.draws = interaction.options.getInteger("draws") ?? player.draws;
                    await player.save();
                    await bot.database.updateRankings();
                    await interaction.reply({content: `${player.username} has been updated.`});

                } else if (subcommand == "ban") {

                    const player = await Player.get(user.id);
                    if (!player) {
                        await interaction.reply({content: "This player is not registered.", ephemeral: true});
                        return;
                    }
                    const magnitude = interaction.options.getInteger("length");
                    const unit = interaction.options.getString("unit");
                    const time = Math.round(Date.now() / 1000);
                    const response = await ban(player, magnitude, unit, time);
                    await interaction.reply({content: response});

                } else if (subcommand == "unban") {

                    const player = await Player.get(user.id);
                    if (!player) {
                        await interaction.reply({content: "This player is not registered.", ephemeral: true});
                        return;
                    }
                    player.banTime = 0;
                    await player.save();
                    await interaction.reply({content: `**${player.username}** has been unbanned from ten-mans.`}) ;

                }
            }
        } catch (error) {
            if (interaction.replied) await interaction.followUp({content: "Sorry, this didn't work.", ephemeral: true});
            else await interaction.reply({content: "Sorry, this didn't work", ephemeral: true});
        }
    }
}

async function ban(player: Player, magnitude: number, unit: string, time: number): Promise<string> {
    switch (unit) {
        case "minutes":
            time += magnitude * 60;
            break;
        case "hours":
            time += magnitude * 3600;
            break;
        case "days":
            time += magnitude * 86400;
            break;
        case "weeks":
            time += magnitude * 604800;
            break;
        case "months":
            time += magnitude * 2629800;
            break;
        case "years":
            time += magnitude * 31556952;
            break;
    }
    player.banTime = time;
    await player.save();
    if (bot.queue.has(player.id)) {
        bot.queue.delete(player.id);
        await bot.queue.update(`${player.username} has been kicked from the queue`);
    }
    return `**${player.username}** has been banned from ten-mans until <t:${time}:F>`;
}


function isValidUsername(username: String): boolean {
    for (const word of censoredWords) if (username.toLowerCase().includes(word)) return false;
    let usernameFilter = new RegExp(/^[a-zA-Z0-9]([._-](?![._-])|[a-zA-Z0-9]){1,18}[a-zA-Z0-9]$/);
    let filteredUsername = username.toLowerCase().match(usernameFilter);
    return !!filteredUsername;
}