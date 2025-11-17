import z from "zod";

export const MediaAssetSchema = z.object({
    id: z.number().int().positive(),
    url: z.string(),
    altText: z.string(),
    tag: z.union([z.literal("normal"), z.literal("slow")]),
}).strict();

export const OptionSchema = z.object({
    id: z.number().int().positive(),
    term_en: z.string(),
}).strict();

export const dataGameResponSchema = z.object({

    title: z.string().optional(),
    mediaAssets: z.array(MediaAssetSchema),
    options: z.array(OptionSchema),
}).strict(); 2

export type DataGameRespon = z.infer<typeof dataGameResponSchema>;