import {ActionRowBuilder, ButtonBuilder, ButtonStyle} from "discord.js";
import * as config from "../../config.json";

export default class QueueRow extends ActionRowBuilder<ButtonBuilder> {
    constructor() {
        super();
        this.addComponents(
            new ButtonBuilder().setLabel("Join").setCustomId("join").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setLabel("Leave").setCustomId("leave").setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setLabel("Register").setCustomId(config.roles.tenmans).setStyle(ButtonStyle.Secondary)
        );
    }
}