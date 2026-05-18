import { Request, Response, NextFunction } from "express";
import * as songService from "./song.service";
import { sendResponse } from "../../utils/apiResponse";
import { ApiError } from "../../utils/apiError";
import { playCountQueue } from "../../queues/playCount.queue";
import { title } from "node:process";

export const createSong = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const song = await songService.createSong(req.body);
    if (!song) {
      throw new ApiError(400, "Failed to create song");
    }
    sendResponse(res, 201, "Song created", song);
  } catch (error) {
    next(error);
  }
};
export const getAllSongs = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const songs = await songService.getAllSongs(req.query.genre as string);
    if (!songs) {
      throw new ApiError(404, "No songs found");
    }
    sendResponse(res, 200, "Songs found", songs);
  } catch (error) {
    next(error);
  }
};

export const getSongsById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const song = await songService.getSongById(req.params.id as string);
    if (!song) {
      throw new ApiError(404, "No song found");
    }
    sendResponse(res, 200, "Song found");
  } catch (error) {
    next(error);
  }
};

export const searchSong = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const query = (await req.query.q) as string;
    const song = await songService.searchSongs(query);
    if (!song) {
      throw new ApiError(404, "No songs found");
    }
    sendResponse(res, 200, "Songs found", song);
  } catch (error) {
    next(error);
  }
};

export const updateSong = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const song = await songService.updateSong(
      req.params.id as string,
      req.body,
    );
    if (!song) {
      throw new ApiError(404, "Updation failed");
    }
    sendResponse(res, 200, "Song updated", song);
  } catch (error) {
    next(error);
  }
};

export const deleteSong = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const song = await songService.deleteSong(req.params.id as string);
    sendResponse(res, 200, "Song deleted", null);
  } catch (error) {
    next();
  }
};

export const playSong = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const song = await songService.recordPlay(req.params.id as string);
    await playCountQueue.add("increment", { songId: song.id });
    sendResponse(res, 200, "Now playing", { url: song.url, title: song.title });
  } catch (error) {
    next(error);
  }
};
