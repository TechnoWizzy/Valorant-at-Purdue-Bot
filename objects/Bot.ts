import {
    ActivityType,
    Client,
    ClientOptions,
    Collection,
    Guild, IntentsBitField,
    TextChannel
} from "discord.js";
import {Routes} from "discord-api-types/v9";
import * as config from "../config.json";
import {REST} from "@discordjs/rest";
import Queue from "./Queue";
import * as fs from "fs";
import Logger from "./Logger";
import {SlashCommandBuilder} from "@discordjs/builders";
import Database from "./Database";
import {bot} from "../index";

const options = {
    intents: [
        IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildBans, IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.DirectMessages, IntentsBitField.Flags.GuildPresences
    ]
} as ClientOptions;

export default class Bot extends Client{
    private _guild: Guild;
    private _queue: Queue;
    private _logger: Logger;
    private _database: Database;
    private _commands: Collection<any, any>;

    constructor() {
        super(options);
        this._commands = new Collection();
    }

    get guild(): Guild {
        return this._guild;
    }

    set guild(value: Guild) {
        this._guild = value;
    }

    get queue() {
        return this._queue;
    }

    set queue(value) {
        this._queue = value;
    }

    get logger(): Logger {
        return this._logger;
    }

    set logger(value: Logger) {
        this._logger = value;
    }

    get database() {
        return this._database;
    }

    set database(value: Database) {
        this._database = value;
    }

    get commands() {
        return this._commands;
    }

    set commands(value) {
        this._commands = value;
    }
    async init() {
        this.guild = await this.guilds.fetch(config.guild);
        this.logger = new Logger(await this._guild.channels.fetch(config.channels.log) as TextChannel);
        this.queue = new Queue(await this._guild.channels.fetch(config.channels["10mans"]) as TextChannel);
        this.database = new Database();

        switch (config.status.type) {
            case "PLAYING": bot.user.setActivity({name: config.status.name, type: ActivityType.Playing}); break;
            case "STREAMING": bot.user.setActivity({name: config.status.name, type: ActivityType.Streaming}); break;
            case "LISTENING": bot.user.setActivity({name: config.status.name, type: ActivityType.Listening}); break;
            case "WATCHING": bot.user.setActivity({name: config.status.name, type: ActivityType.Watching}); break;
            case "COMPETING": bot.user.setActivity({name: config.status.name, type: ActivityType.Competing}); break;
        }

        await this.queue.init();
        await this.database.init();
        await this.initializeCommands(config.token);
    }

    async initializeCommands(token: string) {
        const guildCommands = [];
        const globalCommands = [];
        const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
        const rest = new REST({ version: '9' }).setToken(token);
        const id = this.application.id;
        const guild = this.guilds.cache.get(config.guild);

        for (const file of commandFiles) {
            const command = require(`../commands/${file}`);
            if (!command.disabled) {
                if (command.global) globalCommands.push(command.data.toJSON());
                else guildCommands.push(command.data.toJSON());
                await this._commands.set(command.data.name, command);
            }
        }

        try {
            await rest.put(Routes.applicationGuildCommands(id, guild.id), {body: guildCommands});
            await rest.put(Routes.applicationCommands(id), {body: globalCommands});
            await this.logger.info("Application commands uploaded");
        } catch (error) {
            await this.logger.error("Error uploading application commands", error);
        }
    }
}

let ping = new SlashCommandBuilder()
.setName("ping")
.setDescription("pong")