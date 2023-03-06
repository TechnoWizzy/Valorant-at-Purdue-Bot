import {Colors, TextChannel} from "discord.js";
import LogEmbed from "./embeds/Log.Embed";

export default class Logger {
    private readonly _channel: TextChannel;

    constructor(channel: TextChannel) {
        this._channel = channel;
    }

    public get channel() {
        return this._channel;
    }

    public info(content: string): void {
        if (this.channel) this.channel.send({embeds: [new LogEmbed(content, null, Colors.Blue)]}).catch();
    }

    public error(content: string = null, error: Error): void {
        if (this.channel) this.channel.send({embeds: [new LogEmbed(content, error.message, Colors.DarkOrange)]}).catch();
    }
}