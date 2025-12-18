
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { gotoResult } from "../../../utils/gameResult";
import "../css/PictureMatchWord.css";
import {
  getPictureMatchWordGames,
  type GameAnswerReq,
  submitGameAnswer
} from "../../../api/game";
import { getProfileId } from "../../../store/storage";
import { markItemAsCompleted, type LessonProgressReq } from "../../../api/lessonProgress";
import type { PictureMatchWordRes } from "../../../type/game";

// Hàm shuffle
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

const SOUND_CORRECT = "/sounds/correct_sound.mp3";
const SOUND_WRONG = "/sounds/wrong_sound.mp3";

export default function PictureMatchWordGamePage() {
  const navigate = useNavigate();
  const { unitId = "" } = useParams();
  const profileId = getProfileId();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [games, setGames] = useState<PictureMatchWordRes[]>([]);

  const [idx, setIdx] = useState(0);
  const [selectedLeftId, setSelectedLeftId] = useState<number | null>(null);
  const [selectedRightId, setSelectedRightId] = useState<number | null>(null);
  const [paired, setPaired] = useState<Record<number, number>>({});
  
  // State hiển thị feedback
  const [judge, setJudge] = useState<null | "correct" | "wrong">(null);
  // State lưu thông tin phần thưởng
  const [rewardInfo, setRewardInfo] = useState<{ points: number; gems: number } | null>(null);
  
  const [earned, setEarned] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locked, setLocked] = useState(false);

  const total = games.length;
  const current = games[idx];

  // --- HÀM PHÁT ÂM THANH ---
  const playAudio = (type: "correct" | "wrong") => {
        try {
            const audioSrc = type === "correct" ? SOUND_CORRECT : SOUND_WRONG;
            const audio = new Audio(audioSrc);
            audio.volume = 0.8; 
            audio.play().catch((err) => {
                console.warn("Không thể phát âm thanh:", err);
            });
        } catch (e) {
            console.error("Lỗi khởi tạo âm thanh:", e);
        }
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getPictureMatchWordGames(Number(unitId));
        if (!alive) return;
        data.forEach((g) => {
          g.optRes.sort((a, b) => a.position - b.position);
        });
        setGames(data);
        setError(null);
      } catch (e: any) {
        setError(e?.message ?? "Load data failed");
      } finally {
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [unitId]);

  // Reset state khi chuyển câu
  useEffect(() => {
    setSelectedLeftId(null);
    setSelectedRightId(null);
    setJudge(null);
    setRewardInfo(null); // Reset reward info
    setPaired({});
  }, [idx]);

  const { leftOptions, rightOptions } = useMemo(() => {
    if (!current?.optRes) return { leftOptions: [], rightOptions: [] };
    const bySide: Record<string, typeof current.optRes> = {};
    current.optRes.forEach((o) => {
      const s = (o.side ?? "").toString().toLowerCase();
      if (!bySide[s]) bySide[s] = [];
      bySide[s].push(o);
    });
    let imageSide: string | null = null;
    for (const s of Object.keys(bySide)) {
      if (bySide[s].some((o) => !!o.imgUrl)) {
        imageSide = s;
        break;
      }
    }
    let determinedLeftOptions: typeof current.optRes = [];
    let determinedRightOptions: typeof current.optRes = [];
    if (imageSide) {
        determinedRightOptions = bySide[imageSide];
        determinedLeftOptions = current.optRes.filter((o) => (o.side ?? "").toString().toLowerCase() !== imageSide);
    } else {
        const rightByImg = current.optRes.filter((o) => !!o.imgUrl);
        const leftByImg = current.optRes.filter((o) => !o.imgUrl);
        if (rightByImg.length && leftByImg.length) {
            determinedLeftOptions = leftByImg;
            determinedRightOptions = rightByImg;
        } else {
            const half = Math.ceil(current.optRes.length / 2);
            determinedLeftOptions = current.optRes.slice(0, half);
            determinedRightOptions = current.optRes.slice(half);
        }
    }
    const shuffledLeftOptions = shuffleArray(determinedLeftOptions);
    return {
        leftOptions: shuffledLeftOptions,
        rightOptions: determinedRightOptions, 
    };
  }, [current]);

  const isLeftPaired = (leftId: number) => paired.hasOwnProperty(String(leftId));
  const isRightPaired = (rightId: number) => Object.values(paired).some((rid) => rid === rightId);

  // --- HÀM TRYMATCH (Chỉ hiệu ứng ghép cặp, không hiện banner kết quả ngay) ---
  function tryMatch() {
    if (!current || selectedLeftId == null || selectedRightId == null) return;
    setLocked(true);
    const leftOpt = current.optRes.find((o) => o.id === selectedLeftId);
    const rightOpt = current.optRes.find((o) => o.id === selectedRightId);
    
    if (!leftOpt || !rightOpt) {
      setTimeout(() => setLocked(false), 300);
      return;
    }

    const isRight = leftOpt.pairKey && rightOpt.pairKey && (leftOpt.pairKey === rightOpt.pairKey);
    
    if (isRight) {
      // 1. Nối đúng -> Thêm vào 'paired'
      setPaired((p) => ({ ...p, [leftOpt.id]: rightOpt.id }));
      // 2. Feedback nhanh
      setJudge("correct");
      playAudio("correct");

      // 3. Reset nhanh để người dùng chơi tiếp (chưa hiện banner điểm)
      setTimeout(() => {
        setSelectedLeftId(null);
        setSelectedRightId(null);
        setJudge(null);
        setLocked(false);
      }, 1200);
      
    } else {
      // 1. Nối sai
      setJudge("wrong");
      playAudio("wrong");

      setTimeout(() => {
        setSelectedLeftId(null);
        setSelectedRightId(null);
        setJudge(null);
        setLocked(false);
      }, 1500);
    }
  }

  useEffect(() => {
    if (selectedLeftId != null && selectedRightId != null) {
      tryMatch();
    }
  }, [selectedLeftId, selectedRightId]);

  function skipPair() {
    if (!current || locked || isSubmitting) return;
    const firstLeft = leftOptions.find((l) => !isLeftPaired(l.id));
    if (!firstLeft) return;
    setPaired((p) => ({ ...p, [firstLeft.id]: -1 }));
  }

  // --- HÀM CHUYỂN BƯỚC (Gọi khi bấm nút trên Banner) ---
  const handleNextStep = () => {
      const next = idx + 1;
      if (next >= total) {
          gotoResult(navigate, {
              from: "picture-match-word",  
              gameType:"vocab",     
              unitId,                   
              total,
              correct: correctCount,
              points: earned,
          });
      } else {
          setIdx(next); 
      }
  };

  // --- HÀM NỘP BÀI (Gọi API và hiện Banner kết quả) ---
  async function nextOrFinish() {
      if (!current || !profileId || isSubmitting) {
          if (!profileId) setError("Lỗi: Không tìm thấy Profile ID.");
          return;
      }
      setIsSubmitting(true);

      const pairsPayload = Object.entries(paired)
          .filter(([leftId, rightId]) => rightId !== -1)
          .map(([leftId, rightId]) => ({
              leftOptionId: Number(leftId),
              rightOptionId: Number(rightId)
          }));

      const answerPayload: GameAnswerReq = {
          profileId: profileId,
          gameId: current.gameId,
          gameQuestionId: current.id,
          pairs: pairsPayload
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
              setJudge("correct"); // Kích hoạt Banner xanh
              
              // Cập nhật thông tin điểm để hiển thị
              setRewardInfo({
                  points: answerResult.rewardEarned,
                  gems: answerResult.rewardEarned // Hoặc 1, tùy logic của bạn
              });

              // Cập nhật điểm tổng tích lũy
              setEarned(prev => prev + answerResult.rewardEarned);
              setCorrectCount(prev => prev + 1);
              
              window.dispatchEvent(new Event("EVENT_UPDATE_POINTS"));
          } else {
              setJudge("wrong"); // Kích hoạt Banner đỏ
              setRewardInfo(null); 
          }

      } catch (error: any) {
          setError(error.message || "Lỗi khi nộp bài");
      } finally {
          setIsSubmitting(false);
      }
  }

  if (loading) return <div className="pmw__wrap"><div className="pmw__loader">Đang tải...</div></div>;
  if (error) return <div className="pmw__wrap"><div className="pmw__error">{error}</div></div>;
  if (!current) return <div className="pmw__wrap"><div className="pmw__empty">Đang tải...</div></div>;

  const allPairedCount = Object.keys(paired).length;
  const totalPairs = leftOptions.length;
  const canFinish = allPairedCount >= totalPairs;
  const percent = Math.round(((idx + 1) / total) * 100);

  return (
    <div className="pmw__wrap">
      <div className="pmw__topbar">
        <button className="pmw__close" onClick={() => navigate(-1)} aria-label="close">×</button>
        <div className="pmw__progress">
          <div className="pmw__progress-bar">
            <div className="pmw__progress-fill" style={{ width: `${percent}%` }} />
          </div>
          <div className="pmw__progress-text">{idx + 1}/{total}</div>
        </div>
      </div>

      <h1 className="pmw__title">Nối hình và từ vựng</h1>
      
      <div className="pmw__game-area">
        <div className="pmw__left">
          {leftOptions.map((opt) => {
            const isSelected = selectedLeftId === opt.id;
            const disabled = isLeftPaired(opt.id);
            return (
              <button
                key={opt.id}
                className={"pmw__word" + (isSelected ? " selected" : "") + (disabled ? " paired" : "")}
                onClick={() => {
                  if (locked || disabled || isSubmitting) return;
                  setSelectedLeftId((s) => (s === opt.id ? null : opt.id));
                }}
                disabled={disabled || judge !== null} // Disable khi đang hiện kết quả
              >
                {opt.answerText}
              </button>
            );
          })}
        </div>
        <div className="pmw__right">
          {rightOptions.map((opt) => {
            const rightPaired = isRightPaired(opt.id);
            const isSelected = selectedRightId === opt.id;
            return (
              <button
                key={opt.id}
                className={"pmw__imgbtn" + (isSelected ? " selected" : "") + (rightPaired ? " paired" : "")}
                onClick={() => {
                  if (locked || rightPaired || isSubmitting) return;
                  setSelectedRightId((s) => (s === opt.id ? null : opt.id));
                }}
                disabled={rightPaired || judge !== null}
              >
                {opt.imgUrl ? <img src={opt.imgUrl} alt={opt.answerText ?? "img"} /> : <div className="pmw__img-placeholder">{opt.answerText}</div>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pmw__status">
        <div>Đã ghép: {allPairedCount}/{totalPairs}</div>
      </div>

      {/* Ẩn nút Action khi đã có kết quả (để tránh bấm nhầm, user phải bấm vào banner) */}
      {judge === null && (
        <div className="pmw__actions">
            <button className="pmw__ghost" onClick={skipPair} disabled={locked || isSubmitting || canFinish}>Bỏ qua</button>
            <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
            <button
                className="pmw__primary"
                onClick={nextOrFinish}
                disabled={!canFinish || isSubmitting}
            >
                {isSubmitting ? "Đang lưu..." : (idx + 1 < total ? "TIẾP CÂU" : "XEM KẾT QUẢ")}
            </button>
            </div>
        </div>
      )}

      {/* 🔥🔥🔥 FEEDBACK BANNER (Dính đáy) - CHỈ GIỮ LẠI CÁI NÀY 🔥🔥🔥 */}
      {judge !== null && (
        <div className={`pmw__feedback ${judge === "correct" ? "pmw__feedback--ok" : "pmw__feedback--bad"}`}>
          <div className="pmw__feedback-inner">
            <div className="pmw__fb-left">
              {/* Icon */}
              <div className={judge === "correct" ? "pmw__fb-icon ok" : "pmw__fb-icon bad"} aria-hidden />
              
              {/* Text info */}
              <div className="pmw__fb-text">
                <div className="pmw__fb-title">
                  {judge === "correct" ? "Chính xác!" : "Chưa chính xác"}
                </div>
                
                {/* Hiển thị điểm thưởng nếu đúng */}
                {judge === "correct" && rewardInfo && (
                   <div className="pmw__fb-reward">
                      Bạn nhận được <b>+{rewardInfo.points}</b> điểm thưởng ⭐ và <b>+{rewardInfo.gems}</b> kim cương 💎
                   </div>
                )}
                
                {/* Nếu sai */}
                {judge === "wrong" && (
                    <div className="pmw__fb-reward">Đáp án chưa đúng, hãy cố gắng ở câu sau nhé!</div>
                )}
              </div>
            </div>

            {/* Nút bấm để đi tiếp */}
            <div className="pmw__fb-right">
              <button
                className={judge === "correct" ? "ok" : "no"}
                onClick={handleNextStep}
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