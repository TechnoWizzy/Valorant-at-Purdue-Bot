import {ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle} from "discord.js";

const prompt = "What is your Riot ID? (Ex: Techno#NA1)";

export default class TournamentModal extends ModalBuilder {
    constructor() {
        super();
        const riotIdInput = new TextInputBuilder().setCustomId("riotId").setLabel(prompt).setStyle(TextInputStyle.Short);
        const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(riotIdInput);
        this.addComponents(actionRow).setCustomId("tournament").setTitle("Tournament Sign-Up");
    }
}