import * as config from "../config.json";
import * as nodemailer from "nodemailer";
import * as crypto from "crypto";
import {ModalSubmitInteraction, User} from "discord.js";
import Student from "./Student";
import {bot} from "../index";

const regex = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/m);

export default class Verifier extends Map<string, {timeout: NodeJS.Timeout, interaction: ModalSubmitInteraction}> {

    private readonly _time: number;

    public constructor() {
        super();
        this._time = 870000;
    }

    get time(): number {
        return this._time;
    }

    public insert(user: User, interaction: ModalSubmitInteraction): Promise<void> {
        this.delete(user.id);
        Student.get(user.id).then(student => {
            if (student && student.status) return;
            const timeout = global.setTimeout(Verifier.timeout, this.time, this, user, interaction);
            this.set(user.id, {timeout: timeout, interaction: interaction});
        });
        return;
    }

    public static timeout(verifier: Verifier, user: User, interaction: ModalSubmitInteraction): void {
        try {
            verifier.delete(user.id);
            interaction.followUp({
                content: `Hey ${user}, your verification email has timed out! Click the **Purdue Button** to send another one.`,
                ephemeral: true
            }).catch();
        } catch (error) {
            bot.logger.error("Timeout Failed", error);
        }
    }

    public static isValidEmail(email: string): boolean {
        const matches = email.toLowerCase().match(regex);
        if (matches != null) {
            return matches[0].endsWith('@purdue.edu') || matches[0].endsWith('@alumni.purdue.edu') || matches[0].endsWith("@student.purdueglobal.edu");
        }
        return false;
    }

    public static sendEmail(email: string, link: string): void {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: config.email.username,
                pass: config.email.password
            }
        });
        const mailOptions = {
            from: config.email.username,
            to: email,
            subject: 'PUGG Discord Account Verification',
            text:
                `Click this link to verify your account!
            \nLink: ${link}`
        };

        transporter.sendMail(mailOptions, function (error) {
            if (error) {
                bot.logger.error(`An error occurred sending an email to ${email}`, error);
                return;
            }
            bot.logger.info("Verification email sent");
        });
    }

    public static encrypt(text: string): {iv: string, content: string} {

        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv("aes-256-ctr", config.key, iv);
        const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

        return {iv: iv.toString("hex"), content: encrypted.toString("hex")};

    }
}