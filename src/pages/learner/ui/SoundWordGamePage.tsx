// import { useEffect, useMemo, useRef, useState } from "react";
// import { useLocation, useNavigate, useParams } from "react-router-dom";
// import "../css/SoundWordGamePage.css";
// import {
//   getSoundWordGames,
//   submitGameAnswer,
//   type GameAnswerReq,
//   type SoundWordOptionRes,
//   type SoundWordQuestionRes,
// } from "../../../api/game";
// import { gotoResult } from "../../../utils/gameResult";
// import { getProfileId } from "../../../store/storage";
// import { markItemAsCompleted, type LessonProgressReq } from "../../../api/lessonProgress";
// import type { MenuState } from "../../../type/menu";

// export default function SoundWordGamePage() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { unitId = "" } = useParams();
//   const profileId = getProfileId(); // 👈 Lấy profileId

//   // Lấy state từ Router HOẶC LocalStorage
//   const navState = useMemo(() => {
//     // Cách 1: Có sẵn trong location (do trang trước truyền tới)
//     if (location.state) return location.state;

//     // Cách 2: Mất state (do F5 hoặc vào thẳng link), lấy lại từ LocalStorage
//     try {
//       const raw = localStorage.getItem("lessonMenuState");
//       if (raw) {
//         const saved = JSON.parse(raw) as MenuState;
//         // Quan trọng: Kiểm tra xem data trong LocalStorage có đúng là của bài này không
//         // (Tránh trường hợp LS lưu bài 1, nhưng đang chơi bài 2)
//         if (String(saved.unitId) === String(unitId)) {
//           return saved;
//         }
//       }
//     } catch (e) {
//       console.error("Lỗi đọc localStorage", e);
//     }
//     return null; // Không tìm thấy gì cả
//   }, [location.state, unitId]);



//   const [questions, setQuestions] = useState<SoundWordQuestionRes[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const [idx, setIdx] = useState(0);
//   const [selected, setSelected] = useState<number | null>(null);
//   const [judge, setJudge] = useState<null | "correct" | "wrong">(null);
//   const [earned, setEarned] = useState(0);
//   const [correctCount, setCorrectCount] = useState(0);

//   // State mới
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // 🟢 FIX 1: Dùng useRef để chặn submit kép ngay lập tức (Logic Guard)
//   const submittingRef = useRef(false);

//   const [correctAnswerText, setCorrectAnswerText] = useState("");
//    const total = questions.length;
//   const q = questions[idx];
//   const current = q; // Dùng tên 'current' cho nhất quán

//   const audioRef = useRef<HTMLAudioElement | null>(null);

//   // fetch data
//   useEffect(() => {
//     if (!unitId) return;
//     setLoading(true);
//     getSoundWordGames(Number(unitId))
//       .then((data) => {
//         // sort theo position nếu cần
//         const sorted = [...data].sort((a, b) => a.position - b.position);
//         setQuestions(sorted);
//         console.log("sample option", data?.[0]?.options?.[0]);
//       })
//       .catch((e) => setError(e?.message ?? "Lỗi tải dữ liệu"))
//       .finally(() => setLoading(false));
      
//   }, [unitId]);

//   // 👇 2. Logic phát âm thanh (Dùng chung)
//   const playAudio = (url: string) => {
//     if (!url) return;

//     if (!audioRef.current) {
//       audioRef.current = new Audio(url);
//     } else {
//       // Nếu có rồi thì pause cái cũ và gán src mới
//       audioRef.current.pause();
//       audioRef.current.currentTime = 0;
      
//       // Chỉ gán lại src nếu khác url cũ (để tránh load lại nếu bấm nghe lại)
//       // Tuy nhiên với game này mỗi câu là 1 url khác nhau nên gán luôn cũng được
//       if (audioRef.current.src !== url) { 
//           audioRef.current.src = url;
//       }
//     }
//   const playPromise = audioRef.current.play();
//     if (playPromise !== undefined) {
//       playPromise.catch((error) => {
//         console.warn("Autoplay bị chặn hoặc lỗi phát âm thanh:", error);
//         // Trình duyệt (nhất là Chrome) chặn autoplay nếu user chưa tương tác với trang.
//         // Nhưng vì user đã click vào đây từ trang trước nên thường sẽ phát được.
//       });
//     }
//   };

