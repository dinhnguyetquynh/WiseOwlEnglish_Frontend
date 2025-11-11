import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import "../css/VerifyOtpPage.css";

type VerifyOtpRes = {
  message?: string;
  // ... tuỳ backend trả gì thêm
};

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get("email") ?? "";

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const [errors, setErrors] = useState<{ email?: string; otp?: string }>({});
  const [serverErr, setServerErr] = useState("");
  const [loading, setLoading] = useState(false);

  // resend OTP cooldown (seconds)
  const [cooldown, setCooldown] = useState(60);
  const canResend = cooldown === 0;

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  useEffect(() => {
    // focus vào ô OTP đầu tiên
    inputsRef.current[0]?.focus();
  }, []);

  const otpValue = useMemo(() => otp.join(""), [otp]);

  const validate = () => {
    const next: typeof errors = {};
    if (!email) next.email = "Email không được để trống";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Email không hợp lệ";

    if (!otpValue || otpValue.length !== 6) next.otp = "Vui lòng nhập đủ 6 số OTP";
    else if (!/^\d{6}$/.test(otpValue)) next.otp = "OTP chỉ gồm 6 chữ số";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChangeOtp = (index: number, val: string) => {
    // chỉ nhận số
    const v = val.replace(/\D/g, "");
    if (!v) {
      // xoá thì set rỗng và ở lại ô hiện tại
      const next = [...otp];
      next[index] = "";
      setOtp(next);
      return;
    }

    // Nếu user dán 6 số vào 1 ô
    if (v.length === 6) {
      setOtp(v.split("").slice(0, 6));
      inputsRef.current[5]?.focus();
      return;
    }

    // còn lại: lấy ký tự đầu tiên
    const next = [...otp];
    next[index] = v[0];
    setOtp(next);

    // tự động nhảy sang ô tiếp theo
    if (index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        // lùi focus khi ô hiện tại trống
        inputsRef.current[index - 1]?.focus();
      } else {
        // xoá giá trị hiện tại
        const next = [...otp];
        next[index] = "";
        setOtp(next);
      }
    }
    if (e.key === "ArrowLeft" && index > 0) inputsRef.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerErr("");

    if (!validate()) return;

    try {
      setLoading(true);
      const res = await fetch("http://localhost:8081/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          otp: otpValue, // "123456"
        }),
      });

      if (!res.ok) {
        let message = "Xác thực OTP thất bại. Vui lòng thử lại.";
        try {
          const data = (await res.json()) as VerifyOtpRes & { error?: string };
          if (data?.message) message = data.message;
          if (data?.error) message = data.error;
        } catch { }
        setServerErr(message);
        return;
      }

      // Thành công → điều hướng đăng nhập (hoặc /learn nếu bạn có auto-login)
      navigate("/login", { state: { verifiedEmail: email } });
    } catch {
      setServerErr("Không thể kết nối máy chủ. Hãy kiểm tra backend hoặc mạng.");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setServerErr("");
    // validate email trước khi resend
    if (!email) {
      setErrors((e) => ({ ...e, email: "Email không được để trống" }));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors((e) => ({ ...e, email: "Email không hợp lệ" }));
      return;
    }
    if (!canResend) return;

    try {
      const res = await fetch("http://localhost:8081/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!res.ok) {
        let message = "Gửi lại OTP thất bại. Vui lòng thử lại.";
        try {
          const data = await res.json();
          if (data?.message) message = data.message;
          if (data?.error) message = data.error;
        } catch { }
        setServerErr(message);
        return;
      }

      // reset input OTP và bắt đầu đếm ngược
      setOtp(["", "", "", "", "", ""]);
      inputsRef.current[0]?.focus();
      setCooldown(60);
    } catch {
      setServerErr("Không thể kết nối máy chủ. Hãy kiểm tra backend hoặc mạng.");
    }
  };

  return (
    <div className="otp__screen">
      <div className="otp__container">
        <h1 className="otp__title">XÁC THỰC OTP</h1>

        <form className="otp__form" onSubmit={onSubmit}>
          {/* Email */}
          <div className="otp__field">
            <label className="otp__label otp_label_mail">Mã xác thực đã được gửi về {email}. <br></br>Vui lòng kiểm tra email!</label>
            {/* <input
              type="email"
              className={`otp__input ${errors.email ? "otp__input--error" : ""}`}
              placeholder="Nhập email đã đăng ký"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            /> */}
            {errors.email && <span className="otp__error">{errors.email}</span>}
          </div>

          {/* OTP 6 ô */}
          <div className="otp__field otp__field--otp">
            <label className="otp__label">Nhập mã xác thực OTP</label>
            <div className={`otp__grid ${errors.otp ? "otp__grid--error" : ""}`}>
              {otp.map((v, i) => (
                <input
                  key={i}
                  ref={(el) => { inputsRef.current[i] = el; }}//???
                  pattern="[0-9]*"
                  maxLength={1}
                  className="otp__cell"
                  value={v}
                  onChange={(e) => handleChangeOtp(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                />
              ))}
            </div>
            {errors.otp && <span className="otp__error">{errors.otp}</span>}
          </div>

          {serverErr && <div className="otp__server-error">{serverErr}</div>}

          <button className="otp__btn" type="submit" disabled={loading}>
            {loading ? "Đang xác thực..." : "Xác nhận"}
          </button>

          <div className="otp__resend">
            {canResend ? (
              <button
                type="button"
                className="otp__resend-btn"
                onClick={resendOtp}
              >
                Gửi lại OTP
              </button>
            ) : (
              <span className="otp__countdown">
                Gửi lại OTP sau {cooldown}s
              </span>
            )}
          </div>
        </form>

        <p className="otp__foot">
          Nhập sai email?{" "}
          <Link to="/register" className="otp__link">
            Đăng ký lại
          </Link>
        </p>
      </div>
    </div>
  );
}
