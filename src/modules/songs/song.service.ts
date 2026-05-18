import { resolve } from "node:dns";
import prisma from "../../config/db";
import { redis } from "../../config/redis";
import { ApiError } from "../../utils/apiError";
const CACHE_TTL = 60 * 5;
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

export const getAllSongs = async (genre?: string) => {
  const cacheKey = genre ? `songs:genre:${genre}` : "songs:all";

  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const songs = await prisma.song.findMany({
    where: genre ? { genre } : {},
    include: {
      artist: { select: { id: true, name: true } },
      album: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  await redis.set(cacheKey, JSON.stringify(songs), "EX", CACHE_TTL);
  return songs;
};

export const getSongById = async (id:string) => {
  if (!id) {
    throw new ApiError(400, "Song id is required")
  }
  const song = await prisma.song.findUnique({
    where:{id},
    include:{
      artist:{select:{id:true, name:true}},
      album:{select:{id:true, title:true}}
    }
  })
  if (!song) {
    throw new ApiError(404, "Song not found")
  }
  return song
}

export const searchSongs = async (query: string) => {
  if (!query || query.trim().length === 0) {
    throw new ApiError(400, "Search query is required");
  }
  const songs = await prisma.song.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { genre: { contains: query, mode: "insensitive" } },
        { artist: { name: { contains: query, mode: "insensitive" } } },
      ],
    },
    include:{
      artist:{select:{id:true, name:true}},
      album:{select:{id:true, title:true}}
    },
    take:20
  });
  return songs;
};


export const updateSong = async(id:string, data:Partial<{
  title:string,
  duration:number,
  url:string,
  genre:string,
  artistId:string,
  albumId:string
}>)=>{
  const existing = await prisma.song.findUnique({where:{id}})
  if (!existing) {
    throw new ApiError(404, "Song not found")
  }
  const updated = await prisma.song.update({where:{id}, data})

  await redis.del((`songs:${id}`));
  await redis.del("songs:all");

  if (existing.genre) {
    await redis.del(`songs:genre:${existing.genre}`)
  }

  return updated;
}

export const deleteSong = async (id:string) => {
  const existing = await prisma.song.findUnique({where:{id}})
  if (!existing) {
    throw new ApiError(404, "Song not found")
  } 
  await redis.del((`songs:${id}`));
  await redis.del("songs:all");
}

export const recordPlay = async (id:string) => {
  const song = await prisma.song.findUnique({where:{id}})
  if (!song) {
    throw new ApiError(404, "Song not found")
  }
  return song;
}