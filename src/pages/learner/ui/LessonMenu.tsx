import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import "../css/LessonMenu.css";
import { useEffect, useMemo, useState, type JSX } from "react";
import { getLessonLockStatus, type LessonLockStatusRes } from "../../../api/lessonProgress";
import { getProfileId } from "../../../store/storage";

type LessonMenuItem = {
  key: string;
  label: string;
  icon: JSX.Element;
  gradientClass: string;
  to: string;
  disabled: boolean;
};

type MenuState = {
  unitName?: string;   // "UNIT 1"
  unitTitle?: string;  // "COLOR"
  title?: string;      // "UNIT 1: COLOR"
};
// Component `LoadingSpinner` (bạn có thể tạo file riêng hoặc để tạm ở đây)
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
  const state = (location.state ?? {}) as MenuState;


  const [sp] = useSearchParams();

  // Ưu tiên state; nếu F5 mất state, lấy từ query; nếu vẫn thiếu thì fallback chữ "BÀI HỌC"
  const unitName = state.unitName ?? sp.get("unitName") ?? "";
  const unitTitle = state.unitTitle ?? sp.get("unitTitle") ?? "";
  const titleFromStateOrQuery = state.title ?? sp.get("title") ?? "";
 


  const headerText =
    (unitName && unitTitle && `${unitName}: ${unitTitle}`) ||
    titleFromStateOrQuery ||
    "BÀI HỌC";
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [lockStatus, setLockStatus] = useState<LessonLockStatusRes | null>(null);
  useEffect(() => {
    const profileId = getProfileId();
    if (!unitId || !profileId) {
        setLoadingStatus(false);
        return;
    }

    let isMounted = true;
    getLessonLockStatus(Number(unitId), profileId) // Hàm này đã được cập nhật ở bước 1
        .then(data => {
            if (isMounted) setLockStatus(data);
        })
        .catch(err => {
            if (isMounted) console.error("Lỗi tải trạng thái khóa:", err);
            // (Nếu lỗi, mặc định mở khóa hết để user không bị kẹt)
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

  // const items: LessonMenuItem[] = [
  //   { key: "learn-vocab",    label: "HỌC TỪ VỰNG",   icon: <span className="lm__icon-emoji">📖</span>, gradientClass: "lm__btn--yellow", to: `/learn/units/${unitId}/vocab/learn` },
  //   { key: "review-vocab",   label: "ÔN TỪ VỰNG",    icon: <span className="lm__icon-emoji">↻</span>, gradientClass: "lm__btn--green",  to: `/learn/units/${unitId}/vocab/review` },
  //   { key: "learn-sentence", label: "HỌC CÂU",       icon: <span className="lm__icon-emoji">💬</span>, gradientClass: "lm__btn--pink",  to: `/learn/units/${unitId}/sentence/learn` },
  //   { key: "review-sentence",label: "ÔN CÂU",        icon: <span className="lm__icon-emoji">✏️</span>, gradientClass: "lm__btn--lime",  to: `/learn/units/${unitId}/sentence/review` },
  //   { key: "test",           label: "KIỂM TRA",      icon: <span className="lm__icon-emoji">📋</span>, gradientClass: "lm__btn--blue",  to: `/learn/units/${unitId}/testlist` },
  // ];


  const items: LessonMenuItem[] = useMemo(() => {
    // Luồng học:
    // 1. Học TV
    // 2. Ôn TV (Sau khi xong 1)
    // 3. Học Câu (Sau khi xong 2)
    // 4. Ôn Câu (Sau khi xong 3)
    // 5. Test (Sau khi xong 4)
    
    const defaultStatus = { 
        vocabLearned: false, 
        vocabGamesDone: false,
        sentenceLearned: false, 
        sentenceGamesDone: false,
        allTestsDone: false 
    };
    const status = lockStatus ?? defaultStatus;

    // Định nghĩa các điều kiện mở khóa
    const unlockLearnVocab = true; // 1. Luôn mở
    const unlockReviewVocab = status.vocabLearned; // 2. Mở sau khi Học TV
    const unlockLearnSentence = status.vocabGamesDone; // 3. Mở sau khi Ôn TV
    const unlockReviewSentence = status.sentenceLearned; // 4. Mở sau khi Học Câu
    const unlockTest = status.sentenceGamesDone; // 5. Mở sau khi Ôn Câu

    // 👇 Thêm điều kiện cho nút mới (giống hệt unlockReviewVocab)
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


  useEffect(() => {
  if (state && (state.unitName || state.unitTitle || state.title)) {
    localStorage.setItem("lessonMenuState", JSON.stringify(state));
    console.log("Du lieu da luu:" + state.unitName)
  }
}, [state]);


  return (
    <div className="lm">
      {/* Header full width */}
      <header className="lm__header">
        <button className="lm__back" onClick={() => navigate("/learn")}>←</button>
        <div className="lm__title-inline">{headerText}</div>
      </header>

      {/* List center */}
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
