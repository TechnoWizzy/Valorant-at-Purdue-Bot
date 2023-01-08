import { CanvasRenderingContext2D, Image } from "canvas";

export default class ImageUtils {
    public static printText
    (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string, font: string, alignment: CanvasTextAlign) {
        ctx.fillStyle = color;
        ctx.textAlign = alignment;
        ctx.font = font;
        ctx.fillText(text, x, y);
        ctx.save();
    }

    public static printImage
    (ctx: CanvasRenderingContext2D, image: Image, x: number, y: number, width: number, height: number) {
        ctx.drawImage(image, x, y, width, height);
        ctx.restore();
        ctx.save();
    }

    public static printAvatar(ctx: CanvasRenderingContext2D, avatar: Image, x, y, d) {
        ctx.beginPath();
        ctx.arc(x + d / 2, y + d / 2, d / 2, 0, Math.PI * 2, true);
        ctx.fillStyle = "#ffffff";
        ctx.clip();
        ctx.fill();
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + d / 2, y + d / 2, d / 2.05, 0, Math.PI * 2, true);
        ctx.fillStyle = "#000000";
        ctx.clip();
        ctx.fill();
        ctx.drawImage(avatar, x, y, d / 1, d / 1);
    }

    public static ordinalSuffixOf(i): string {
        let j = i % 10,
            k = i % 100;
        if (j == 1 && k != 11) {
            return i + "st";
        }
        if (j == 2 && k != 12) {
            return i + "nd";
        }
        if (j == 3 && k != 13) {
            return i + "rd";
        }
        return i + "th";
    }
}