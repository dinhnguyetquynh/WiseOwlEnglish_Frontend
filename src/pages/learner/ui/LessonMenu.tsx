import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import "../css/LessonMenu.css";
import { useEffect, useMemo, useState, type JSX } from "react";
import { getLessonLockStatus, type LessonLockStatusRes } from "../../../api/lessonProgress";
import { getProfileId } from "../../../store/storage";
import type { MenuState } from "../../../type/menu";

type LessonMenuItem = {
  key: string;
  label: string;
  icon: JSX.Element;
  gradientClass: string;
  to: string;
  disabled: boolean;
};

// type MenuState = {
//   unitName?: string;   // "UNIT 1"
//   unitTitle?: string;  // "COLOR"
//   title?: string;      // "UNIT 1: COLOR"
//   unitId?: string;     // ID để kiểm tra khớp dữ liệu
// };

const LoadingSpinner = () => (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <div style={{
            width: '40px', height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
        }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
);

export default function LessonMenu() {
  const navigate = useNavigate();
  const { unitId = "u1" } = useParams();
  const location = useLocation();
  const [sp] = useSearchParams();

  // 1. Lấy state từ router (nếu đi từ HomePage)
  const routerState = location.state as MenuState | null;

  // 2. Lấy state từ localStorage (Dự phòng)
  // SỬA LỖI: Thêm [unitId] vào dependency để nó đọc lại khi đổi bài
  const savedState = useMemo(() => {
    try {
      const raw = localStorage.getItem("lessonMenuState");
      if (raw) return JSON.parse(raw) as MenuState;
    } catch { 
      return null;
    }
    return null;
  }, [unitId]); // 👈 Quan trọng: Chạy lại khi unitId thay đổi


  // 3. QUYẾT ĐỊNH DỮ LIỆU CUỐI CÙNG
  const isStateValid = routerState?.unitName || routerState?.title;
  
  // SỬA LỖI: So sánh String để tránh lỗi "1" !== 1
  const isSavedValid = savedState?.unitId && String(savedState.unitId) === String(unitId);

  // Ưu tiên Router > LocalStorage (nếu khớp ID) > Rỗng
  const finalState = isStateValid ? routerState : (isSavedValid ? savedState : {});

  const unitName = finalState?.unitName ?? sp.get("unitName") ?? "";
  const unitTitle = finalState?.unitTitle ?? sp.get("unitTitle") ?? "";
  const titleFromState = finalState?.title ?? sp.get("title") ?? "";
  
  const headerText =
    (unitName && unitTitle && `${unitName}: ${unitTitle}`) ||
    titleFromState ||
    `UNIT ${unitId}`; // Fallback nếu không có gì cả

  // 4. Lưu lại vào LocalStorage mỗi khi có dữ liệu mới hợp lệ (đến từ Router)
  useEffect(() => {
    // Chỉ lưu nếu có dữ liệu thực (tránh lưu cái fallback UNIT X)
    if (isStateValid) {
      const stateToSave: MenuState = {
        unitId, 
        unitName: routerState?.unitName || unitName,
        unitTitle: routerState?.unitTitle || unitTitle,
        title: headerText
      };
      localStorage.setItem("lessonMenuState", JSON.stringify(stateToSave));
      console.log("Đã lưu LessonMenuState mới:", stateToSave);
    }
  }, [unitId, isStateValid, routerState, unitName, unitTitle, headerText]);

  // --- Logic API khóa bài học ---
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [lockStatus, setLockStatus] = useState<LessonLockStatusRes | null>(null);
  
  useEffect(() => {
    const profileId = getProfileId();
    if (!unitId || !profileId) {
        setLoadingStatus(false);
        return;
    }

    let isMounted = true;
    getLessonLockStatus(Number(unitId), profileId)
        .then(data => {
            if (isMounted) setLockStatus(data);
        })
        .catch(err => {
            if (isMounted) console.error("Lỗi tải trạng thái khóa:", err);
            setLockStatus({ 
                vocabLearned: true, 
                vocabGamesDone: true, 
                sentenceLearned: true, 
                sentenceGamesDone: true, 
                allTestsDone: true 
            });
        })
        .finally(() => {
            if (isMounted) setLoadingStatus(false);
        });
    
    return () => { isMounted = false; };
  }, [unitId]);

  // --- Danh sách items ---
  const items: LessonMenuItem[] = useMemo(() => {
    const defaultStatus = { 
        vocabLearned: false, 
        vocabGamesDone: false,
        sentenceLearned: false, 
        sentenceGamesDone: false,
        allTestsDone: false 
    };
    const status = lockStatus ?? defaultStatus;

    const unlockLearnVocab = true; 
    const unlockReviewVocab = status.vocabLearned; 
    const unlockLearnSentence = status.vocabGamesDone; 
    const unlockReviewSentence = status.sentenceLearned; 
    const unlockTest = status.sentenceGamesDone; 
    const unlockPronounceVocab = status.vocabLearned;

    return [
      { key: "learn-vocab",    label: "HỌC TỪ VỰNG",   icon: <span className="lm__icon-emoji">📖</span>, gradientClass: "lm__btn--yellow", to: `/learn/units/${unitId}/vocab/learn`, disabled: !unlockLearnVocab },
      { key: "pronounce-vocab", label: "LUYỆN PHÁT ÂM", icon: <span className="lm__icon-emoji">🎙️</span>, gradientClass: "lm__btn--blue",  to: `/learn/units/${unitId}/vocab/pronounce`, disabled: !unlockPronounceVocab },
      { key: "review-vocab",   label: "ÔN TỪ VỰNG",    icon: <span className="lm__icon-emoji">↻</span>, gradientClass: "lm__btn--green",  to: `/learn/units/${unitId}/vocab/review`, disabled: !unlockReviewVocab },
      { key: "learn-sentence", label: "HỌC CÂU",       icon: <span className="lm__icon-emoji">💬</span>, gradientClass: "lm__btn--pink",  to: `/learn/units/${unitId}/sentence/learn`, disabled: !unlockLearnSentence },
      { key: "review-sentence",label: "ÔN CÂU",        icon: <span className="lm__icon-emoji">✏️</span>, gradientClass: "lm__btn--lime",  to: `/learn/units/${unitId}/sentence/review`, disabled: !unlockReviewSentence },
      { key: "test",           label: "KIỂM TRA",      icon: <span className="lm__icon-emoji">📋</span>, gradientClass: "lm__btn--blue",  to: `/learn/units/${unitId}/testlist`, disabled: !unlockTest },
    ];
  }, [lockStatus, unitId]);

  return (
    <div className="lm">
      <header className="lm__header">
        <button className="lm__back" onClick={() => navigate("/learn")}>←</button>
        <div className="lm__title-inline">{headerText}</div>
      </header>

      <section className="lm__list">
      {loadingStatus && <LoadingSpinner />}

        {!loadingStatus && items.map((it) => (
          <button
            key={it.key}
            className={`lm__btn ${it.gradientClass}`}
            onClick={() => navigate(it.to,{
              state: {
                  title: headerText,
                  unitName,
                  unitTitle,
                  unitId, // Truyền tiếp ID để chắc chắn
                },
            })}
            disabled={it.disabled}
          >
            <span className="lm__icon">{it.icon}</span>
            <span className="lm__label">{it.label}</span>
          </button>
        ))}
      </section>
    </div>
  );
}