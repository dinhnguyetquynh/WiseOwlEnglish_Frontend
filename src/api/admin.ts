import type { Lessons } from "../pages/admin/schemas/game.schema";
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