//   // 👇 3. Tự động phát khi câu hỏi (current) thay đổi
//   useEffect(() => {
//     if (current?.urlSound) {
//       // Thêm delay nhỏ để UI render xong mượt mà rồi mới phát
//       const timer = setTimeout(() => {
//         playAudio(current.urlSound);
//       }, 300); 
//       return () => clearTimeout(timer);
//     }
//   }, [current]); // Chạy lại mỗi khi 'current' thay đổi (chuyển câu)
//   // 👇 4. Nút bấm thủ công (Nghe lại)
//   const handleManualPlay = () => {
//     if (current?.urlSound) {
//       playAudio(current.urlSound);
//     }
//   };
//   const progressPercent = useMemo(() => {
//     if (total === 0) return 0;
//     return Math.round(((idx) / total) * 100);
//   }, [idx, total]);


// const handleSelect = (op: SoundWordOptionRes) => {
//     if (judge) return; // đã kiểm tra thì không đổi
//     setSelected(op.id);
//   };

//   const handleCheck = async () => {
//     if (!current || selected == null || !profileId || isSubmitting) {
//       if (!profileId) setError("Lỗi: Không tìm thấy Profile ID.");
//       return;
//     }
    
//     setIsSubmitting(true);

//     const answerPayload: GameAnswerReq = {
//         profileId: profileId,
//         gameId: current.gameId, 
//         gameQuestionId: current.id,
//         optionId: selected
//     };

//     const progressPayload: LessonProgressReq = {
//         learnerProfileId: profileId,
//         lessonId: Number(unitId),
//         itemType: "GAME_QUESTION",
//         itemRefId: Number(current.id)
//     };

//     try {
//         const [answerResult] = await Promise.all([
//             submitGameAnswer(answerPayload),
//             markItemAsCompleted(progressPayload).catch(e => {
//                 console.error("Lỗi ngầm khi lưu tiến độ:", e.message);
//             })
//         ]);

//         if (answerResult.isCorrect) {
//             setJudge("correct");
//             setCorrectCount((c) => c + 1);
//             setEarned((p) => p + answerResult.rewardEarned);
//         } else {
//             setJudge("wrong");
//         }
//         setCorrectAnswerText(answerResult.correctAnswerText);

//     } catch (err: any) {
//         setError(err.message || "Lỗi khi nộp câu trả lời");
//     } finally {
//         setIsSubmitting(false);
//     }
//   };
  
//   const goNext = () => {
//     const next = idx + 1;
//     if (next >= total) {
//       gotoResult(navigate, {
//         from: "sound-word",  
//         gameType:"vocab",
//         unitId,
//         total,
//         correct: correctCount,
//         points: earned, // 👈 Đổi tên
//       });
//     } else {
//       setIdx(next);
//       setSelected(null);
//       setJudge(null); // 👈 Đổi tên
//       setCorrectAnswerText(""); // 👈 Reset
//       // preload âm thanh tiếp theo
//       // setTimeout(() => {
//       //   if (audioRef.current) {
//       //     audioRef.current.pause();
//       //     audioRef.current.currentTime = 0;
//       //     audioRef.current.src = questions[idx + 1]?.urlSound || "";
//       //   }
//       // }, 0);
//     }
//   };
// const handleSkip = () => {
//     setJudge(null);
//     setSelected(null);
//     goNext();
//   };

// const handleClose = () => {
//    // Quay về trang GameSelectedPage (Ôn tập từ vựng)
//     // Route tương ứng trong App.tsx là: /learn/units/:unitId/vocab/review
//     navigate(`/learn/units/${unitId}/vocab/review`, { state: navState });
//   };

//   if (loading) return <div className="swg__wrap"><div className="swg__loading">Đang tải...</div></div>;
//   if (error) return <div className="swg__wrap"><div className="swg__error">{error}</div></div>;
//   if (!q) return <div className="swg__wrap"><div className="swg__empty">Không có câu hỏi</div></div>;

