import * as Canvas from "canvas";
import {bot} from "../../index";
import {AttachmentBuilder, GuildMember} from "discord.js";
import ImageUtils from "./ImageUtils";
import Player from "../Player";

export default class ProfileImage {
    public static async build(player: Player): Promise<AttachmentBuilder> {
        const canvas = Canvas.createCanvas(644, 900);
        const ctx = canvas.getContext('2d');
        const user = await bot.guild.members.fetch(player.id) as GuildMember;
        const avatar = await Canvas.loadImage(user.displayAvatarURL({ extension: 'jpg', size: 512 }));
        const index = Math.floor(player.points / 5) > 6 ? 6 : Math.floor(player.points / 5);
        const background = await Canvas.loadImage("./media/profile.png");
        const rank = await Canvas.loadImage(`./media/ranks/${index}.png`);

        ImageUtils.printImage(ctx, background, 0, 0, canvas.width, canvas.height);
        ImageUtils.printImage(ctx, rank, 87, 222, 135, 135);

        ImageUtils.printText(ctx, `${player.username}`, canvas.width / 2, 535, "#ffffff", "72px sans-serif", "center");
        ImageUtils.printText(ctx, `Points:`, canvas.width / 5, 600, "#ffffff", "50px sans-serif", "left");
        ImageUtils.printText(ctx, `Wins:`, canvas.width / 5, 660, "#ffffff", "50px sans-serif", "left");
        ImageUtils.printText(ctx, `Losses:`, canvas.width / 5, 720, "#ffffff", "50px sans-serif", "left");
        ImageUtils.printText(ctx, `${player.points}`, canvas.width / 1.5, 600, "#ffffff", "50px sans-serif", "center");
        ImageUtils.printText(ctx, `${player.wins}`, canvas.width / 1.5, 660, "#ffffff", "50px sans-serif", "center");
        ImageUtils.printText(ctx, `${player.losses}`, canvas.width / 1.5, 720, "#ffffff", "50px sans-serif", "center");
        ImageUtils.printText(ctx, `${ImageUtils.ordinalSuffixOf(player.rank)}`, 155, 435, "#ffffff", "80px sans-serif", "center");
        ImageUtils.printAvatar(ctx, avatar, 249, 144, 300);

        return new AttachmentBuilder( canvas.toBuffer(), {name: `${player.username}-profile.png`});
    }
}