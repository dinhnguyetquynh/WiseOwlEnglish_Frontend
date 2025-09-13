export interface Lesson {
  id: number;              // Long -> number
  title: string;
  position: number;        // int -> number
  isActive: boolean;
  classId: number;         // Long (FK) -> number
  createdAt: string;       // LocalDateTime -> ISO string (ex: "2025-09-03T10:00:00")
  updatedAt: string;
  deletedAt?: string | null; // optional (nullable)
}