import {EmbedBuilder} from "discord.js";
import Player from "../Player";

export default class QueueEmbed extends EmbedBuilder {
    public constructor(message: string, players: Array<Player>) {
        super();
        let description = "";
        for (let i = 0; i < players.length; i++) {
            description += `**${i + 1}.** ${players[i].username}\n`;
        }
        if (players.length > 0) this.setDescription(description);
        this.setTitle("10-Mans: " + message.concat(` [${players.length}/10]`));
        this.setColor("#2f3136");
    }
}