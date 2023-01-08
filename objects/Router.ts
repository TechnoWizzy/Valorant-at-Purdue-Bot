import * as express from "express";
import * as config from "../config.json";
import {Request, Response} from "express";
import {bot} from "../index";

export const Router = express.Router();

Router.use(express.json());

Router.get("/activate/:id", async (req: Request, res: Response) => {
    const id = req?.params?.id;
    const member = await bot.guild.members.fetch(id);
    if (member && !member.roles.cache.has(config.roles.purdue)) {
        await bot.logger.info("Automatic Role Applied");
        await member.roles.add(config.roles.purdue);
        res.status(200);
    } else {
        res.status(201);
    }
})