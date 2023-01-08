import Game from "../Game";
import * as Canvas from "canvas";
import ImageUtils from "./ImageUtils";
import {AttachmentBuilder} from "discord.js";

export default class GameImage {
    public static async build(game: Game): Promise<AttachmentBuilder> {
        let font = "px sans-serif";
        const canvas = Canvas.createCanvas(500, 554);
        const ctx = canvas.getContext('2d');
        const background = await Canvas.loadImage("./media/background.png");
        const panel = await Canvas.loadImage("./media/panel.png");
        const gray = await Canvas.loadImage("./media/gray.png");
        const logo = await Canvas.loadImage("./media/logo.png");
        const map = await Canvas.loadImage(`./media/maps/${game.map.replace(/ /g,"_").toLowerCase()}.jpg`);

        ImageUtils.printImage(ctx, background, 0, 0, canvas.width, canvas.height);
        ImageUtils.printImage(ctx, gray, 10, 75, canvas.width - 20, canvas.height - 85);
        ImageUtils.printImage(ctx, panel, 13, 78, canvas.width - 26, canvas.height - 360);
        ImageUtils.printImage(ctx, logo, 15, 10, 50, 54);
        ImageUtils.printImage(ctx, logo, canvas.width - 70, 8, 60, 60);
        ImageUtils.printImage(ctx, map, 13, 275, 474, 266);
        ImageUtils.printText(ctx, `Game ${game.id}`, canvas.width / 2, 40, "#ffffff", `32${font}`, "center");
        ImageUtils.printText(ctx, `Purdue University Pro League`, canvas.width / 2, 64, "#ffffff", `20${font}`, "center");

        /*
        if (game.phase == 0) {
            if (game.winner && game.loser) {
                let winner = Team.fromObject(game.winner);
                let loser = Team.fromObject(game.loser);
                for (let i = 0; i < 5; i++) {
                    let winnerPlayer = Player.fromObject(winner.players[i]);
                    let loserPlayer = Player.fromObject(loser.players[i]);
                    console.log(winnerPlayer.username);
                    console.log(loserPlayer.username)
                    let winnerAvatar = await Canvas.loadImage((await bot.guild.members.fetch(winnerPlayer.id)).user.displayAvatarURL({ format: 'jpg' }));
                    let loserAvatar = await Canvas.loadImage((await bot.guild.members.fetch(loserPlayer.id)).user.displayAvatarURL({ format: 'jpg' }));
                    ImageUtils.printAvatar(ctx, winnerAvatar, canvas.width / 5, 135 + i * 30, 20);
                    ImageUtils.printAvatar(ctx, loserAvatar, canvas.width - canvas.width / 5, 135 + i * 25, 20);
                }
            } else {
                for (let i = 0; i < 2; i++) {
                    let team = Team.fromObject(game.teams[i]);
                    ImageUtils.printText(ctx, `Draw`, canvas.width / 4 + i * (canvas.width / 2), 110, "#000000", `28${font}`, "center");
                    for (let j = 0; j < 5; j++) {
                        let player = Player.fromObject(team.players[j]);
                        let avatar = await Canvas.loadImage((await bot.guild.members.fetch(player.id)).user.avatarURL({format: "jpg"}));
                        //ImageUtils.printAvatar(ctx, avatar, i, j, 20);
                        ImageUtils.printText(ctx, player.username, canvas.width / 4 + i * (canvas.width / 2), 135 + j * 25, "#000000", `24${font}`, "center");
                    }
                }
            }
        } else {

        }

         */

        return new AttachmentBuilder(canvas.toBuffer(), {name:`game-${game.id}.png`});
    }
}