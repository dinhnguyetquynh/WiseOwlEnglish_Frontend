import z from "zod";
import type { GamePayload } from "../pages/admin/component/GameComponent/Game";
import type { DataGameRespon } from "../pages/admin/schemas/dataGameResponse";
import type { GameAdminDetailRes, GameTypeEnum, GameTypesByGrade, Lessons } from "../pages/admin/schemas/game.schema";
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

export const VocabResSchema = z.object({
    id: z.number().int().nonnegative(),
    orderIndex: z.number().int().nonnegative(),
    term_en: z.string(),
    phonetic: z.string().nullable().optional(),
    partOfSpeech: z.string().nullable().optional(),

    // Thêm các trường mới
    term_vi: z.string().nullable().optional(),
    isForLearning: z.boolean().optional().default(true),
    imgUrl: z.string().nullable().optional(),
    audioNormal: z.string().nullable().optional(),
    audioSlow: z.string().nullable().optional(),
});

export const SentenceAdminResSchema = z.object({
    id: z.number().int().nonnegative(),
    orderIndex: z.number().int().nonnegative(),
    sen_en: z.string(),

     sen_vi: z.string(),
     imgUrl: z.string().nullable().optional(),
    audioNormal: z.string().nullable().optional(),
    audioSlow: z.string().nullable().optional(),

});

export const LessonDetailSchema = z.object({
    vocabResList: z.array(VocabResSchema),
    sentenceResList: z.array(SentenceAdminResSchema),
});

/**
 * TypeScript types inferred from Zod
 */
export type VocabRes = z.infer<typeof VocabResSchema>;
export type SentenceAdminRes = z.infer<typeof SentenceAdminResSchema>;
export type LessonDetails = z.infer<typeof LessonDetailSchema>;

export async function getLessonDetail(lessonId: number): Promise<LessonDetails> {
    const res = await axiosClient.get(`/api/lesson-admin/detail/${lessonId}`);
    // validate + cast
    return res.data;
}



export const uploadAudio = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axiosClient.post("/api/uploads/lesson/audio", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return res.data.url; // server trả về URL audio
};
export const uploadVocabImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axiosClient.post("/api/uploads/lesson/img", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data.url; // server trả về URL ảnh
};
export const createVocab = async (payload: any) => {
    const res = await axiosClient.post("/api/admin/vocab/create", payload);
    return res.data.url;
};


export interface CreateSentenceReq {
    sen_en: string;
    sen_vn: string;
    lessonId: number;
    isForLearning: boolean;
    urlImg: string;
    urlAudioNormal: string;
    durationSecNormal: number;
    urlAudioSlow: string;
    durationSecSlow: number;
}

export async function createSentences(
    payload: CreateSentenceReq
): Promise<SentenceAdminRes> {

    const res = await axiosClient.post<SentenceAdminRes>(
        "/api/admin/sentences/create",
        payload
    );

    return res.data;
}

export async function getGameDetailToUpdate(
    gameId: number
): Promise<GameAdminDetailRes> {
    try {
        const response = await axiosClient.get<GameAdminDetailRes>(
            `/api/games/update/detail/${gameId}`
        );
        return response.data;
    } catch (error: any) {
        const message =
            error.response?.data?.message || "Không thể tải game để chỉnh sửa";
        throw new Error(message);
    }
}
export async function updateGame(gameId: number, payload: GamePayload) {
    try {
        const res = await axiosClient.put(`/api/games/update/${gameId}`, payload);
        return res.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Không thể cập nhật game");
    }
}
export interface TestItem {
    id: number;
    lessonId: number;
    title: string;
    type: string;
    description: string;
    durationMin: number;
    active: boolean;
}

export interface LessonTestItem {
    lessonId: number;
    unitName: string;
    lessonName: string;
    orderIndex: number;
    tests: TestItem[];
}
export const getTestsByGrade = async (gradeId: number) => {
    const res = await axiosClient.get(
        `/api/test-admin/by-grade?gradeId=${gradeId}`
    );
    return res.data;
};

export interface TestDetailItem {
    id: number;
    lessonId: number;
    title: string;
    type: string;
    description: string;
    durationMin: number;
    active: boolean;
    totalQuestion: number;
    hasAttempt: boolean;
}
export interface LessonDetailResponse {
    id: number;                // lessonId
    unitNumber: string;        // "Unit 1"
    unitName: string;          // "Colors"
    testList: TestDetailItem[];
}


