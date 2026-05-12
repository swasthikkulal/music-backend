import express from "express"
import { authenticcate } from "../../middlewares/auth.middleware";
import { createSongSchema, updateSongSchema } from "./song.schema";
import { validate } from "../../middlewares/validate.middleware";
import * as songController from "./song.controller";
const router = express.Router()

router.post("/", validate(createSongSchema), songController.createSong);

export default router