import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { fetchVocabulariesByLesson, type VocabularyDTORes } from "../../../api/learn";
import "../css/VocabLearnPage.css";
import { markItemAsCompleted, type LessonProgressReq } from "../../../api/lessonProgress";
import { getProfileId } from "../../../store/storage";
import LessonCompletion from "../../../components/learner/ui/LessonCompletion";

type HeaderState = { unitName?: string; unitTitle?: string; title?: string };

export default function VocabLearnPage() {
  const navigate = useNavigate();
  const { unitId = "" } = useParams();
  const { state } = useLocation() as { state?: HeaderState };

  // Header text (nếu có từ LessonMenu)
  const headerText =
    (state?.unitName && state?.unitTitle && `${state.unitName}: ${state.unitTitle}`) ||
    state?.title ||  "Học từ vựng";
  
  //ds vocab kiểu VocabularyDTORes
  const [list, setList] = useState<VocabularyDTORes[]>([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  //  STATE MỚI: Kiểm soát hiển thị màn hình tổng kết
  const [showSuccess, setShowSuccess] = useState(false);

  // 2 audio players (normal / slow)
  const normalAudioRef = useRef<HTMLAudioElement | null>(null);
  const slowAudioRef = useRef<HTMLAudioElement | null>(null);

  //lấy tổng số từ vựng để hiển thị lên thanh progress
  const total = list.length;

  //lưu phần tử hiện tại trong list từ vựng
  const current = list[idx];

  // Trích xuất media: image / normal audio / slow audio
  const media = useMemo(() => {
    if (!current) return { image: "", normal: "", slow: "" };
    let image = "", normal = "", slow = "";
    for (const m of current.mediaAssets ?? []) {
      if (m.mediaType === "IMAGE" && !image) image = m.url;
      if (m.mediaType === "AUDIO") {
        const tag = (m.tag ?? "").toLowerCase();
        if (tag === "slow" && !slow) slow = m.url;
        else if (!normal) normal = m.url; // mặc định coi là normal
      }
    }
    return { image, normal, slow };
  }, [current]);

  // Fetch data
  useEffect(() => {
    if (!unitId) return;
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const data = await fetchVocabulariesByLesson(unitId);
        if (!isMounted) return;
        // Sort theo orderIndex asc (phòng khi backend chưa order)
        data.sort((a, b) => a.orderIndex - b.orderIndex);
        setList(data);
        setIdx(0);
      } catch (e: any) {
        if (isMounted) setErr(e?.message ?? "Lỗi tải từ vựng");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [unitId]);

  const pct = useMemo(() => {
    if (total === 0) return 0;
    return Math.round(((idx + 1) / total) * 100);
  }, [idx, total]);

  const onPrev = () => {
    setIdx((i) => Math.max(0, i - 1));
  };
  const onNext = async () => {
    const learnerProfileId = Number(getProfileId());
    const myPayload: LessonProgressReq = {
    learnerProfileId,
    lessonId: Number(unitId),
    itemType: "VOCAB", // Phải là chuỗi khớp với Enum
    itemRefId: Number(current.id)
    };

    try {
        await markItemAsCompleted(myPayload);
        console.log("FE: Đã cập nhật thành công!");
        if (idx < total - 1) {
            setIdx((i) => i + 1);
        } else {
            // 👇 THAY ĐỔI Ở ĐÂY: Không navigate ngay mà hiện popup
            setShowSuccess(true);
        }
    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message); 
        } else {
            console.error("Một lỗi không xác định đã xảy ra:", error);
        }
    }
       
  };

  const playNormal = () => {
    if (!media.normal) return;
    normalAudioRef.current?.pause();
    normalAudioRef.current?.load();
    normalAudioRef.current?.play().catch(() => {});
  };
  const playSlow = () => {
    if (!media.slow) return;
    slowAudioRef.current?.pause();
    slowAudioRef.current?.load();
    slowAudioRef.current?.play().catch(() => {});
  };
const toLessonMenu = () => {
  const qs = new URLSearchParams({
    title: state?.title ?? "",
    unitName: state?.unitName ?? "",
    unitTitle: state?.unitTitle ?? "",
  }).toString();

  navigate(`/learn/units/${unitId}?${qs}`, {
    replace: true,                
    state: { 
      title: state?.title, 
      unitName: state?.unitName,
      unitTitle: state?.unitTitle,
    },
  });
};
// 👇 Hàm xử lý nút "Ôn tập"
  const handleReview = () => {
    // Chuyển hướng sang trang chọn game từ vựng
    // Giữ nguyên state để breadcrumb hoạt động nếu cần
    navigate(`/learn/units/${unitId}/vocab/review`, { 
      state: state 
    });
  };

  // 👇 Hàm xử lý nút "Học lại"
  const handleRetry = () => {
    setIdx(0);
    setShowSuccess(false);
  };

  return (
    <div className="vl">
      {/* Top bar & close */}
      <div className="vl__top">
        <button className="vl__exit" onClick={() => toLessonMenu()}>×</button>
        <div className="vl__progress-wrap" aria-label={`Tiến độ ${idx + 1}/${total}`}>
          <div className="vl__progress-bar" style={{ width: `${pct}%` }} />
          <span className="vl__progress-text">{idx + 1}/{total}</span>
        </div>
      </div>

      {/* Header (tên bài) */}
      <h2 className="vl__header">{headerText}</h2>

      {loading && <div className="vl__loading">Đang tải từ vựng…</div>}
      {err && <div className="vl__error">{err}</div>}
      {!loading && !err && total === 0 && <div className="vl__empty">Chưa có từ vựng.</div>}

      {current && (
        <div className="vl__content">
          {/* Image box */}
          <div className="vl__image-box">
            {media.image ? (
              <img src={media.image} alt={current.term_en} className="vl__image" />
            ) : (
              <div className="vl__image-placeholder">No Image</div>
            )}
          </div>

          {/* Audio buttons */}
          <div className="vl__audio-row">
            <button className="vl__audio-btn" onClick={playNormal}  title="Phát âm thường">
              <img
                src="https://res.cloudinary.com/dxhhluk84/image/upload/v1759733260/NormalSound_c5nhfv.png"
                alt="Phát âm chuẩn"
                className="vl__icon"
              />
              Normal
            </button>
            <button className="vl__audio-btn" onClick={playSlow}  title="Phát âm chậm">
              <img
                src="https://res.cloudinary.com/dxhhluk84/image/upload/v1759733260/NormalSound_c5nhfv.png"
                alt="Phát âm chậm"
                className="vl__icon"
              />
              Slow 
            </button>
          </div>
          <audio ref={normalAudioRef} src={media.normal} preload="auto" />
          <audio ref={slowAudioRef} src={media.slow} preload="auto" />

          {/* Word & meaning */}
          <div className="vl__word">{current.term_en}</div>
          {!!current.phonetic && <div className="vl__phonetic">{current.phonetic}_({current.partOfSpeech})</div>}
          <div className="vl__meaning">{current.term_vi}</div>
        </div>
      )}

      {/* Bottom nav */}
      <div className="vl__bottom">
        <button className="vl__btn vl__btn--ghost" onClick={onPrev} disabled={idx === 0}>
          QUAY LẠI
        </button>
        <button className="vl__btn vl__btn--primary" onClick={onNext}>
          {idx < total - 1 ? "TIẾP TỤC" : "HOÀN THÀNH"}
        </button>
      </div>
      {/* 👇 RENDER POPUP KHI HOÀN THÀNH */}
      {showSuccess && (
        <LessonCompletion
          type="vocab"
          totalItem={total}
          onClose={toLessonMenu}
          onRetry={handleRetry}
          onReview={handleReview}
        />
      )}

    </div>
  );
}