export async function getTestsByLesson(lessonId: number): Promise<LessonDetailResponse> {
    const res = await axiosClient.get(
        `/api/test-admin/get-all/${lessonId}`
    );
    return res.data;
}
export async function updateTestStatus(testId: number, active: boolean) {
    try {
        const res = await axiosClient.patch(
            `api/test-admin/update-status/${testId}?active=${active}`
        );

        return res.data;
    } catch (err) {
        console.error("Update test status error:", err);
        throw new Error("Không thể cập nhật trạng thái");
    }
}

export const updateLessonStatus = async (id: number, isActive: boolean): Promise<CreateLessonRes> => {
    // Gọi API PATCH: /api/lessons/{id}/active?isActive=...
    const response = await axiosClient.patch(`/api/lesson-admin/${id}/active`, null, {
        params: {
            isActive: isActive
        }
    });
    return response.data; // Backend trả về đối tượng Lesson (CreateLessonRes)
};
export const deleteLesson = async (id: number): Promise<string> => {
    // Gọi API DELETE: /api/lessons/delete/{id}
    const response = await axiosClient.delete(`/api/lesson-admin/delete/${id}`);
    return response.data; // Trả về thông báo String từ Backend
};
// API Xoá Vocabulary
export const deleteVocab = async (id: number): Promise<string> => {
    // Backend trả về String message (ResponseEntity<String>)
    const response = await axiosClient.delete(`/api/admin/vocab/delete/${id}`); 
    return response.data; 
};

// API Xoá Sentence
export const deleteSentence = async (id: number): Promise<string> => {
    const response = await axiosClient.delete(`/api/admin/sentences/delete/${id}`);
    return response.data;
};

export const deleteGame = async (gameId: number) => {
    // API endpoint khớp với backend controller: /api/games/delete/{id}
    const response = await axiosClient.delete(`/api/games/delete/${gameId}`);
    return response.data;
};
// Định nghĩa kiểu dữ liệu gửi lên
export interface UpdateLessonReq {
    unitName: string;
    lessonName: string;
    mascot: string;
}
export interface LessonUpdatedRes {
    id : number;
    unitNumber : string;
    unitName : string;
    orderIndex : number;
    active : boolean;
    urlMascot : string;
    updatedAt: string;

}
export const updateLesson = async (id: number, data: UpdateLessonReq):Promise<LessonUpdatedRes> => {
    // Đường dẫn API phải khớp với Backend Controller bạn đã viết
    const response = await axiosClient.put(`/api/lesson-admin/update/${id}`, data);
    return response.data;
};

// 3. THÊM INTERFACE CHO REQUEST UPDATE
export interface VocabUpdateReq {
    term_en: string;
    term_vi: string;
    phonetic: string;
    partOfSpeech: string;
    isForLearning: boolean;
    imgUrl: string | null;
    audioNormal: string | null;
    audioSlow: string | null;
}

// 4. HAM UPDATE VOCAB
export const updateVocab = async (id: number, data: VocabUpdateReq): Promise<VocabRes> => {
    const response = await axiosClient.put<VocabRes>(`/api/admin/vocab/update/${id}`, data);
    return response.data;
};

export const deleteTestById = async (id: number) => {
    const url = `/api/test-admin/delete/${id}`; 
    return axiosClient.delete(url);
};

// 1. Interface cho Request Update Câu
export interface SentenceUpdateReq {
    sen_en: string;
    sen_vi: string;
    imgUrl: string | null;
    audioNormal: string | null;
    audioSlow: string | null;
}

// 2. Interface đầy đủ cho Sentence (để hiển thị lên form sửa)
// (Lưu ý: SentenceAdminRes hiện tại của bạn hơi thiếu trường, bạn có thể dùng cái này cho Modal)
export interface SentenceFullRes {
    id: number;
    orderIndex: number;
    sen_en: string;
    sen_vi: string;
    imgUrl: string | null;
    audioNormal: string | null;
    audioSlow: string | null;
    isForLearning: boolean;
}

// 3. Hàm gọi API Update Sentence
export const updateSentence = async (id: number, data: SentenceUpdateReq): Promise<SentenceFullRes> => {
    const response = await axiosClient.put<SentenceFullRes>(
        `/api/admin/sentences/update/${id}`, // Endpoint này cần khớp với Controller Java của bạn
        data
    );
    return response.data;
};