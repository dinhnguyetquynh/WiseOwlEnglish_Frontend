import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { gotoResult } from "../../../utils/gameResult";
import "../css/SentenceHiddenGame.css"; // Đổi tên file CSS
import { getSentenceHiddenGames, type SentenceHiddenRes } from "../../../api/game";
import { getProfileId } from "../../../store/storage";
import { markItemAsCompleted, type LessonProgressReq } from "../../../api/lessonProgress";

// Giả định API Fetch, bạn cần điều chỉnh trong file api/game.ts của bạn
// Ví dụ:
// export const getSentenceHiddenGames = async (lessonId: number): Promise<SentenceHiddenRes[]> => { ... }

export default function SentenceHiddenGamePage() {
  const navigate = useNavigate();
  // Giả sử unitId trong route của bạn chính là lessonId
  const { unitId: lessonId = "" } = useParams(); 

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [games, setGames] = useState<SentenceHiddenRes[]>([]);// Mảng câu hỏi
  
  const [idx, setIdx] = useState(0);// Chỉ số câu hiện tại
  const [userInput, setUserInput] = useState("");// Từ người chơi điền
  const [judge, setJudge] = useState<null | "correct" | "wrong">(null);// Trạng thái đã chấm
  const [earned, setEarned] = useState(0); // Tổng điểm kiếm được
  const [correctCount, setCorrectCount] = useState(0); // Số câu đúng. 

  const total = games.length;
  const current = games[idx];

  // Lấy câu trả lời đúng từ dữ liệu (chỉ có 1 phần tử trong optRes)
  const correctAnswer = useMemo(() => {
    // Chỉ lấy từ đầu tiên, giả định chỉ có 1 đáp án
    return current?.optRes?.[0]?.answerText || current?.hiddenWord || "";
  }, [current]);

  // --- 1. Fetch Dữ liệu ---
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        // Thay đổi hàm API gọi đến endpoint mới
        const data = await getSentenceHiddenGames(Number(lessonId));
        if (!alive) return;
        data.sort((a, b) => a.position - b.position);
        setGames(data);
        setError(null);
      } catch (e: any) {
        setError(e?.message ?? "Load data failed");
      } finally {
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [lessonId]);

  // --- 2. Reset trạng thái khi chuyển câu ---
  useEffect(() => {
    setUserInput("");
    setJudge(null);
  }, [idx]);

  // Tính toán phần trăm tiến độ
  const progressPct = useMemo(() => (total ? Math.round((idx / total) * 100) : 0), [idx, total]);

  // --- 3. Xử lý Kiểm tra ---
  const handleCheck = useCallback(() => {
    if (!current || !userInput.trim()) return;

    // Chuẩn hóa và so sánh: loại bỏ khoảng trắng dư thừa, chuyển về chữ thường để so sánh không phân biệt hoa/thường (tùy theo yêu cầu game)
    const normalizedInput = userInput.trim().toLowerCase();
    const normalizedCorrectAnswer = correctAnswer.trim().toLowerCase();
    
    // Logic chấm điểm
    const isRight = normalizedInput === normalizedCorrectAnswer;

    if (isRight) {
      setCorrectCount((x) => x + 1);
      setEarned((x) => x + (current.rewardCore ?? 0));
      setJudge("correct");
    } else {
      setJudge("wrong");
    }
  }, [current, userInput, correctAnswer]);

  // --- 4. Chuyển câu hoặc Hoàn thành ---
  const nextOrFinish = useCallback(async () => {
    // if (idx + 1 < total) {
    //   setJudge(null);
    //   setIdx((x) => x + 1);
    // } else {
    //   // Chuyển hướng đến trang kết quả
    //   gotoResult(navigate, {
    //     from: "sentence-hidden",
    //     gameType:"sentence",
    //     unitId: lessonId,
    //     total,
    //     correct: correctCount,
    //     points: earned,
    //   });
    // }
  const learnerProfileId = Number(getProfileId());
          const myPayload: LessonProgressReq = {
          learnerProfileId,
          lessonId:Number(lessonId),
          itemType: "GAME_QUESTION", // Phải là chuỗi khớp với Enum
          itemRefId: Number(current.id)
          };
      
          try {
              await markItemAsCompleted(myPayload);
              console.log("FE: Đã cập nhật thành công!");
              const next = idx + 1;
              if (next >= total) {
        // ➜ HOÀN TẤT: điều hướng sang trang kết quả và truyền dữ liệu
                gotoResult(navigate, {
                  from: "sentence-hidden",  
                  gameType:"sentence",     
                  unitId: lessonId,                   
                  total,
                  correct: correctCount,    
                  points: earned,           
                });
              }else {
              // ➜ CHƯA HOÀN TẤT: Chuyển sang câu tiếp theo
              setIdx(next);
              setJudge(null);
              }
          } catch (error) {
              console.error("Lỗi khi đang lưu tiến độ:", error);
              if (error instanceof Error) {
                  console.error(error.message); 
              } else {
                  console.error("Một lỗi không xác định đã xảy ra:", error);
              }
          }
  }, [idx, total, navigate, lessonId, correctCount, earned]);
  
  // --- 5. Hàm render câu hỏi với ô input ---
  const renderQuestionText = useMemo(() => {
    if (!current) return null;
    
    // Dữ liệu API: questionText chứa dấu gạch dưới (ví dụ: "I am a _____.")
    // Lấy từ cần điền (để biết độ dài ô input nếu cần)
    const wordToHide = current.hiddenWord || correctAnswer; 
    
    // Thay thế dấu gạch dưới (hoặc từ placeholder) bằng ô input
    const parts = current.questionText.split("___"); // Giả sử từ bị khuyết được đánh dấu bằng "_____"
    
    if (parts.length < 2) {
      return <div>{current.questionText} (Không tìm thấy chỗ trống để điền)</div>;
    }

    return (
      <div className="shg__question-text">
        {parts[0]}
        <input 
          type="text" 
          className={`shg__input ${judge === "correct" ? "correct" : ""} ${judge === "wrong" ? "wrong" : ""}`}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          // placeholder="Từ bị thiếu"
          disabled={judge !== null}
          // Thiết lập autoFocus nếu chưa chấm điểm
          autoFocus={judge === null} 
          // Thiết lập width ước tính cho ô input (ví dụ: 10px * số ký tự + padding)
          style={{ width: `${Math.max(8, wordToHide.length) * 12 + 20}px` }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && userInput.trim() && judge === null) {
                handleCheck();
            } else if (e.key === 'Enter' && judge !== null) {
                nextOrFinish();
            }
          }}
        />
        {parts.slice(1).join("_____")} {/* nối lại phần còn lại */}
      </div>
    );
  }, [current, userInput, judge, handleCheck, nextOrFinish, correctAnswer]);


  if (loading) return <div className="shg__wrap"><div className="shg__loader">Đang tải...</div></div>;
  if (error) return <div className="shg__wrap"><div className="shg__error">{error}</div></div>;
  if (!current) return <div className="shg__wrap"><div className="shg__empty">Không có dữ liệu.</div></div>;

  return (
    <div className="shg__wrap">
      <div className="shg__topbar">
        <button className="shg__close" onClick={() => navigate(-1)} aria-label="close">×</button>
        <div className="shg__progress">
          <div className="shg__progress-bar">
            <div className="shg__progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="shg__progress-text">{idx + 1}/{total}</div>
        </div>
      </div>

      <h1 className="shg__title">Điền từ còn thiếu vào câu</h1>

      {/* Box chứa hình ảnh */}
      <div className={`shg__image-box ${judge === "correct" ? "ok" : ""} ${judge === "wrong" ? "no" : ""}`}>
        <img src={current.imgURL} alt="question" />
      </div>
      
      {/* Hiển thị câu hỏi với ô input */}
      <div className="shg__question-container">
        {renderQuestionText}
      </div>


      {/* Footer khi CHƯA kiểm tra */}
      {judge === null && (
        <div className="shg__actions">
          <button 
            className="shg__ghost" 
            onClick={() => setIdx((x) => Math.min(total - 1, x + 1))}
            disabled={idx + 1 >= total} // Chỉ cho phép bỏ qua nếu không phải câu cuối
          >
            Bỏ qua
          </button>
          <button
            className="shg__primary"
            disabled={!userInput.trim()} // Vô hiệu hóa nếu input rỗng
            onClick={handleCheck}
          >
            KIỂM TRA
          </button>
        </div>
      )}

      {/* === FEEDBACK BANNER DÍNH ĐÁY === */}
      {judge !== null && (
        <div className={`shg__feedback ${judge === "correct" ? "shg__feedback--ok" : "shg__feedback--bad"}`}>
          <div className="shg__feedback-inner">
            <div className="shg__fb-left">
              <div className={judge === "correct" ? "shg__fb-icon ok" : "shg__fb-icon bad"} aria-hidden />
              <div className="shg__fb-text">
                <div className="shg__fb-title">
                  {judge === "correct" ? "Tuyệt vời! Đáp án đúng" : "Đáp án đúng:"}
                </div>
                <div className="shg__fb-answer">{correctAnswer}</div>
                {judge === "correct" && (
                  <div className="shg__fb-reward">
                    Bạn nhận được <b>+{current.rewardCore ?? 0}</b> điểm thưởng
                  </div>
                )}
              </div>
            </div>

            <div className="shg__fb-right">
              <button
                className={`shg__primary ${judge === "correct" ? "ok" : "no"}`}
                onClick={nextOrFinish}
                autoFocus
              >
                {judge === "correct" ? "TIẾP TỤC" : "ĐÃ HIỂU"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}