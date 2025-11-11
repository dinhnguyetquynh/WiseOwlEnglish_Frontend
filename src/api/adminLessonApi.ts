import axiosClient from "./axiosClient";

// 1. Định nghĩa kiểu dữ liệu dựa trên DTO bạn cung cấp
export interface LessonByGradeRes {
  id: number;
  unitName: string;
  lessonName: string;
  orderIndex: number;
  active: boolean;
  updatedAt: string; // Đây là LocalDateTime, sẽ là một chuỗi ISO string
  mascot: string | null;
}

// 2. Hàm gọi API bằng axiosClient
export async function getLessonsByGrade(
  gradeId: number
): Promise<LessonByGradeRes[]> {
  try {
    // Gọi đúng endpoint GET /api/learn/lessons/by-grade
    // (Vì LessonController của bạn có @RequestMapping("/api/learn"))
    const response = await axiosClient.get<LessonByGradeRes[]>(
      "/api/learn/lessons/by-grade",
      {
        params: { gradeId }, // Gửi gradeId làm query param
      }
    );

    // Sắp xếp theo orderIndex để đảm bảo thứ tự
    return response.data.sort((a, b) => a.orderIndex - b.orderIndex);

  } catch (error: any) {
    let message = "Không thể tải danh sách bài học";
    if (error.response?.data?.message) {
      message = error.response.data.message;
    }
    throw new Error(message);
  }
}