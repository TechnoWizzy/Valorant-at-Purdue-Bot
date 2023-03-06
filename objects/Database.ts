import {Collection, MongoClient} from "mongodb";
import * as config from "../config.json";
import {bot} from "../index";
import Player from "./Player";

export default class Database {
    private _students: Collection;
    private _players: Collection;
    private _games: Collection;
    private _teams: Collection;

    private _tournamentPlayers: Collection;
    private _tournamentTeams: Collection;

    async init() {
        const client: MongoClient = new MongoClient(`mongodb://${config.mongo.username}:${config.mongo.password}@technowizzy.dev:27017/?authMechanism=DEFAULT`);
        await client.connect();
        const db = client.db("PUGG");
        const valDb = client.db("Valorant");
        this.students = db.collection("students");
        this.players = valDb.collection("players");
        this.teams = valDb.collection("teams");
        this.games = valDb.collection("games");
        this.tournamentPlayers = valDb.collection("tournament-teams");
        this.tournamentTeams = valDb.collection("tournament-players");
    }

    get students(): Collection {
        return this._students;
    }

    set students(value: Collection) {
        this._students = value;
    }

    get players(): Collection {
        return this._players;
    }

    set players(value: Collection) {
        this._players = value;
    }

    get games(): Collection {
        return this._games;
    }

    set games(value: Collection) {
        this._games = value;
    }

    get teams(): Collection {
        return this._teams;
    }

    set teams(value: Collection) {
        this._teams = value;
    }

    get tournamentPlayers(): Collection {
        return this._tournamentPlayers;
    }

    set tournamentPlayers(value: Collection) {
        this._tournamentPlayers = value;
    }

    get tournamentTeams(): Collection {
        return this._tournamentTeams;
    }

    set tournamentTeams(value: Collection) {
        this._tournamentTeams = value;
    }

    public async updateRankings() {
        const players = (await this.players.find().sort({_points: -1, _wins: -1, _losses: 1, _username: 1}).toArray());
        for (let i = 0; i < players.length; i++) {
            let player = Player.fromObject(players[i]);
            bot.guild.members.fetch(player.id).catch(async () => {await Player.delete(player)});
            player.rank = i + 1;
            await player.save();
        }
    }
}