import * as Canvas from "canvas";
import {AttachmentBuilder} from "discord.js";
import ImageUtils from "./ImageUtils";

export default class PictureImage {
    public static async build(color, username): Promise<AttachmentBuilder> {
        const canvas = Canvas.createCanvas(512, 512);
        const ctx = canvas.getContext('2d');
        const purdueLogo = await Canvas.loadImage("./media/logo.png");

        ctx.beginPath();
        ctx.arc(256, 256, 256, 0, 2 * Math.PI, false);
        ctx.fillStyle = `#${color}`;
        ctx.fill();

        ImageUtils.printImage(ctx, purdueLogo, 142.5, 128, 227, 256);

        return new AttachmentBuilder( canvas.toBuffer(), {name: `${username}-profile.png`});
    }
}