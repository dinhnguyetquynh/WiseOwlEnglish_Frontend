import { boolean, z } from "zod";

// --- Schema cho từng game ---
export const GameDetailSchema = z.object({
    id: z.number(),
    totalQuestion: z.number(),
    gameType: z.string(),
    title: z.string(),
    active: boolean(),
    updatedDate: z.string(),
});

// --- Schema cho 1 lesson chi tiết ---
export const LessonDetailSchema = z.object({
    lessonId: z.number(),
    unitName: z.string(),
    lessonName: z.string(),
    games: z.array(GameDetailSchema),
});

// --- Types infer từ Zod ---
export type GameDetail = z.infer<typeof GameDetailSchema>;
export type LessonDetail = z.infer<typeof LessonDetailSchema>;
