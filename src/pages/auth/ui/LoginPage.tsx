import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginApi } from "../../../api/auth";
import "../css/LoginPage.css";

export default function LoginPage() {
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const canSubmit = email.trim() !== "" && pw.trim() !== "" && !loading;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setErr("");
    setLoading(true);
    try {
      const data = await loginApi({ email, password: pw });
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      nav("/create-profile"); // đổi thành route bạn muốn
    } catch (ex: any) {
      setErr(ex?.message ?? "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="lp__wrap">
      <div className="lp__card">
        <div className="lp__logo">
          <img
            alt="mascot"
            src="https://res.cloudinary.com/dxhhluk84/image/upload/v1759569444/Owl_Ava_qpagsn.png"
            className="lp__logo-img"
          />
        </div>

        <h1 className="lp__title">ĐĂNG NHẬP</h1>

        <form className="lp__form" onSubmit={onSubmit} noValidate>
          <input
            type="email"
            inputMode="email"
            placeholder="Gmail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="lp__input"
          />

          <div className="lp__pw">
            <input
              type={showPw ? "text" : "password"}
              placeholder="Mật khẩu"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="lp__input lp__input--pw"
            />
            <button
              type="button"
              className="lp__pw-toggle"
              onClick={() => setShowPw((s) => !s)}
              aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPw ? "Ẩn" : "Hiện"}
            </button>
          </div>

          <div className="lp__forgot">
            <button type="button" className="lp__forgot-btn" onClick={() => nav("/forgot-password")}>
              Quên mật khẩu?
            </button>
          </div>

          {err && <div className="lp__error">{err}</div>}

          <button type="submit" className="lp__submit" disabled={!canSubmit}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <p className="lp__footer">
          Bạn chưa có tài khoản?{" "}
          <Link to="/register" className="lp__link">
            Đăng ký
          </Link>
        </p>
      </div>
    </div>
  );
}
