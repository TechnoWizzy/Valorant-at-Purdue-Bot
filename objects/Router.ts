import * as express from "express";
import * as config from "../config.json";
import {Request, Response} from "express";
import {bot} from "../index";
import {ModalSubmitInteraction} from "discord.js";

export const Router = express.Router();

Router.use(express.json());

Router.get("/activate/:id", async (req: Request, res: Response) => {
    const id = req?.params?.id;
    const member = await bot.guild.members.fetch(id);
    if (member && !member.roles.cache.has(config.roles.purdue)) {
        await member.roles.add(config.roles.purdue);
        const entry = bot.verifier.get(member.id);
        if (entry) {
            const timeout: NodeJS.Timeout = bot.verifier.get(member.id).timeout;
            const interaction: ModalSubmitInteraction = bot.verifier.get(member.id).interaction;
            await interaction.followUp({content: `Hey ${member.user.username}, you have been successfully verified. Thank you!`, ephemeral: true});
            bot.verifier.delete(member.id);
            clearTimeout(timeout);
        }
        await bot.logger.info("Automatic Role Applied");
        res.status(200);
    } else {
        res.status(201);
    }
})