import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  createLearnerProfileApi,
  type LearnerProfileReq,
  type LearnerProfileRes,
} from "../../../api/learnerProfile";
import "../css/CreateLearnerProfilePage.css";

export default function CreateLearnerProfilePage() {
  const nav = useNavigate();
  const [form, setForm] = useState<LearnerProfileReq>({
    fullName: "",
    nickName: "",
    dateOfBirth: "",
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState<LearnerProfileRes | null>(null);

  // Nếu chưa đăng nhập thì đá về /login
  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      nav("/login");
    }
  }, [nav]);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.fullName.trim()) {
      setErr("Vui lòng nhập Họ và Tên Đầy Đủ.");
      return;
    }
    setErr("");
    setLoading(true);
    try {
      const payload: LearnerProfileReq = {
        fullName: form.fullName.trim(),
        nickName: form.nickName?.trim() || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
      };
      const res = await createLearnerProfileApi(payload);
      localStorage.setItem("currentProfileId", String(res.id));
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

          {/* <div className="clp-footer">
            <Link to="/learn" className="clp-link">
              ← Quay lại trang học
            </Link>
          </div> */}
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