//   return (
//     <div className="swg__wrap">
//       {/* Top bar */}
//       <div className="swg__top">
//         {/* Nút X gọi hàm handleClose */}
//         <button className="swg__close" onClick={handleClose} aria-label="Thoát">
//           ×
//         </button>
//         <div className="swg__progress">
//           <div className="swg__progress-bar">
//             <div className="swg__progress-fill" style={{ width: `${progressPercent}%` }} />
//           </div>
//           <div className="swg__progress-text">{idx + 1}/{total}</div>
//         </div>
//       </div>

//       <h2 className="swg__title">Nghe âm thanh chọn chữ</h2>

//       {/* Speaker button */}
//       <button className="swg__speaker" onClick={handleManualPlay} aria-label="Phát âm thanh">
//         <span className="swg__speaker-icon" />
//       </button>

//       {/* Options */}
//       <div className="swg__options">
//         {q.options
//           .slice()
//           .sort((a, b) => a.position - b.position)
//           .map((op) => {
//             const isSelected = selected === op.id;
//             // 💥 SỬA LOGIC HIỂN THỊ (Giống PictureGuessingGame) 💥
//             const isCorrectAnswer = normalize(op.optionText) === normalize(correctAnswerText);
            
//             let cls = "swg__option";
//             if (!judge) {
//               if (isSelected) cls += " is-selected";
//             } else {
//               if (judge === 'correct' && isSelected) {
//                 cls += " is-correct";
//               } else if (judge === 'wrong') {
//                 if (isSelected) cls += " is-wrong";
//                 if (isCorrectAnswer) cls += " is-correct";
//               }
//             }
            
//             return (
//               <button
//                 key={op.id}
//                 className={cls}
//                 onClick={() => handleSelect(op)}
//                 disabled={!!judge || isSubmitting} // 👈 Khóa khi đã chấm hoặc đang submit
//               >
//                 {op.optionText}
//               </button>
//             );
//           })}
//       </div>

// {/* Footer (trước khi kiểm tra) */}
//         {!judge && ( // 👈 Đổi tên
//         <div className="swg__footer">
//           <button className="swg__btn swg__btn--ghost" onClick={handleSkip}>
//             Bỏ qua
//           </button>
//           <button
//             className="swg__btn swg__btn--primary"
//             onClick={handleCheck}
//             disabled={selected == null || isSubmitting} // 👈 Thêm isSubmitting
//           >
//             {isSubmitting ? "Đang chấm..." : "Kiểm tra"}
//           </button>
//         </div>
//       )}


     
//       {/* 💥 SỬA LẠI FEEDBACK PANEL 💥 */}
//       {judge && (
//         <div
//           className={[
//             "swg__feedback",
//             judge === "correct" ? "swg__feedback--ok" : "swg__feedback--bad",
//           ].join(" ")}
//         >
//           <div className="swg__feedback-inner">
//             <div className="swg__fb-left">
//               <div
//                 className={
//                   judge === "correct" ? "swg__fb-icon ok" : "swg__fb-icon bad"
//                 }
//                 aria-hidden
//               />
//               <div className="swg__fb-text">
//                 <div className="swg__fb-title">
//                   {judge === "correct" ? "Đáp án đúng" : "Đáp án đúng:"}
//                 </div>
//                 {/* 💥 Hiển thị correctAnswerText từ API 💥 */}
//                 <div className="swg__fb-answer">{correctAnswerText}</div>
//                 {judge === "correct" && (
//                   <div className="swg__fb-reward">
//                     Bạn nhận được <b>+{current.rewardPoint ?? 0}</b> điểm thưởng
//                   </div>
//                 )}
//               </div>
//             </div>

//             <div className="swg__fb-right">
//               <button
//                 className="swg__btn swg__btn--primary"
//                 onClick={goNext}
//                 autoFocus
//               >
//                 {judge === "correct" ? "Tiếp tục" : "Đã hiểu"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
// function normalize(s: string) {
//     if (!s) return "";
//     return s.trim().toLowerCase();
// }

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "../css/SoundWordGamePage.css";
import {
  getSoundWordGames,
  submitGameAnswer,
  type GameAnswerReq,
  type SoundWordOptionRes,
  type SoundWordQuestionRes,
} from "../../../api/game";
import { gotoResult } from "../../../utils/gameResult";
import { getProfileId } from "../../../store/storage";
import { markItemAsCompleted, type LessonProgressReq } from "../../../api/lessonProgress";
import type { MenuState } from "../../../type/menu";

