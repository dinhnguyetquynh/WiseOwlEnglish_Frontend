import type { GamePayload } from "../pages/admin/component/GameComponent/Game";
import type { DataGameRespon } from "../pages/admin/schemas/dataGameResponse";
import type { GameTypeEnum, GameTypesByGrade, Lessons } from "../pages/admin/schemas/game.schema";
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
    gradeOrder: number,
    lessonId: number
): Promise<GameTypesByGrade> {
    try {
        const response = await axiosClient.get<GameTypesByGrade>(
            "/api/games/types-by-grade",
            {
                params: { gradeOrder, lessonId },
            }
        );
        return response.data;
    } catch (error: any) {
        const message =
            error.response?.data?.message || "Không thể tải danh sách bài học";
        throw new Error(message);
    }
}

export async function getDataGame(
    gameType: GameTypeEnum,
    lessonId: number
): Promise<DataGameRespon> {
    try {
        const response = await axiosClient.get<DataGameRespon>(
            "/api/data-game/get-data",
            {
                params: { gameType, lessonId },
            }
        );
        return response.data;
    } catch (error: any) {
        const message =
            error.response?.data?.message || "Không thể tải danh sách bài học";
        throw new Error(message);
    }
}

export async function createGame(payload: GamePayload): Promise<DataGameRespon> {
    try {
        const response = await axiosClient.post<DataGameRespon>(
            "/api/games/create-game",
            payload
        );

        return response.data;
    } catch (error: any) {
        const message =
            error.response?.data?.message || "Không thể tạo game";
        throw new Error(message);
    }
}
