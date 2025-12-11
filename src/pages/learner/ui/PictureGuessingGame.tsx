
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import "../css/PictureGuessingGame.css";
import { getPictureGuessingGame, type PictureGuessingGameRes,type GameAnswerReq,submitGameAnswer,type GameAnswerRes } from "../../../api/game";
import { gotoResult } from "../../../utils/gameResult";
import { getProfileId } from "../../../store/storage";
import { markItemAsCompleted, type LessonProgressReq } from "../../../api/lessonProgress";

// Helper
function normalize(s: string) {
    if (!s) return "";
    return s.trim().toLowerCase();
}

// --- CẤU HÌNH ĐƯỜNG DẪN ÂM THANH ---
const SOUND_CORRECT = "/sounds/correct_sound.mp3";
const SOUND_WRONG = "/sounds/wrong_sound.mp3";

export default function PictureGuessingGamePage() {
  const navigate = useNavigate();
  const { unitId = "" } = useParams();
  const profileId = getProfileId();

  const [games, setGames] = useState<PictureGuessingGameRes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [idx, setIdx] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showResult, setShowResult] = useState<null | "correct" | "wrong">(null);
  const [earned, setEarned] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [correctAnswerText, setCorrectAnswerText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);


  // --- HÀM PHÁT ÂM THANH (MỚI) ---
    const playAudio = (type: "correct" | "wrong") => {
        try {
            const audioSrc = type === "correct" ? SOUND_CORRECT : SOUND_WRONG;
            const audio = new Audio(audioSrc);
            // Giảm âm lượng một chút nếu cần (0.0 đến 1.0)
            audio.volume = 0.8; 
            audio.play().catch((err) => {
                console.warn("Không thể phát âm thanh (có thể do trình duyệt chặn hoặc sai đường dẫn):", err);
            });
        } catch (e) {
            console.error("Lỗi khởi tạo âm thanh:", e);
        }
    };

    useEffect(() => {
      if (!unitId) return;
      let isMounted = true;
      (async () => {
        try {
          setLoading(true);
          // setErr("");
          const data = await getPictureGuessingGame(Number(unitId));
          if (!isMounted) return;
          // Ensure data is an array before sorting
          const gameList = Array.isArray(data) ? data : [data];
          // Sort theo orderIndex asc (phòng khi backend chưa order)
          gameList.sort((a, b) => a.position - b.position);
          setGames(gameList);
          setIdx(0);
        } catch (e: any) {
          if (isMounted) setError(e?.message ?? "Lỗi tải ôn tập từ vựng");
        } finally {
          if (isMounted) setLoading(false);
        }
      })();
      return () => { isMounted = false; };
    }, [unitId]);

  const total = games.length;
  const current = games[idx];

  // const correctOption = useMemo(() => current?.options.find((o) => o.correct) || null, [current]);
  const canCheck = selectedId !== null && showResult === null;

  async function handleCheck() {

    if (!canCheck || !current || !profileId) {
        if (!profileId) setError("Lỗi: Không tìm thấy Profile ID.");
        return;
    }
    
    setIsSubmitting(true); // 👈 Khóa nút

    // 1. Chuẩn bị payload cho API chấm điểm
    const answerPayload: GameAnswerReq = {
        profileId: profileId,
        gameId: current.gameId,
        gameQuestionId: current.id,
        optionId: selectedId
    };

    // 2. Chuẩn bị payload cho API tính tiến độ
    const progressPayload: LessonProgressReq = {
        learnerProfileId: profileId,
        lessonId: Number(unitId),
        itemType: "GAME_QUESTION",
        itemRefId: Number(current.id)
    };

    try {
        // Gọi song song 2 API:
        // 1. API chấm điểm (để lấy kết quả đúng/sai)
        // 2. API tính tiến độ (để đánh dấu là "đã học", theo logic của bạn)
        
        const [answerResult] = await Promise.all([
            submitGameAnswer(answerPayload),
            markItemAsCompleted(progressPayload).catch(e => {
                // Lỗi tính tiến độ không được làm hỏng game
                console.error("Lỗi ngầm khi lưu tiến độ:", e.message);
            })
        ]);

        // ---- 🕵️ DEBUGGING MẠNH NHẤT LÀ Ở ĐÂY 🕵️ ----
        // Log toàn bộ đối tượng ra để xem cấu trúc thật của nó
        console.log("ĐỐI TƯỢNG BE TRẢ VỀ:", answerResult);

        // 3. Dùng kết quả chấm điểm (answerResult) để cập nhật UI
        if (answerResult.isCorrect) {
            console.log("ket qua cua dap an la: "+answerResult.isCorrect+answerResult.correctAnswerText+answerResult.rewardEarned);
            // --- PHÁT ÂM THANH ĐÚNG ---
                playAudio("correct");
            setShowResult("correct");
            setCorrectCount((c) => c + 1);
            setEarned((p) => p + answerResult.rewardEarned);
        } else {
            console.log("ket qua sai roi"+answerResult.isCorrect+answerResult.correctAnswerText+answerResult.rewardEarned);
            // --- PHÁT ÂM THANH SAI ---
                playAudio("wrong");
            setShowResult("wrong");
        }
        setCorrectAnswerText(answerResult.correctAnswerText); // Lưu đáp án đúng

    } catch (err: any) {
        setError(err.message || "Lỗi khi nộp câu trả lời");
    } finally {
        setIsSubmitting(false); // 👈 Mở khóa nút
    }
  }

  async function gotoNext() {
    const next = idx + 1;
    if (next >= total) {
      gotoResult(navigate, {
        from: "picture-guessing",  
        gameType:"vocab",     
        unitId,                   
        total,
        correct: correctCount,    
        points: earned,           
      });
    } else {
      setIdx(next);
      setShowResult(null);
      setSelectedId(null);
      setCorrectAnswerText("");
    }
  }

  if (loading) {
    return (
      <div className="pg-wrap">
        <TopBar index={idx} total={total} />
        <div className="pg-skeleton" />
        <div className="pg-options pg-options--grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="pg-skeleton pg-skeleton--btn" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pg-wrap pg-center">
        <p className="pg-text-error">{error}</p>
        <button onClick={() => window.history.back()} className="pg-btn pg-btn--ghost">Quay lại</button>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="pg-wrap pg-center">
        <p className="pg-text-muted">Chưa có câu hỏi cho bài học này.</p>
      </div>
    );
  }

  const percent = Math.round(((idx + 1) / total) * 100);
    // --- GAMEPLAY LOGIC ---
  // const percent = useMemo(() => {
  //   if (total === 0) return 0;
  //   return Math.round(((idx + 1) / total) * 100);
  // }, [idx, total]);


  return (
    <div className="pg-wrap">
      <div className="pg-topbar">
        <button onClick={() => history.back()} className="pg-close" aria-label="Đóng">✕</button>
        <div className="pg-progress">
          <div className="pg-progress__track">
            <div className="pg-progress__bar" style={{ width: `${percent}%` }} />
          </div>
          <div className="pg-progress__text">{Math.min(idx + 1, Math.max(total, 1))}/{Math.max(total, 1)}</div>
        </div>
      </div>

      <h1 className="pg-title">Nhìn hình chọn từ</h1>

      <div className="pg-panel">
        {current.imageUrl ? (
          <img src={current.imageUrl} className="pg-img" alt="question" />
        ) : (
          <div className="pg-text-muted">(Chưa có ảnh)</div>
        )}
      </div>

      <div className="pg-options pg-options--grid">
          {current.options
          .slice()
          .sort((a, b) => a.position - b.position)
          .map((opt) => {
            const isSelected = selectedId === opt.id; //kiểm tra xem option này đã dc chọn chưa
            const judged = showResult !== null; 
            
            let cls = "pg-option";

            if (!judged) {
                // ---- 1. TRƯỚC KHI CHẤM ----
                // Chỉ highlight nút đang được chọn
                if (isSelected) {
                cls += " pg-option--active";
                }
                } else {
                // ---- 2. SAU KHI CHẤM ----
                // Xác định xem nút (opt) này có phải là đáp án đúng không
                const isThisOptionTheCorrectAnswer = normalize(opt.optionText) === normalize(correctAnswerText);

                if (showResult === "correct") {
                // Người dùng trả lời ĐÚNG
                // Chỉ cần highlight nút họ chọn (vì nó đúng) màu xanh
                if (isSelected) {
                cls += " pg-option--correct";
                }
                } else {
                // Người dùng trả lời SAI
                // Highlight nút họ chọn là "sai" (màu đỏ)
                if (isSelected) {
                cls += " pg-option--wrong";
                }
                // Và highlight nút đúng là "đúng" (màu xanh)
                if (isThisOptionTheCorrectAnswer) {
                cls += " pg-option--correct";
                }
                }
                }
            
            return (
              <button
                key={opt.id}
                onClick={() => setSelectedId(opt.id)}
                disabled={judged || isSubmitting} // 👈 Khóa khi đang chấm
                className={cls}
              >
                {opt.optionText}
              </button>
            );
          })}
      </div>

      <div className="pg-actions">
        <button onClick={gotoNext} className="pg-btn pg-btn--ghost">Bỏ qua</button>
        <button 
            onClick={handleCheck} 
            disabled={!canCheck} // 👈 Dùng state canCheck
            className={`pg-btn pg-btn--primary ${!canCheck ? "pg-btn--disabled" : ""}`}
        >
            {isSubmitting ? "Đang chấm..." : "KIỂM TRA"}
        </button>
      </div>

      {showResult && (
        <div className={`pg-feedback ${showResult === "correct" ? "pg-feedback--correct" : "pg-feedback--wrong"}`}>
          <div className="pg-feedback-inner">
            
            <div className="pg-fb-left">
              {/* Icon */}
              <div className={`pg-fb-icon ${showResult}`}>
                {showResult === "correct" ? "✔" : "✖"}
              </div>
              
              {/* Text Content */}
              <div className="pg-fb-text">
                <div className="pg-fb-title">
                  {showResult === "correct" ? "Chính xác!" : "Đáp án đúng:"}
                </div>
                
                <div className="pg-fb-answer">
                  {correctAnswerText}
                </div>

                {/* Reward Point */}
                {showResult === "correct" && (
                  <div className="pg-fb-reward">
                    +{earned - (correctCount - 1) * (current.reward || 0)} điểm thưởng
                  </div>
                )}
              </div>
            </div>

            {/* Right Button */}
            <div className="pg-fb-right">
              <button 
                onClick={gotoNext} 
                className={`pg-btn ${showResult === "correct" ? "pg-btn--success" : "pg-btn--danger"}`}
                autoFocus // Tự động focus để user có thể bấm Enter
              >
                {showResult === "correct" ? "TIẾP TỤC" : "ĐÃ HIỂU"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
function TopBar({ index, total }: { index: number; total: number }) {
  const percent = Math.round((index / Math.max(total, 1)) * 100);
  return (
    <div className="pg-topbar">
      <button onClick={() => history.back()} className="pg-close" aria-label="Đóng">
        ✕
      </button>
      <div className="pg-progress">
        <div className="pg-progress__track">
          <div className="pg-progress__bar" style={{ width: `${percent}%` }} />
        </div>
        <div className="pg-progress__text">
          {Math.min(index + 1, Math.max(total, 1))}/{Math.max(total, 1)}
        </div>
      </div>
    </div>
  );
}



