import Team from "./Team";
import * as config from "../config.json";
import Queue from "./Queue";
import {bot} from "../index";
import {
    CategoryChannel,
    MessageActionRow,
    MessageAttachment,
    MessageEmbed,
    MessageSelectMenu,
    TextChannel
} from "discord.js";
import {collections, updateRankings} from "../database/database.service";
import Player from "./Player";

export default class Game {
    private _id: string;
    private _phase: number;
    private _players: Array<object>;
    private _teams: Array<object>;
    private _winner: object;
    private _loser: object;
    private _channel: string;
    private _map: string;

    constructor(id: string, phase: number = 1, players: Array<object> = [], teams: Array<object> = [], winner: object = null, loser: object = null, channel: string = "", map = null) {
        this._id = id;
        this._phase = phase;
        this._players = players;
        this._teams = teams;
        this._winner = winner;
        this._loser = loser;
        this._channel = channel;
        this._map = map ?? config.maps[Math.floor(Math.random() * config.maps.length)];
    }

    static fromObject(object) {
        return new Game(object._id, object._phase, object._players, object._teams, object._winner, object._loser, object._channel, object._map);
    }

    static async create(queue: Queue) {
        let players = [];
        let id = await collections.games.countDocuments() + 1;
        let channel = await Game.createChannel(id);
        let mentions = ""
        for (let [key] of queue) {
            players.push(await Player.get(key));
            queue.delete(key);
        }
        players.forEach(player => mentions = mentions.concat(`<@!${player.id}> `));
        let teamOne = await Team.create(1);
        let teamTwo = await Team.create(2);
        let game = new Game(id.toString(), 1, players, [teamOne, teamTwo], null, null, "", null);
        game.channel = channel.id;
        //await channel.permissionOverwrites.create(bot.guild.id,{VIEW_CHANNEL: false});
        //await channel.permissionOverwrites.create("824110063748120577", {VIEW_CHANNEL: true});
        await channel.send({content: `\`${mentions}\``, embeds: [game.toEmbed()]}).then(message => {
            message.edit({content: "@everyone"})
        });
        await Game.post(game);
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get phase(): number {
        return this._phase;
    }

    set phase(value: number) {
        this._phase = value;
    }

    get players(): Array<object> {
        return this._players;
    }

    set players(value: Array<object>) {
        this._players = value;
    }

    get teams(): Array<object> {
        return this._teams;
    }

    set teams(value: Array<object>) {
        this._teams = value;
    }

    get winner(): object {
        return this._winner;
    }

    set winner(value: object) {
        this._winner = value;
    }

    get loser(): object {
        return this._loser;
    }

    set loser(value: object) {
        this._loser = value;
    }

    get channel(): string {
        return this._channel;
    }

    set channel(value: string) {
        this._channel = value;
    }

    get map(): string {
        return this._map;
    }

    set map(value: string) {
        this._map = value;
    }

    getMapAttachment(): MessageAttachment {
        let mapFileName = this.map.replace(/ /g,"_").toLowerCase();
        return new MessageAttachment(`./media/maps/${mapFileName}.png`);
    }

    public async pick(target: Player, index: number) {
        let response;
        let channel = await bot.guild.channels.fetch(this.channel) as TextChannel;
        let teamOne = Team.fromObject(this.teams[index]);
        let teamTwo = Team.fromObject(this.teams[Math.abs(index - 1)])
        let captainOne = Player.fromObject(teamOne.players[0]);
        let captainTwo = Player.fromObject(teamTwo.players[0]);
        this.players = this.players.filter((object) => object["_id"] != target.id);
        switch (this.players.length + 1) {
            case 8: case 6:
                response ={
                    content: `**${captainOne.username}** has picked **${target.username}**. <@!${captainTwo.id}> please pick two players.`,
                    components: [this.buildSelectMenu()]
                };
                break;
            case 7: case 5:
                response = {
                    content: `**${captainOne.username}** has picked **${target.username}**. <@!${captainOne.id}> please pick another player.`,
                    components: [this.buildSelectMenu()]};
                break;
            case 4: case 3:
                response = {
                    content: `**${captainOne.username}** has picked **${target.username}**. <@!${captainTwo.id}> please pick another player.`,
                    components: [this.buildSelectMenu()]};
                break;
            case 2:
                response = { content: `**${captainOne.username}** has picked **${target.username}**.`};
                break;
            case 1:
                response = {content: `**${captainOne.username}** has received **${target.username}**.`};
                this.phase = 2;
                break;
        }
        teamOne.players.push(target);
        this.teams[index] = teamOne;
        await Team.put(teamOne);
        await Game.put(this);
        await channel.send(response);
    }

    public buildSelectMenu() {
        let actionRow = new MessageActionRow();
        let selectMenu = new MessageSelectMenu().setCustomId(`select_teams`).setPlaceholder('Select a player!');
        let players = this.players;
        for (const object of players) {
            let player = Player.fromObject(object);
            selectMenu.addOptions([
                {
                    label: player.username,
                    value: player.id,
                    emoji: config.emotes.valorant
                }
            ])
        }
        actionRow.addComponents(selectMenu);
        return actionRow;
    }

    static async createChannel(id) {
        const category = await bot.guild.channels.fetch(config.categories["10mans"]) as CategoryChannel;
        return await category.createChannel(`game ${id}`);
    }

    async deleteChannel() {
        if (this.channel != null) {
            let channel = await bot.guild.channels.fetch(this.channel);
            await channel.delete();
            this.channel = null;
        }
    }

    async start() {
        this.phase = 2;
        let channel = await bot.guild.channels.fetch(this.channel) as TextChannel;
        let mentions = "";
        let embed = this.toEmbed();
        let attachment = this.getMapAttachment();
        for (let i = 0; i < 2; i ++) {
            let team = Team.fromObject(this.teams[i]);
            await team.createChannel();
            for (let j = 0; j < team.players.length; j++) {
                let player = Player.fromObject(team.players[j]);
                mentions = mentions = mentions.concat(`<@!${player.id}> `);
            }
        }
        await channel.send({content: `${mentions}`, embeds: [embed], files: [attachment]});
    }

    async sub(sub: Player, target: Player): Promise<boolean> {
        let response = false;
        for (let i = 0; i < this.players.length; i++) {
            let player = Player.fromObject(this._players[i]);
            if (target.id == player.id) {
                this._players.splice(i, 1);
                this._players.push(sub)
                await Game.put(this);
                return true;
            }
        }
        response = await Team.fromObject(this.teams[0]).sub(sub, target) ? true : response;
        response = await Team.fromObject(this.teams[0]).sub(sub, target) ? true : response;
        return response;
    }

    async end(code: number) {
        let channel = await bot.guild.channels.fetch(config.channels["10mans"]) as TextChannel;
        this.phase = 0;
        await (await Team.get(this.teams[0]["_id"])).deleteChannel();
        await (await Team.get(this.teams[1]["_id"])).deleteChannel();
        switch (code) {
            case 0: case 1:
                let winner = Team.fromObject(this.teams[code]);
                let loser = Team.fromObject(this.teams[Math.abs(code - 1)]);
                this.winner = winner;
                this.loser = loser;
                await winner.setWinner();
                await loser.setLoser();
                await channel.send({content: `Team ${code + 1} has won Game ${this.id}.`, embeds: [this.toEmbed()]});
                break;
            case 2:
                await channel.send({content: `Game ${this.id} has been called a draw.`, embeds: [this.toEmbed()]});
        }
        await this.deleteChannel();
        await updateRankings();
        await Game.put(this);
    }

    toEmbed(): MessageEmbed {
        let embed = new MessageEmbed()
            .setTitle(`Game ${this.id} - Purdue University Pro League`)

        for (let i = 0; i < 2; i++) {
            const team = Team.fromObject(this.teams[i]);
            let  title = `Team ${team.index}`;
            if (this.winner != null) title = team.id == Team.fromObject(this.winner).id ? `WINNER - Team ${team.index}` : title;
            let description = team.players.length > 0 ? `Player: <@!${Player.fromObject(team.players[0]).id}>` : `No Players`;
            for (let j = 1; j < 5; j++) {
                if (team.players[j]) description = description.concat(`\nPlayer: <@!${Player.fromObject(team.players[j]).id}>`);
            }
            embed.addField(title, description, true);
        }

        switch(this.phase) {
            case 0: embed.setColor("GREEN");
                break
            case 1: embed.setColor("RED");
                break;
            case 2:
                let mapFileName = this.map.replace(/ /g,"_").toLowerCase();
                embed.setColor("ORANGE");
                embed.setImage(`attachment://${mapFileName}.png`);
                break;
        }
        return embed;
    }

    async save(): Promise<boolean> {
        await Game.put(this);
        return true;
    }

    async delete(): Promise<boolean> {
        await Game.delete(this);
        return true;
    }

    static async get(id: string) {
        try {
            const query = { _id: id };
            const game = Game.fromObject(await collections.games.findOne(query));

            if (game) {
                return game;
            }
        } catch (error) {
            return undefined;
        }
    }

    static async post(game: Game) {
        try {
            const newGame = (game);
            // @ts-ignore
            return await collections.games.insertOne(newGame);

        } catch (error) {
            console.error(error);
            return undefined;
        }
    }

    static async put(game: Game) {
        await collections.games.updateOne({ _id: (game.id) }, { $set: game });
    }

    static async delete(game: Game) {
        await collections.games.deleteOne({ _id: (game.id) });
    }
}

function mergeSort(players: Array<Player>) {
    const half = players.length / 2

    if (players.length < 2){
        return players
    }

    const left = players.splice(0, half)
    return merge(mergeSort(left),mergeSort(players))
}

function merge(left: Array<Player>, right: Array<Player>) {
    let arr = []
    while (left.length && right.length) {
        if (left[0].rank < right[0].rank) {
            arr.push(left.shift())
        } else {
            arr.push(right.shift())
        }
    }
    return [ ...arr, ...left, ...right ]
}