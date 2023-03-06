import {ActionRowBuilder, ButtonBuilder, EmbedBuilder, TextChannel} from "discord.js";
import {bot} from "../index";
import Player from "./Player";
import Game from "./Game";
import QueueEmbed from "./embeds/Queue.Embed";
import QueueRow from "./components/Queue.Row";

export default class Queue extends Map<string, NodeJS.Timeout>{
    private _time: number;
    private _channel: TextChannel;

    public constructor(channel: TextChannel) {
        super();
        this._time = 3600000;
        this._channel = channel;
    }

    public get time(): number {
        return this._time;
    }

    public set time(value: number) {
        this._time = value;
    }

    get channel(): TextChannel {
        return this._channel;
    }

    set channel(value: TextChannel) {
        this._channel = value;
    }

    public async init() {
        await this.update("A new queue has started");
        for (const [,message] of (await this.channel.messages.fetch({limit: 6}))) {
            if (message.author.id == bot.user.id) {
                if (message.embeds.some(embed => embed.title == "A new queue has started")) {
                    await message.delete();
                }
            }
        }
    }

    public async join(player: Player): Promise<string> {
        if (this.has(player.id)) return ("You are already in the queue.");
        else if (this.size == 10) return ("The queue is already full.");
        else {
            const timeout = global.setTimeout(Queue.timeout, this.time, this, player);
            this.set(player.id, timeout)
            if (this.size == 10) {
                await this.update("A new game is starting...");
                for (const timeout of this) clearTimeout(timeout[1]);
                await new Game().init(await this.sortedPlayers());
                bot.queue = new Queue(this.channel);
            } else this.update(`${player.username} has joined`).then();
            return undefined;
        }
    }

    public async remove(player: Player): Promise<string> {
        if (this.size == 10) return ("Queue has filled. You cannot leave at this time.");
        else if (this.has(player.id)) {
            clearTimeout(this.get(player.id));
            this.delete(player.id);
            this.update(`${player.username} has left`).then(() => {
            });
            return undefined;
        } else return ("You are not in the queue.");
    }

    public async update(message: string, mention: string = null) {
        let messages = (await this.channel.messages.fetch({limit: 10}))
            .filter(message => message.author == bot.user);

        for (const [, message] of messages) {
            if (message.embeds[0] != undefined && message.embeds[0] != null) {
                if (message.embeds[0].title.toLowerCase().includes("10-mans")) await message.delete();
            }
        }

        const players = await this.unsortedPlayers();
        const embed: EmbedBuilder = new QueueEmbed(message, players);
        const row: ActionRowBuilder<ButtonBuilder> = new QueueRow();

        if (!mention) return this.channel.send({embeds: [embed], components: [row]});
        await this.channel.send({content: mention, embeds: [embed], components: [row]});
    }

    public async sortedPlayers(): Promise<Array<Player>> {
        const players = await this.unsortedPlayers();
        for (let i = 0; i < players.length - 1; i++) {
            for (let j = 0; j < players.length - i - 1; j++) {
                const a = players[j];
                const b = players[j + 1];
                if (a.rank > b.rank) {
                    players[j] = b;
                    players[j + 1] = a;
                }
            }
        }
        return players;
    }

    public async unsortedPlayers(): Promise<Array<Player>> {
        const players: Array<Player> = []
        for (const [key,] of this) {
            const player = await Player.get(key);
            players.push(player);
        }
        return players;
    }

    static async timeout(queue: Queue, player: Player) {
        queue.delete(player.id);
        await queue.update(`${player.username} has been timed out`, `<@!${player.id}>`);
    }
}