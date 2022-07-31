import * as mongoDB from "mongodb";
import * as dotenv from "dotenv";
import * as config from "../config.json";
import {bot} from "../index";
import Player from "../objects/Player";

export const collections: { players?: mongoDB.Collection, teams?:mongoDB.Collection, games?: mongoDB.Collection, students?: mongoDB.Collection } = {}

export async function connectToDatabase () {
    dotenv.config();

    const client: mongoDB.MongoClient = new mongoDB.MongoClient(`mongodb://${config.mongo.username}:${config.mongo.password}@technowizzy.dev:27017/?authMechanism=DEFAULT`);

    await client.connect();

    const db: mongoDB.Db = client.db("PUGG");
    const valDb: mongoDB.Db = client.db("Valorant");


    collections.games = valDb.collection("games");
    collections.teams = valDb.collection("teams");
    collections.players = valDb.collection("players");
    collections.students = db.collection("students");

    await bot.logger.info(`Connected to ${db.databaseName} Database`);
}


export async function updateRankings() {
    const players = (await collections.players.find().sort({_points: -1, _wins: -1, _losses: 1, _username: 1}).toArray());
    for (let i = 0; i < players.length; i++) {
        let player = Player.fromObject(players[i]);
        bot.guild.members.fetch(player.id).catch(async () => {
            //await Player.delete(player);
        })
        player.rank = i + 1;
        await Player.put(player);
    }
}