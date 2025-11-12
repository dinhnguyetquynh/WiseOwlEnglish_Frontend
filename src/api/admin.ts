import type { GameTypesByGrade, Lessons } from "../pages/admin/schemas/game.schema";
import type { LessonDetail } from "../pages/admin/schemas/gamedetails.schema";
import axiosClient from "./axiosClient";


export async function getLessonsGameByGrade(
    gradeId: number
): Promise<Lessons> {
    try {
        const response = await axiosClient.get<Lessons>(
            "/api/games/lesson-games-by-grade",
            {
                params: { gradeId },
            }
        );
        return response.data;
    } catch (error: any) {
        const message =
            error.response?.data?.message || "Không thể tải danh sách bài học";
        throw new Error(message);
    }
}

export async function getDetailsGameOfLessons(
    lessonId: number
): Promise<LessonDetail> {
    try {
        const response = await axiosClient.get<LessonDetail>(
            `/api/games/details-games-of-lesson/${lessonId}`
        );
        return response.data;
    } catch (error: any) {
        const message =
            error.response?.data?.message || "Không thể tải danh sách bài học";
        throw new Error(message);
    }
}

export async function getTypesByGrade(
    gradeOrder: number
): Promise<GameTypesByGrade> {
    try {
        const response = await axiosClient.get<GameTypesByGrade>(
            "/api/games/types-by-grade",
            {
                params: { gradeOrder },
            }
        );
        return response.data;
    } catch (error: any) {
        const message =
            error.response?.data?.message || "Không thể tải danh sách bài học";
        throw new Error(message);
    }
}