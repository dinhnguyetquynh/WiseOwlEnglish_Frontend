import { useNavigate } from "react-router-dom";
import "../css/WelcomePage.css";

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="welcome-screen">
      <div className="welcome-left">
        <img
          src="https://res.cloudinary.com/dxhhluk84/image/upload/v1759382382/welcome_ekfpjr.png"
          alt="characters"
          className="welcome-img"
        />
      </div>

      <div className="welcome-right">
        <h1 className="welcome-title">
          Học tiếng anh cùng  <br /> WiseOwl English nha!
        </h1>

        <button
          className="welcome-btn start"
          onClick={() => navigate("/register")}
        >
          BẮT ĐẦU
        </button>

        <button
          className="welcome-btn login"
          onClick={() => navigate("/login")}
        >
          TÔI ĐÃ CÓ TÀI KHOẢN
        </button>
      </div>
    </div>
  );
}
