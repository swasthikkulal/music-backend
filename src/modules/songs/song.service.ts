import prisma from "../../config/db";
import { redis } from "../../config/redis";
import { ApiError } from "../../utils/apiError";

export const createSong = async (data: {
  title: string;
  duration: number;
  url: string;
  genre?: string;
  artistId: string;
  albumId?: string;
}) => {
  const artist = await prisma.artist.findUnique({
    where: { id: data.artistId },
  });
  if (!artist) {
    throw new ApiError(404, "Artist not found");
  }
  if (data.albumId) {
    const album = await prisma.album.findUnique({
      where: { id: data.albumId },
    });
    if (!album) {
      throw new ApiError(404, "Album not found");
    }
  }
  const song = await prisma.song.create({ data });
  await redis.del("songs:all");

  return song;
};
