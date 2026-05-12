import {Request, Response, NextFunction } from "express";
import * as songService from "./song.service";
import { sendResponse } from "../../utils/apiResponse";

export const createSong = async (req:Request, res:Response, next:NextFunction) => {
    try {
        const song = await songService.createSong(req.body)
        sendResponse(res, 201, "Song created", song)
    } catch (error) {
        next(error)
    }
}