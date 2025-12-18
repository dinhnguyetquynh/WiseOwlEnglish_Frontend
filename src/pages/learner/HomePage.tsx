import { useEffect, useMemo, useState } from "react";
import UnitCard, { type Unit } from "../../components/learner/ui/UnitCard.tsx"; // import component đã tách
import "./css/HomePage.css";
import FancyClassSelect from "../../components/learner/ui/FancyClassSelect.tsx";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { fecthLessonsForGuest, fetchLessonsByGradeForProfile, fetchLessonsForHomePage, type LessonsByClassRes } from "../../api/learn.ts";
import { getCurrentViewingGrade, getPrimaryGrade, getProfileId, isGuestMode, saveCurrentViewingGrade, savePrimaryGrade } from "../../store/storage.ts";
import { getProfile, type LearnerProfileRes } from "../../api/learnerProfile.ts";
import { useLearnerLayoutContext } from "../../layouts/LearnerLayout.tsx";

export default function HomePage() {



  const [units, setUnits] = useState<Unit[]>([]);
  // const [grade, setGrade] = useState<number>(1); 
  // 1. Lớp học chính của user (lấy từ API)
  const [primaryGrade, setPrimaryGrade] = useState<number | null>(null);
  // 2. Lớp học user đang chọn xem (từ dropdown)
  // const [selectedGrade, setSelectedGrade] = useState<number | null>(null);

  const [searchParams] = useSearchParams();
  // State cho Popup yêu cầu đăng nhập
  const [showLoginRequest, setShowLoginRequest] = useState(false); // 👈 Lấy tham số URL


  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [profile, setProfile] = useState<LearnerProfileRes | null>(null);
  const navigate = useNavigate();


   
      //lấy profileID từ localStorage
      const profileId = getProfileId();
      const isGuest = isGuestMode();

  // 1. LẤY STATE TỪ LAYOUT
  const { selectedGrade, setSelectedGrade } = useLearnerLayoutContext();

  // ... (giữ nguyên phần useEffect initData)

// ✅ gọi API lấy profile
  useEffect(() => {
   if (isGuest || !profileId) return; // Bỏ qua nếu là khách
    (async () => {
      try {
        const data = await getProfile(profileId);
        setProfile(data);
      } catch (e) {
        console.error("Lỗi tải profile:", e);
      }
    })();
  }, [profileId]);

  useEffect(() => {
    const initData = async () => {
      // TRƯỜNG HỢP GUEST
      // --- TRƯỜNG HỢP GUEST ---
      if (isGuest) {
        if (primaryGrade) return;

        const savedGradeRaw = getPrimaryGrade();
        const savedGrade = savedGradeRaw ? Number(savedGradeRaw) : 1;

        console.log("Guest Mode - Saved Grade:", savedGrade); // Debug log

        setPrimaryGrade(savedGrade);
        
        // Nếu Context chưa có selectedGrade hoặc nó đang khác với cái Guest chọn
        // thì cập nhật ngay Context để kích hoạt việc fetch bài
        if (selectedGrade !== savedGrade) {
             setSelectedGrade(savedGrade);
        }
        return; 
      }
      // TRƯỜNG HỢP USER (Cần profileId)
      if (profileId && !primaryGrade) {
        try {
          // Gọi song song lấy Profile và Bài học mặc định
          const lessonsData = await fetchLessonsForHomePage(profileId);
          
          // Setup Grade
          const grade = lessonsData.gradeOrderIndex;
          setPrimaryGrade(grade);
          // setSelectedGrade(grade);
          if (!selectedGrade || selectedGrade !== grade) {
              setSelectedGrade(grade); 
          }

        } catch (e) {
          console.error("Lỗi khởi tạo user:", e);
          setErr("Không thể tải thông tin người học.");
        }
      }
    };

    // Chỉ chạy khi chưa có primaryGrade
    initData();
  }, [profileId, isGuest,primaryGrade, selectedGrade, setSelectedGrade]);
  
  // ✅ EFFECT 2: Lưu lại grade đang xem mỗi khi thay đổi
  useEffect(() => {
    if (selectedGrade) {
      saveCurrentViewingGrade(selectedGrade);
    }
  }, [selectedGrade]);

  useEffect(() => {
    if (!selectedGrade) return;

    (async () => {
      try {
        setLoading(true);
        setErr("");
        let data: LessonsByClassRes;

        // --- TRƯỜNG HỢP GUEST ---
        if (isGuest) {
           data = await fecthLessonsForGuest(Number(selectedGrade));
        } 
        // --- TRƯỜNG HỢP USER ĐĂNG NHẬP ---
        else if (profileId) {
          if (primaryGrade && selectedGrade === primaryGrade) {
            data = await fetchLessonsForHomePage(profileId);
          } else {
            data = await fetchLessonsByGradeForProfile(profileId, selectedGrade);
          }
        } else {
            return;
        }

        // Map dữ liệu
        // Với Guest: Mặc định không khoá bài nào (hoặc chỉ khoá bài sau), progress = 0
        const isLocked = !isGuest && (primaryGrade ? selectedGrade > primaryGrade : false); 
        
        const mapped: Unit[] = data.lessons.map((l) => ({
          id: String(l.id),
          title: `${l.unitName}: ${l.lessonName}`,
          unitName: l.unitName,
          unitTitle: l.lessonName,
          lessonCount: 100,
          progress: { done: isGuest ? 0 : l.percentComplete, total: 100 }, // Guest luôn là 0%
          status: isLocked ? "LOCKED" : (isGuest ? "ACTIVE" : l.status), // Guest luôn ACTIVE
          mascot: l.mascot,
        }));
        setUnits(mapped);
      } catch (e: any) {
        // Tắt lỗi nếu là guest mock
        console.log(e);
        setErr("Có lỗi khi tải danh sách bài học.");
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedGrade, primaryGrade, profileId, isGuest]);



const handleContinue = (unit: Unit) => {
    // NẾU LÀ GUEST -> HIỆN POPUP BẮT ĐĂNG NHẬP
    if (isGuest) {
      setShowLoginRequest(true);
      return;
    }

    // Logic cũ cho User thật
    if (unit.status === "LOCKED") {
      alert("Bạn cần hoàn thành các lớp trước để mở khóa lớp này!");
      return;
    }
    const qs = new URLSearchParams({
      title: unit.title,
      unitName: unit.unitName ?? "",
      unitTitle: unit.unitTitle ?? "",
    }).toString();

    navigate(`/learn/units/${unit.id}?${qs}`, {
      state: { ...unit },
    });
  };
  return (
    <div className="hp">
      {/* Header: select lớp */}
      <header className="hp__header">
         {/* <FancyClassSelect value={selectedGrade ?? 1} onChange={setSelectedGrade} /> */}
         {/* Nút Đăng nhập trên Header */}
         {isGuest && (
           <button 
             onClick={() => navigate("/login")} 
             className="hp-login-btn"
             title="Đăng nhập để lưu kết quả nhé!"
           >
             Đăng nhập
           </button>
         )}
      </header>

      <hr className="hp__divider" />
      {err && <div className="hp__error">{err}</div>}
      {loading && <div className="hp__loading">Đang tải bài học…</div>}

      {/* Danh sách Units */}
      <section className="hp__units">
        {units.map((u) => (
          <UnitCard key={u.id} unit={u} onContinue={handleContinue} />
        ))}
      </section>
      {/* POPUP YÊU CẦU TẠO TÀI KHOẢN */}
      {/* POPUP YÊU CẦU ĐĂNG NHẬP (Giao diện mới) */}
      {showLoginRequest && (
         <div className="popup-overlay">
           <div className="popup-content">
             <h3>Chưa có tài khoản?</h3>
             <p>
               Bé ơi, hãy tạo tài khoản để lưu lại <br/>
               kết quả học tập xuất sắc của mình nhé!
             </p>
             
             <div className="popup-actions">
               {/* Nút Đăng ký (Ưu tiên bấm vào đây) */}
               <button 
                  className="popup-btn register"
                  onClick={() => navigate("/register")}
               >
                  🚀 Tạo tài khoản mới
               </button>

               {/* Nút Đăng nhập */}
               <button 
                  className="popup-btn login"
                  onClick={() => navigate("/login")}
               >
                  Đăng nhập ngay
               </button>

               {/* Nút Đóng */}
               <button 
                  className="popup-btn close"
                  onClick={() => setShowLoginRequest(false)}
               >
                  Để sau nha
               </button>
             </div>
           </div>
         </div>
      )}
    </div>
  );
}
