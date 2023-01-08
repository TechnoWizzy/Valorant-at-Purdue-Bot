import {bot} from "../index";
import * as config from "../config.json";
import {
    ActionRowBuilder,
    AttachmentBuilder,
    CategoryChannel,
    SelectMenuBuilder,
    TextChannel, VoiceChannel
} from "discord.js";
import Player from "./Player";
import {Document, Filter, UpdateFilter, UpdateOptions} from "mongodb";
import Team from "./Team";
import GameEmbed from "./embeds/Game.Embed";

export default class Game {
    private _id: string;
    private _phase: number;
    private _players: Array<string>;
    private _teamOne: string;
    private _teamTwo: string;
    private _result: GameResult;
    private _channel: string;
    private _map: string;

    constructor(id: string = null, phase: GamePhase = 0, players: Array<string> = new Array<string>(), teamOne: string = null, teamTwo: string = null, result = null, channel: string = null, map: string = null) {
        this.id = id;
        this.phase = phase;
        this.players = players;
        this.teamOne = teamOne;
        this.teamTwo = teamTwo;
        this.result = result;
        this.channel = channel;
        this.map = map;
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

    get players(): Array<string> {
        return this._players;
    }

    set players(value: Array<string>) {
        this._players = value;
    }

    get teamOne(): string {
        return this._teamOne;
    }

    set teamOne(value: string) {
        this._teamOne = value;
    }

    get teamTwo(): string {
        return this._teamTwo;
    }

    set teamTwo(value: string) {
        this._teamTwo = value;
    }

    get result(): GameResult {
        return this._result;
    }

    set result(value: GameResult) {
        this._result = value;
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

    public static fromObject(document: Document): Game {
        if (!document) return null;
        return new Game(document._id, document._phase, document._players, document._teamOne, document._teamTwo, document._winner, document._channel, document._map);
    }

    public async init(players: Array<Player>) {
        const id = await bot.database.games.countDocuments() + 1;
        const category = await bot.guild.channels.fetch(config.categories["10mans"]) as CategoryChannel;
        const channel = await category.children.create({name: `game-${id}`})
        const teamOne = new Team(String(await bot.database.teams.countDocuments() + 1));
        const teamTwo = new Team(String(await bot.database.teams.countDocuments() + 2));
        const playerIds: Array<string> = new Array<string>();

        for (const player of players) playerIds.push(player.id);

        this.id = id.toString();
        this.phase = GamePhase.PickPhase;
        this.channel = channel.id
        this.teamOne = teamOne.id;
        this.teamTwo = teamTwo.id;
        this.players = playerIds;
        this.map = config.maps[Math.floor(Math.random() * 7)];

        await teamOne.save();
        await teamTwo.save();
        await this.save();

        let mentions = "";
        for (const player of this.players) mentions += `<@${player}>  `;

        await channel.send({content: mentions});
        await channel.send({content: `\n\n**Please pick teams using </pick:988442478136942618>**>`});
    }

    public async start() {
        let mentions = String();
        const map = new AttachmentBuilder(`./maps/${this.map.replace(/ /g,"_").toLowerCase()}.jpg`, {name: "map.jpg"});
        const embed = new GameEmbed(this, await Team.get(this.teamOne), await Team.get(this.teamTwo)).setImage("attachment://map.jpg");
        const channel = await bot.guild.channels.fetch(this.channel) as TextChannel;
        for (const id of this.players) mentions += `<@${id}> `;
        await channel.send({content: mentions, embeds: [embed], files: [map]});
    }

    public async end(result: GameResult) {
        const channel = await bot.guild.channels.fetch(config.channels["10mans"]) as TextChannel;
        const voice = await bot.guild.channels.fetch(config.channels["10mans-vc"]) as VoiceChannel;
        const teamOne = await Team.get(this.teamOne);
        const teamTwo = await Team.get(this.teamTwo);
        const teamOneVoice = await bot.guild.channels.fetch(teamOne.channel) as VoiceChannel;
        const teamTwoVoice = await bot.guild.channels.fetch(teamTwo.channel) as VoiceChannel;
        for (const [,member] of teamOneVoice.members) await member.voice.setChannel(voice);
        for (const [,member] of teamTwoVoice.members) await member.voice.setChannel(voice);
        await teamOneVoice.delete();
        await teamTwoVoice.delete();
        await bot.guild.channels.delete(this.channel);

        if (result == GameResult.TeamOneVictory) {
            for (const id of teamOne.players) {
                const player = await Player.get(id);
                player.points += 2;
                player.wins += 1;
                await player.save();
            }
            for (const id of teamTwo.players) {
                const player = await Player.get(id);
                player.points += 1;
                player.losses += 1;
                await player.save();
            }
            await channel.send({content: `Team 1 has won Game ${this.id}.`, embeds: [new GameEmbed(this, teamOne, teamTwo)]});
        } else if (result == GameResult.TeamTwoVictory) {
            for (const id of teamTwo.players) {
                const player = await Player.get(id);
                player.points += 2;
                player.wins += 1;
                await player.save();
            }
            for (const id of teamOne.players) {
                const player = await Player.get(id);
                player.points += 1;
                player.losses += 1;
                await player.save();
            }
            await channel.send({content: `Team 2 has won Game ${this.id}.`, embeds: [new GameEmbed(this, teamOne, teamTwo)]});
        } else {
            for (const id of teamOne.players) {
                const player = await Player.get(id);
                player.points += 1;
                player.draws += 1;
                await player.save();
            }
            for (const id of teamTwo.players) {
                const player = await Player.get(id);
                player.points += 1;
                player.draws += 1;
                await player.save();
            }
            await channel.send({content: `Game ${this.id} has been called a draw.`, embeds: [new GameEmbed(this, teamOne, teamTwo)]});
        }
        await bot.database.updateRankings();
        this.phase = GamePhase.EndPhase;
        await this.save();
    }

    public async sub(sub: Player, target: Player): Promise<boolean> {
        const teamOne = await Team.get(this.teamOne);
        const teamTwo = await Team.get(this.teamTwo);

        for (const id of this.players) {
            if (sub.id == id) {
                return false;
            }
        }

        for (const id of teamOne.players) {
            if (target.id == id) {
                this.players.splice(this.players.indexOf(id), 1, sub.id);
                teamOne.players.splice(teamOne.players.indexOf(id), 1, sub.id);
                await this.save();
                await teamOne.save();
                return true;
            }
        }

        for (const id of teamTwo.players) {
            if (target.id == id) {
                this.players.splice(this.players.indexOf(id), 1, sub.id);
                teamTwo.players.splice(teamTwo.players.indexOf(id), 1, sub.id);
                await this.save();
                await teamTwo.save();
                return true;
            }
        }

        return false;
    }

    public async unpickedPlayers(): Promise<Array<Player>> {
        const unpickedPlayers = new Array<string>();
        const players = new Array<Player>();
        const teamOne = await Team.get(this.teamOne);
        const teamTwo = await Team.get(this.teamTwo);
        for (const player of this.players) unpickedPlayers.push(player);
        for (const player of teamOne.players) unpickedPlayers.splice(unpickedPlayers.indexOf(player), 1);
        for (const player of teamTwo.players) unpickedPlayers.splice(unpickedPlayers.indexOf(player), 1);
        for (const player of unpickedPlayers) players.push(await Player.get(player));
        return players;
    }

    public async save() {
        const query: Filter<any> = {_id: this.id};
        const update: UpdateFilter<any> = {$set: this};
        const options: UpdateOptions = {upsert: true};
        await bot.database.games.updateOne(query, update, options);
    }

    public static async get(id: string): Promise<Game> {
        try {
            const query = { _id: id };
            const document = await bot.database.games.findOne(query);
            if (!document) return null;
            return Game.fromObject(document);
        } catch (error) {
            return null;
        }
    }
}

export enum GamePhase {
    EndPhase = -1,
    PickPhase = 0,
    PlayPhase = 1,
}

export enum GameResult {
    Draw = 0,
    TeamOneVictory = 1,
    TeamTwoVictory = 2
}