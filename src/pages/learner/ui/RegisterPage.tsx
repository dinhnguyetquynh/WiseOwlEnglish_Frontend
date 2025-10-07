import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/RegisterPage.css";

type RegisterRes = {
  id: number | string;
  email: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");

  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);


  const [errors, setErrors] = useState<{ email?: string; pw?: string; pw2?: string }>({});

  const [serverErr, setServerErr] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: { email?: string; pw?: string; pw2?: string } = {};

    if (!email) {
      newErrors.email = "Email không được để trống";
    }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Email không hợp lệ";
    }
      

    if (!pw) newErrors.pw = "Mật khẩu không được để trống";
    else if (pw.length < 8 || pw.length > 100) newErrors.pw = "Mật khẩu phải từ 8 đến 100 ký tự";

    if (!pw2) newErrors.pw2 = "Vui lòng nhập lại mật khẩu";
    else if (pw2 !== pw) newErrors.pw2 = "Mật khẩu nhập lại không khớp";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerErr("");

    if (!validate()) return;

    try {
      setLoading(true);

      const res = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password: pw2, // 👈 Gửi password là giá trị của ô "Nhập lại mật khẩu"
        }),
      });

      // nếu server trả JSON thông tin lỗi/ok
      if (!res.ok) {
        // cố gắng lấy message từ body
        let message = "Đăng ký thất bại. Vui lòng thử lại.";
        try {
          const data = await res.json();
          if (data?.message) message = data.message;
          if (data?.error) message = data.error;
        } catch {
          /* ignore parse error */
        }
        setServerErr(message);
        return;
      }

      const data = (await res.json()) as RegisterRes;
      console.log("Đăng ký thành công:", data);
      // TODO: nếu bạn có bước OTP thì navigate sang trang OTP
      // navigate(`/verify-otp?email=${encodeURIComponent(email)}`);

      // Tạm điều hướng sang khu học tập sau khi đăng ký thành công:
      navigate(`/verify-otp?email=${encodeURIComponent(email)}`);//???
    } catch (err) {
      setServerErr("Không thể kết nối máy chủ. Hãy kiểm tra backend hoặc mạng.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reg__screen">
      <div className="reg__container">
         <div className="lp__logo">
          <img
            alt="mascot"
            src="https://res.cloudinary.com/dxhhluk84/image/upload/v1759569444/Owl_Ava_qpagsn.png"
            className="lp__logo-img"
          />
        </div>
        <h1 className="reg__title">ĐĂNG KÝ TÀI KHOẢN</h1>

        <form className="reg__form" onSubmit={onSubmit}>
          <div className="reg__field">
            <input
              type="email"
              className={`reg__input ${errors.email ? "reg__input--error" : ""}`}
              placeholder="Gmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            {errors.email && <span className="reg__error">{errors.email}</span>}
          </div>

          <div className="reg__field reg__pw-field">
            <input
              type={showPw ? "text" : "password"}
              className={`reg__input ${errors.pw ? "reg__input--error" : ""}`}
              placeholder="Mật khẩu"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="reg__toggle"
              onClick={() => setShowPw((s) => !s)}
            >
              {showPw ? "Ẩn" : "Hiện"}
            </button>
            {errors.pw && <span className="reg__error">{errors.pw}</span>}
          </div>

          <div className="reg__field reg__pw-field">
            <input
              type={showPw2 ? "text" : "password"}
              className={`reg__input ${errors.pw2 ? "reg__input--error" : ""}`}
              placeholder="Nhập lại mật khẩu"
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="reg__toggle"
              onClick={() => setShowPw2((s) => !s)}
            >
              {showPw2 ? "Ẩn" : "Hiện"}
            </button>
            {errors.pw2 && <span className="reg__error">{errors.pw2}</span>}
          </div>

          {serverErr && <div className="reg__server-error">{serverErr}</div>}

          <button className="reg__btn" type="submit" disabled={loading}>
            {loading ? "Đang tạo..." : "Tạo tài khoản"}
          </button>
        </form>

        <p className="reg__foot">
          Bạn đã có tài khoản rồi?{" "}
          <Link to="/login" className="reg__link">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
