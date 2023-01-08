import {AttachmentBuilder, GuildMember} from "discord.js";
import * as Canvas from "canvas";
import ImageUtils from "./ImageUtils";
import Player from "../Player";
import {bot} from "../../index";

export default class LeaderboardImage {
    public static async build(page: number): Promise<AttachmentBuilder> {

        let offset = (page - 1) * 5;
        const canvas = Canvas.createCanvas(2560, 1440);
        const ctx = canvas.getContext('2d');
        const background = await Canvas.loadImage("./media/Leaderboard.png");
        const players = (await bot.database.players.find().sort({_rank: 1}).skip(offset).limit(5).toArray());

        ImageUtils.printImage(ctx, background, 0, 0, canvas.width, canvas.height);

        for (let i = 0; i < players.length; i++) {
            try {
                let player = Player.fromObject(players[i]);
                let index = Math.floor(player.points / 8) > 6 ? 6 : Math.floor(player.points / 5);
                let user = await bot.guild.members.fetch(player.id) as GuildMember;
                let avatar = await Canvas.loadImage(user.displayAvatarURL({extension: 'jpg', size: 256}));
                const rank = await Canvas.loadImage(`./media/ranks/${index}.png`);
                ImageUtils.printImage(ctx, rank, 144, (400 + (i * 200)),125, 125);
                ctx.fillStyle = "#000000";
                ctx.beginPath();
                ctx.arc(980, (460 + (i * 200)), 64, 0, Math.PI * 2, true);
                ctx.fillStyle = "#ffffff";
                ctx.clip();
                ctx.fill();
                ctx.beginPath();
                ctx.arc(980, (460 + (i * 200)), 60, 0, Math.PI * 2, true);
                ctx.clip();
                ctx.drawImage(avatar, 920, (400 + (i * 200)), 120, 120);
                ctx.closePath();
                ctx.restore();
                ctx.save();

            } catch (error) {
                console.log(error);
            }
        }

        for (let i = 0; i < players.length; i++) {
            let player = Player.fromObject(players[i]);
            ImageUtils.printText(ctx, player.username, 1080, 490 + (i * 200), "#FFFFFF", "90px sans-serif","left");
            ImageUtils.printText(ctx, `${player.points} Points`, 2200, 490 + (i * 200), "#FFFFFF", "90px sans-serif, Code2000","center");
            ImageUtils.printText(ctx, `${ImageUtils.ordinalSuffixOf(player.rank)}`, 550, 490 + (i * 200), "#FFFFFF", "90x sans-serif, Code2000", "center");
        }

        return new AttachmentBuilder(canvas.toBuffer(), {name: 'leaderboard.png'});
    }
}
