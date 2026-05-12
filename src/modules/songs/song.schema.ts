import z from "zod";

export const createSongSchema = z.object({
    title:z.string().min(1, "Title is required"),
    duration:z.number().int().positive("Duration must be positive (seconds)"),
    url:z.string().url("Must valid url"),
    genre:z.string().optional(),
    artistId:z.string().uuid("Invalid artist Id"),
    albunId:z.string().uuid("Invalid album Id").optional()
})

export const updateSongSchema = createSongSchema.partial();