import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { gotoResult } from "../../../utils/gameResult";
import "../css/PictureMatchWord.css";
import {
  getPictureMatchWordGames,
  type GameAnswerReq,
  type GameAnswerRes,
  submitGameAnswer
} from "../../../api/game";
import { getProfileId } from "../../../store/storage";
import { markItemAsCompleted, type LessonProgressReq } from "../../../api/lessonProgress";
import type { PictureMatchWordRes } from "../../../type/game";

// Hàm shuffle (Giữ nguyên)
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}


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
  
  // 💥 PHỤC HỒI LẠI state 'judge' ĐỂ HIỂN THỊ FEEDBACK
  const [judge, setJudge] = useState<null | "correct" | "wrong">(null);
  
  // State điểm/câu đúng (chỉ cập nhật ở 'nextOrFinish')
  const [earned, setEarned] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locked, setLocked] = useState(false);

  const total = games.length;
  const current = games[idx];

  // (useEffect fetch data giữ nguyên)
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
    return () => {
      alive = false;
    };
  }, [unitId]);

  // Reset state khi chuyển câu
  useEffect(() => {
    setSelectedLeftId(null);
    setSelectedRightId(null);
    setJudge(null); // 👈 Phục hồi
    setPaired({});
  }, [idx]);

  // (useMemo { leftOptions, rightOptions } giữ nguyên)
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
  const isRightPaired = (rightId: number) =>
    Object.values(paired).some((rid) => rid === rightId);

  // --- 💥 HÀM TRYMATCH ĐÃ SỬA (CHẤM TỨC THỜI CHO UI) 💥 ---
  function tryMatch() {
    if (!current || selectedLeftId == null || selectedRightId == null) return;

    setLocked(true);

    const leftOpt = current.optRes.find((o) => o.id === selectedLeftId);
    const rightOpt = current.optRes.find((o) => o.id === selectedRightId);
    
    if (!leftOpt || !rightOpt) {
      setTimeout(() => setLocked(false), 300);
      return;
    }

    // 💥 SỬA LOGIC CHECK: Đảm bảo pairKey tồn tại (khác null/undefined) rồi mới so sánh
    const isRight = 
        leftOpt.pairKey && 
        rightOpt.pairKey && 
        (leftOpt.pairKey === rightOpt.pairKey);
    
    if (isRight) {
      // 1. Nối đúng -> Thêm vào 'paired'
      setPaired((p) => ({ ...p, [leftOpt.id]: rightOpt.id }));
      // 2. Báo 'correct'
      setJudge("correct");
      // 3. 💥 KHÔNG CỘNG ĐIỂM Ở ĐÂY 💥

      // 4. Reset và mở khóa
      setTimeout(() => {
        setSelectedLeftId(null);
        setSelectedRightId(null);
        setJudge(null);
        setLocked(false);
      }, 1200); // Delay 1.2s cho người dùng thấy
      
    } else {
      // 1. Nối sai -> Báo 'wrong'
      setJudge("wrong");
      
      // 2. 💥 KHÔNG THÊM VÀO 'paired' 💥

      // 3. Reset và mở khóa (thời gian xem 5s hơi lâu, giảm còn 1.5s)
      setTimeout(() => {
        setSelectedLeftId(null);
        setSelectedRightId(null);
        setJudge(null);
        setLocked(false);
      }, 1500); // 1.5s
    }
  }

  // (useEffect tryMatch giữ nguyên)
  useEffect(() => {
    if (selectedLeftId != null && selectedRightId != null) {
      tryMatch();
    }
  }, [selectedLeftId, selectedRightId]);

  // (skipPair giữ nguyên)
  function skipPair() {
    if (!current || locked || isSubmitting) return;
    const firstLeft = leftOptions.find((l) => !isLeftPaired(l.id));
    if (!firstLeft) return;
    setPaired((p) => ({ ...p, [firstLeft.id]: -1 }));
  }

  // --- 💥 HÀM NEXT/FINISH (CHẤM ĐIỂM CUỐI CÙNG) - Giữ nguyên logic 💥 ---
  async function nextOrFinish() {
      if (!current || !profileId || isSubmitting) {
          if (!profileId) setError("Lỗi: Không tìm thấy Profile ID.");
          return;
      }
      
      setIsSubmitting(true);

      // 1. Build payload (lọc bỏ cặp -1 là skip)
      // (Vì tryMatch chỉ thêm cặp đúng, payload này sẽ luôn đúng)
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

      let currentQuestionEarned = 0;
      let isCurrentQuestionCorrect = false;

      try {
          // 💥 GỌI API CHẤM ĐIỂM CUỐI CÙNG 💥
          const [answerResult] = await Promise.all([
              submitGameAnswer(answerPayload),
              markItemAsCompleted(progressPayload).catch(e => {
                  console.error("Lỗi ngầm khi lưu tiến độ:", e.message);
              })
          ]);
          
          // 2. Ghi nhận kết quả từ BE
          // (BE sẽ check req.getPairs().size() == correctPairCount, nếu đúng => isCorrect: true)
          if (answerResult.isCorrect) {
              isCurrentQuestionCorrect = true;
              currentQuestionEarned = answerResult.rewardEarned;
          }

      } catch (error: any) {
          setError(error.message || "Lỗi khi nộp bài");
      } finally {
          setIsSubmitting(false);

          // 3. Tính toán state MỚI cho trang kết quả
          const finalEarned = earned + currentQuestionEarned;
          const finalCorrect = correctCount + (isCurrentQuestionCorrect ? 1 : 0);

          // 4. Chuyển câu hoặc kết thúc
          const next = idx + 1;
          if (next >= total) {
              gotoResult(navigate, {
                  from: "picture-match-word",  
                  gameType:"vocab",     
                  unitId,                   
                  total,
                  correct: finalCorrect, // 👈 Dùng giá trị mới (0 hoặc 1 câu đúng)
                  points: finalEarned,   // 👈 Dùng giá trị mới (tổng điểm)
              });
          } else {
              setEarned(finalEarned);
              setCorrectCount(finalCorrect);
              setIdx(next); 
          }
      }
  }

  if (loading) return <div className="pmw__wrap"><div className="pmw__loader">Đang tải...</div></div>;
  if (error) return <div className="pmw__wrap"><div className="pmw__error">{error}</div></div>;
  if (!current) return <div className="pmw__wrap"><div className="pmw__empty">Không có dữ liệu.</div></div>;

  const allPairedCount = Object.keys(paired).length;
  const totalPairs = leftOptions.length;
  const canFinish = allPairedCount >= totalPairs;

  return (
    <div className="pmw__wrap">
      {/* (Top bar, Title, Game Area giữ nguyên) */}
      <div className="pmw__topbar">
        <button className="pmw__close" onClick={() => navigate(-1)} aria-label="close">×</button>
        <div className="pmw__progress">
          {/* 💥 Progress bar hiển thị số cặp đã nối / tổng số cặp 💥 */}
          <div className="pmw__progress-bar">
            <div className="pmw__progress-fill" style={{ width: `${(allPairedCount / totalPairs) * 100}%` }} />
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
                className={
                  "pmw__word" +
                  (isSelected ? " selected" : "") +
                  (disabled ? " paired" : "") 
                }
                onClick={() => {
                  if (locked || disabled || isSubmitting) return;
                  setSelectedLeftId((s) => (s === opt.id ? null : opt.id));
                }}
                disabled={disabled}
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
                className={
                  "pmw__imgbtn" +
                  (isSelected ? " selected" : "") +
                  (rightPaired ? " paired" : "")
                }
                onClick={() => {
                  if (locked || rightPaired || isSubmitting) return;
                  setSelectedRightId((s) => (s === opt.id ? null : opt.id));
                }}
                disabled={rightPaired}
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

      {/* 💥 PHỤC HỒI LẠI FEEDBACK BANNER 💥 */}
      {judge !== null && (
        <div
          className={`pmw__feedback ${judge === "correct" ? "pmw__feedback--ok" : "pmw__feedback--bad"}`}
        >
          <div className="pmw__feedback-inner">
            <div className="pmw__fb-left">
              <div className={judge === "correct" ? "pmw__fb-icon ok" : "pmw__fb-icon bad"} aria-hidden />
              <div className="pmw__fb-text">
                <div className="pmw__fb-title">
                  {judge === "correct" ? "Ghép đúng!" : "Ghép sai, thử lại!"}
                </div>
                {/* 💥 Bỏ hiển thị điểm ở đây 💥 */}
              </div>
            </div>
            <div className="pmw__fb-right">
              {/* 💥 Nút này chỉ để đóng banner 💥 */}
              <button className={`pmw__primary ${judge === "correct" ? "ok" : "no"}`} onClick={() => setJudge(null)}>
                {judge === "correct" ? "TIẾP" : "OK"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}