import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { gotoResult } from "../../../utils/gameResult";
import "../css/SentenceHiddenGame.css"; // Đổi tên file CSS
import { getSentenceHiddenGames, submitGameAnswer, type GameAnswerReq, type SentenceHiddenRes } from "../../../api/game";
import { getProfileId } from "../../../store/storage";
import { markItemAsCompleted, type LessonProgressReq } from "../../../api/lessonProgress";

// Giả định API Fetch, bạn cần điều chỉnh trong file api/game.ts của bạn
// Ví dụ:
// export const getSentenceHiddenGames = async (lessonId: number): Promise<SentenceHiddenRes[]> => { ... }

export default function SentenceHiddenGamePage() {
  const navigate = useNavigate();
  // Giả sử unitId trong route của bạn chính là lessonId
  const { unitId: lessonId = "" } = useParams(); 
  const profileId = getProfileId(); // 👈 Lấy profileId
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [games, setGames] = useState<SentenceHiddenRes[]>([]);// Mảng câu hỏi
  
  const [idx, setIdx] = useState(0);// Chỉ số câu hiện tại
  const [userInput, setUserInput] = useState("");// Từ người chơi điền
  const [judge, setJudge] = useState<null | "correct" | "wrong">(null);// Trạng thái đã chấm
  const [earned, setEarned] = useState(0); // Tổng điểm kiếm được
  const [correctCount, setCorrectCount] = useState(0); // Số câu đúng. 

  // State mới
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [correctAnswerText, setCorrectAnswerText] = useState("");

  const total = games.length;
  const current = games[idx];


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
    setCorrectAnswerText("");
  }, [idx]);

  // Tính toán phần trăm tiến độ
  const progressPct = useMemo(() => (total ? Math.round((idx / total) * 100) : 0), [idx, total]);

  // --- 3. Xử lý Kiểm tra ---
const handleCheck = useCallback(async () => {
    if (!current || !userInput.trim() || !profileId || isSubmitting) {
       if (!profileId) setError("Lỗi: Không tìm thấy Profile ID.");
       return;
    }
    
    setIsSubmitting(true);

    const answerPayload: GameAnswerReq = {
        profileId: profileId,
        gameId: current.gameId,
        gameQuestionId: current.id,
        textInput: userInput.trim() // 👈 Gửi textInput
    };

    const progressPayload: LessonProgressReq = {
        learnerProfileId: profileId,
        lessonId: Number(lessonId),
        itemType: "GAME_QUESTION",
        itemRefId: Number(current.id)
    };
    
    try {
        const [answerResult] = await Promise.all([
            submitGameAnswer(answerPayload),
            markItemAsCompleted(progressPayload).catch(e => {
                console.error("Lỗi ngầm khi lưu tiến độ:", e.message);
            })
        ]);

        if (answerResult.isCorrect) {
            setJudge("correct");
            setCorrectCount((c) => c + 1);
            setEarned((p) => p + answerResult.rewardEarned);
        } else {
            setJudge("wrong");
        }
        setCorrectAnswerText(answerResult.correctAnswerText); 

    } catch (err: any) {
        setError(err.message || "Lỗi khi nộp câu trả lời");
    } finally {
        setIsSubmitting(false);
    }
  }, [current, userInput, profileId, isSubmitting, lessonId]);

  // --- 4. Chuyển câu hoặc Hoàn thành ---
 const nextOrFinish = useCallback(async () => {
    const next = idx + 1;
    if (next >= total) {
      gotoResult(navigate, {
        from: "sentence-hidden",
        gameType:"sentence",
        unitId: lessonId,
        total,
        correct: correctCount,
        points: earned,
      });
    } else {
      setIdx(next);
      // State khác đã được reset trong useEffect[idx]
    }
  }, [idx, total, navigate, lessonId, correctCount, earned]);

  async function handleSkip() {
      const next = idx + 1;
      if (next >= total) {
        gotoResult(navigate, {
          from: "sentence-hidden",
          gameType:"sentence",
          unitId: lessonId,
          total,
          correct: correctCount,
          points: earned,
        });
      } else {
         setIdx(next);
      }
  }
  // --- 5. Hàm render câu hỏi với ô input ---
  const renderQuestionText = useMemo(() => {
    if (!current) return null;
    
    // Dữ liệu API: questionText chứa dấu gạch dưới (ví dụ: "I am a _____.")
    // Lấy từ cần điền (để biết độ dài ô input nếu cần)
    const wordToHide = current.hiddenWord || correctAnswerText || "____"; 
    
    // Thay thế dấu gạch dưới (hoặc từ placeholder) bằng ô input
    const parts = current.questionText.split("___"); // Giả sử từ bị khuyết được đánh dấu bằng "_____"
    
    if (parts.length < 2) {
      return <div>{current.questionText} (Không tìm thấy chỗ trống để điền)</div>;
    }

    return (
      <div className="shg__question-text">
        {parts[0]} {/* Phần 1: "This is a " */}
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
        />{/*  Ô input được chèn vào giữa */}
        {parts.slice(1).join("_____")} {/* nối lại phần còn lại */}
      </div>
    );
  }, [current, userInput, judge, handleCheck, nextOrFinish, correctAnswerText]);


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
            onClick={handleSkip}
            disabled={idx + 1 >= total} // Chỉ cho phép bỏ qua nếu không phải câu cuối
          >
            Bỏ qua
          </button>
          <button
            className="shg__primary"
            disabled={!userInput.trim()|| isSubmitting} // Vô hiệu hóa nếu input rỗng
            onClick={handleCheck}
          >
            {isSubmitting ? "Đang chấm..." : "KIỂM TRA"}
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
                <div className="shg__fb-answer">{correctAnswerText}</div>
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