export default function SoundWordGamePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { unitId = "" } = useParams();
  const profileId = getProfileId();

  // --- STATE QUẢN LÝ ---
  const [questions, setQuestions] = useState<SoundWordQuestionRes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [judge, setJudge] = useState<null | "correct" | "wrong">(null);
  const [earned, setEarned] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // UI loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  // 🟢 FIX 1: Dùng useRef để chặn submit kép ngay lập tức (Logic Guard)
  const submittingRef = useRef(false); 
  
  const [correctAnswerText, setCorrectAnswerText] = useState("");

  const total = questions.length;
  const current = questions[idx];
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- LOGIC NAV STATE ---
  const navState = useMemo(() => {
    if (location.state) return location.state;
    try {
      const raw = localStorage.getItem("lessonMenuState");
      if (raw) {
        const saved = JSON.parse(raw) as MenuState;
        if (String(saved.unitId) === String(unitId)) return saved;
      }
    } catch (e) {
      console.error("Lỗi đọc localStorage", e);
    }
    return null;
  }, [location.state, unitId]);

  // --- FETCH DATA ---
  useEffect(() => {
    if (!unitId) return;
    setLoading(true);
    getSoundWordGames(Number(unitId))
      .then((data) => {
        const sorted = [...data].sort((a, b) => a.position - b.position);
        setQuestions(sorted);
      })
      .catch((e) => setError(e?.message ?? "Lỗi tải dữ liệu"))
      .finally(() => setLoading(false));
  }, [unitId]);

  // --- AUDIO LOGIC ---
  const playAudio = (url: string) => {
    if (!url) return;
    
    // Tạo audio instance nếu chưa có
    if (!audioRef.current) {
      audioRef.current = new Audio(url);
    } else {
      // Nếu url khác thì đổi src, còn giống thì chỉ cần reset time
      if (audioRef.current.src !== url) {
        audioRef.current.src = url;
      }
      audioRef.current.currentTime = 0;
    }

    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.warn("Autoplay bị chặn hoặc lỗi:", error);
      });
    }
  };

  // 🟢 FIX 2: Tự động phát & Cleanup kỹ càng để tránh phát 2 lần
  useEffect(() => {
    if (current?.urlSound) {
      const timer = setTimeout(() => {
        playAudio(current.urlSound);
      }, 300);

      // Cleanup function: Chạy khi component unmount hoặc khi `current` đổi
      return () => {
        clearTimeout(timer); // Hủy hẹn giờ nếu chưa kịp phát
        if (audioRef.current) {
          audioRef.current.pause();       // Dừng ngay lập tức
          audioRef.current.currentTime = 0; 
        }
      };
    }
  }, [current]); // Dependency là 'current'

  const handleManualPlay = () => {
    if (current?.urlSound) playAudio(current.urlSound);
  };

  // --- GAMEPLAY LOGIC ---
  const progressPercent = useMemo(() => {
    if (total === 0) return 0;
    return Math.round((idx / total) * 100);
  }, [idx, total]);

  const handleSelect = (op: SoundWordOptionRes) => {
    if (judge || isSubmitting) return; 
    setSelected(op.id);
  };

  const handleCheck = async () => {
    // 🟢 FIX 1: Kiểm tra Ref thay vì State để chặn click kép tuyệt đối
    if (!current || selected == null || !profileId || submittingRef.current) {
      if (!profileId) setError("Lỗi: Không tìm thấy Profile ID.");
      return;
    }

    // Lock ngay lập tức
    submittingRef.current = true;
    setIsSubmitting(true); // Cập nhật UI

    const answerPayload: GameAnswerReq = {
      profileId: profileId,
      gameId: current.gameId,
      gameQuestionId: current.id,
      optionId: selected,
    };

    const progressPayload: LessonProgressReq = {
      learnerProfileId: profileId,
      lessonId: Number(unitId),
      itemType: "GAME_QUESTION",
      itemRefId: Number(current.id),
    };

    try {
      const [answerResult] = await Promise.all([
        submitGameAnswer(answerPayload),
        markItemAsCompleted(progressPayload).catch((e) => {
          console.error("Lỗi ngầm khi lưu tiến độ:", e.message);
        }),
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
      // 🟢 Unlock
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const goNext = () => {
    const next = idx + 1;
    if (next >= total) {
      gotoResult(navigate, {
        from: "sound-word",
        gameType: "vocab",
        unitId,
        total,
        correct: correctCount,
        points: earned,
      });
    } else {
      setIdx(next);
      setSelected(null);
      setJudge(null);
      setCorrectAnswerText("");
      // Không cần preload thủ công ở đây vì useEffect sẽ lo việc phát âm thanh
    }
  };

  const handleSkip = () => {
    if (submittingRef.current) return;
    setJudge(null);
    setSelected(null);
    goNext();
  };

  const handleClose = () => {
    navigate(`/learn/units/${unitId}/vocab/review`, { state: navState });
  };

  // --- RENDER ---
  if (loading) return <div className="swg__wrap"><div className="swg__loading">Đang tải...</div></div>;
  if (error) return <div className="swg__wrap"><div className="swg__error">{error}</div></div>;
  if (!current) return <div className="swg__wrap"><div className="swg__empty">Không có câu hỏi</div></div>;

  return (
    <div className="swg__wrap">
      {/* Top bar */}
      <div className="swg__top">
        <button className="swg__close" onClick={handleClose} aria-label="Thoát">×</button>
        <div className="swg__progress">
          <div className="swg__progress-bar">
            <div className="swg__progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="swg__progress-text">{idx + 1}/{total}</div>
        </div>
      </div>

      <h2 className="swg__title">Nghe âm thanh chọn chữ</h2>

      {/* Speaker button */}
      <button className="swg__speaker" onClick={handleManualPlay} aria-label="Phát âm thanh">
        <span className="swg__speaker-icon" />
      </button>

      {/* Options */}
      <div className="swg__options">
        {current.options
          .slice()
          .sort((a, b) => a.position - b.position)
          .map((op) => {
            const isSelected = selected === op.id;
            const isCorrectAnswer = normalize(op.optionText) === normalize(correctAnswerText);

            let cls = "swg__option";
            if (!judge) {
              if (isSelected) cls += " is-selected";
            } else {
              if (judge === "correct" && isSelected) {
                cls += " is-correct";
              } else if (judge === "wrong") {
                if (isSelected) cls += " is-wrong";
                if (isCorrectAnswer) cls += " is-correct";
              }
            }

            return (
              <button
                key={op.id}
                className={cls}
                onClick={() => handleSelect(op)}
                disabled={!!judge || isSubmitting}
              >
                {op.optionText}
              </button>
            );
          })}
      </div>

      {/* Footer */}
      {!judge && (
        <div className="swg__footer">
          <button 
            className="swg__btn swg__btn--ghost" 
            onClick={handleSkip}
            disabled={isSubmitting}
          >
            Bỏ qua
          </button>
          <button
            className="swg__btn swg__btn--primary"
            onClick={handleCheck}
            disabled={selected == null || isSubmitting}
          >
            {isSubmitting ? "Đang chấm..." : "Kiểm tra"}
          </button>
        </div>
      )}

      {/* Feedback Panel */}
      {judge && (
        <div className={["swg__feedback", judge === "correct" ? "swg__feedback--ok" : "swg__feedback--bad"].join(" ")}>
          <div className="swg__feedback-inner">
            <div className="swg__fb-left">
              <div className={judge === "correct" ? "swg__fb-icon ok" : "swg__fb-icon bad"} aria-hidden />
              <div className="swg__fb-text">
                <div className="swg__fb-title">
                  {judge === "correct" ? "Đáp án đúng" : "Đáp án đúng:"}
                </div>
                <div className="swg__fb-answer">{correctAnswerText}</div>
                {judge === "correct" && (
                  <div className="swg__fb-reward">
                    Bạn nhận được <b>+{current.rewardPoint ?? 0}</b> điểm thưởng
                  </div>
                )}
              </div>
            </div>
            <div className="swg__fb-right">
              <button className="swg__btn swg__btn--primary" onClick={goNext} autoFocus>
                {judge === "correct" ? "Tiếp tục" : "Đã hiểu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function normalize(s: string) {
  if (!s) return "";
  return s.trim().toLowerCase();
}