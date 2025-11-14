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