import {AttachmentBuilder, GuildMember} from "discord.js";
import * as Canvas from "canvas";
import {bot} from "../../index";
import ImageUtils from "./ImageUtils";

export default class TestImage {
    public static async build(id): Promise<AttachmentBuilder> {
        const canvas = Canvas.createCanvas(1000, 1000);
        const ctx = canvas.getContext('2d');
        const user = await bot.guild.members.fetch(id) as GuildMember;
        const avatar = await Canvas.loadImage(user.displayAvatarURL({extension: 'jpg', size: 256}));
        const background = await Canvas.loadImage("./media/background.png");

        ImageUtils.printImage(ctx, background, 0, 0, canvas.width, canvas.height);

        ImageUtils.printAvatar(ctx, avatar, 235, 566, 400);

        return new AttachmentBuilder(canvas.toBuffer(), {name: `test.png`});
    }
}