import z from "zod";
import type { GamePayload } from "../pages/admin/component/GameComponent/Game";
import type { DataGameRespon } from "../pages/admin/schemas/dataGameResponse";
import type { GameTypeEnum, GameTypesByGrade, Lessons } from "../pages/admin/schemas/game.schema";
import type { LessonDetail } from "../pages/admin/schemas/gamedetails.schema";
import axiosClient from "./axiosClient";


export const lessonResSchema = z.object({
    id: z.number().int(),
    unitNumber: z.string(),
    unitName: z.string(),
    orderIndex: z.number().int(),
    active: z.boolean(),
    // allow null or empty string from backend; use .nullable() if backend can return null explicitly
    urlMascot: z.union([z.string().url(), z.string().min(0), z.null()]),
    // coerce ISO string / epoch / Date -> Date
    updatedAt: z.preprocess((val) => {
        if (val instanceof Date) return val;
        if (typeof val === "string" || typeof val === "number") {
            const d = new Date(val);
            return isNaN(d.getTime()) ? val : d;
        }
        return val;
    }, z.date()),
});

export type LessonRes = z.infer<typeof lessonResSchema>;



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

export async function getListLesson(gradeId: number): Promise<LessonRes[]> {
    try {
        const response = await axiosClient.get<LessonRes[]>(
            `/api/lesson-admin/get-list/${gradeId}`
        );

        return response.data;
    } catch (error: any) {
        const message =
            error.response?.data?.message || "Không thể lấy danh sách bài học";
        throw new Error(message);
    }
}

export async function uploadMascot(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axiosClient.post("/api/uploads/lesson/img-mascot", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data.url;
}
export interface CreateLessonReq {
    unitNumber: string;
    unitName: string;
    orderIndex: number;
    active: boolean;
    gradeLevelId: number;
    urlMascot: string | null;
}

export interface CreateLessonRes {
    id: number;
    unitNumber: string;
    unitName: string;
    orderIndex: number;
    active: boolean;
    gradeLevelId: number;
    urlMascot: string;
    updatedAt: string;
}

export async function createLesson(payload: CreateLessonReq): Promise<CreateLessonRes> {
    const res = await axiosClient.post<CreateLessonRes>(
        "/api/lesson-admin/create",
        payload
    );
    return res.data;
}



