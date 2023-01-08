import {Document, Filter, UpdateFilter, UpdateOptions} from "mongodb";
import {bot} from "../index";

export default class Team {
    private _id: string;
    private _channel: string;
    private _players: Array<string>;

    constructor(id: string, channel: string = null, players: Array<string> = []) {
        this.id = id;
        this.channel = channel;
        this.players = players;
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get channel(): string {
        return this._channel;
    }

    set channel(value: string) {
        this._channel = value;
    }

    get players(): Array<string> {
        return this._players;
    }

    set players(value: Array<string>) {
        this._players = value;
    }

    public static fromObject(document: Document): Team {
        return new Team(document._id, document._channel, document._players);
    }

    public stringify(): string {
        let string = `**C**: <@${this.players[0]}>`;
        for (let i = 1; i < 5; i++) {
            if (this.players[i]) string += `\n<@${this.players[i]}>`;
        }
        return string;
    }

    public async save() {
        const query: Filter<any> = {_id: this.id};
        const update: UpdateFilter<any> = {$set: this};
        const options: UpdateOptions = {upsert: true};
        await bot.database.teams.updateOne(query, update, options);
    }

    public static async get(id: string): Promise<Team> {
        try {
            const query = { _id: id };
            const document = await bot.database.teams.findOne(query);
            if (!document) return null;
            return Team.fromObject(document);
        } catch (error) {
            return undefined;
        }
    }
}