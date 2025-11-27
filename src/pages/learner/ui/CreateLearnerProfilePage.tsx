import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  createLearnerProfileApi,
  uploadAvatarApi,
  type LearnerProfileReq,
  type ProfileRes,
} from "../../../api/learnerProfile";
import "../css/CreateLearnerProfilePage.css";
import { getAllGradeLevels, type GradeLevelDTO } from "../../../api/gradeLevel";
import { saveProfileId } from "../../../store/storage";

export default function CreateLearnerProfilePage() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    nickName: "",
    dateOfBirth: "",
    avatarUrl:"",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null); 
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState<ProfileRes | null>(null);

  const [grades, setGrades] = useState<GradeLevelDTO[]>([]);
  const [gradeId, setGradeId] = useState<string>(""); // lưu id dưới dạng string cho dễ binding select
  const [loadingGrades, setLoadingGrades] = useState<boolean>(false);

  const previewUrl = useMemo(
    ()=>(avatarFile? URL.createObjectURL(avatarFile):""),
    [avatarFile]
  );

  // Nếu chưa đăng nhập thì đá về /login
  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      nav("/login");
      return;
    }
    // Load grade levels
    (async () => {
      setLoadingGrades(true);
      try {
        const levels = await getAllGradeLevels();
        setGrades(levels);
        // (tuỳ chọn) auto chọn lớp đầu tiên
        // if (levels.length > 0) setGradeId(String(levels[0].id));
      } catch (e: any) {
        setErr(e?.message ?? "Không tải được danh sách lớp");
      } finally {
        setLoadingGrades(false);
      }
    })();
    return ()=>{
      if(previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [nav,previewUrl]);

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target as HTMLInputElement | HTMLSelectElement;

    if (name === "avatarFile" && (e.target as HTMLInputElement).files?.[0]) {
      const f = (e.target as HTMLInputElement).files![0];
      if (!/^image\//.test(f.type)) {
        setErr("Chỉ hỗ trợ file ảnh (PNG/JPG/WebP...)");
        return;
      }
      if (f.size > 5 * 1024 * 1024) {
        setErr("Ảnh quá lớn (>5MB). Vui lòng chọn ảnh nhỏ hơn.");
        return;
      }
      setErr("");
      setAvatarFile(f);
      return;
    }

    if (name === "gradeId") {
      setGradeId(value); // lưu id lớp được chọn
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.fullName.trim()) {
      setErr("Vui lòng nhập Họ và Tên Đầy Đủ.");
      return;
    }
    if (!gradeId) {
      setErr("Vui lòng chọn Lớp.");
      return;
    }

    setErr("");
    setLoading(true);
    try {
      let avatarUrl = form.avatarUrl?.trim() || "";
      if (avatarFile) {
        avatarUrl = await uploadAvatarApi(avatarFile);
      }
      const payload: LearnerProfileReq = {
        fullName: form.fullName.trim(),
        nickName: form.nickName?.trim() || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        avatarUrl: avatarUrl||undefined,
        initialGradeLevelId: Number(gradeId),
      };
      const res = await createLearnerProfileApi(payload);
      saveProfileId(res.id);
      setSuccess(res);
      // Điều hướng bước tiếp theo (ví dụ chọn khối lớp)
      setTimeout(() => {
        nav(`/learn`); // đổi route theo flow của bạn, ví dụ: `/select-grade`
      }, 800);
    } catch (ex: any) {
      setErr(ex?.message ?? "Tạo hồ sơ thất bại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="clp-page">
      {/* Banner/Header */}
      <div className="clp-hero">
        <div className="clp-hero-inner">
          <h1 className="clp-title">
            <span className="clp-pin">📍</span>
            Tạo hồ sơ học tập cho bé
            <span className="clp-pin">📍</span>
          </h1>
          <p className="clp-subtitle">
            Bắt đầu hành trình học tiếng Anh vui vẻ cùng con bạn!
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="clp-content">
        <div className="clp-card">
          <form onSubmit={onSubmit}>
            <label className="clp-label">Họ và Tên Đầy Đủ (Tên hiển thị)</label>
            <input
              className="clp-input"
              name="fullName"
              type="text"
              placeholder="Ví dụ: Nguyễn Văn A"
              value={form.fullName}
              onChange={onChange}
              autoComplete="name"
            />

            <label className="clp-label">Tên Gọi Thân Mật (Nick Name)</label>
            <input
              className="clp-input"
              name="nickName"
              type="text"
              placeholder="Ví dụ: Tom, Bống (Dùng để gọi bé trong ứng dụng)"
              value={form.nickName}
              onChange={onChange}
            />

            <label className="clp-label">Ngày Tháng Năm Sinh</label>
            <input
              className="clp-input"
              name="dateOfBirth"
              type="date"
              value={form.dateOfBirth}
              onChange={onChange}
            />
          {/* Select lớp lấy từ API */}
            <label className="clp-label">Chọn Lớp</label>
            <select
              className="clp-input"
              name="gradeId"
              value={gradeId}
              onChange={onChange}
              disabled={loadingGrades}
               required
            >
              <option value="">
                {loadingGrades ? "Đang tải danh sách lớp..." : "-- Chọn lớp --"}
              </option>
              {grades.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.gradeName}
                </option>
              ))}
            </select>


            <label className="clp-label">Ảnh đại diện của bé (tuỳ chọn)</label>
            <input
              className="clp-input"
              name="avatarFile"
              type="file"
              accept="image/*"
              onChange={onChange}
            />
            {/* Preview ảnh nếu có */}
            {avatarFile && (
              <div className="clp-avatar-preview">
                <img src={previewUrl} alt="avatar preview" />
              </div>
            )}



            {err && <div className="clp-alert clp-alert--error">{err}</div>}
            {success && (
              <div className="clp-alert clp-alert--success">
                Tạo hồ sơ thành công (ID: {success.id}).
              </div>
            )}

            <button className="clp-btn" type="submit" disabled={loading}>
              {loading ? "Đang tạo..." : "Hoàn Tất Hồ Sơ"}
            </button>
          </form>
        </div>

        {/* (Tùy chọn) Cột minh họa bên phải */}
        <div className="clp-side">
          <div className="clp-illus">🎓</div>
          <p className="clp-side-text">
            Vui lòng nhập đúng độ tuổi của bé để WiseOwl chọn đúng chương trình học cho bé nhé ba mẹ ơi!
            <br/>
            <br/>
            Lưu ý : Ba mẹ có thể tạo nhiều hồ sơ cho các bé khác nhau trong gia đình nhé 😊!
          </p>
        </div>
      </div>
    </div>
  );
}
