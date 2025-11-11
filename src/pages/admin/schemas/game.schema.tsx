import { z } from "zod";

// --- Enum cho gameType ---
export const GameTypeEnum = z.enum([
    "PICTURE_WORD_MATCHING",
    " SOUND_WORD_MATCHING",
    "PICTURE_SENTENCE_MATCHING",
    "PICTURE_WORD_WRITING",
    "PICTURE4_WORD4_MATCHING",
    "PRONUNCIATION",
    "SENTENCE_HIDDEN_WORD",
    "WORD_TO_SENTENCE"
]);

// --- Schema cho từng game ---
export const GameSchema = z.object({
    gameId: z.number(),
    gameType: GameTypeEnum,
});

// --- Schema cho từng lesson ---
export const LessonSchema = z.object({
    lessonId: z.number(),
    unitName: z.string(),
    lessonName: z.string(),
    games: z.array(GameSchema),
});

// --- Schema tổng cho danh sách lessons ---
export const LessonsSchema = z.array(LessonSchema);

// --- Interface TypeScript infer ra từ Zod ---
export type Game = z.infer<typeof GameSchema>;
export type Lesson = z.infer<typeof LessonSchema>;
export type Lessons = z.infer<typeof LessonsSchema>;
