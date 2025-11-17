import { z } from "zod";

// --- Enum cho gameType ---
export const GameTypeEnum = z.enum([
    "PICTURE_WORD_MATCHING",
    "SOUND_WORD_MATCHING",
    "PICTURE_SENTENCE_MATCHING",
    "PICTURE_WORD_WRITING",
    "PICTURE4_WORD4_MATCHING",
    "PRONUNCIATION",
    "SENTENCE_HIDDEN_WORD",
    "WORD_TO_SENTENCE"
]);
// --- Mảng các loại game (API /types-by-grade trả về) ---
export const GameTypesByGradeSchema = z.array(GameTypeEnum);
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

export const GameEnum = z.enum([
    "QUIZ",
    "MATCH",
    "FLASHCARD",
    "PUZZLE",
    // thêm các enum khác nếu backend có
]);
export type GameEnum = z.infer<typeof GameEnum>;

// Prompt type enum
export const PromptTypeEnum = z.enum([
    "VOCAB",
    "SENTENCE",
    "IMAGE",
    "AUDIO",
]);
export type PromptType = z.infer<typeof PromptTypeEnum>;

// Content type enum
export const ContentTypeEnum = z.enum([
    "VOCAB",
    "SENTENCE",
    "IMAGE",
    "AUDIO",
]);
export type ContentType = z.infer<typeof ContentTypeEnum>;

// Side enum (matching)
export const SideEnum = z.enum(["LEFT", "RIGHT"]);
export type Side = z.infer<typeof SideEnum>;
// --- Schema tổng cho danh sách lessons ---
export const LessonsSchema = z.array(LessonSchema);
export type GameTypesByGrade = z.infer<typeof GameTypesByGradeSchema>;
// --- Interface TypeScript infer ra từ Zod ---

export type GameTypeEnum = z.infer<typeof GameTypeEnum>;


export type Game = z.infer<typeof GameSchema>;
export type Lesson = z.infer<typeof LessonSchema>;
export type Lessons = z.infer<typeof LessonsSchema>;
