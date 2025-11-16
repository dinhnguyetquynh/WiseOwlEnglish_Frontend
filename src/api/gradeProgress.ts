import axiosClient from "./axiosClient";

// 1. Định nghĩa Type cho dữ liệu trả về
export type LessonOfGradeProgress = {
  lessonId: number;
  unitName: string;
  lessonName: string;
  lessonProgress: number; // % hoàn thành của lesson
  lastTestScore: number;  // Điểm test gần nhất
};

export type GradeProgress = {
  orderIndex: number;     // Lớp 1, 2, 3...
  lessonsLearned: number; // Số bài đã học (completed)
  rewardScore: number;    // Tổng điểm thưởng
  starsArchived: number;  // Số sao (0-5)
  listLessons: LessonOfGradeProgress[]; // Danh sách bài học
};

// 2. Hàm gọi API
export async function getGradeProgress(
  orderIndex: number,
  profileId: number
): Promise<GradeProgress> {
  try {
    const res = await axiosClient.get<GradeProgress>(
      `/api/grade-progress/by-grade`,
      {
        params: { orderIndex, profileId },
      }
    );
    return res.data;
  } catch (error: any) {
    let message = "Không tải được dữ liệu tiến độ";
    if (error.response?.data?.message) {
      message = error.response.data.message;
    }
    throw new Error(message);
  }
}

// 👇 --- THÊM PHẦN MỚI --- 👇

// --- Types cho trang chi tiết ---
export type IncorrectItem = {
  itemEn: string;
  itemVi: string;
  wrongCount: number;
};

export type AttemptScore = {
  attemptId: number;
  score: number;
  finishedAt: string; // ISO Date string
};

export type TestAttemptHistory = {
  testId: number;
  testTitle: string;
  attempts: AttemptScore[];
};

export type LessonProgressDetail = {
  lessonId: number;
  unitName: string;
  lessonName: string;
  incorrectVocabularies: IncorrectItem[];
  incorrectSentences: IncorrectItem[];
  testHistories: TestAttemptHistory[];
};

// --- Hàm API mới ---
export async function getLessonProgressDetail(
  lessonId: number,
  profileId: number
): Promise<LessonProgressDetail> {
  try {
    const res = await axiosClient.get<LessonProgressDetail>(
      `/api/grade-progress/lesson-detail`,
      {
        params: { lessonId, profileId },
      }
    );
    return res.data;
  } catch (error: any) {
    let message = "Không tải được dữ liệu chi tiết";
    if (error.response?.data?.message) {
      message = error.response.data.message;
    }
    throw new Error(message);
  }
}