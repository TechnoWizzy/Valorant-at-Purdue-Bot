import {EmbedBuilder, TextChannel} from "discord.js";

export default class Logger {
    private channel: TextChannel;

    constructor(channel: TextChannel) {
        this.channel = channel;
    }

    async fatal(info: string, error) {
        const log = this.buildLog(LogLevel.fatal, info, error);
        await this.channel.send({content: "<@!751910711218667562>",embeds: [log]});
    }

    async error(info: string, error) {
        const log = this.buildLog(LogLevel.error, info, error);
        await this.channel.send({embeds: [log]});
    }

    async warn(info: string) {
        const log = this.buildLog(LogLevel.warn, info);
        await this.channel.send({embeds: [log]});
    }

    async info(info: string) {
        const log = this.buildLog(LogLevel.info, info);
        await this.channel.send({embeds: [log]});
    }

    async debug(info: string) {
        const log = this.buildLog(LogLevel.debug, info);
        await this.channel.send({embeds: [log]});
    }

    async trace(info: string) {
        const log = this.buildLog(LogLevel.trace, info);
        await this.channel.send({embeds: [log]});
    }

    buildLog(level: LogLevel, info: string, error = null) {
        const embed = new EmbedBuilder().setTitle(info);
        if (level < 2) embed.setDescription(error.message + "\n" + error.stack);
        switch (level) {
            case 0: embed.setColor("Red"); break;
            case 1: embed.setColor("Orange"); break;
            case 2: embed.setColor("Yellow"); break;
            case 3: embed.setColor("Green"); break;
            case 4: embed.setColor("Blue"); break;
            case 5: embed.setColor("DarkBlue"); break;
        }
        return embed;
    }
}

export enum LogLevel {
    fatal,
    error,
    warn,
    info,
    debug,
    trace
}