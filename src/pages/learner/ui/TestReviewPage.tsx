// src/pages/learner/ui/TestReviewPage.tsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getTestById } from "../../../api/test";
import type { SubmitTestRes, TestRes, QuestionResultRes } from "../../../type/test";
import { TEST_QUESTION_REGISTRY } from "../ui/Registry"; // Tận dụng lại Registry cũ
import "../css/TestRunner.css"; // Tận dụng CSS của TestRunner

export default function TestReviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Lấy kết quả từ trang trước
  const result = location.state?.result as SubmitTestRes;

  const [testData, setTestData] = useState<TestRes | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!result) {
      navigate("/learn"); // Nếu không có dữ liệu, đá về home
      return;
    }

    (async () => {
      try {
        // Gọi API lấy nội dung đề thi gốc để hiển thị lại câu hỏi/hình ảnh
        const data = await getTestById(result.testId);
        // Sort lại cho đúng thứ tự hiển thị lúc làm bài
        data.questionRes.sort((a, b) => a.position - b.position);
        setTestData(data);
      } catch (error) {
        console.error("Lỗi tải bài thi:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [result, navigate]);

  if (!result || loading || !testData) return <div>Đang tải lại bài làm...</div>;

  return (
    <div className="test-layout" style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{margin: 0}}>Xem lại: {testData.title}</h2>
        <button onClick={() => navigate(-1)} className="pg-btn pg-btn--primary">Quay lại kết quả</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
        {testData.questionRes.map((question, index) => {
          const userResult = result.questionResults.find(r => r.questionId === question.id);
          
          if (!userResult) return null;

          return (
            <div key={question.id} style={{ 
              border: "1px solid #ddd", 
              borderRadius: "12px", 
              padding: "20px",
              background: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              borderLeft: userResult.correct ? "5px solid #22c55e" : "5px solid #ef4444"
            }}>
              <div style={{ marginBottom: "10px", fontWeight: "bold", color: "#555" }}>
                Câu {index + 1}: {userResult.correct ? <span style={{color: '#22c55e'}}>Đúng</span> : <span style={{color: '#ef4444'}}>Sai</span>}
              </div>

              {/* Render Component Câu hỏi (Tái sử dụng logic Registry) */}
              {/* Chúng ta cần sửa Registry một chút hoặc Mock cái host */}
              <ReviewItemRenderer 
                question={question} 
                userResult={userResult} 
              />
              
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Component wrapper để render từng loại câu hỏi ở chế độ Review
function ReviewItemRenderer({ question, userResult }: { question: any, userResult: QuestionResultRes }) {
  // Tạo một "host" giả để truyền vào các component con (TestPWM, TestPWW...)
  // Host này sẽ cung cấp dữ liệu đã chọn thay vì cho phép người dùng chọn
  const mockHost = {
    getSelected: (qid: number) => {
      // Mapping lại dữ liệu từ userResult sang format mà các component TestXXX hiểu (SelValue)
      // 1. Trắc nghiệm (OptionId)
    if (userResult.selectedOptionId) return { type: "option", value: userResult.selectedOptionId };
    
    // 2. Nhập Text (TestPWW, TestSHW)
    if (userResult.textInput !== undefined && userResult.textInput !== null) {
         return { type: "text", value: userResult.textInput };
    }

    // 3. Sắp xếp (TestWTS)
    if (userResult.userSequence && userResult.userSequence.length > 0) {
        return { type: "sequence", value: userResult.userSequence };
    }

    // 4. Nối cặp (TestPMW)
    if (userResult.userPairs && userResult.userPairs.length > 0) {
        return { type: "pairs", value: userResult.userPairs };
    }
    
    return null;
    },
    setSelected: () => {}, // Không làm gì cả (Read-only)
    disabled: true, // Khóa tương tác
  };

  // Render nội dung câu hỏi
  const renderContent = TEST_QUESTION_REGISTRY[question.questionType]?.(question, mockHost as any);

  // Hiển thị đáp án đúng (nếu sai)
  return (
    <div>
      <div style={{ opacity: 1 }}>
      
        {renderContent}
      </div>

      {/* Phần giải thích đáp án */}
      {!userResult.correct && (
        <div style={{ marginTop: "15px", padding: "10px", background: "#f9fafb", borderRadius: "8px", fontSize: "14px" }}>
          <strong>Đáp án đúng: </strong> 
          {/* Logic hiển thị đáp án đúng dựa vào ID */}
          {question.options
            .filter((o: any) => userResult.correctOptionIds.includes(o.id))
            .map((o: any) => o.optionText || o.text || "Hình ảnh")
            .join(", ")
          }
          {question.hiddenWord && <span>{question.hiddenWord}</span>}
        </div>
      )}
    </div>
  );
}