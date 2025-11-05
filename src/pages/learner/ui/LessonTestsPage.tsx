import React from "react";
import { useParams } from "react-router-dom";
import TestListByLesson from "../../../components/learner/ui/TestListByLesson";

export default function LessonTestsPage() {
  const { lessonId } = useParams<{ lessonId: string }>();

  return (
    <div style={{ padding: "20px" }}>
      <div style={{marginLeft:"300px"}}>
        <p>Trang chủ &gt; Menu bài học &gt; Kiểm tra </p>
      </div>
      <TestListByLesson lessonId={Number(lessonId)} />
    </div>
  );
}
