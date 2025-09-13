import React from "react";
import type { Lesson } from "../../type/lesson";
import "../../styles/admin.css";

/** 
 * Card hiển thị 1 bài học
 * variant: đổi màu viền (green | blue | red)
 */
export default function LessonCard({
  lesson,
  variant = "green",
}: { lesson: Lesson; variant?: "green" | "blue" | "red" }) {
  return (
    <div className={`lesson-card ${variant}`}>
      <div className="lesson-title">Lesson: {lesson.title}</div>
      <div className="lesson-meta">
        <div>Thứ tự: <strong>{lesson.position}</strong></div>
        <div>Trạng thái: <strong>{lesson.isActive ? "Hoạt động" : "Không hoạt động"}</strong></div>
      </div>
    </div>
  );
}
