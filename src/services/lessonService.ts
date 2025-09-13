// src/services/lessonService.ts
import type { Lesson } from "../type/lesson";
import { API_BASE, http } from "./http";

export type CreateLessonInput = {
  title: string;
  position: number;
  isActive: boolean;
  classId: number;
};

// Tạo "DB" giả trong bộ nhớ để bạn thấy được danh sách thay đổi
// let FAKE_DB: Lesson[] = [];

// export async function listLessonsByClass(classId: number): Promise<Lesson[]> {
//   // Giả lập call API: trả về theo classId + sắp xếp theo position
//   // Thêm độ trễ nhẹ để giống gọi mạng
//   await sleep(200);
//   return FAKE_DB
//     .filter(l => l.classId === classId && l.deletedAt == null)
//     .sort((a, b) => a.position - b.position);
// }

// export async function createLesson(input: CreateLessonInput): Promise<Lesson> {
//   await sleep(200);
//   const now = new Date().toISOString();
//   const newLesson: Lesson = {
//     id: Date.now(),        // tạm dùng timestamp làm id
//     title: input.title,
//     position: input.position,
//     isActive: input.isActive,
//     classId: input.classId,
//     createdAt: now,
//     updatedAt: now,
//     deletedAt: null
//   };
//   FAKE_DB.push(newLesson);
//   return newLesson;
// }

// // tiện ích nhỏ mô phỏng độ trễ mạng
// function sleep(ms: number) {
//   return new Promise(res => setTimeout(res, ms));
// }
// Map từ LessonRespone (BE) -> Lesson (FE)
// Map từ LessonRespone (BE) -> Lesson (FE)
function mapRespToLesson(resp: any, levelIdFallback?: number): Lesson {
  return {
    id: resp.id,
    title: resp.title,
    position: resp.position,
    isActive: resp.isActive ?? resp.active ?? false,              // BE có field này
    classId: levelIdFallback ?? 0,         // BE chưa trả -> lấy từ input
    createdAt: resp.createdAt ?? null,
    updatedAt: resp.updateAt ?? null,      // BE đặt tên updateAt
    deletedAt: resp.deletedAt ?? null,
  };
}

export async function createLesson(input: CreateLessonInput): Promise<Lesson> {
  const body = {
    levelId: input.classId,                // BE cần field levelId
    title: input.title,
    position: input.position,
    isActive: input.isActive,
  };
  const resp = await http<any>(`${API_BASE}/api/lessons`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return mapRespToLesson(resp, input.classId);
}

export async function listLessonsByClass(classId: number): Promise<Lesson[]> {
  // Gọi API backend GET /api/lessons?gradeLevelId=...
  const arr = await http<any[]>(`${API_BASE}/api/lessons?gradeLevelId=${classId}`);
  return arr.map((x) => mapRespToLesson(x, classId));
}
