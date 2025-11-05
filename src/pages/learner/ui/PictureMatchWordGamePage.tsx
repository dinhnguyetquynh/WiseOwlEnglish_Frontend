import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { gotoResult } from "../../../utils/gameResult";
import "../css/PictureMatchWord.css"; // hoặc dùng chung css file

// --- API helper (nếu bạn đã có file api/game, thay bằng import tương ứng) ---
// import { getPictureMatchWordGames } from "../../../api/game";
// Nếu bạn chưa thêm API helper, uncomment hàm getPictureMatchWordGames và thay axiosClient tương ứng.
import type { PictureMatchWordRes } from "../../../type/game";
import { getPictureMatchWordGames } from "../../../api/game";
 function shuffleArray<T>(array: T[]): T[] {
  // Tạo bản sao để tránh thay đổi trực tiếp mảng gốc (immutable)
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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [games, setGames] = useState<PictureMatchWordRes[]>([]);

  const [idx, setIdx] = useState(0);
  const [selectedLeftId, setSelectedLeftId] = useState<number | null>(null);
  const [selectedRightId, setSelectedRightId] = useState<number | null>(null);
  const [paired, setPaired] = useState<Record<number, number>>({}); // leftId -> rightId
  const [judge, setJudge] = useState<null | "correct" | "wrong">(null);
  const [earned, setEarned] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const [locked, setLocked] = useState(false);

  const total = games.length;
  const current = games[idx];

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getPictureMatchWordGames(Number(unitId));
        if (!alive) return;
        // ensure options sorted by position
        data.forEach((g) => {
          g.optRes.sort((a, b) => a.position - b.position);
        });
        setGames(data);
        setError(null);
         console.log("games sample:", data[0]);
         console.log("optRes sample:", data[0]?.optRes);
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

  // reset selection when changing question
  useEffect(() => {
    setSelectedLeftId(null);
    setSelectedRightId(null);
    setJudge(null);
    setPaired({});
  }, [idx]);


const { leftOptions, rightOptions } = useMemo(() => {
  if (!current?.optRes) return { leftOptions: [], rightOptions: [] };

  // group by raw side value (case-insensitive)
  const bySide: Record<string, typeof current.optRes> = {};
  current.optRes.forEach((o) => {
    const s = (o.side ?? "").toString().toLowerCase();
    if (!bySide[s]) bySide[s] = [];
    bySide[s].push(o);
  });

  // find which side contains images (has imgUrl)
  let imageSide: string | null = null;
  for (const s of Object.keys(bySide)) {
    if (bySide[s].some((o) => !!o.imgUrl)) {
      imageSide = s;
      break;
    }
  }

 
//   if (imageSide) {
//     const right = bySide[imageSide];
//     const left = current.optRes.filter((o) => (o.side ?? "").toString().toLowerCase() !== imageSide);
//     return { leftOptions: left, rightOptions: right };
//   }

//   const rightByImg = current.optRes.filter((o) => !!o.imgUrl);
//   const leftByImg = current.optRes.filter((o) => !o.imgUrl);

//   if (rightByImg.length && leftByImg.length) {
//     return { leftOptions: leftByImg, rightOptions: rightByImg };
//   }

//   const half = Math.ceil(current.optRes.length / 2);
//   return {
//     leftOptions: current.optRes.slice(0, half),
//     rightOptions: current.optRes.slice(half),
//   };
        let determinedLeftOptions: typeof current.optRes = [];
        let determinedRightOptions: typeof current.optRes = [];

        // If we found one side that clearly contains images, map it to rightOptions
        if (imageSide) {
            determinedRightOptions = bySide[imageSide];
            // left = everything else
            determinedLeftOptions = current.optRes.filter((o) => (o.side ?? "").toString().toLowerCase() !== imageSide);
        } else {
            // If no side metadata helps, fallback: use imgUrl presence directly
            const rightByImg = current.optRes.filter((o) => !!o.imgUrl);
            const leftByImg = current.optRes.filter((o) => !o.imgUrl);

            if (rightByImg.length && leftByImg.length) {
                determinedLeftOptions = leftByImg;
                determinedRightOptions = rightByImg;
            } else {
                // Last-resort fallback: split array into halves (preserve position order)
                const half = Math.ceil(current.optRes.length / 2);
                determinedLeftOptions = current.optRes.slice(0, half);
                determinedRightOptions = current.optRes.slice(half);
            }
        }

        // --- BƯỚC XÁO TRỘN NẰM Ở ĐÂY ---
        // Xáo trộn determinedRightOptions (thường là các từ vựng)
        const shuffledLeftOptions = shuffleArray(determinedLeftOptions);

        return {
            leftOptions: shuffledLeftOptions,
            rightOptions: determinedRightOptions, // SỬ DỤNG MẢNG ĐÃ XÁO TRỘN
        };

}, [current]);

  // helper to check if left or right already paired
  const isLeftPaired = (leftId: number) => paired.hasOwnProperty(String(leftId));
  const isRightPaired = (rightId: number) =>
    Object.values(paired).some((rid) => rid === rightId);

function tryMatch() {
  if (!current || selectedLeftId == null || selectedRightId == null) return;

  // khóa tương tác để tránh click thêm khi đang xử lý feedback
  setLocked(true);

  const leftOpt = current.optRes.find((o) => o.id === selectedLeftId);
  const rightOpt = current.optRes.find((o) => o.id === selectedRightId);
  if (!leftOpt || !rightOpt) {
    // unlock to be safe
    setTimeout(() => setLocked(false), 300);
    return;
  }

  const isRight = leftOpt.pairKey === rightOpt.pairKey;
  if (isRight) {
    // đúng: register pair
    setPaired((p) => ({ ...p, [leftOpt.id]: rightOpt.id }));
    setJudge("correct");
    setCorrectCount((x) => x + 1);
    setEarned((x) => x + (current.rewardCore ?? 0));

    // hiển thị feedback một lúc rồi chuyển về trạng thái bình thường
    setTimeout(() => {
      setSelectedLeftId(null);
      setSelectedRightId(null);
      setJudge(null);
      setLocked(false);
    }, 1200); // 1.2s — tuỳ bạn chỉnh
  } else {
    // sai: show wrong, tự ẩn selection & feedback sau 1.2s
    setJudge("wrong");

    setTimeout(() => {
      // chỉ clear selection (không đánh dấu paired)
      setSelectedLeftId(null);
      setSelectedRightId(null);
      setJudge(null);
      setLocked(false);
    }, 5000); // 1.2s — bạn có thể tăng lên 2000
  }
}


  // when both selected, attempt auto-match
  useEffect(() => {
    if (selectedLeftId != null && selectedRightId != null) {
      tryMatch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLeftId, selectedRightId]);

  function skipPair() {
    // allow skipping only if there are unpaired left items
    if (!current) return;
    // mark first unpaired left as paired with -1 (no points)
    const firstLeft = leftOptions.find((l) => !isLeftPaired(l.id));
    if (!firstLeft) return;
    setPaired((p) => ({ ...p, [firstLeft.id]: -1 }));
  }

  function nextOrFinish() {
    if (idx + 1 < total) {
      setIdx((x) => x + 1);
    } else {
      gotoResult(navigate, {
        from: "picture-match-word",
        gameType: "vocab",
        unitId,
        total,
        correct: correctCount,
        points: earned,
      });
    }
  }

  if (loading)
    return (
      <div className="pmw__wrap">
        <div className="pmw__loader">Đang tải...</div>
      </div>
    );
  if (error)
    return (
      <div className="pmw__wrap">
        <div className="pmw__error">{error}</div>
      </div>
    );
  if (!current)
    return (
      <div className="pmw__wrap">
        <div className="pmw__empty">Không có dữ liệu.</div>
      </div>
    );

  const progressPct = total ? Math.round((idx / total) * 100) : 0;
  const allPairedCount = Object.keys(paired).length;
  const totalPairs = leftOptions.length;


  return (
    <div className="pmw__wrap">
      <div className="pmw__topbar">
        <button className="pmw__close" onClick={() => navigate(-1)} aria-label="close">
          ×
        </button>
        <div className="pmw__progress">
          <div className="pmw__progress-bar">
            <div className="pmw__progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="pmw__progress-text">{idx + 1}/{total}</div>
        </div>
      </div>

      <h1 className="pmw__title">{/* optional title or question text */}Nối hình và từ vựng</h1>

      <div className="pmw__game-area">
        <div className="pmw__left">
          {leftOptions.map((opt) => {
            const pairedWith = paired[opt.id];
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
                  if (locked) return;
                  if (disabled) return;
                  setSelectedLeftId((s) => (s === opt.id ? null : opt.id));
                }}
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
                  if (locked) return;
                  if (rightPaired) return;
                  setSelectedRightId((s) => (s === opt.id ? null : opt.id));
                }}
              >
                <img src={opt.imgUrl} alt={opt.answerText ?? "img"} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="pmw__status">
        <div>Đã ghép: {allPairedCount}/{totalPairs}</div>
        <div>Điểm: {earned}</div>
      </div>

      <div className="pmw__actions">
        <button className="pmw__ghost" onClick={skipPair}>Bỏ qua</button>

        <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
          <button
            className="pmw__primary"
            onClick={nextOrFinish}
            disabled={allPairedCount < totalPairs}
          >
            {idx + 1 < total ? "TIẾP CÂU" : "XEM KẾT QUẢ"}
          </button>
        </div>
      </div>

      {/* Feedback banner when judge set */}
      {judge !== null && (
        <div
          className={`pmw__feedback ${judge === "correct" ? "pmw__feedback--ok" : "pmw__feedback--bad"}`}
        >
          <div className="pmw__feedback-inner">
            <div className="pmw__fb-left">
              <div className={judge === "correct" ? "pmw__fb-icon ok" : "pmw__fb-icon bad"} aria-hidden />
              <div className="pmw__fb-text">
                <div className="pmw__fb-title">
                  {judge === "correct" ? "Ghép đúng!" : "Ghép sai"}
                </div>
                {judge === "correct" ? (
                  <div className="pmw__fb-reward">Bạn nhận được <b>+{current.rewardCore ?? 0}</b> điểm</div>
                ) : null}
              </div>
            </div>

            <div className="pmw__fb-right">
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
