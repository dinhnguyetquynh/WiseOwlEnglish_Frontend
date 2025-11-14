import { useEffect, useMemo, useState } from "react";
import UnitCard, { type Unit } from "../../components/learner/ui/UnitCard.tsx"; // 👈 import component đã tách
import "./css/HomePage.css";
import FancyClassSelect from "../../components/learner/ui/FancyClassSelect.tsx";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { fetchLessonsByGradeForProfile, fetchLessonsForHomePage, type LessonsByClassRes } from "../../api/learn.ts";
import { getProfileId } from "../../store/storage.ts";
import { getProfile, type LearnerProfileRes } from "../../api/learnerProfile.ts";

export default function HomePage() {


  const [units, setUnits] = useState<Unit[]>([]);
  // const [grade, setGrade] = useState<number>(1); 
  // 1. Lớp học chính của user (lấy từ API)
  const [primaryGrade, setPrimaryGrade] = useState<number | null>(null);
  // 2. Lớp học user đang chọn xem (từ dropdown)
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);


  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [profile, setProfile] = useState<LearnerProfileRes | null>(null);
  const navigate = useNavigate();
   
      //lấy profileID từ localStorage
      const profileId = getProfileId();
// ✅ gọi API lấy profile
  useEffect(() => {
    console.log("Đã gọi đến api getProfile")
    if (!profileId) return;
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
    if (!profileId) return;
    (async () => {
      try {
        setErr("");
        const data: LessonsByClassRes = await fetchLessonsForHomePage(profileId);
        setPrimaryGrade(data.gradeOrderIndex);
        setSelectedGrade(data.gradeOrderIndex);
        // const mapped: Unit[] = data.lessons.map(l => ({
        //   id: String(l.id),
        //   title: `${l.unitName}: ${l.lessonName}`, // yêu cầu của bạn
        //   unitName: l.unitName,
        //   unitTitle: l.lessonName,
        //   lessonCount: 100,                        // hoặc tổng item lesson nếu muốn
        //   progress: { done: l.percentComplete, total: 100 },
        //   status: l.status,
        //   mascot:l.mascot
        // }));
        // setUnits(mapped);
      } catch (e: any) {
        setErr(e?.message ?? "Lỗi tải bài học");
      // } finally {
      //   setLoading(false);
       }
    })();
  }, [profileId]);

  // Effect này chạy khi người dùng CHỌN LỚP KHÁC
  useEffect(() => {
    if (!selectedGrade || !primaryGrade || !profileId ) {
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setErr("");

       let data: LessonsByClassRes;

        // Nếu lớp đang chọn là lớp chính -> gọi API home
        if (selectedGrade === primaryGrade) {
          data = await fetchLessonsForHomePage(profileId);
        }
        // Nếu lớp đang chọn là lớp khác -> gọi API kia
        else {
          data = await fetchLessonsByGradeForProfile(
            profileId,
            selectedGrade
          );
        }
        
        const isLocked = selectedGrade > primaryGrade;
        const mapped: Unit[] = data.lessons.map((l) => ({
          id: String(l.id),
          title: `${l.unitName}: ${l.lessonName}`,
          unitName: l.unitName,
          unitTitle: l.lessonName,
          lessonCount: 100,
          progress: { done: l.percentComplete, total: 100 },
          // SỬA Ở ĐÂY:
          // Bây giờ chúng ta tin tưởng 100% vào status (LOCKED/ACTIVE/COMPLETE)
          // mà Backend trả về (do hàm `getLessonsByGradeForProfile` đã xử lý)
          status: isLocked ? "LOCKED" : l.status,
          mascot: l.mascot,
        }));
        setUnits(mapped);
      } catch (e: any) {
        setErr(e?.message ?? "Lỗi tải bài học của lớp này");
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedGrade, primaryGrade, profileId]);

const handleContinue = (unit: Unit) => {
    // State: mượt, sạch
    // Query: dự phòng nếu user F5 ở LessonMenu vẫn giữ được tiêu đề
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
      state: {
        title: unit.title,
        unitName: unit.unitName,
        unitTitle: unit.unitTitle,
      },
    });
  };


  return (
    <div className="hp">
      {/* Header: select lớp */}
      <header className="hp__header">
         <FancyClassSelect value={selectedGrade ?? 1} onChange={setSelectedGrade} />
         <div className="hp_account">
          <div className="hp_account_avatar">
            <img src={profile?.avatarUrl ??
                "https://res.cloudinary.com/dxhhluk84/image/upload/v1759137636/unit1_color_noBG_awzhqe.png"} alt="avatar" />
          </div>
          <div>
            <p>{profile?.nickName ?? "Đang tải..."}</p>
          </div>
         </div>
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
    </div>
  );
}
