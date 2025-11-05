import axiosClient from "./axiosClient";

export type LessonBriefRes = {
  id: number;
  unitName: string;
  lessonName: string;
  orderIndex: number;
  percentComplete: number; // 0..100
  status: "ACTIVE" | "COMPLETE";
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


// const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

// function getAccessToken() {
//   const t = localStorage.getItem("accessToken");
//   if (!t) throw new Error("NOT_AUTHENTICATED");
//   return t;
// }

// export async function fetchLessonsForHomePage(profileId: number): Promise<LessonsByClassRes> {
//   const token = getAccessToken();
//   const url = `${BASE_URL}/api/learn/lessons/home-page?profileId=${profileId}`;
//   const res = await fetch(url, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });
//   if (!res.ok) {
//     let msg = "Không lấy được danh sách bài học";
//     try { const data = await res.json(); msg = data?.message ?? data?.error ?? msg; } catch {}
//     throw new Error(msg);
//   }
//   return res.json();
// }





// // Lấy danh sách từ vựng theo lessonId
// export async function fetchVocabulariesByLesson(lessonId: string | number): Promise<VocabularyDTORes[]> {
//   const token = getAccessToken();
//   const url = `${BASE_URL}/api/vocabularies/${lessonId}`;
//   const res = await fetch(url, {
//     headers: { Authorization: `Bearer ${token}` },
//   });
//   if (!res.ok) {
//     let msg = "Không lấy được danh sách từ vựng";
//     try { const data = await res.json(); msg = data?.message ?? data?.error ?? msg; } catch {}
//     throw new Error(msg);
//   }
//   return res.json();
// }



// // Lấy danh sách cau theo lessonId
// export async function fetchSentenceByLesson(lessonId: string | number): Promise<SentenceDTORes[]> {
//   const token = getAccessToken();
//   const url = `${BASE_URL}/api/sentences/${lessonId}`;
//   const res = await fetch(url, {
//     headers: { Authorization: `Bearer ${token}` },
//   });
//   if (!res.ok) {
//     let msg = "Không lấy được danh sách cau";
//     try { const data = await res.json(); msg = data?.message ?? data?.error ?? msg; } catch {}
//     throw new Error(msg);
//   }
//   return res.json();
// }


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