import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { fetchVocabulariesByLesson, type VocabularyDTORes } from "../../../api/learn";
import { getProfileId } from "../../../store/storage";
import { markItemAsCompleted, type LessonProgressReq } from "../../../api/lessonProgress";
// import { gradePronunciationApi, type PronounceGradeResponse } from "../../../api/game"; // 👈 Import API mới
import "../css/PronunciationPracticePage.css"; // 👈 File CSS mới (Bước 2.5)
import { gradePronunciationApi, type PronounceGradeResponse } from "../../../api/game";
import { claimEpicRewardApi, type StickerRes } from "../../../api/shop";
import RewardModal from "../../../components/learner/ui/RewardModal";
import LessonCompletion from "../../../components/learner/ui/LessonCompletion";

type HeaderState = { unitName?: string; unitTitle?: string; title?: string };

// Kiểu trả về của Mock API
type GradeResult = PronounceGradeResponse | null;

export default function PronunciationPracticePage() {
  const navigate = useNavigate();
  const { unitId = "" } = useParams();
  const { state } = useLocation() as { state?: HeaderState };
  const profileId = getProfileId();

  // 1. State quản lý từ vựng (giống VocabLearnPage)
  const headerText = (state?.title) || "Luyện phát âm";
  const [list, setList] = useState<VocabularyDTORes[]>([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const normalAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // 2. State cho việc ghi âm và chấm điểm
  const [isRecording, setIsRecording] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [gradeResult, setGradeResult] = useState<GradeResult>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [showRewardModal, setShowRewardModal] = useState(false);
  const [earnedSticker, setEarnedSticker] = useState<StickerRes>();

  const [passedCount, setPassedCount] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);


  const total = list.length;
  const current = list[idx];
  const media = useMemo(() => {
    // (Logic trích xuất media giống hệt VocabLearnPage)
    if (!current) return { image: "", normal: "", slow: "" };
    let image = "", normal = "", slow = "";
    for (const m of current.mediaAssets ?? []) {
      if (m.mediaType === "IMAGE" && !image) image = m.url;
      if (m.mediaType === "AUDIO") {
        if (!normal) normal = m.url; // Chỉ cần âm thanh chuẩn
      }
    }
    return { image, normal, slow };
  }, [current]);

  // Fetch data (giống VocabLearnPage)
  useEffect(() => {
    if (!unitId) return;
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const data = await fetchVocabulariesByLesson(unitId);
        if (!isMounted) return;
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

  // Tính %
  const pct = useMemo(() => (total === 0 ? 0 : Math.round(((idx) / total) * 100)), [idx, total]);

  // Chơi âm thanh mẫu
  const playNormal = () => {
    if (!media.normal) return;
    normalAudioRef.current?.pause();
    normalAudioRef.current?.load();
    normalAudioRef.current?.play().catch(() => {});
  };

  // --- LOGIC GHI ÂM ---

  const startRecording = async () => {
    if (isRecording || !current) return;
    setGradeResult(null); // Xóa kết quả chấm cũ
    audioChunksRef.current = []; // Xóa đoạn audio cũ

    try {
      // 1. Xin quyền truy cập micro
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // 2. Khởi tạo MediaRecorder
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      // 3. (Event) Khi có dữ liệu âm thanh
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      // 4. (Event) Khi dừng ghi âm
      mediaRecorderRef.current.onstop = () => {
        // Tắt stream micro (dừng icon trên tab)
        stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
        
        // Tạo file âm thanh
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Gửi đi chấm điểm
        handleSubmitRecording(audioBlob);
      };

      // 5. Bắt đầu ghi
      mediaRecorderRef.current.start();
      setIsRecording(true);

    } catch (err) {
      console.error("Lỗi ghi âm:", err);
    //   setError("Không thể truy cập micro. Vui lòng cấp quyền.");
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current || !isRecording) return;
    mediaRecorderRef.current.stop(); // Tự động trigger event 'onstop'
  };

  // Nút chính (Bấm để ghi / Bấm để dừng)
  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Gửi file đi chấm điểm
const handleSubmitRecording = async (audioBlob: Blob) => {
  if (!current || !profileId) return;

  setIsGrading(true);
  setErr("");
  
  try {
    // Bây giờ truyền cả blob user và URL audio ref
    const result = await gradePronunciationApi(audioBlob, current.term_en);
    setGradeResult(result);
    if (result.grade === 'ACCURATE' || result.grade === 'ALMOST') {
        // Sử dụng functional update để tránh stale state
        setPassedCount(prev => prev + 1);
      }

  } catch (e: any) {
    console.error("Grade error:", e);
    setGradeResult(null);
    setErr(e.message || "Lỗi chấm điểm");
  } finally {
    setIsGrading(false);
  }
};

// Kiểm tra xem đây có phải là từ cuối cùng không
  const isLastWord = idx === total - 1;
  // Hàm kiểm tra kết quả cuối cùng và thoát
  const checkRewardAndExit = async () => {
    // Điều kiện nhận quà: Phải đọc đúng ít nhất 1 từ (hoặc tùy bạn chỉnh)
    const isEligibleForReward = passedCount / total >=0.5;

    if (isEligibleForReward) {
      try {
        const sticker = await claimEpicRewardApi(Number(profileId));
        setEarnedSticker(sticker);
        setShowRewardModal(true);
      } catch (rewardErr) {
        console.error("Lỗi nhận thưởng:", rewardErr);
        setShowCompletionModal(true);
      }
    } else {
      setShowCompletionModal(true);
    }
  };


  // Hàm xử lý nút BỎ QUA
  const handleSkip = () => {
    if (isLastWord) {
      checkRewardAndExit();
    } else {
      setGradeResult(null);
      setIdx((i) => i + 1);
    }
  };
  // Chuyển từ tiếp theo
  const handleNext = async () => {
    if (!current || !profileId) return;

    // 1. Đánh dấu đã hoàn thành (giống VocabLearnPage)
    // Chúng ta dùng "VOCAB" vì đây là một hình thức học từ vựng
    const myPayload: LessonProgressReq = {
      learnerProfileId: profileId,
      lessonId: Number(unitId),
      itemType: "VOCAB", // Dùng lại type "VOCAB"
      itemRefId: Number(current.id)
    };
    try {
      // Gọi không chờ (fire and forget) để trải nghiệm mượt hơn
      markItemAsCompleted(myPayload).catch(e => console.error(e));
    } catch (e) { console.error(e); }

    // 2. Xử lý chuyển cảnh
    if (isLastWord) {
      checkRewardAndExit();
    } else {
      setGradeResult(null);
      setIdx((i) => i + 1);
    }
  };



  const handleRetry = () => {
    // Chỉ cần xóa kết quả hiện tại, màn hình sẽ tự động
    // quay về trạng thái 3a (chờ ghi âm)
    setGradeResult(null);
  };
  // 4. Hàm đóng Modal (được gọi khi bé bấm nút trên Modal)
  const handleCloseReward = () => {
    setShowRewardModal(false);
    setShowCompletionModal(true);
  };
  // Lấy class màu cho feedback
  const feedbackClass = useMemo(() => {
    if (!gradeResult) return '';
    if (gradeResult.grade === 'ACCURATE') return 'pp-feedback--ok';
    if (gradeResult.grade === 'ALMOST') return 'pp-feedback--almost';
    return 'pp-feedback--bad';
  }, [gradeResult]);


// Hàm 3: Nút "Học lại" (Reset toàn bộ để học lại từ đầu)
  const handleReplay = () => {
    setIdx(0);
    setPassedCount(0);
    setGradeResult(null);
    setShowCompletionModal(false);
    // Nếu muốn random lại danh sách từ, bạn có thể gọi lại hàm fetch data ở đây
  };

  // Hàm 4: "Đóng" (Thoát ra menu)
  const handleCloseCompletion = () => {
    setShowCompletionModal(false);
    navigate(-1);
  };

  // 👇 Hàm xử lý nút "Ôn tập"
  const handleReview = () => {
    // Chuyển hướng sang trang chọn game từ vựng
    // Giữ nguyên state để breadcrumb hoạt động nếu cần
    navigate(`/learn/units/${unitId}/vocab/review`, { 
      state: state 
    });
  };

  // --- RENDER ---

// --- RENDER ---

  if (loading) return <div className="pp-wrap"><div className="pp-loader">Đang tải...</div></div>;
  if (err) return <div className="pp-wrap"><div className="pp-error">{err}</div></div>;
  if (!current) return <div className="pp-wrap"><div className="pp-empty">Không có từ vựng.</div></div>;

  return (
    <div className="pp-wrap">
      {/* 1. Top Bar (Giữ nguyên) */}
      <div className="pp-top">
        <button className="pp-exit" onClick={() => navigate(-1)}>×</button>
        <div className="pp-progress-wrap" aria-label={`Tiến độ ${idx + 1}/${total}`}>
          <div className="pp-progress-bar" style={{ width: `${pct}%` }} />
        </div>
        <div className="pp-progress-text">{idx + 1}/{total}</div>
      </div>

      <h2 className="pp-header">Hãy phát âm từ vựng sau</h2>

      {/* 2. Content Card (Giữ nguyên) */}
      <div className="pp-card-wrap">
        <div className="pp-card">
          {/* Ảnh */}
          <div className="pp-image-box">
            {media.image ? (
              <img src={media.image} alt={current.term_en} className="pp-image" />
            ) : (
              <div className="pp-image-placeholder">No Image</div>
            )}
          </div>
          
          {/* Nút phát âm mẫu */}
          <button className="pp-speaker" onClick={playNormal} aria-label="Nghe phát âm mẫu">
            <span className="pp-icon-speaker" />
          </button>
          <audio ref={normalAudioRef} src={media.normal} preload="auto" />

          {/* Thông tin từ */}
          <div className="pp-word">{current.term_en}</div>
          {!!current.phonetic && <div className="pp-phonetic">{current.phonetic}</div>}
          <div className="pp-meaning">{current.term_vi}</div>
        </div>
      </div>

      {/* 3. Footer (Nút Ghi âm / Bỏ qua) - ĐÃ SỬA LẠI HOÀN TOÀN CẤU TRÚC */}
      
      {/* 3a. Khi CHƯA ghi âm (hoặc đã Next) */}
      {!gradeResult && (
        <div className="pp-footer-actions"> {/* Đổi tên class và bỏ position fixed */}
          <button 
            className={`pp-btn pp-btn--mic ${isRecording ? 'is-recording' : ''}`}
            onClick={handleMicClick}
            disabled={isGrading}
          >
            <span className="pp-icon-mic" />
            {isGrading ? "ĐANG CHẤM..." : (isRecording ? "ĐANG GHI..." : "NHẤN ĐỂ ĐỌC")}
          </button>

          <button 
            className="pp-btn pp-btn--skip" 
            onClick={handleSkip} 
            disabled={isRecording || isGrading}
          >
            BỎ QUA
          </button>
        </div>
      )}

      {/* 3b. Khi ĐÃ CÓ KẾT QUẢ chấm (Vẫn là banner dính đáy) */}
      {gradeResult && (
        <div className={`pp-feedback ${feedbackClass}`}>
          <div className="pp-feedback-inner">
            <div className="pp-fb-left">
              <div className="pp-fb-text">
                <div className="pp-fb-title">{gradeResult.feedback}</div>
                <div className="pp-fb-score">
                  <strong>{gradeResult.score}</strong> điểm — {gradeResult.grade}
                </div>
              </div>
            </div>
            <div className="pp-fb-right">
            <button
              className="pp-btn pp-btn--retry"
              onClick={handleRetry}
            >
              PHÁT ÂM LẠI
            </button>
              <button
                className={`pp-btn ${feedbackClass}`}
                onClick={handleNext}
                autoFocus
              >
                {isLastWord ? "HOÀN THÀNH" : "TIẾP TỤC"}
              </button>
            </div>
          </div>
        </div>
      )}

      <RewardModal 
        isOpen={showRewardModal} 
        sticker={earnedSticker??null} 
        onClose={handleCloseReward} 
      />
      {/* 2. Modal tổng kết bài học */}
      {showCompletionModal && (
        <LessonCompletion
          type="pronunciation"
          totalItem={total}
          correctCount={passedCount}
          onRetry={handleReplay}           // Nút "Học lại"
          onReview={handleReview} // Nút "Ôn tập" -> Tạm thời cho về menu
          onClose={handleCloseCompletion}  // Nút "X" -> Về menu
        />
      )}

    </div>
  );
}