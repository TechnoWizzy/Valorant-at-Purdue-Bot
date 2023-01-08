import {EmbedBuilder} from "discord.js";
import Game, {GameResult} from "../Game";
import Team from "../Team";

export default class GameEmbed extends EmbedBuilder {
    constructor(game: Game, teamOne: Team, teamTwo: Team) {
        super();
        this.setTitle(`Game ${game.id} - Purdue Rainbow Six Siege`);
        if (game.result == GameResult.Draw) {
            this.setTitle(`Game ${game.id} - DRAW - Purdue Rainbow Six Siege`);
            this.addFields({name: "Team 1", value: teamOne.stringify(), inline: true});
            this.addFields({name: "Team 2", value: teamTwo.stringify(), inline: true});
        } else if (game.result == GameResult.TeamOneVictory) {
            this.addFields({name: "Winner - Team 1", value: teamOne.stringify(), inline: true});
            this.addFields({name: "Team 2", value: teamTwo.stringify(), inline: true});
        } else if (game.result == GameResult.TeamTwoVictory) {
            this.addFields({name: "Team 1", value: teamOne.stringify(), inline: true});
            this.addFields({name: "Winner - Team 2", value: teamTwo.stringify(), inline: true});
        } else {
            this.addFields({name: "Team 1", value: teamOne.stringify(), inline: true});
            this.addFields({name: "Team 2", value: teamTwo.stringify(), inline: true});
        }
    }
}