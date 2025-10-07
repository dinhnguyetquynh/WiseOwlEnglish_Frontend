export type LessonBriefRes = {
  id: number;
  unitName: string;
  lessonName: string;
  orderIndex: number;
  percentComplete: number; // 0..100
  status: "ACTIVE" | "COMPLETE";
};

export type LessonsByAgeRes = {
  profileId: number;
  age: number;
  gradeLevelId: number;
  gradeName: string;
  gradeOrderIndex: number; // 1..5
  lessons: LessonBriefRes[];
};

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

function getAccessToken() {
  const t = localStorage.getItem("accessToken");
  if (!t) throw new Error("NOT_AUTHENTICATED");
  return t;
}

export async function fetchLessonsByAge(profileId: number): Promise<LessonsByAgeRes> {
  const token = getAccessToken();
  const url = `${BASE_URL}/api/learn/lessons/by-age?profileId=${profileId}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    let msg = "Không lấy được danh sách bài học";
    try { const data = await res.json(); msg = data?.message ?? data?.error ?? msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

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



// Lấy danh sách từ vựng theo lessonId
export async function fetchVocabulariesByLesson(lessonId: string | number): Promise<VocabularyDTORes[]> {
  const token = getAccessToken();
  const url = `${BASE_URL}/api/vocabularies/${lessonId}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    let msg = "Không lấy được danh sách từ vựng";
    try { const data = await res.json(); msg = data?.message ?? data?.error ?? msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}
