// src/pages/game/PictureWordWritingGamePage.tsx
import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPictureWordGames, submitGameAnswer, type GameAnswerReq, type PictureWordRes } from "../../../api/game";
import { gotoResult } from "../../../utils/gameResult";
import "../css/PictureWordWriting.css"; // tận dụng css hiện có (class giống nhau)
import { getProfileId } from "../../../store/storage";
import { markItemAsCompleted, type LessonProgressReq } from "../../../api/lessonProgress";

const SOUND_CORRECT = "/sounds/correct_sound.mp3";
const SOUND_WRONG = "/sounds/wrong_sound.mp3";
export default function PictureWordWritingGamePage() {
  const navigate = useNavigate();
  const { unitId = "" } = useParams();
  const profileId = getProfileId(); // 👈 Lấy profileId

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [games, setGames] = useState<PictureWordRes[]>([]);

  const [idx, setIdx] = useState(0);
  const [inputText, setInputText] = useState("");
  const [judge, setJudge] = useState<null | "correct" | "wrong">(null);
  const [earned, setEarned] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // State mới
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [correctAnswerText, setCorrectAnswerText] = useState(""); // 👈 Thêm

  const total = games.length;
  const current = games[idx];
  const inputRef = useRef<HTMLInputElement | null>(null);
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
    let alive = true;
    (async () => {
      try {
        console.log("Đã vào được trang word-writing");
        setLoading(true);
        const data = await getPictureWordGames(Number(unitId));
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
    return () => {
      alive = false;
    };
  }, [unitId]);

  useEffect(() => {
    setInputText("");
    setJudge(null);
    setCorrectAnswerText("");
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [idx]);

  // const progressPct = useMemo(() => (total ? Math.round((idx / total) * 100) : 0), [idx, total]);
    // --- GAMEPLAY LOGIC ---
  const progressPct = useMemo(() => {
    if (total === 0) return 0;
    return Math.round(((idx + 1) / total) * 100);
  }, [idx, total]);

  // normalize function: trim, lowercase, remove diacritics (for robustness)
  function normalizeAnswer(s = "") {
    return s
      .trim()
      .toLowerCase()
      // remove diacritics (accents)
      .normalize?.("NFD")
      .replace(/\p{Diacritic}/gu, "") ?? s.trim().toLowerCase();
  }

  

async function handleCheck() {
    if (!current || !inputText.trim() || !profileId || isSubmitting) {
        if (!profileId) setError("Lỗi: Không tìm thấy Profile ID.");
        return;
    }

    setIsSubmitting(true);

    const answerPayload: GameAnswerReq = {
        profileId: profileId,
        gameId: current.gameId,
        gameQuestionId: current.id,
        textInput: inputText.trim() // 👈 Gửi textInput
    };

    const progressPayload: LessonProgressReq = {
        learnerProfileId: profileId,
        lessonId: Number(unitId),
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
            playAudio("correct");
            setJudge("correct");
            setCorrectCount((c) => c + 1);
            setEarned((p) => p + answerResult.rewardEarned);
            // --- CẬP NHẬT MỚI TẠI ĐÂY ---
        // Phát sự kiện để báo cho UserBadge biết cần cập nhật điểm
        window.dispatchEvent(new Event("EVENT_UPDATE_POINTS"));
        } else {
            playAudio("wrong");
            setJudge("wrong");
        }
        // API trả về đáp án đúng (có thể đã chuẩn hóa)
        setCorrectAnswerText(answerResult.correctAnswerText); 

    } catch (err: any) {
        setError(err.message || "Lỗi khi nộp câu trả lời");
    } finally {
        setIsSubmitting(false);
    }
  }

  async function nextOrFinish() {
    const next = idx + 1;
    if (next >= total) {
      gotoResult(navigate, {
        from: "word-writing", // 👈 Sửa 'from'
        gameType:"vocab",
        unitId,
        total,
        correct: correctCount,
        points: earned,
      });
    } else {
      setIdx(next);
      // State khác đã được reset trong useEffect[idx]
    }
  }
      function handleSkip() {
          // skip to next (but if last, finish)
          if (idx + 1 < total) {
            setIdx((x) => Math.min(total - 1, x + 1));
          } else {
            gotoResult(navigate, {
              from: "word-writing",
              gameType:"vocab",
              unitId,
              total,
              correct: correctCount,
              points: earned,
            });
          }
              
      }

  if (loading) return <div className="psg__wrap"><div className="psg__loader">Đang tải...</div></div>;
  if (error) return <div className="psg__wrap"><div className="psg__error">{error}</div></div>;
  if (!current) return <div className="psg__wrap"><div className="psg__empty">Đang tải...</div></div>;

  return (
    <div className="psg__wrap">
      <div className="psg__topbar">
        <button className="psg__close" onClick={() => navigate(-1)} aria-label="close">×</button>
        <div className="psg__progress">
          <div className="psg__progress-bar">
            <div className="psg__progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="psg__progress-text">{idx + 1}/{total}</div>
        </div>
      </div>

      <h1 className="psg__title">Viết từ mô tả hình</h1>

      <div className={`psg__image-box ${judge === "correct" ? "ok" : ""} ${judge === "wrong" ? "no" : ""}`}>
        <img src={current.imgURL} alt="question" />
      </div>

      <div className="psg__write-area">
        <label htmlFor="pw-input" className="visually-hidden">Nhập từ</label>
        <input
          id="pw-input"
          ref={inputRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && inputText.trim().length > 0 && judge === null) {
              handleCheck();
            }
            if (e.key === "Enter" && judge !== null) {
              nextOrFinish();
            }
          }}
          placeholder="Gõ từ vựng vào đây..."
          className="psg__text-input"
          disabled={judge !== null}
          autoComplete="off"
          autoFocus
        />
        <div className="psg__hint">Nhập chính xác từ (không phân biệt hoa thường)</div>
      </div>

      {/* Footer khi CHƯA kiểm tra */}
      {judge === null && (
        <div className="psg__actions">
          <button className="psg__ghost" onClick={handleSkip}>Bỏ qua</button>
          <button
            className="psg__primary"
            disabled={inputText.trim().length === 0|| isSubmitting}
            onClick={handleCheck}
          >
            {isSubmitting ? "Đang chấm..." : "KIỂM TRA"}
          </button>
        </div>
      )}

      {/* Feedback banner */}
      {judge !== null && (
        <div className={`psg__feedback ${judge === "correct" ? "psg__feedback--ok" : "psg__feedback--bad"}`}>
          <div className="psg__feedback-inner">
            <div className="psg__fb-left">
              <div className={judge === "correct" ? "psg__fb-icon ok" : "psg__fb-icon bad"} aria-hidden />
              <div className="psg__fb-text">
                <div className="psg__fb-title">
                  {judge === "correct" ? "Chính xác" : "Đáp án đúng:"}
                </div>
                <div className="psg__fb-answer">{correctAnswerText}</div>
                {judge === "correct" && (
                  <div className="psg__fb-reward">Bạn nhận được <b>+{current.rewardCore ?? 0}</b> điểm thưởng ⭐  và <b>+{current.rewardCore ?? 0}</b> kim cương 💎</div>
                )}
              </div>
            </div>

            <div className="psg__fb-right">
              <button
                className={`psg__primary ${judge === "correct" ? "ok" : "no"}`}
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
