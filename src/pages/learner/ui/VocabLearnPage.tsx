import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { fetchVocabulariesByLesson, type VocabularyDTORes } from "../../../api/learn";
import "../css/VocabLearnPage.css";

type HeaderState = { unitName?: string; unitTitle?: string; title?: string };

export default function VocabLearnPage() {
  const navigate = useNavigate();
  const { unitId = "" } = useParams();
  const { state } = useLocation() as { state?: HeaderState };

  // Header text (nếu có từ LessonMenu)
  const headerText =
    (state?.unitName && state?.unitTitle && `${state.unitName}: ${state.unitTitle}`) ||
    state?.title ||
    "Học từ vựng";

  const [list, setList] = useState<VocabularyDTORes[]>([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // 2 audio players (normal / slow)
  const normalAudioRef = useRef<HTMLAudioElement | null>(null);
  const slowAudioRef = useRef<HTMLAudioElement | null>(null);

  const total = list.length;
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
  const onNext = () => {
    if (idx < total - 1) setIdx((i) => i + 1);
    else navigate(-1); // xong bài → quay lại menu (tuỳ bạn chỉnh hướng)
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

  return (
    <div className="vl">
      {/* Top bar & close */}
      <div className="vl__top">
        <button className="vl__exit" onClick={() => navigate(-1)}>×</button>
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
          {!!current.phonetic && <div className="vl__phonetic">{current.phonetic}</div>}
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
    </div>
  );
}
