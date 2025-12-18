import axiosClient from "./axiosClient";

export type LessonBriefRes = {
  id: number;
  unitName: string;
  lessonName: string;
  orderIndex: number;
  percentComplete: number; // 0..100
  status: "ACTIVE" | "COMPLETE"| "LOCKED";
  mascot : string;
};

export type LessonsByClassRes = {
  profileId: number;
  gradeLevelId: number;
  gradeName: string;
  gradeOrderIndex: number; // 1..5
  lessons: LessonBriefRes[];
};

// --- Types giống Backend DTO --- //
export type MediaType = "IMAGE" | "AUDIO"; // (mở rộng thêm nếu backend có VIDEO)

export type MediaAssetDTORes = {
  id: number;
  url: string;
  mediaType: MediaType;
  altText?: string | null;
  durationSec?: number | null;
  storageProvider?: string | null;
  publicId?: string | null;
  tag?: string | null; // "normal" | "slow" cho AUDIO; ảnh thì null/"" cũng được
};

export type VocabularyDTORes = {
  id: number;
  term_en: string;
  term_vi: string;
  phonetic?: string | null;
  orderIndex: number;
  partOfSpeech?: string | null;
  mediaAssets: MediaAssetDTORes[];
};
export type SentenceDTORes ={
  id : number;
  orderIndex: number;
  sentence_en: string;
  sentence_vi: string;
  mediaAssets : MediaAssetDTORes[];
}


// --- Helper chung để lấy message lỗi từ BE ---
function getErrMsg(e: any, fallback: string) {
  return e?.response?.data?.message ??
         e?.response?.data?.error ??
         fallback;
}

// ---------------------------------------------
//                 API FUNCTIONS
// ---------------------------------------------

//  Danh sách bài học cho trang chủ
export async function fetchLessonsForHomePage(profileId: number): Promise<LessonsByClassRes> {
  try {
    const res = await axiosClient.get<LessonsByClassRes>(
      `/api/learn/lessons/home-page`,
      { params: { profileId } } // dùng params cho gọn
    );
    return res.data;
  } catch (e: any) {
    throw new Error(getErrMsg(e, "Không lấy được danh sách bài học"));
  }
}

//  Từ vựng theo lessonId
export async function fetchVocabulariesByLesson(lessonId: string | number): Promise<VocabularyDTORes[]> {
  try {
    const res = await axiosClient.get<VocabularyDTORes[]>(
      `/api/vocabularies/${lessonId}`
    );
    return res.data;
  } catch (e: any) {
    throw new Error(getErrMsg(e, "Không lấy được danh sách từ vựng"));
  }
}

//  Câu theo lessonId
export async function fetchSentenceByLesson(lessonId: string | number): Promise<SentenceDTORes[]> {
  try {
    const res = await axiosClient.get<SentenceDTORes[]>(
      `/api/sentences/${lessonId}`
    );
    return res.data;
  } catch (e: any) {
    throw new Error(getErrMsg(e, "Không lấy được danh sách câu"));
  }
}

/**
 * Lấy danh sách bài học và tiến độ của user cho một LỚP CỤ THỂ.
 * @param profileId ID của người học
 * @param gradeOrderIndex Lớp muốn xem (1, 2, 3...)
 */
    export async function fetchLessonsByGradeForProfile(
      profileId: number,
      gradeOrderIndex: number
    ): Promise<LessonsByClassRes> {
      try {
        const res = await axiosClient.get<LessonsByClassRes>(
          `/api/learn/lessons/by-grade-for-profile`,
          {
            params: { profileId, gradeOrderIndex }, // Gửi 2 params
          }
        );
        return res.data;
      } catch (e: any) {
        throw new Error(getErrMsg(e, "Không lấy được danh sách bài học cho lớp này"));
      }
    }

    export async function fecthLessonsForGuest(gradeId:number):Promise<LessonsByClassRes> {
      try{
        const res = await axiosClient.get<LessonsByClassRes>(
          `/api/learn/lessons/for-guest/${gradeId}`
        );
        return res.data;
      } catch (e: any) {
        throw new Error(getErrMsg(e, "Không lấy được danh sách bai hoc cho guest"));
    }
      
    }